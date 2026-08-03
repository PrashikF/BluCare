from typing import Annotated, Literal, TypedDict

from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field


class SymptomUpdates(BaseModel):
    """Fields that changed in the current turn. Only output fields that were newly discovered or updated. Omit fields that haven't changed to save tokens."""
    primary_symptom: str | None = None
    duration: str | None = None
    severity: Literal["mild", "moderate", "severe", "unknown"] | None = None
    associated_symptoms: list[str] | None = Field(
        default=None, 
        description="A list of strings representing associated symptoms. MUST be an array."
    )
    age_group: Literal["infant", "child", "adult", "elderly", "unknown"] | None = None
    is_pregnant: bool | None = None  # None = not yet asked / not applicable
    known_allergies: list[str] | None = Field(
        default=None, 
        description="A list of strings representing known allergies. MUST be an array."
    )
    notes: str | None = None
    symptoms_to_remove: list[str] | None = Field(
        default=None, 
        description="If the patient corrects themselves and explicitly denies a symptom they previously claimed, list it here so we can delete it from their record."
    )


class CentralAgentOutput(BaseModel):
    """Unified output from the central medical agent."""
    symptom_updates: SymptomUpdates = Field(description="Only the patient facts that changed during this turn.")

    decision: Literal["ask_question", "call_rag", "final_synthesis", "call_remedy", "post_diagnosis_chat"] = Field(
        description="The next action to take."
    )
    response_to_user: str = Field(
        description="The natural chat/question text to send to the user (if asking a question) or an empty string otherwise."
    )
    rag_query: str = Field(
        description="A single compact symptom-summary sentence used for RAG lookup. Only populate if decision is 'call_rag'."
    )
    confidence_score: float = Field(
        ge=0.0, le=1.0,
        description="0-1 confidence in the decision."
    )


class PossibleCondition(BaseModel):
    name: str
    reason: str = Field(description="Briefly explain why this condition matches the symptoms.")


class ConditionSynthesisOutput(BaseModel):
    summary: list[str] = Field(description="Summary of the reported symptoms")
    most_likely_condition: PossibleCondition = Field(description="The most likely condition matching the symptoms.")
    alternative_conditions: list[PossibleCondition] = Field(description="Alternative possible condition(s)")
    explanation: str = Field(description="Brief explanation of why the leading condition best matches the collected information")
    recommendation: str = Field(description="Recommendation to consult a healthcare professional for confirmation")


class RemedyDetail(BaseModel):
    name: str
    why_it_helps: str = Field(
        description="Short, clear explanation of why this specifically helps the user's disease and symptoms."
    )


class RemedyOutput(BaseModel):
    home_remedies: list[RemedyDetail]
    otc_options: list[RemedyDetail] = Field(
        description="Only OTC categories/names explicitly present in retrieved chunks. "
        "Generic guidance only if no specific chunk supports a specific drug."
    )
    red_flags_to_watch_for: list[str] = Field(
        description="Symptoms that mean the user should escalate to a doctor/ER immediately."
    )


class TriageState(TypedDict):
    messages: Annotated[list, add_messages]
    chat_summary: str | None
    symptom_facts: dict
    turn_count: int
    confidence_score: float

    latest_rag_query: str | None
    router_decision: str | None
    retrieved_docs: list
    possible_conditions: list[dict]
    remedy_response: dict | None
    stage: str
