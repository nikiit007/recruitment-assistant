from pymilvus import connections, utility

from app.core.config import settings
from app.services.milvus_client import FIELDS


if __name__ == "__main__":
    tls_kwargs = {}
    if settings.milvus_ca_pem_path:
        tls_kwargs["ca_pem_path"] = settings.milvus_ca_pem_path
    if settings.milvus_server_pem_path:
        tls_kwargs["server_pem_path"] = settings.milvus_server_pem_path
    if settings.milvus_server_name:
        tls_kwargs["server_name"] = settings.milvus_server_name
    if settings.milvus_tls_insecure:
        tls_kwargs["secure"] = True

    if settings.milvus_uri:
        connections.connect(
            alias="default",
            uri=settings.milvus_uri,
            token=settings.milvus_token,
            **tls_kwargs,
        )
    else:
        connections.connect(
            alias="default",
            host=settings.milvus_host,
            port=settings.milvus_port,
            **tls_kwargs,
        )

    if utility.has_collection(settings.milvus_collection):
        print(f"Collection '{settings.milvus_collection}' already exists.")
    else:
        from pymilvus import Collection, CollectionSchema

        schema = CollectionSchema(fields=FIELDS, description="Resume embeddings")
        collection = Collection(
            name=settings.milvus_collection,
            schema=schema,
            using="default",
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
        print(f"Collection '{settings.milvus_collection}' created and indexed.")
