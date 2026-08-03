# Step 3 (Qdrant) — FastAPI Integration Update

**Prerequisite:** Step 2 (`02_ADVANCED_RAG_RETRIEVAL.md`) is complete —
`scripts/test_advanced_retrieval.py` passes all three cases against your real
`medical_triage_kb` collection.

**Goal:** point your FastAPI service's startup warm-up at the new Qdrant
singleton loaders instead of the old Chroma ones. Your endpoints
(`/session/start`, `/session/message`, `/session/{thread_id}`) and
`session_service.py` don't change at all — they only ever talked to
`compiled_graph`, never to Chroma directly. The only real edit is the
`lifespan` startup hook.

---

## 1. Update `app/main.py`'s `lifespan`

Change the import and warm-up call:

```python
from app.rag.store import warm_up  # was: from app.rag.store import warm_up (Chroma version)
```

The import line itself looks identical — that's the point. Since Step 1
rewrote `app/rag/store.py` in place to be Qdrant-based, `main.py` needs no
other changes; `warm_up()` now loads the Qdrant client + BGE embeddings +
cross-encoder reranker instead of Chroma + BGE embeddings.

Full `lifespan` block for reference (unchanged from before, shown here so you
can confirm nothing else needs editing):

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up: warming up RAG store (Qdrant + embeddings + reranker)...")
    init_tracing()
    warm_up()
    logger.info("Startup complete. Server ready to accept requests.")
    yield
    logger.info("Shutting down.")
```

---

## 2. Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Startup logs should now show, in order, exactly once each:

```
Connecting to Qdrant at ... (should print once per process)
Loading embedding model 'BAAI/bge-small-en-v1.5' on cpu (should print once per process)
Loading cross-encoder reranker 'BAAI/bge-reranker-base' on CPU (should print once)
RAG store warm-up complete: Qdrant client + embeddings + reranker all loaded.
Startup complete. Server ready to accept requests.
```

If you see any of the first three lines print again later while hitting
endpoints, a singleton isn't wired correctly — check nothing outside
`app/rag/store.py` is constructing `QdrantClient`/`HuggingFaceEmbeddings`/
`CrossEncoder` directly.

---

## 3. End-to-end test sequence (curl)

**Start a session with a plain symptom description:**

```bash
curl -X POST http://localhost:8000/session/start \
  -H "Content-Type: application/json" \
  -d '{"initial_message": "I have been feeling anxious with dizziness and shortness of breath"}'
```

Copy the returned `thread_id` for the next calls.

**Continue answering intake questions until `is_complete: true`:**

```bash
curl -X POST http://localhost:8000/session/message \
  -H "Content-Type: application/json" \
  -d '{"thread_id": "PASTE_THREAD_ID", "message": "It has been about a week, moderate severity"}'
```

**Test the self-query + Ayurvedic filter end-to-end**, once you're in a
session where a condition has been identified, by explicitly asking:

```bash
curl -X POST http://localhost:8000/session/message \
  -H "Content-Type: application/json" \
  -d '{"thread_id": "PASTE_THREAD_ID", "message": "Do you have any Ayurvedic remedies for this?"}'
```

The `remedy_response` in the JSON reply should draw specifically from chunks
with populated `ayurvedic_deep_herbs`/`ayurvedic_terms` fields — you can
confirm this by checking LangSmith's trace for this call and inspecting the
retrieved chunk metadata in the `rag_retrieval`/`remedy` node's trace entry.

---

## 4. What changed vs. the original Chroma-based Step 3 — nothing else

For clarity, everything below is **unchanged** from the original Chroma-based
FastAPI integration and needs no edits:
- `app/schemas/api.py`
- `app/core/session_service.py`
- All FastAPI route handlers in `app/main.py`
- The checkpointer setup in `app/graph/build_graph.py` (still `MemorySaver`
  for now, per your earlier decision to defer persistence work)

This is exactly why the earlier architecture kept the web layer, the session
service, and the RAG layer in separate files — swapping the entire vector
database and retrieval strategy underneath only touched `app/rag/*` and
`app/graph/retrieval.py`, nothing else in the request-handling path had to
change.

---

## ✅ Success criteria for this step

1. Startup logs show Qdrant + embeddings + reranker loading exactly once,
   before "Startup complete," never again during the session.
2. A full curl conversation (start → several `/session/message` calls →
   `is_complete: true`) works end-to-end same as before.
3. The Ayurvedic-remedy curl test returns a `remedy_response` that's visibly
   different in content from a plain (non-Ayurvedic) remedy request for the
   same condition — proving the filter is actually changing what gets
   retrieved, not just what gets said.
4. LangSmith traces show the retrieval node's self-query filter, the
   MMR/rerank step, and final chunk count at each stage (`N passed threshold
   -> M after MMR -> K final`).

---

## 5. Known limitations still deferred (unchanged from before)

- **`MemorySaver`**: in-process only, lost on restart. Swap for
  `SqliteSaver`/`PostgresSaver` before any real deployment — you decided to
  defer this, still true.
- **No hybrid (BM25) search**: you decided to skip this for now rather than
  touch the already-ingested collection. Dense-only retrieval with MMR +
  reranking is a solid baseline; hybrid can be added later as a migration
  (new collection, sparse vectors computed from already-stored `page_content`
  — no PDF/JSON reprocessing needed) whenever you're ready.
- **Reranker latency on CPU**: if `bge-reranker-base` proves too slow once
  you measure real production latency, `RERANKER_MODEL_NAME` in `.env` is a
  one-line swap to a lighter model — no code changes required.
