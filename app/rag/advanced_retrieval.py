"""
Advanced retrieval pipeline: self-query metadata filtering + BGE dense search
with score thresholding + MMR diversification + cross-encoder reranking.
See this project's Step 2 MD file for the full rationale behind the ordering.
"""

import logging

from langchain.chains.query_constructor.base import load_query_constructor_runnable
from langchain_community.query_constructors.qdrant import QdrantTranslator
from langchain_community.vectorstores.utils import maximal_marginal_relevance
from langchain_core.documents import Document
from qdrant_client import models

from app.core.config import settings
from app.core.llm import get_llm
from app.rag.attribute_schema import DOCUMENT_CONTENT_DESCRIPTION, METADATA_FIELD_INFO
from app.rag.intent import wants_ayurvedic_info
from app.rag.store import embed_query, get_qdrant_client, get_reranker

logger = logging.getLogger(__name__)

# metadata_key="metadata" matches langchain_qdrant.QdrantVectorStore's default
# payload structure from ingestion: {"page_content": ..., "metadata": {...}}
_translator = QdrantTranslator(metadata_key="metadata")
_query_constructor = None


def get_query_constructor():
    """
    Singleton query-constructor chain (prompt + output parser bound to our
    attribute schema) -- cheap to reuse across requests, no reason to rebuild
    it per call.

    CRITICAL: allowed_comparators is restricted to exactly what
    QdrantTranslator supports. The LLM's default comparator set also
    includes CONTAIN/LIKE/NE/IN/NIN, which QdrantTranslator has no
    translation for and would raise on -- restricting this up front is what
    prevents that failure mode entirely rather than catching it at runtime.
    """
    global _query_constructor
    if _query_constructor is None:
        llm = get_llm(temperature=0.0)
        _query_constructor = load_query_constructor_runnable(
            llm=llm,
            document_contents=DOCUMENT_CONTENT_DESCRIPTION,
            attribute_info=METADATA_FIELD_INFO,
            allowed_comparators=_translator.allowed_comparators,
        )
    return _query_constructor


def build_filter(natural_language_query: str):
    """Runs the self-query LLM call to extract a Qdrant filter from natural
    language, then merges in the deterministic Ayurvedic-intent condition."""
    structured_query = get_query_constructor().invoke({"query": natural_language_query})
    _, search_kwargs = _translator.visit_structured_query(structured_query)
    base_filter = search_kwargs.get("filter")

    must = list(base_filter.must) if base_filter and base_filter.must else []
    must_not = list(base_filter.must_not) if base_filter and base_filter.must_not else []
    should = list(base_filter.should) if base_filter and base_filter.should else []

    if wants_ayurvedic_info(natural_language_query):
        logger.info("Ayurvedic intent detected -- requiring non-empty ayurvedic_deep_herbs")
        must.append(
            models.Filter(
                must_not=[
                    models.IsEmptyCondition(
                        is_empty=models.PayloadField(key="metadata.ayurvedic_deep_herbs")
                    )
                ]
            )
        )

    if not must and not must_not and not should:
        return None
    return models.Filter(must=must or None, must_not=must_not or None, should=should or None)


def advanced_retrieve(
    dense_query_text: str,
    natural_language_context: str,
    final_k: int | None = None,
) -> list:
    """
    dense_query_text: clean text built from structured facts (or a condition
        name) -- this is what actually gets embedded for vector search, kept
        separate from raw chat phrasing so embedding quality doesn't depend
        on how the user worded their sentence.
    natural_language_context: the user's raw message -- used ONLY to drive
        self-query filter extraction and Ayurvedic-intent detection, never
        embedded directly.
    """
    final_k = final_k or settings.final_k
    client = get_qdrant_client()

    qdrant_filter = build_filter(natural_language_context)
    query_vector = embed_query(dense_query_text)

    # Score threshold applied natively by Qdrant -- low-confidence chunks
    # never even come back, which is the hallucination-prevention mechanism.
    hits = client.search(
        collection_name=settings.qdrant_collection_name,
        query_vector=query_vector,
        query_filter=qdrant_filter,
        limit=settings.fetch_k,
        score_threshold=settings.score_threshold,
        with_vectors=True,
        with_payload=True,
    )

    if not hits:
        logger.info(
            "No chunks passed score_threshold=%.2f -- returning empty rather than a guessed answer.",
            settings.score_threshold,
        )
        return []

    docs, vectors = [], []
    for hit in hits:
        payload = hit.payload or {}
        metadata = dict(payload.get("metadata", {}))
        metadata["_score"] = hit.score
        docs.append(Document(page_content=payload.get("page_content", ""), metadata=metadata))
        vectors.append(hit.vector)

    # MMR: diversify the thresholded candidate pool before reranking
    import numpy as np
    mmr_k = min(settings.mmr_k, len(docs))
    mmr_indices = maximal_marginal_relevance(np.array(query_vector), np.array(vectors), lambda_mult=settings.mmr_lambda, k=mmr_k)
    diverse_docs = [docs[i] for i in mmr_indices]

    # Cross-encoder rerank: precision-sort within the diverse set
    reranker = get_reranker()
    pairs = [(dense_query_text, d.page_content) for d in diverse_docs]
    rerank_scores = reranker.predict(pairs)
    ranked = sorted(zip(diverse_docs, rerank_scores), key=lambda x: x[1], reverse=True)
    top_docs = [d for d, _ in ranked[:final_k]]

    logger.info(
        "Retrieval: %d passed threshold -> %d after MMR -> %d final after rerank",
        len(docs), len(diverse_docs), len(top_docs),
    )
    return top_docs
