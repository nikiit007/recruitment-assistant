from pathlib import Path
from typing import List, Optional, Sequence

from PyPDF2 import PdfReader
from pymilvus import Collection
from sentence_transformers import SentenceTransformer

from app.core.config import settings
from app.services.milvus_client import get_or_create_collection


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
) -> List[str]:
    """Chunk text by whitespace tokens with configurable overlap."""

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")

    tokens = text.split()
    chunks: List[str] = []
    start = 0
    stride = max(1, chunk_size - max(0, overlap))

    while start < len(tokens):
        end = start + chunk_size
        chunk = " ".join(tokens[start:end])
        if chunk:
            chunks.append(chunk)
        start += stride

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
