import json

import pytest

from app.services import ingestion, reasoning_engine, search


class StubCollection:
    def __init__(self):
        self.inserted = []
        self.flushed = False

    def insert(self, data, fields=None):
        self.inserted.append((data, tuple(fields) if fields else None))

    def flush(self):
        self.flushed = True

    def search(self, data, anns_field=None, param=None, limit=None, output_fields=None):
        return [[
            StubHit(
                entity={
                    "candidate_name": "Alice",
                    "text_chunk": "Experienced engineer",
                    "skills": ["python"],
                },
                distance=0.12,
            ),
            StubHit(
                entity={
                    "candidate_name": "Bob",
                    "text_chunk": "Data scientist",
                    "skills": ["ml"],
                },
                distance=0.34,
            ),
        ]]


class StubHit:
    def __init__(self, entity, distance):
        self.entity = entity
        self.distance = distance


class StubModel:
    def __init__(self, embedding_value=0.5):
        self.embedding_value = embedding_value

    def encode(self, texts, show_progress_bar=False):  # pragma: no cover - simple stub
        # Return a distinct embedding per text to ensure lengths match.
        return [[self.embedding_value] for _ in texts]


class StubCompletion:
    def __init__(self, content):
        self.choices = [type("Choice", (), {"message": type("Message", (), {"content": content})()})]


class StubChat:
    def __init__(self, content):
        self._content = content

    def completions(self):  # pragma: no cover - compatibility hook
        return self

    def create(self, **kwargs):  # pragma: no cover - simple stub
        return StubCompletion(self._content)


class StubOpenAI:
    def __init__(self, content):
        self.chat = type("Chat", (), {"completions": StubChat(content)})()


def test_chunk_text_overlap():
    text = "one two three four five six seven"
    chunks = ingestion.chunk_text(text, chunk_size=3, overlap=1)
    assert chunks == [
        "one two three",
        "three four five",
        "five six seven",
        "seven",
    ]


def test_chunk_text_respects_max_length():
    text = " ".join(["word"] * 20)
    chunks = ingestion.chunk_text(text, chunk_size=20, overlap=0, max_length=20)

    assert all(len(chunk) <= 20 for chunk in chunks)
    assert " ".join(chunks).split() == text.split()


def test_ingest_resume_inserts_chunks(monkeypatch, tmp_path):
    stub_collection = StubCollection()
    stub_model = StubModel()

    # Avoid reading a real PDF by faking the extraction.
    monkeypatch.setattr(ingestion, "extract_text_from_pdf", lambda _: "lorem ipsum dolor sit amet")
    monkeypatch.setattr(ingestion, "get_or_create_collection", lambda: stub_collection)

    fake_pdf = tmp_path / "candidate.pdf"
    fake_pdf.write_text("placeholder")

    chunks = ingestion.ingest_resume(
        str(fake_pdf), collection=stub_collection, model=stub_model
    )

    assert chunks == ["lorem ipsum dolor sit amet"]
    # Ensure data was inserted with the expected fields and values.
    assert stub_collection.inserted
    inserted_data, fields = stub_collection.inserted[0]
    assert fields == ("embedding", "text_chunk", "candidate_name", "skills")
    assert inserted_data[1] == ["lorem ipsum dolor sit amet"]
    assert inserted_data[2] == ["candidate"]
    assert stub_collection.flushed is True


def test_search_candidates_returns_matches(monkeypatch):
    stub_collection = StubCollection()
    stub_model = StubModel()

    monkeypatch.setattr(search, "get_collection", lambda: stub_collection)

    results = search.search_candidates(
        "backend engineer", top_k=2, collection=stub_collection, model=stub_model
    )

    assert len(results) == 2
    assert results[0] == ("Alice: Experienced engineer", pytest.approx(0.12))
    assert results[1] == ("Bob: Data scientist", pytest.approx(0.34))


def test_analyze_match_returns_json(monkeypatch):
    llm_response = {
        "match_score": 82,
        "chain_of_thought": "Strong Python background, minor gap on Django but has Flask experience.",
        "green_flags": ["5 years Python", "Flask APIs"],
        "red_flags": ["No explicit Django"],
    }

    stub_client = StubOpenAI(json.dumps(llm_response))

    result = reasoning_engine.analyze_match(
        candidate_profile="Senior Python engineer with Flask APIs",
        job_description="Looking for Django backend experience",
        client=stub_client,
        model="fake-model",
    )

    assert result == llm_response
