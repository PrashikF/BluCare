from langchain_core.prompts import ChatPromptTemplate

from app.core.llm import get_llm
from app.graph.retrieval import retrieve_remedy_docs
from app.graph.synthesis import format_docs_for_prompt
from app.schemas.state import RemedyOutput

_REMEDY_SYSTEM_PROMPT = """You summarize home-remedy and OTC (over-the-counter) \
guidance for a likely condition, based ONLY on the retrieved reference text below.

STRICT RULES:
- You must explain exactly *why* a remedy helps the specific symptoms (e.g. \
"Ginger tea: Helps soothe the throat inflammation caused by your cough").
- You may name a specific OTC medication category or common generic drug name \
ONLY IF it is explicitly present in the retrieved context. 
- If the context gives a specific dosage, you may restate it, but ALWAYS \
frame it as "typical guidance is X", never as a personalized prescription.
- If the context does not support any specific medication, say so and offer \
only general home-remedy / rest / hydration style guidance instead.
- Always populate red_flags_to_watch_for with concrete escalation signs.

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
