from typing import Optional

from pymilvus import Collection, CollectionSchema, DataType, FieldSchema, connections, utility

from app.core.config import settings


FIELDS = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384),
    FieldSchema(name="text_chunk", dtype=DataType.VARCHAR, max_length=2048),
    FieldSchema(name="candidate_name", dtype=DataType.VARCHAR, max_length=256),
    FieldSchema(name="skills", dtype=DataType.JSON),
]


def _build_tls_kwargs() -> dict:
    tls_kwargs: dict = {}
    if settings.milvus_ca_pem_path:
        tls_kwargs["ca_pem_path"] = settings.milvus_ca_pem_path
    if settings.milvus_server_pem_path:
        tls_kwargs["server_pem_path"] = settings.milvus_server_pem_path
    if settings.milvus_server_name:
        tls_kwargs["server_name"] = settings.milvus_server_name
    if settings.milvus_tls_insecure:
        tls_kwargs["secure"] = True
    return tls_kwargs


def connect_milvus(alias: str = "default") -> None:
    tls_kwargs = _build_tls_kwargs()
    if settings.milvus_uri:
        connections.connect(
            alias=alias,
            uri=settings.milvus_uri,
            token=settings.milvus_token,
            **tls_kwargs,
        )
        return
    connections.connect(
        alias=alias,
        host=settings.milvus_host,
        port=settings.milvus_port,
        **tls_kwargs,
    )


def get_or_create_collection(alias: str = "default") -> Collection:
    connect_milvus(alias=alias)

    if not utility.has_collection(settings.milvus_collection, using=alias):
        schema = CollectionSchema(fields=FIELDS, description="Resume embeddings")
        collection = Collection(
            name=settings.milvus_collection,
            schema=schema,
            using=alias,
        )
        collection.create_index(
            field_name="embedding",
            index_params={
                "index_type": "HNSW",
                "metric_type": "COSINE",
                "params": {"M": 48, "efConstruction": 200},
            },
        )
        collection.load()
        return collection

    collection = Collection(name=settings.milvus_collection, using=alias)
    if not collection.has_index():
        collection.create_index(
            field_name="embedding",
            index_params={
                "index_type": "HNSW",
                "metric_type": "COSINE",
                "params": {"M": 48, "efConstruction": 200},
            },
        )
    collection.load()
    return collection


def get_collection(alias: str = "default") -> Optional[Collection]:
    if not utility.has_collection(settings.milvus_collection, using=alias):
        return None
    return Collection(name=settings.milvus_collection, using=alias)
