from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class StartSessionRequest(BaseModel):
    initial_message: Optional[str] = Field(default=None, description="Optional starting message from the user")

class StartSessionResponse(BaseModel):
    thread_id: str = Field(description="Unique session ID to pass in subsequent messages")
    message: Optional[str] = Field(default=None, description="Initial greeting or response from agent")

class ChatMessageRequest(BaseModel):
    thread_id: str = Field(description="The active session thread ID")
    message: str = Field(description="The user's message text", max_length=2000)

class ChatMessageResponse(BaseModel):
    message: str = Field(description="The AI agent's response")
    is_complete: bool = Field(default=False, description="True if a final diagnosis/remedy was reached")
    stage: str = Field(description="The current internal stage of the triage graph")
    symptom_facts: Dict[str, Any] = Field(default_factory=dict, description="Current known facts about the patient")
