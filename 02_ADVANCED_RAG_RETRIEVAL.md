# Step 2 (Qdrant) — Advanced RAG Retrieval Pipeline

**Prerequisite:** Step 1 (`01_SETUP_QDRANT_ENV.md`) is complete —
`scripts/verify_qdrant_rag.py` passes against your real `medical_triage_kb`
collection.

**Goal:** implement self-querying metadata filtering, score-threshold
hallucination prevention, MMR diversification, and cross-encoder reranking —
correctly combined into one coherent pipeline, not four features bolted on
independently.

---

## 0. One thing to understand before the code: why these four features need
a specific order, and why Ayurvedic filtering is handled separately

**LangChain's Qdrant self-query translator only supports five comparators:
`EQ, LT, LTE, GT, GTE`** (not `CONTAIN`, `LIKE`, or any "field is not empty"
concept). This is a real, verified limitation of `QdrantTranslator`, not an
oversight on your part. It means the LLM-driven self-query mechanism is great
for exact-match filters like `document_type = "structured_json_db"` or
`name = "Anxiety"`, but it **cannot** express "give me chunks where
`ayurvedic_deep_herbs` is not empty" — there's no comparator for that.

So this pipeline uses **two different filtering mechanisms for two different
jobs**:
- **Self-query** (LLM-driven) for clean categorical attributes: `name`,
  `entity_type`, `source`, `source_book`, `document_type`, `page_number`.
- **A deterministic keyword check + a direct Qdrant `IsEmptyCondition`
  filter** for the one case that needs "does this field have content":
  detecting Ayurvedic-remedy intent and requiring
  `ayurvedic_deep_herbs`/`ayurvedic_terms` to be non-empty.

This isn't a workaround bolted on to cover a gap — it's using the right tool
for each job, which is what keeps a multi-technique pipeline like this from
becoming "dumb."

**Why MMR runs before reranking, not after:** cross-encoder reranking scores
each candidate purely on relevance — it has no concept of diversity, so
reranking-first could hand you back five near-duplicate paragraphs that all
happen to score highest. MMR-first reduces the candidate pool to a diverse
set, and reranking then chooses the best *ordering within that diverse set* —
so the final answer has both variety (diagnostic + Ayurvedic + Allopathic
chunks, as you wanted) and precision.

**Pipeline order:**
```
natural language query
  -> self-query LLM call extracts a Qdrant filter (name/type/source/etc.)
  -> merge in Ayurvedic must_not(IsEmptyCondition) filter if intent detected
  -> Qdrant dense search: combined filter + native score_threshold + fetch_k candidates
  -> MMR selects a diverse subset from those candidates
  -> cross-encoder reranks the diverse subset
  -> top final_k chunks returned
```

---

## 1. Metadata schema for self-querying — `app/rag/attribute_schema.py`

Built directly from your real JSON metadata example (`source`, `entity_type`,
`name`, `document_type`, plus PDF-only `source_book`/`page_number`).
Deliberately **excludes** `symptoms`, `indian_allopathic_medicines`,
`ayurvedic_deep_herbs`, `ayurvedic_terms` — these are free-text comma-separated
lists, not clean categorical values, so an `EQ` filter on them would almost
never match anything a real user types. The Ayurvedic signal is handled by
the deterministic mechanism in section 3 instead.

```python
from langchain.chains.query_constructor.base import AttributeInfo

DOCUMENT_CONTENT_DESCRIPTION = (
    "Medical reference information for triage: structured disease/symptom/"
    "medicine records from a curated JSON database, and raw text chunks "
    "extracted from medical textbooks (PDFs)."
)

METADATA_FIELD_INFO = [
    AttributeInfo(
        name="document_type",
        description=(
            "Whether this chunk comes from the structured JSON medical "
            "database ('structured_json_db') or from a raw PDF textbook "
            "('medical_reference')."
        ),
        type="string",
    ),
    AttributeInfo(
        name="name",
        description=(
            "The specific disease, condition, or medical entity this chunk "
            "is about, e.g. 'Anxiety', 'Dengue Fever', 'Migraine'. Only "
            "present on structured_json_db chunks. Use this when the user "
            "names a specific condition."
        ),
        type="string",
    ),
    AttributeInfo(
        name="entity_type",
        description=(
            "The category of medical entity, e.g. 'disease', 'symptom', "
            "'medicine'. Only present on structured_json_db chunks."
        ),
        type="string",
    ),
    AttributeInfo(
        name="source",
        description=(
            "The origin database of a structured_json_db chunk, e.g. "
            "'medlineplus'. Only present on structured_json_db chunks."
        ),
        type="string",
    ),
    AttributeInfo(
        name="source_book",
        description=(
            "The filename of the source PDF textbook. Only present on "
            "medical_reference (PDF-derived) chunks."
        ),
        type="string",
    ),
    AttributeInfo(
        name="page_number",
        description="Page number within the source PDF book. Only present on medical_reference chunks.",
        type="integer",
    ),
]
```

---

## 2. Ayurvedic-intent detector — `app/rag/intent.py`

A fast keyword check, not an LLM call — deterministic, free, and good enough
for this one gate. Can be upgraded to an LLM classifier later if you find
real conversations it misses.

```python
import re

_AYURVEDIC_TRIGGERS = [
    r"ayurved",
    r"\bherb",
    r"herbal",
    r"natural remedy",
    r"home remedy",
    r"desi (ilaj|nuska)",
    r"gharelu",
    r"kadha",
    r"traditional medicine",
]
_COMPILED = [re.compile(p, re.IGNORECASE) for p in _AYURVEDIC_TRIGGERS]


def wants_ayurvedic_info(text: str) -> bool:
    """
    Whether the user is specifically asking for Ayurvedic/home-remedy
    guidance. Drives the must_not(IsEmptyCondition) filter merge in
    advanced_retrieval.py -- see the note in this file's header about why
    this can't go through the self-query mechanism itself.
    """
    return any(p.search(text) for p in _COMPILED)
```

---

## 3. The core pipeline — `app/rag/advanced_retrieval.py`

```python
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
    mmr_k = min(settings.mmr_k, len(docs))
    mmr_indices = maximal_marginal_relevance(query_vector, vectors, lambda_mult=settings.mmr_lambda, k=mmr_k)
    diverse_docs = [docs[i] for i in mmr_indices]

    # Cross-encoder rerank: precision-sort within the diverse set
    reranker = get_reranker()
    pairs = [(natural_language_context, d.page_content) for d in diverse_docs]
    rerank_scores = reranker.predict(pairs)
    ranked = sorted(zip(diverse_docs, rerank_scores), key=lambda x: x[1], reverse=True)
    top_docs = [d for d, _ in ranked[:final_k]]

    logger.info(
        "Retrieval: %d passed threshold -> %d after MMR -> %d final after rerank",
        len(docs), len(diverse_docs), len(top_docs),
    )
    return top_docs
```

---

## 4. Wire into the LangGraph agent — replace `app/graph/retrieval.py`

```python
"""REPLACES the Chroma-based version of this file entirely."""

from app.rag.advanced_retrieval import advanced_retrieve


def build_dense_query(symptom_facts: dict) -> str:
    parts = []
    if symptom_facts.get("primary_symptom"):
        parts.append(symptom_facts["primary_symptom"])
    if symptom_facts.get("duration"):
        parts.append(f"for {symptom_facts['duration']}")
    if symptom_facts.get("severity") and symptom_facts["severity"] != "unknown":
        parts.append(f"{symptom_facts['severity']} severity")
    if symptom_facts.get("associated_symptoms"):
        parts.append("with " + ", ".join(symptom_facts["associated_symptoms"]))
    return " ".join(parts) or "general symptom inquiry"


def retrieve_condition_docs(symptom_facts: dict, latest_user_message: str):
    dense_query = build_dense_query(symptom_facts)
    return advanced_retrieve(dense_query_text=dense_query, natural_language_context=latest_user_message)


def retrieve_remedy_docs(condition_name: str, latest_user_message: str):
    dense_query = f"home remedies and over the counter treatment for {condition_name}"
    return advanced_retrieve(dense_query_text=dense_query, natural_language_context=latest_user_message)
```

**Update `app/graph/build_graph.py`** — the two node functions that call
retrieval now also need the latest raw user message (for self-query + intent
detection). Replace these two functions:

```python
def rag_retrieval_node(state: TriageState) -> dict:
    latest_user_message = next(
        (m.content if hasattr(m, "content") else m.get("content", "")
         for m in reversed(state["messages"])
         if getattr(m, "type", m.get("role") if isinstance(m, dict) else None) in ("human", "user")),
        "",
    )
    docs = retrieve_condition_docs(state["symptom_facts"], latest_user_message)
    serializable_docs = [{"page_content": d.page_content, "metadata": d.metadata} for d in docs]
    return {"retrieved_docs": serializable_docs, "stage": "rag"}


def remedy_node(state: TriageState) -> dict:
    conditions = state.get("possible_conditions", [])
    if not conditions:
        return {"stage": "done"}

    top_condition = conditions[0]["name"]
    latest_user_message = next(
        (m.content if hasattr(m, "content") else m.get("content", "")
         for m in reversed(state["messages"])
         if getattr(m, "type", m.get("role") if isinstance(m, dict) else None) in ("human", "user")),
        "",
    )
    patient_context = {
        "age_group": state["symptom_facts"].get("age_group"),
        "is_pregnant": state["symptom_facts"].get("is_pregnant"),
        "known_allergies": state["symptom_facts"].get("known_allergies"),
    }

    docs = retrieve_remedy_docs(top_condition, latest_user_message)
    from app.graph.synthesis import format_docs_for_prompt
    context_text = format_docs_for_prompt(docs)

    from langchain_core.prompts import ChatPromptTemplate
    from app.core.llm import get_llm
    from app.schemas.state import RemedyOutput

    # (reuse the same _REMEDY_SYSTEM_PROMPT / generate_remedy logic from the
    # original remedy.py -- only the doc-retrieval call changed, from Chroma
    # to advanced_retrieve via retrieve_remedy_docs above)
    from app.graph.remedy import _REMEDY_SYSTEM_PROMPT

    prompt = ChatPromptTemplate.from_messages([("system", _REMEDY_SYSTEM_PROMPT)])
    llm = get_llm(temperature=0.2)
    result = (prompt | llm.with_structured_output(RemedyOutput)).invoke({
        "condition_name": top_condition,
        "patient_context": patient_context,
        "context": context_text,
    })

    remedy_text = (
        f"Home remedies to consider: {'; '.join(result.home_remedies)}.\n\n"
        f"OTC options (general guidance only): {'; '.join(result.otc_options) or 'none specifically supported by sources'}.\n\n"
        f"{result.dosage_disclaimer}\n\n"
        f"Seek medical care if you notice: {'; '.join(result.red_flags_to_watch_for)}."
    )
    return {
        "remedy_response": result.model_dump(),
        "messages": [{"role": "assistant", "content": remedy_text}],
        "stage": "done",
    }
```

---

## 5. Test script — `scripts/test_advanced_retrieval.py`

Three cases: a plain symptom query, a named-condition self-query filter
test, and the Ayurvedic-intent filter test.

```python
import sys
sys.path.insert(0, ".")

from app.core.tracing import init_tracing
from app.rag.advanced_retrieval import advanced_retrieve

init_tracing()


def run_case(label, dense_query, nl_context):
    print(f"\n=== {label} ===")
    docs = advanced_retrieve(dense_query_text=dense_query, natural_language_context=nl_context)
    if not docs:
        print("No chunks passed the score threshold -- pipeline correctly returned nothing.")
        return
    for i, d in enumerate(docs, 1):
        label_name = d.metadata.get("name") or d.metadata.get("source_book") or "unknown"
        print(f"{i}. score={d.metadata.get('_score'):.3f} | {label_name}")
        print(f"   {d.page_content[:150]}...")


run_case(
    "Plain symptom query",
    "anxiety with dizziness and shortness of breath",
    "I've been feeling anxious with dizziness and shortness of breath",
)
run_case(
    "Named-condition self-query filter test (expects name='Anxiety')",
    "anxiety",
    "Tell me specifically about Anxiety",
)
run_case(
    "Ayurvedic-intent filter test (expects only chunks with ayurvedic_deep_herbs)",
    "anxiety remedies",
    "What are some Ayurvedic remedies for anxiety?",
)
```

```bash
python scripts/test_advanced_retrieval.py
```

---

## ✅ Success criteria for this step

1. **Plain query** returns relevant chunks with real scores — note the score
   range and compare against `SCORE_THRESHOLD=0.80` from Step 1's raw test.
2. **Named-condition test** returns chunks where `name == "Anxiety"` (or very
   close matches) — proves self-query filtering is actually constraining
   results, not just ignoring the filter.
3. **Ayurvedic-intent test** returns ONLY chunks that have real content in
   `ayurvedic_deep_herbs`/`ayurvedic_terms` — check this by inspecting
   `d.metadata` in the printed output. If a returned chunk has an empty
   Ayurvedic field, the `IsEmptyCondition` merge isn't working — check the
   `metadata.ayurvedic_deep_herbs` key path matches your actual payload
   structure exactly (Step 1's `verify_qdrant_rag.py` output shows real
   payload shape if you need to double check).
4. Log lines show `"Retrieval: N passed threshold -> M after MMR -> K final
   after rerank"` with `N >= M >= K` each time — confirms the full pipeline
   ran, not just a subset of it.

---

## What's next

**`03_FASTAPI_QDRANT_INTEGRATION.md`** wires this into the FastAPI service —
the startup warm-up now loads the Qdrant client + embeddings + reranker
(replacing the old Chroma warm-up), and includes an end-to-end curl test
demonstrating self-query + Ayurvedic filtering + reranking working through
the full HTTP API.
