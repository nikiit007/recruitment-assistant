from typing import List, Optional, Tuple

from pymilvus import Collection
from sentence_transformers import SentenceTransformer

from app.core.config import settings
from app.services.milvus_client import get_collection, get_or_create_collection


def search_candidates(
    job_description_text: str,
    top_k: int = 5,
    *,
    collection: Optional[Collection] = None,
    model: Optional[SentenceTransformer] = None,
) -> List[Tuple[str, float]]:
    collection = collection or get_collection() or get_or_create_collection()
    model = model or SentenceTransformer(settings.embedding_model_name)

    query_embedding = model.encode([job_description_text], show_progress_bar=False)[0]

    search_params = {"metric_type": "COSINE", "params": {"ef": 64}}
    results = collection.search(
        data=[query_embedding],
        anns_field="embedding",
        param=search_params,
        limit=top_k,
        output_fields=["text_chunk", "candidate_name", "skills"],
    )

    matches: List[Tuple[str, float]] = []
    for hit in results[0]:
        candidate_label = hit.entity.get("candidate_name") or "Unknown"
        text_chunk = hit.entity.get("text_chunk")
        score = float(hit.distance)
        matches.append((f"{candidate_label}: {text_chunk}", score))

    return matches
