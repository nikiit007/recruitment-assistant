from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    milvus_host: str = "localhost"
    milvus_port: str = "19530"
    milvus_collection: str = "resumes"
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 500
    chunk_overlap: int = 50
    openai_api_key: str | None = None
    llm_model: str = "gpt-4o-mini"


settings = Settings()
