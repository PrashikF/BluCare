# Step 1 — Project Setup, Environment, and RAG Singleton Loader

**Goal of this step:** stand up the project skeleton, install dependencies, wire up
API keys, and build a Chroma loader that loads the vectorstore **exactly once per
process** (not once per request). At the end of this step you will run one script
and confirm retrieval works against your real 30-book `medical_kb` collection.

Do not proceed to Step 2 until the verification command at the bottom of this file
prints real retrieved chunks from your books.

---

## 0. Context the agent must know before touching anything

- The user already has a populated Chroma DB on disk at `./chroma_db_backup`
  (folder contains a UUID-named subfolder with `data_level0.bin`, `header.bin`,
  `index_metadata.pickle`, `length.bin`, `link_lists.bin`, and a `chroma.sqlite3`
  file). **Do not recreate, re-embed, or delete this data.** It was built with:

  ```python
  from langchain_huggingface import HuggingFaceEmbeddings
  from langchain_chroma import Chroma

  embedding = HuggingFaceEmbeddings(
      model_name="BAAI/bge-base-en-v1.5",
      encode_kwargs={"normalize_embeddings": False},
  )

  db = Chroma(
      persist_directory="./chroma_db_backup",
      collection_name="medical_kb",
      embedding_function=embedding,
  )
  ```

- **The embedding model, `normalize_embeddings` value, `persist_directory`, and
  `collection_name` must match this EXACTLY** in all code we write. If any of
  these differ, Chroma will either error on load or silently return irrelevant
  results because query vectors won't be comparable to the stored vectors.

- This project will use **Groq** for all LLM text generation (question-asking,
  condition synthesis, remedy generation). Groq does not serve embedding models,
  so embeddings stay 100% local via `HuggingFaceEmbeddings` as above — this is
  not a choice to revisit later, it's required to match the existing index.

- We are also installing skills from the `agentic-awesome-skills` library
  (https://github.com/sickn33/agentic-awesome-skills), specifically the
  **"AAS Agent & MCP Builder"** plugin bundle, which is built for exactly this
  kind of work: agentic apps, RAG systems, and eval loops. Install it into
  Antigravity's skill path so the coding agent can reference it during later
  steps (structuring the RAG retrieval layer, later eval work in a future
  phase). This does not replace anything in this MD file — it's supplementary
  guidance the agent should read if unsure how to structure a RAG-backed
  agentic tool.

---

## 1. Prerequisites check

Run these and confirm versions exist before continuing:

```bash
python3 --version        # need 3.10+
node --version            # needed only for the npx skills installer below
```

---

## 2. Create the project skeleton

```bash
mkdir -p symptom-triage-agent
cd symptom-triage-agent

mkdir -p app/core
mkdir -p app/rag
mkdir -p app/graph
mkdir -p app/schemas
mkdir -p scripts
mkdir -p tests

# move/copy your existing chroma backup into the project root
# (adjust source path to wherever chroma_db_backup currently lives)
cp -r /path/to/your/chroma_db_backup ./chroma_db_backup
```

Expected folder shape after this step:

```
symptom-triage-agent/
├── app/
│   ├── core/
│   ├── rag/
│   ├── graph/
│   └── schemas/
├── scripts/
├── tests/
├── chroma_db_backup/       <- your existing populated Chroma data
├── .env
├── requirements.txt
└── venv/ (or .venv/)
```

---

## 3. Install the agentic-awesome-skills library (for Antigravity)

This gives your Antigravity coding agent structured playbooks for RAG /
agent-building work while you build the rest of this project.

```bash
npx agentic-awesome-skills --antigravity
```

Verify:

```bash
test -d ~/.agents/skills && echo "Skills installed in ~/.agents/skills"
```

Then, inside Antigravity, you can invoke the relevant bundle with:

```
Use @agent-mcp-builder to review the RAG retrieval layer in app/rag/
```

(This is optional assistive tooling — it does not replace anything below. If
the skill isn't found under that exact name, browse `~/.agents/skills` and use
whichever RAG/agent-building skill is present; do not block on this.)

---

## 4. Python virtual environment

```bash
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
```

---

## 5. requirements.txt

Create `requirements.txt` with exactly this content:

```txt
# --- LangChain / LangGraph core ---
langchain==0.3.27
langchain-core==0.3.79
langgraph==0.2.62
langchain-groq==0.2.1

# --- RAG / vectorstore (must match how the DB was originally built) ---
langchain-chroma==0.1.4
langchain-huggingface==0.1.2
chromadb==0.5.23
sentence-transformers==3.3.1

# --- LangSmith tracing/eval ---
langsmith==0.1.147

# --- FastAPI service layer (used starting Step 3, install now) ---
fastapi==0.115.6
uvicorn[standard]==0.32.1
pydantic==2.10.4
pydantic-settings==2.7.0

# --- Utilities ---
python-dotenv==1.0.1
```

Install:

```bash
pip install -r requirements.txt
```

> If any pinned version fails to resolve on your Python version, let the
> Antigravity agent bump only the failing package to its nearest compatible
> release — do not mass-upgrade everything.

---

## 6. Environment variables — create `.env`

Create a file named `.env` in the project root:

```env
# --- Groq ---
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# --- LangSmith ---
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=symptom-triage-agent
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# --- Chroma / RAG ---
CHROMA_PERSIST_DIR=./chroma_db_backup
CHROMA_COLLECTION_NAME=medical_kb
EMBEDDING_MODEL_NAME=BAAI/bge-base-en-v1.5

# --- App ---
APP_ENV=development
MAX_INTAKE_TURNS=7
CONFIDENCE_THRESHOLD=0.75
RAG_TOP_K=5
```

Get your keys from:
- Groq: https://console.groq.com/keys
- LangSmith: https://smith.langchain.com/ (Settings → API Keys)

Add `.env` and `venv/` to a `.gitignore`:

```txt
venv/
.env
__pycache__/
*.pyc
chroma_db_backup/
```

(`chroma_db_backup/` is listed in gitignore because it's large binary data —
don't commit it; treat it as a local/deployed artifact.)

---

## 7. Centralized settings — `app/core/config.py`

This is the ONE place that reads environment variables. Nothing else in the
codebase should call `os.environ` directly — everything imports `settings`
from here. This matters for a clean production architecture: config becomes
testable and mockable.

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

    # Chroma / RAG — MUST match how chroma_db_backup was originally built
    chroma_persist_dir: str = "./chroma_db_backup"
    chroma_collection_name: str = "medical_kb"
    embedding_model_name: str = "BAAI/bge-base-en-v1.5"

    # App behavior
    app_env: str = "development"
    max_intake_turns: int = 7
    confidence_threshold: float = 0.75
    rag_top_k: int = 5


settings = Settings()
```

---

## 8. The RAG singleton loader — `app/rag/store.py`

**This is the most important file in this step.** It guarantees the Chroma
vectorstore and embedding model are loaded exactly once per running process,
no matter how many times a node or API request calls into it.

```python
"""
Singleton loader for the Chroma vectorstore.

Design rule: nothing outside this file may call `Chroma(...)` or
`HuggingFaceEmbeddings(...)` directly. Every other module imports
`get_vectorstore()` or `get_retriever()` from here. This guarantees the
(potentially slow) embedding model + vectorstore load happens ONCE per
process, not once per request.
"""

import logging
import threading

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from app.core.config import settings

logger = logging.getLogger(__name__)

_embeddings = None
_vectorstore = None
_lock = threading.Lock()


def get_embeddings() -> HuggingFaceEmbeddings:
    global _embeddings
    if _embeddings is None:
        with _lock:
            if _embeddings is None:  # double-checked locking
                logger.info(
                    "Loading embedding model '%s' (should print once per process)",
                    settings.embedding_model_name,
                )
                _embeddings = HuggingFaceEmbeddings(
                    model_name=settings.embedding_model_name,
                    encode_kwargs={"normalize_embeddings": False},
                )
    return _embeddings


def get_vectorstore() -> Chroma:
    global _vectorstore
    if _vectorstore is None:
        with _lock:
            if _vectorstore is None:
                logger.info(
                    "Loading Chroma collection '%s' from '%s' (should print once per process)",
                    settings.chroma_collection_name,
                    settings.chroma_persist_dir,
                )
                _vectorstore = Chroma(
                    persist_directory=settings.chroma_persist_dir,
                    collection_name=settings.chroma_collection_name,
                    embedding_function=get_embeddings(),
                )
    return _vectorstore


def get_retriever(k: int | None = None, filter: dict | None = None):
    """
    Returns a retriever bound to the singleton vectorstore.
    Safe to call as many times as you want — it's cheap after first load.
    """
    vs = get_vectorstore()
    search_kwargs = {"k": k or settings.rag_top_k}
    if filter:
        search_kwargs["filter"] = filter
    return vs.as_retriever(search_kwargs=search_kwargs)


def warm_up():
    """
    Call this once at application startup (FastAPI lifespan, in Step 3) to
    force the load to happen at boot time rather than on the first user
    request. Safe to call multiple times.
    """
    get_vectorstore()
    logger.info("RAG store warm-up complete.")
```

**Why the lock + double-checked pattern:** if your FastAPI server (Step 3) runs
with multiple async workers hitting this on first request simultaneously, the
lock prevents loading the embedding model twice in a race. For a single
dev-server run this is mostly precautionary, but it's the correct production
pattern and it costs nothing.

---

## 9. Verification script — `scripts/verify_rag.py`

```python
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
```

Run it:

```bash
python scripts/verify_rag.py
```

---

## ✅ Success criteria for this step

You must see ALL of the following before moving to Step 2:

1. `Call 1` prints a "Loading embedding model..." log line and takes a
   noticeable amount of time (several seconds, since `bge-base-en-v1.5` is
   loading into memory).
2. `Call 2` is near-instant (milliseconds) — this proves the singleton is
   working and the model is NOT reloading per call.
3. The test query returns real chunks with `metadata` and readable
   `page_content` from your actual 30-book corpus — not empty, not an error.
4. If `doc.metadata` includes things like a book title / source filename,
   note the exact metadata key names (e.g. `source`, `book`, `title`) — you
   will need these exact key names in Step 2 for citations.

If retrieval returns nothing or errors: stop, do not proceed to Step 2. The
most common causes are a wrong `CHROMA_PERSIST_DIR` path (must point at the
folder containing the UUID subfolder + `chroma.sqlite3`, not the UUID
subfolder itself) or a mismatched `collection_name`.

---

## What's next

Once `scripts/verify_rag.py` passes, move to
**`02_LANGGRAPH_AGENT_CORE.md`**, which builds the actual intake loop, safety
check, RAG retrieval node, condition synthesis, and remedy node using
LangGraph + Groq, all wired through the `get_retriever()` singleton built here.
