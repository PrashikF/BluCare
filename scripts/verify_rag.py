"""
Run this once to confirm the RAG singleton loader works against the REAL
chroma_db_backup data, and that it only loads once even when called
multiple times in the same process.
"""

import logging
import sys
import time

sys.path.insert(0, ".")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

from app.rag.store import get_retriever  # noqa: E402


def main():
    print("\n=== Call 1: get_retriever() ===")
    t0 = time.time()
    retriever = get_retriever(k=3)
    print(f"First call took {time.time() - t0:.2f}s (this SHOULD be slow — model loads here)")

    print("\n=== Call 2: get_retriever() again ===")
    t0 = time.time()
    retriever2 = get_retriever(k=3)
    print(f"Second call took {time.time() - t0:.4f}s (this MUST be near-instant — proves singleton works)")

    test_query = "high fever with body ache and headache for 3 days"
    print(f"\n=== Test retrieval for: '{test_query}' ===")
    docs = retriever.invoke(test_query)

    if not docs:
        print("\n❌ NO DOCUMENTS RETURNED. Something is wrong:")
        print("   - Check CHROMA_PERSIST_DIR points at the real chroma_db_backup folder")
        print("   - Check CHROMA_COLLECTION_NAME matches exactly ('medical_kb')")
        print("   - Check the folder actually contains data_level0.bin, chroma.sqlite3, etc.")
        return

    print(f"\n✅ Retrieved {len(docs)} chunks:\n")
    for i, doc in enumerate(docs, 1):
        print(f"--- Chunk {i} ---")
        print(f"Source metadata: {doc.metadata}")
        print(f"Content preview: {doc.page_content[:200]}...")
        print()


if __name__ == "__main__":
    main()
