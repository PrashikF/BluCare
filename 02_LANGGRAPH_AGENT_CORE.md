# Step 2 — LangGraph Agent Core

**Prerequisite:** Step 1 (`01_SETUP_AND_RAG_LOADER.md`) is complete and
`scripts/verify_rag.py` passes with real retrieved chunks.

**Goal of this step:** build the actual multi-turn agent as a LangGraph state
machine: an intake loop that asks one focused question at a time, a safety
check that runs after every turn, RAG retrieval against `medical_kb`, a
condition-synthesis node, and a remedy node — all using Groq for generation
and LangSmith for tracing. At the end of this step you will run a
command-line test harness (no FastAPI yet — that's Step 3) and have a full
traced conversation visible in your LangSmith dashboard.

---

## 0. Non-negotiable safety framing (read this before writing prompts)

This agent is a **triage / educational assistant**, not a diagnostic
authority. Every prompt template in this file already encodes this — do not
loosen the language when implementing, even for a hackathon demo. Concretely:

- The agent NEVER says "you have X" — only "your symptoms are consistent
  with X, according to [source]."
- A hard-coded safety check runs after every user answer, independent of the
  LLM's judgment, checking for a fixed list of red-flag symptom combinations.
  If triggered, the graph short-circuits to an emergency-response node
  regardless of where it is in the flow.
- The remedy node only ever surfaces OTC/home-remedy content that is
  retrieved from the RAG corpus — the LLM's job is to summarize retrieved
  chunks, never to generate medication/dosage guidance from its own
  parametric knowledge. The prompt explicitly forbids inventing dosages.
- Every response to the user ends with a line recommending professional
  medical evaluation. This is not optional boilerplate to trim later.

If the Antigravity agent building this is tempted to "simplify" any of the
above for speed, don't — it's a fixed requirement of this project, not a
suggestion.

---

## 1. Structured schemas — `app/schemas/state.py`

```python
from typing import Annotated, Literal, TypedDict

from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field


class SymptomFacts(BaseModel):
    """Structured facts extracted from the conversation so far. Grows turn by turn."""
    primary_symptom: str | None = None
    duration: str | None = None
    severity: Literal["mild", "moderate", "severe", "unknown"] = "unknown"
    associated_symptoms: list[str] = Field(default_factory=list)
    age_group: Literal["infant", "child", "adult", "elderly", "unknown"] = "unknown"
    is_pregnant: bool | None = None  # None = not yet asked / not applicable
    known_allergies: list[str] = Field(default_factory=list)
    notes: str | None = None


class IntakeTurnOutput(BaseModel):
    """What the LLM must return on every intake turn — one structured call, not two."""
    updated_facts: SymptomFacts
    next_question: str = Field(
        description="ONE focused follow-up question to ask the user next. "
        "Empty string if enough_info_gathered is true."
    )
    enough_info_gathered: bool = Field(
        description="True only if there is enough signal to proceed to RAG retrieval."
    )
    confidence_score: float = Field(
        ge=0.0, le=1.0,
        description="0-1 confidence that enough_info_gathered reflects a well-formed picture."
    )


class RedFlagCheck(BaseModel):
    is_red_flag: bool
    reason: str | None = None
    recommended_action: str | None = None


class PossibleCondition(BaseModel):
    name: str
    likelihood_note: str = Field(
        description="Plain language, e.g. 'commonly consistent with these symptoms' — "
        "NEVER a certainty claim."
    )
    supporting_evidence: str
    sources: list[str] = Field(default_factory=list)


class ConditionSynthesisOutput(BaseModel):
    possible_conditions: list[PossibleCondition]
    summary_for_user: str


class RemedyOutput(BaseModel):
    home_remedies: list[str]
    otc_options: list[str] = Field(
        description="Only OTC categories/names explicitly present in retrieved chunks. "
        "Generic guidance only if no specific chunk supports a specific drug."
    )
    dosage_disclaimer: str
    red_flags_to_watch_for: list[str] = Field(
        description="Symptoms that mean the user should escalate to a doctor/ER immediately."
    )


class TriageState(TypedDict):
    messages: Annotated[list, add_messages]
    symptom_facts: dict
    turn_count: int
    confidence_score: float
    red_flag: bool
    red_flag_reason: str | None
    retrieved_docs: list
    possible_conditions: list[dict]
    remedy_response: dict | None
    stage: str
```

---

## 2. Groq LLM client — `app/core/llm.py`

Single place that constructs the Groq chat model. Everything imports from
here — same singleton philosophy as the RAG store, though LLM clients are
cheap to construct so this is more about consistency than performance.

```python
from langchain_groq import ChatGroq

from app.core.config import settings

_llm = None


def get_llm(temperature: float = 0.2):
    """
    Returns a ChatGroq client. temperature=0.2 default keeps intake questions
    and synthesis focused; bump per-call if you want more variety in
    conversational phrasing later.
    """
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model=settings.groq_model,
            groq_api_key=settings.groq_api_key,
            temperature=temperature,
        )
    return _llm
```

---

## 3. Red-flag safety check — `app/graph/safety.py`

This runs a **fast keyword pre-filter first** (near-zero cost, catches
obvious cases instantly), then falls back to an LLM check only if the
pre-filter doesn't already trigger. This two-tier design keeps most turns
cheap while still catching red flags the keyword list misses.

```python
import re

from langchain_core.prompts import ChatPromptTemplate

from app.core.llm import get_llm
from app.schemas.state import RedFlagCheck

# Fast, deterministic pre-filter. Not exhaustive — the LLM check below is the
# real safety net. This list exists to catch the most severe/unambiguous
# cases instantly without waiting on an LLM call.
RED_FLAG_PATTERNS = [
    r"\bsuicid",
    r"\bkill myself\b",
    r"\bchest pain\b.*\b(breath|breathing)\b",
    r"\b(can'?t|cannot|difficulty) breath",
    r"\bsevere bleeding\b",
    r"\bunconscious\b",
    r"\bstroke\b",
    r"\bface.*droop",
    r"\bslurred speech\b",
    r"\bcoughing (up )?blood\b",
    r"\bsevere allergic reaction\b",
    r"\banaphyla",
    r"\bseizure\b",
    r"\bpoison",
    r"\boverdose\b",
]

_COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in RED_FLAG_PATTERNS]

_SAFETY_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are a clinical safety triage classifier. Given the conversation and "
     "structured facts so far, decide if this represents a medical emergency "
     "requiring IMMEDIATE professional care (ER/emergency services), as opposed "
     "to a routine/non-urgent symptom conversation. Err on the side of caution: "
     "if genuinely uncertain and there's any plausible emergency reading, mark "
     "is_red_flag=true. Do not diagnose — only flag urgency."),
    ("human",
     "Conversation so far:\n{conversation}\n\nStructured facts so far:\n{facts}\n\n"
     "Return structured output."),
])


def keyword_prefilter(text: str) -> bool:
    return any(p.search(text) for p in _COMPILED_PATTERNS)


def llm_safety_check(conversation_text: str, facts_text: str) -> RedFlagCheck:
    llm = get_llm(temperature=0.0)
    structured_llm = llm.with_structured_output(RedFlagCheck)
    chain = _SAFETY_PROMPT | structured_llm
    return chain.invoke({"conversation": conversation_text, "facts": facts_text})
```

---

## 4. Intake node — `app/graph/intake.py`

```python
import json

from langchain_core.prompts import ChatPromptTemplate

from app.core.llm import get_llm
from app.schemas.state import IntakeTurnOutput

_INTAKE_SYSTEM_PROMPT = """You are a careful medical intake assistant. Your job \
is ONLY to gather information through focused follow-up questions — you do NOT \
diagnose or suggest conditions here.

Rules:
- Ask exactly ONE clear, specific follow-up question per turn.
- Always try to fill in missing critical fields first, in roughly this priority \
order if not yet known: primary symptom, duration, severity, associated \
symptoms, age group, pregnancy status (only ask if age/sex context makes it \
relevant), known allergies.
- Do not ask about something already captured in updated_facts.
- Mark enough_info_gathered=true once you have: primary symptom, duration, \
severity, and at least one associated-symptom check (even if the answer was \
"none"). Do not require exhaustive detail — this is triage, not a full history.
- If the user's messages already reveal severe/emergency-sounding symptoms, \
still fill out updated_facts faithfully and set confidence_score high — the \
safety check is handled by a separate system, not by you.
- next_question must be empty string when enough_info_gathered is true.

Known facts so far:
{known_facts}

Turn count so far: {turn_count} (soft cap: {max_turns} — if you're at or past \
this, set enough_info_gathered=true regardless of gaps and note what's missing \
in updated_facts.notes)
"""

_intake_prompt = ChatPromptTemplate.from_messages([
    ("system", _INTAKE_SYSTEM_PROMPT),
    ("placeholder", "{conversation}"),
])


def run_intake_turn(conversation_messages: list, known_facts: dict, turn_count: int, max_turns: int) -> IntakeTurnOutput:
    llm = get_llm(temperature=0.2)
    structured_llm = llm.with_structured_output(IntakeTurnOutput)
    chain = _intake_prompt | structured_llm
    return chain.invoke({
        "known_facts": json.dumps(known_facts, indent=2),
        "turn_count": turn_count,
        "max_turns": max_turns,
        "conversation": conversation_messages,
    })
```

---

## 5. RAG retrieval node — `app/graph/retrieval.py`

Uses the Step 1 singleton — **never constructs Chroma directly here.**

```python
from app.rag.store import get_retriever


def build_rag_query(symptom_facts: dict) -> str:
    """
    Builds a clean retrieval query from structured facts rather than raw chat
    text — this is what makes retrieval quality good. Raw conversational text
    is noisy; structured facts are the actual clinical signal.
    """
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


def retrieve_condition_docs(symptom_facts: dict, k: int = 5):
    query = build_rag_query(symptom_facts)
    retriever = get_retriever(k=k)
    return retriever.invoke(query)


def retrieve_remedy_docs(condition_name: str, k: int = 4):
    """
    Second retrieval pass, scoped to remedy/treatment content for the
    identified condition. Reuses the SAME singleton retriever — just a
    different query string, not a different vectorstore instance.
    """
    retriever = get_retriever(k=k)
    query = f"home remedies and over the counter treatment for {condition_name}"
    return retriever.invoke(query)
```

---

## 6. Condition synthesis node — `app/graph/synthesis.py`

```python
from langchain_core.prompts import ChatPromptTemplate

from app.core.llm import get_llm
from app.schemas.state import ConditionSynthesisOutput

_SYNTHESIS_SYSTEM_PROMPT = """You summarize retrieved medical reference text into \
possible conditions consistent with a patient's reported symptoms.

STRICT RULES:
- NEVER say "you have X" or otherwise state a diagnosis as fact.
- Use only phrasing like "consistent with", "commonly associated with", or \
"one possibility, based on these sources, is X".
- Base every claim ONLY on the retrieved context below — do not add medical \
facts from your own general knowledge that aren't supported by the context.
- List 1-4 possible_conditions, most likely first, each with a short \
supporting_evidence string and the source citation(s) available in the \
context metadata.
- summary_for_user must end by recommending the user confirm with a licensed \
medical professional — this is not optional.
- If the retrieved context doesn't clearly support any specific condition, \
say so honestly rather than forcing a guess.

Patient's structured facts:
{facts}

Retrieved reference context:
{context}
"""

_synthesis_prompt = ChatPromptTemplate.from_messages([
    ("system", _SYNTHESIS_SYSTEM_PROMPT),
])


def format_docs_for_prompt(docs) -> str:
    blocks = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source") or doc.metadata.get("book") or doc.metadata.get("title") or "unknown source"
        blocks.append(f"[Source {i}: {source}]\n{doc.page_content}")
    return "\n\n---\n\n".join(blocks)


def synthesize_conditions(facts: dict, docs: list) -> ConditionSynthesisOutput:
    llm = get_llm(temperature=0.2)
    structured_llm = llm.with_structured_output(ConditionSynthesisOutput)
    chain = _synthesis_prompt | structured_llm
    context_text = format_docs_for_prompt(docs)
    return chain.invoke({"facts": facts, "context": context_text})
```

> **Metadata key note from Step 1:** adjust `doc.metadata.get(...)` above to
> match whatever key your 30-book ingestion pipeline actually used (you
> should have noted this in Step 1's verification output — commonly `source`,
> `book_title`, or `file_name`). Do not guess blindly here — check the real
> output from `scripts/verify_rag.py`.

---

## 7. Remedy node — `app/graph/remedy.py`

```python
from langchain_core.prompts import ChatPromptTemplate

from app.core.llm import get_llm
from app.graph.retrieval import retrieve_remedy_docs
from app.graph.synthesis import format_docs_for_prompt
from app.schemas.state import RemedyOutput

_REMEDY_SYSTEM_PROMPT = """You summarize home-remedy and OTC (over-the-counter) \
guidance for a likely condition, based ONLY on the retrieved reference text below.

STRICT RULES:
- You may name a specific OTC medication category or common generic drug name \
(e.g. "an antipyretic such as paracetamol/acetaminophen") ONLY IF it is \
explicitly present in the retrieved context. Do not invent dosages, brand \
names, or drug combinations that aren't in the context.
- If the context gives a specific dosage, you may restate it, but ALWAYS \
frame it as "typical guidance is X — confirm with a pharmacist or the product \
label for your specific case," never as a personalized prescription.
- If the context does not support any specific medication, say so and offer \
only general home-remedy / rest / hydration style guidance instead.
- Always populate red_flags_to_watch_for with concrete escalation signs (e.g. \
"fever above 103°F/39.4°C", "symptoms lasting more than X days without \
improvement", "difficulty breathing") — pull these from context where \
possible, otherwise use conservative general medical judgment.
- dosage_disclaimer must clearly state this is general information, not a \
personal medical recommendation, and that a doctor or pharmacist should be \
consulted before taking any medication — especially for children, pregnant \
individuals, the elderly, or anyone with known allergies or existing \
conditions.

Likely condition: {condition_name}
Patient context (age group, pregnancy, allergies if known): {patient_context}

Retrieved reference context:
{context}
"""

_remedy_prompt = ChatPromptTemplate.from_messages([
    ("system", _REMEDY_SYSTEM_PROMPT),
])


def generate_remedy(condition_name: str, patient_context: dict) -> RemedyOutput:
    docs = retrieve_remedy_docs(condition_name)
    context_text = format_docs_for_prompt(docs)

    llm = get_llm(temperature=0.2)
    structured_llm = llm.with_structured_output(RemedyOutput)
    chain = _remedy_prompt | structured_llm
    return chain.invoke({
        "condition_name": condition_name,
        "patient_context": patient_context,
        "context": context_text,
    })
```

---

## 8. Emergency node — `app/graph/emergency.py`

```python
def build_emergency_response(reason: str | None) -> str:
    reason_text = f" ({reason})" if reason else ""
    return (
        "⚠️ Based on what you've described"
        f"{reason_text}, this may be a medical emergency. "
        "Please seek immediate medical attention now — contact your local "
        "emergency number or go to the nearest emergency room. "
        "I'm not able to safely continue a symptom-checker conversation for "
        "this — please prioritize getting in-person medical help right away."
    )
```

---

## 9. Wiring the full graph — `app/graph/build_graph.py`

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph

from app.graph.emergency import build_emergency_response
from app.graph.intake import run_intake_turn
from app.graph.remedy import generate_remedy
from app.graph.retrieval import retrieve_condition_docs
from app.graph.safety import keyword_prefilter, llm_safety_check
from app.graph.synthesis import synthesize_conditions
from app.core.config import settings
from app.schemas.state import TriageState


def intake_node(state: TriageState) -> dict:
    result = run_intake_turn(
        conversation_messages=state["messages"],
        known_facts=state.get("symptom_facts", {}),
        turn_count=state.get("turn_count", 0),
        max_turns=settings.max_intake_turns,
    )

    updates = {
        "symptom_facts": result.updated_facts.model_dump(),
        "turn_count": state.get("turn_count", 0) + 1,
        "confidence_score": result.confidence_score,
        "stage": "intake",
    }

    if not result.enough_info_gathered and result.next_question:
        updates["messages"] = [{"role": "assistant", "content": result.next_question}]

    return updates


def safety_check_node(state: TriageState) -> dict:
    last_user_msgs = [m for m in state["messages"] if getattr(m, "type", m.get("role") if isinstance(m, dict) else None) in ("human", "user")]
    conversation_text = "\n".join(
        m.content if hasattr(m, "content") else m.get("content", "") for m in last_user_msgs
    )

    if keyword_prefilter(conversation_text):
        return {"red_flag": True, "red_flag_reason": "Keyword pre-filter matched a critical symptom phrase.", "stage": "safety"}

    check = llm_safety_check(conversation_text, str(state.get("symptom_facts", {})))
    return {
        "red_flag": check.is_red_flag,
        "red_flag_reason": check.reason,
        "stage": "safety",
    }


def emergency_node(state: TriageState) -> dict:
    response = build_emergency_response(state.get("red_flag_reason"))
    return {"messages": [{"role": "assistant", "content": response}], "stage": "done"}


def rag_retrieval_node(state: TriageState) -> dict:
    docs = retrieve_condition_docs(state["symptom_facts"])
    serializable_docs = [{"page_content": d.page_content, "metadata": d.metadata} for d in docs]
    return {"retrieved_docs": serializable_docs, "stage": "rag"}


def condition_synthesis_node(state: TriageState) -> dict:
    from langchain_core.documents import Document
    docs = [Document(page_content=d["page_content"], metadata=d["metadata"]) for d in state["retrieved_docs"]]
    result = synthesize_conditions(state["symptom_facts"], docs)
    return {
        "possible_conditions": [c.model_dump() for c in result.possible_conditions],
        "messages": [{"role": "assistant", "content": result.summary_for_user}],
        "stage": "synthesis",
    }


def remedy_node(state: TriageState) -> dict:
    conditions = state.get("possible_conditions", [])
    if not conditions:
        return {"stage": "done"}

    top_condition = conditions[0]["name"]
    patient_context = {
        "age_group": state["symptom_facts"].get("age_group"),
        "is_pregnant": state["symptom_facts"].get("is_pregnant"),
        "known_allergies": state["symptom_facts"].get("known_allergies"),
    }
    result = generate_remedy(top_condition, patient_context)

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


def route_after_intake(state: TriageState) -> str:
    if state.get("red_flag"):
        return "emergency"
    enough = state.get("confidence_score", 0) >= settings.confidence_threshold
    capped = state.get("turn_count", 0) >= settings.max_intake_turns
    return "safety_check" if (enough or capped) else "wait_for_user"


def route_after_safety(state: TriageState) -> str:
    return "emergency" if state.get("red_flag") else "rag_retrieval"


def build_graph():
    graph = StateGraph(TriageState)

    graph.add_node("intake", intake_node)
    graph.add_node("safety_check", safety_check_node)
    graph.add_node("emergency", emergency_node)
    graph.add_node("rag_retrieval", rag_retrieval_node)
    graph.add_node("condition_synthesis", condition_synthesis_node)
    graph.add_node("remedy", remedy_node)

    graph.set_entry_point("intake")

    graph.add_conditional_edges(
        "intake",
        route_after_intake,
        {
            "emergency": "emergency",
            "safety_check": "safety_check",
            "wait_for_user": END,  # pause here — real user answers next turn
        },
    )

    graph.add_conditional_edges(
        "safety_check",
        route_after_safety,
        {"emergency": "emergency", "rag_retrieval": "rag_retrieval"},
    )

    graph.add_edge("rag_retrieval", "condition_synthesis")
    graph.add_edge("condition_synthesis", "remedy")
    graph.add_edge("remedy", END)
    graph.add_edge("emergency", END)

    checkpointer = MemorySaver()  # swap for SqliteSaver/PostgresSaver in real prod
    return graph.compile(checkpointer=checkpointer)


compiled_graph = build_graph()
```

> **Important architectural note:** the `wait_for_user` branch routes to `END`
> on purpose. This is a **multi-turn conversation with a human in the loop** —
> the graph cannot ask a question and then wait inside one Python call. Each
> user message triggers one graph invocation, keyed by a stable `thread_id` via
> the checkpointer, so state (symptom_facts, turn_count, etc.) persists between
> invocations. Step 3's FastAPI layer manages this thread_id per conversation
> session — do not try to make this graph block-and-wait internally.

---

## 10. LangSmith tracing — `app/core/tracing.py`

```python
import os

from app.core.config import settings


def init_tracing():
    """Call this once at process startup, before any graph invocation."""
    os.environ["LANGCHAIN_TRACING_V2"] = str(settings.langchain_tracing_v2).lower()
    os.environ["LANGCHAIN_API_KEY"] = settings.langchain_api_key
    os.environ["LANGCHAIN_PROJECT"] = settings.langchain_project
    os.environ["LANGCHAIN_ENDPOINT"] = settings.langchain_endpoint
```

That's the entire integration — LangChain/LangGraph auto-instrument once
these env vars are set. No per-call code changes needed anywhere else.

---

## 11. Command-line test harness — `scripts/run_cli_chat.py`

This lets you manually test the full multi-turn flow before building the
FastAPI layer in Step 3.

```python
import sys
import uuid

sys.path.insert(0, ".")

from app.core.tracing import init_tracing  # noqa: E402
from app.graph.build_graph import compiled_graph  # noqa: E402

init_tracing()


def main():
    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    print("=== Symptom Triage Agent (CLI test) ===")
    print(f"(thread_id: {thread_id} — check this in LangSmith to see the trace)\n")

    user_input = input("Describe how you're feeling: ")
    state = {
        "messages": [{"role": "user", "content": user_input}],
        "symptom_facts": {},
        "turn_count": 0,
        "confidence_score": 0.0,
        "red_flag": False,
        "red_flag_reason": None,
        "retrieved_docs": [],
        "possible_conditions": [],
        "remedy_response": None,
        "stage": "start",
    }

    while True:
        result = compiled_graph.invoke(state, config=config)

        last_msg = result["messages"][-1]
        content = last_msg.content if hasattr(last_msg, "content") else last_msg.get("content")
        print(f"\nAgent: {content}\n")

        if result.get("stage") == "done":
            print("=== Conversation complete ===")
            break

        user_input = input("You: ")
        state = {"messages": [{"role": "user", "content": user_input}]}
        # LangGraph merges this into the persisted state via the checkpointer —
        # we don't need to resend symptom_facts/turn_count/etc, they're loaded
        # from the thread_id automatically.


if __name__ == "__main__":
    main()
```

Run it:

```bash
python scripts/run_cli_chat.py
```

---

## ✅ Success criteria for this step

1. Running `scripts/run_cli_chat.py` asks you one question at a time (not
   several at once), incorporates your previous answers, and eventually
   either:
   - transitions to a condition summary + remedy suggestion, citing sources, or
   - if you deliberately type something like "I have severe chest pain and
     can't breathe" — immediately shows the emergency message instead of
     continuing the questionnaire.
2. Log into https://smith.langchain.com, open the `symptom-triage-agent`
   project, and confirm you see a full trace of the conversation: each node
   (intake, safety_check, rag_retrieval, condition_synthesis, remedy) visible
   as separate steps, with the retrieved chunks visible inside the
   `rag_retrieval` step.
3. Confirm in the trace that `intake` ran multiple times (the loop) before
   `safety_check`/`rag_retrieval` fired once each.
4. Try at least one full run and one "not enough turns yet" partial run to
   confirm the `MAX_INTAKE_TURNS` cap in `.env` is respected.

If the graph errors on `with_structured_output` — confirm you're on
`langchain-groq==0.2.1`+ and using a Groq model that supports tool-calling
(e.g. `llama-3.3-70b-versatile`); not all Groq-hosted models support
structured output equally well.

---

## What's next

Once the CLI harness works and traces show up correctly in LangSmith, move to
**`03_FASTAPI_SERVICE.md`**, which wraps `compiled_graph` in a FastAPI service
with proper session/thread management, the RAG warm-up hook from Step 1, and
clean request/response endpoints your frontend (or Postman/curl for now) can
call.
