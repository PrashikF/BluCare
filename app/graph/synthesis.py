from langchain_core.prompts import ChatPromptTemplate

from app.core.llm import get_llm
from app.schemas.state import ConditionSynthesisOutput

_SYNTHESIS_SYSTEM_PROMPT = """You are a medical information assistant powered by Retrieval-Augmented Generation (RAG).

Always answer ONLY using the retrieved context. Never invent or assume medical facts that are not supported by the retrieved documents.

Provide a final assessment that includes:
- Summary of the reported symptoms
- Most likely condition
- Alternative possible condition(s)
- Brief explanation of why the leading condition best matches the collected information
- Recommendation to consult a healthcare professional for confirmation

Never present a diagnosis as certain. Use phrases such as "most likely," "possible," or "consistent with."
Be clear, empathetic, and easy to understand. Avoid alarming language.
If the retrieved context is insufficient, say you don't have enough information rather than guessing.

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
