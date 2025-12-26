from pathlib import Path
from typing import List, Optional, Sequence

from PyPDF2 import PdfReader
from pymilvus import Collection
from sentence_transformers import SentenceTransformer

from app.core.config import settings
from app.services.milvus_client import get_or_create_collection


def _utf8_length(value: str) -> int:
    return len(value.encode("utf-8"))


def _trim_to_max_bytes(value: str, max_bytes: int) -> str:
    if max_bytes <= 0:
        return ""
    encoded = value.encode("utf-8")
    if len(encoded) <= max_bytes:
        return value
    return encoded[:max_bytes].decode("utf-8", errors="ignore")


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text_segments: List[str] = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        text_segments.append(page_text)
    return "\n".join(text_segments).strip()


def chunk_text(
    text: str,
    chunk_size: int = settings.chunk_size,
    overlap: int = settings.chunk_overlap,
    max_length: int = settings.text_chunk_max_length,
) -> List[str]:
    """Chunk text by whitespace tokens with configurable overlap and size caps."""

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")

    tokens = text.split()
    chunks: List[str] = []
    start = 0
    while start < len(tokens):
        end = min(start + chunk_size, len(tokens))
        chunk = " ".join(tokens[start:end])

        if max_length > 0 and _utf8_length(chunk) > max_length:
            while end > start and _utf8_length(chunk) > max_length:
                end -= 1
                chunk = " ".join(tokens[start:end])

            if end == start:
                # Single token longer than max_length; truncate to fit.
                chunk = _trim_to_max_bytes(tokens[start], max_length)
                if chunk:
                    chunks.append(chunk)
                start += 1
                continue

        if chunk:
            chunks.append(chunk)

        if overlap > 0:
            next_start = end - overlap
            start = end if next_start <= start else next_start
        else:
            start = end

    return chunks


def ingest_resume(
    file_path: str,
    *,
    collection: Optional[Collection] = None,
    model: Optional[SentenceTransformer] = None,
    extracted_text: Optional[str] = None,
) -> List[str]:
    """Ingest a resume PDF into Milvus and return the created chunks."""

    collection = collection or get_or_create_collection()
    model = model or SentenceTransformer(settings.embedding_model_name)

    raw_text = extracted_text if extracted_text is not None else extract_text_from_pdf(file_path)
    text_chunks = chunk_text(raw_text)

    # SentenceTransformer.encode accepts a sequence of strings and returns a list of embeddings.
    embeddings: Sequence[Sequence[float]] = model.encode(text_chunks, show_progress_bar=False)

    candidate_name = Path(file_path).stem
    skills: List[str] = []

    data = [
        list(embeddings),
        text_chunks,
        [candidate_name for _ in text_chunks],
        [skills for _ in text_chunks],
    ]

    collection.insert(
        data,
        fields=["embedding", "text_chunk", "candidate_name", "skills"],
    )
    collection.flush()

    return text_chunks
