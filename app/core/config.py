from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    milvus_uri: str | None = None
    milvus_token: str | None = None
    milvus_ca_pem_path: str | None = None
    milvus_server_pem_path: str | None = None
    milvus_server_name: str | None = None
    milvus_tls_insecure: bool = False
    milvus_host: str = "localhost"
    milvus_port: str = "19530"
    milvus_collection: str = "resumes"
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 500
    chunk_overlap: int = 50
    openai_api_key: str | None = None
    llm_model: str = "gpt-4o-mini"


settings = Settings()
