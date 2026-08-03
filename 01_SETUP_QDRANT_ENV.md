# Step 1 (Qdrant) — Environment Setup & Singleton Loaders

**This replaces the earlier Chroma-based Step 1.** You've already ingested both
your PDF books and `main_medical_database.json` into Qdrant Cloud (collection
`medical_triage_kb`, dense-only, `BAAI/bge-small-en-v1.5`, 384-dim). This step
rewires your agent project to read FROM Qdrant and deletes every remaining
Chroma reference.

---

## 0. What to delete

Run these (or have Antigravity do it) before anything else:

```bash
# remove the old Chroma singleton file -- being replaced entirely below
rm -f app/rag/store.py

# remove the old local Chroma data if it's still sitting in the project
rm -rf chroma_db_backup/

# remove Chroma lines from requirements.txt (langchain-chroma, chromadb) --
# see the corrected requirements.txt in section 2 below
```

Also delete any `CHROMA_*` lines from your `.env` — replaced by `QDRANT_*`
below.

---

## 1. Updated `requirements.txt`

```txt
# --- LangChain / LangGraph core ---
langchain==0.3.27
langchain-core==0.3.79
langgraph==0.2.62
langchain-groq==0.2.1

# --- RAG / vectorstore (Qdrant, not Chroma) ---
qdrant-client==1.12.1
langchain-qdrant==0.2.0
langchain-huggingface==0.1.2
sentence-transformers==3.3.1   # also used for the cross-encoder reranker

# --- LangSmith tracing/eval ---
langsmith==0.1.147

# --- FastAPI service layer ---
fastapi==0.115.6
uvicorn[standard]==0.32.1
pydantic==2.10.4
pydantic-settings==2.7.0

# --- Utilities ---
python-dotenv==1.0.1
```

```bash
pip install -r requirements.txt
```

---

## 2. Updated `.env`

```env
# --- Groq ---
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# --- LangSmith ---
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=symptom-triage-agent
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# --- Qdrant (replaces Chroma entirely) ---
QDRANT_URL=your_qdrant_cluster_url_here
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=medical_triage_kb

# --- Embeddings -- MUST match what your ingestion script used ---
EMBEDDING_MODEL_NAME=BAAI/bge-small-en-v1.5
EMBEDDING_DIM=384
BGE_QUERY_INSTRUCTION=Represent this sentence for searching relevant passages: 

# --- Cross-encoder reranker (runs on CPU -- you confirmed CPU-only serving) ---
RERANKER_MODEL_NAME=BAAI/bge-reranker-base

# --- Retrieval pipeline tuning ---
SCORE_THRESHOLD=0.80
FETCH_K=20
MMR_K=10
MMR_LAMBDA=0.5
FINAL_K=5

# --- App ---
APP_ENV=development
MAX_INTAKE_TURNS=7
CONFIDENCE_THRESHOLD=0.75
```

> **`SCORE_THRESHOLD=0.80`** is what you asked for, but with COSINE distance
> on a small 384-dim model, real similarity scores for genuinely relevant
> chunks can sometimes land in the 0.70s. Treat 0.80 as a starting point —
> Step 2's test script below will show you real scores from your actual data
> so you can tune this empirically rather than guessing blind.

---

## 3. Updated `app/core/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Groq
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"

    # LangSmith
    langchain_tracing_v2: bool = True
    langchain_api_key: str = ""
    langchain_project: str = "symptom-triage-agent"
    langchain_endpoint: str = "https://api.smith.langchain.com"

    # Qdrant -- replaces Chroma entirely
    qdrant_url: str
    qdrant_api_key: str
    qdrant_collection_name: str = "medical_triage_kb"

    # Embeddings -- MUST match the ingestion pipeline exactly
    embedding_model_name: str = "BAAI/bge-small-en-v1.5"
    embedding_dim: int = 384
    bge_query_instruction: str = "Represent this sentence for searching relevant passages: "

    # Reranker
    reranker_model_name: str = "BAAI/bge-reranker-base"

    # Retrieval pipeline tuning
    score_threshold: float = 0.80
    fetch_k: int = 20
    mmr_k: int = 10
    mmr_lambda: float = 0.5
    final_k: int = 5

    # App behavior
    app_env: str = "development"
    max_intake_turns: int = 7
    confidence_threshold: float = 0.75


settings = Settings()
```

---

## 4. New `app/rag/store.py` — Qdrant + embeddings + reranker singletons

This is the direct Qdrant replacement for the old Chroma loader. Same
philosophy as before: nothing outside this file constructs `QdrantClient`,
`HuggingFaceEmbeddings`, or `CrossEncoder` directly.

```python
"""
Singleton loaders for the Qdrant client, the BGE embedding model, and the
cross-encoder reranker. Everything else in the project imports get_*()
functions from here -- this guarantees each of these three (potentially
slow to load / connect) resources is created exactly once per process.
"""

import logging
import threading

import torch
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from sentence_transformers import CrossEncoder

from app.core.config import settings

logger = logging.getLogger(__name__)

_qdrant_client = None
_embeddings = None
_reranker = None
_lock = threading.Lock()


def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        with _lock:
            if _qdrant_client is None:
                logger.info("Connecting to Qdrant at %s (should print once per process)", settings.qdrant_url)
                _qdrant_client = QdrantClient(
                    url=settings.qdrant_url,
                    api_key=settings.qdrant_api_key,
                    timeout=60,
                )
    return _qdrant_client


def get_embeddings() -> HuggingFaceEmbeddings:
    """Loads the SAME BGE model/config your ingestion script used. If this
    ever drifts from ingestion (different model, different normalize
    setting), retrieval quality silently degrades -- query vectors and
    stored vectors stop being comparable in the way you'd expect."""
    global _embeddings
    if _embeddings is None:
        with _lock:
            if _embeddings is None:
                device = "cuda" if torch.cuda.is_available() else "cpu"
                logger.info(
                    "Loading embedding model '%s' on %s (should print once per process)",
                    settings.embedding_model_name, device,
                )
                _embeddings = HuggingFaceEmbeddings(
                    model_name=settings.embedding_model_name,
                    model_kwargs={"device": device},
                    encode_kwargs={"normalize_embeddings": True},
                )
    return _embeddings


def get_reranker() -> CrossEncoder:
    """CPU by default -- you confirmed CPU-only production serving. On CPU,
    bge-reranker-base takes roughly 1-3 seconds to score ~10 candidate pairs
    depending on hardware. If that's too slow once you measure real latency,
    swap RERANKER_MODEL_NAME to 'cross-encoder/ms-marco-MiniLM-L-6-v2'
    (much faster, less medical-domain-tuned) -- no other code changes
    needed, it's a drop-in swap via this one function."""
    global _reranker
    if _reranker is None:
        with _lock:
            if _reranker is None:
                logger.info("Loading cross-encoder reranker '%s' on CPU (should print once)", settings.reranker_model_name)
                _reranker = CrossEncoder(settings.reranker_model_name, device="cpu")
    return _reranker


def embed_query(text: str) -> list:
    """
    Embeds a QUERY -- prefixes with the BGE instruction string, since BGE
    models are trained asymmetrically (queries and passages need different
    treatment). NEVER use this to embed passages/documents; your ingestion
    script embedded those WITHOUT this prefix, which is correct and must
    stay that way.
    """
    prefixed = settings.bge_query_instruction + text
    return get_embeddings().embed_query(prefixed)


def warm_up():
    """Call once at FastAPI startup (Step 3) to force all three resources
    to load/connect before the server accepts its first request."""
    get_qdrant_client()
    get_embeddings()
    get_reranker()
    logger.info("RAG store warm-up complete: Qdrant client + embeddings + reranker all loaded.")
```

---

## 5. Verification script — `scripts/verify_qdrant_rag.py`

```python
"""
Confirms: Qdrant connectivity, collection stats, singleton loading behavior,
and one real dense search against your actual medical_triage_kb data.
"""

import sys
import time

sys.path.insert(0, ".")

import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

from app.core.config import settings  # noqa: E402
from app.rag.store import get_qdrant_client, get_embeddings, get_reranker, embed_query  # noqa: E402


def main():
    print("\n=== Qdrant connection + collection check ===")
    client = get_qdrant_client()
    info = client.get_collection(settings.qdrant_collection_name)
    count = client.count(settings.qdrant_collection_name, exact=True).count
    print(f"Collection '{settings.qdrant_collection_name}': {count} points")
    print(f"Vector size configured: {info.config.params.vectors.size} (expected {settings.embedding_dim})")

    print("\n=== Embedding singleton check ===")
    t0 = time.time()
    get_embeddings()
    print(f"First call: {time.time() - t0:.2f}s (should be slow -- model loads here)")
    t0 = time.time()
    get_embeddings()
    print(f"Second call: {time.time() - t0:.4f}s (should be near-instant)")

    print("\n=== Reranker singleton check ===")
    t0 = time.time()
    get_reranker()
    print(f"First call: {time.time() - t0:.2f}s (should be slow)")
    t0 = time.time()
    get_reranker()
    print(f"Second call: {time.time() - t0:.4f}s (should be near-instant)")

    print("\n=== Real dense search test (no filter, no rerank -- raw sanity check) ===")
    test_query = "high fever with body ache and headache for 3 days"
    query_vector = embed_query(test_query)

    hits = client.search(
        collection_name=settings.qdrant_collection_name,
        query_vector=query_vector,
        limit=5,
    )

    if not hits:
        print("\n❌ NO RESULTS. Check QDRANT_URL/QDRANT_API_KEY/QDRANT_COLLECTION_NAME in .env.")
        return

    print(f"\n✅ Got {len(hits)} raw hits:\n")
    for h in hits:
        payload = h.payload or {}
        meta = payload.get("metadata", {})
        label = meta.get("name") or meta.get("source_book") or "unknown"
        print(f"score={h.score:.3f} | {label} | {payload.get('page_content', '')[:120]}...")


if __name__ == "__main__":
    main()
```

Run it:

```bash
python scripts/verify_qdrant_rag.py
```

---

## ✅ Success criteria for this step

1. Collection point count matches what your ingestion run reported.
2. Vector size shown matches `EMBEDDING_DIM=384`.
3. Embedding and reranker singleton checks show a slow first call, near-instant
   second call — proves nothing reloads per request later.
4. The raw dense search returns real, relevant-looking chunks with actual
   scores (note the score range you see here — you'll use it to sanity-check
   `SCORE_THRESHOLD=0.80` in Step 2).

If anything fails here, stop — do not proceed to Step 2 with a broken Qdrant
connection.

---

## What's next

**`02_ADVANCED_RAG_RETRIEVAL.md`** builds the actual advanced retrieval
pipeline on top of this: self-query metadata filtering, the Ayurvedic-intent
deterministic filter, score thresholding, MMR, and cross-encoder reranking —
all wired into your LangGraph agent's retrieval and remedy nodes.
