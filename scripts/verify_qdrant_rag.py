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
