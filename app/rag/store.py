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
                device = "cuda" if torch.cuda.is_available() else "cpu"
                logger.info("Loading cross-encoder reranker '%s' on %s (should print once)", settings.reranker_model_name, device)
                _reranker = CrossEncoder(settings.reranker_model_name, device=device)
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
