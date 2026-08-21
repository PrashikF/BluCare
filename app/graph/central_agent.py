import json
import re

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.llm import get_llm
from app.schemas.state import CentralAgentOutput

def summarize_chat(chat_history_text: str) -> str:
    from langchain_groq import ChatGroq
    from app.core.config import settings
    # Use a faster, cheaper model for summarization using the secondary API key to avoid rate limits
    llm = ChatGroq(
        model=settings.groq_model,
        temperature=0.1,
        groq_api_key=settings.groq_api_key,
    )
    prompt = "Summarize the following medical conversation history concisely in 2-3 sentences. Focus on symptoms, timeline, and patient details. Omit pleasantries."
    response = llm.invoke([SystemMessage(content=prompt), HumanMessage(content=chat_history_text)])
    return response.content



_CENTRAL_AGENT_SYSTEM_PROMPT = """You are a highly intelligent medical central agent for a LangGraph triage system.
Your job is to read the conversation, extract medical facts, check for emergencies, and intelligently route the user to the next step.

Rules:
1. **Fact Extraction**: Update `symptom_updates` ONLY with new or changed symptoms, duration, and patient details mentioned in the latest turn. If a detail was already extracted, leave the field null/empty to save tokens.
2. **Retractions**: If the patient denies a previously stated symptom or corrects themselves (e.g. "I don't have a fever"), add that symptom to `symptoms_to_remove` so it can be purged.
3. **Routing**: 
   - Ask clarifying questions (`decision='ask_question'`) to deeply understand the patient's condition. You MUST ask at least 3 to 5 questions (one at a time) across multiple turns to build a comprehensive symptom list before moving to the next step.
   - ONLY when you have fully confirmed all symptoms and details (after 3-5 turns), trigger RAG (`decision='call_rag'`) with a highly detailed, comprehensive `rag_query` sentence. **CRITICAL: NEVER select 'call_rag' if 'Turn count so far' is less than 3.**
   - If 'Retrieved conditions' are provided below, do NOT call RAG again. You MUST choose `decision='final_synthesis'` or `decision='ask_question'`.
   - **Post-Prediction Phase**: If 'Predicted Conditions' are provided below, the diagnosis is already done! 
     * If the user explicitly asks for remedies/treatments, use `decision='call_remedy'`.
     * If the user asks for nearby hospitals, clinics, or ambulances, use `decision='call_facilities'`. Extract their Lat/Lon from their message context if provided.
     * If the user asks general questions about the diagnosis, use `decision='post_diagnosis_chat'`.
4. Be concise, intelligent, and deeply analytical. Treat retrieved conditions as possibilities, not confirmed diagnoses.

Patient's known structured facts:
{known_facts}

Previous Chat Summary (if any):
{chat_summary}

Retrieved conditions based on current symptoms (if any):
{top_conditions}

Predicted Conditions (if any, meaning diagnosis is done):
{possible_conditions}

Turn count so far: {turn_count} (Soft cap: {max_turns} — if you're at or past this, force 'call_rag' or 'final_synthesis')
"""

_central_agent_prompt = ChatPromptTemplate.from_messages([
    ("system", _CENTRAL_AGENT_SYSTEM_PROMPT),
    ("placeholder", "{conversation}"),
])

def central_agent_node_impl(conversation_messages: list, known_facts: dict, top_conditions: list, possible_conditions: list, turn_count: int, max_turns: int, state_summary: str | None = None) -> CentralAgentOutput:
    # We slice the conversation to only the last 6 messages to strictly enforce token limits,
    # relying on the rolling summary to preserve older context.
    recent_messages = conversation_messages[-6:] if len(conversation_messages) > 6 else conversation_messages
    
    llm = get_llm(temperature=0.2)
    structured_llm = llm.with_structured_output(CentralAgentOutput)
    chain = _central_agent_prompt | structured_llm
    
    # Hide RAG docs from the router to save massive tokens if we already have a diagnosis
    conditions_text = "Hidden (diagnosis already made)." if possible_conditions else (
        "\n".join([f"- {doc['page_content']}" for doc in top_conditions]) if top_conditions else "None retrieved yet."
    )
    predicted_text = "\n".join([f"- {c['name']}: {c['reason']}" for c in possible_conditions]) if possible_conditions else "No diagnosis made yet."
    
    return chain.invoke({
        "top_conditions": conditions_text,
        "possible_conditions": predicted_text,
        "known_facts": json.dumps(known_facts, indent=2),
        "chat_summary": state_summary if state_summary else "No summary yet.",
        "turn_count": turn_count,
        "max_turns": max_turns,
        "conversation": recent_messages,
    })
