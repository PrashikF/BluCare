from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # API Prefix
    api_v1_prefix: str = "/api/v1"

    # Groq API Credentials
    groq_api_key: str = "mock_groq_key"
    groq_api_key_secondary: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    # LangSmith Observability Tracing
    langchain_tracing_v2: bool = True
    langchain_api_key: str = ""
    langchain_project: str = "symptom-triage-agent"
    langchain_endpoint: str = "https://api.smith.langchain.com"

    # Qdrant Vector Database
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection_name: str = "medical_triage_kb"

    # Redis Database / Checkpointer
    redis_url: str = "redis://localhost:6379/0"

    # Embeddings Configuration
    embedding_model_name: str = "BAAI/bge-small-en-v1.5"
    embedding_dim: int = 384
    bge_query_instruction: str = "Represent this sentence for searching relevant passages: "

    # Cross-Encoder Reranker
    reranker_model_name: str = "BAAI/bge-reranker-base"

    # Retrieval Pipeline Tuning
    score_threshold: float = 0.70
    fetch_k: int = 20
    mmr_k: int = 10
    mmr_lambda: float = 0.5
    final_k: int = 5

    # App Behavior & Limits
    app_env: str = "development"
    max_intake_turns: int = 7
    confidence_threshold: float = 0.75
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ]
    rate_limit_per_minute: int = 60

    # Clerk Authentication
    clerk_issuer_url: str | None = "https://clerk.accepted.catfish-84.clerk.accounts.dev"
    clerk_jwks_url: str | None = None

    # Supabase (Optional DB integration)
    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_db_url: str | None = None


settings = Settings()
