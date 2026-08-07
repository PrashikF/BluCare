from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# --- Session Models ---

class StartSessionRequest(BaseModel):
    initial_message: Optional[str] = Field(default=None, description="Optional starting message from the user")


class StartSessionResponse(BaseModel):
    thread_id: str = Field(description="Unique session ID to pass in subsequent messages")
    message: Optional[str] = Field(default=None, description="Initial greeting or response from agent")


class ChatMessageRequest(BaseModel):
    thread_id: str = Field(description="The active session thread ID")
    message: str = Field(description="The user's message text", max_length=2000)


class CitationSource(BaseModel):
    title: str
    id: str
    tag: Optional[str] = "WHO"


class ChatMessageResponse(BaseModel):
    message: str = Field(description="The AI agent's response")
    is_complete: bool = Field(default=False, description="True if a final diagnosis/remedy was reached")
    stage: str = Field(description="The current internal stage of the triage graph")
    symptom_facts: Dict[str, Any] = Field(default_factory=dict, description="Current known facts about the patient")
    risk_level: Optional[str] = Field(default="low", description="Clinical risk rating (low, medium, high)")
    confidence: Optional[float] = Field(default=0.95, description="Diagnostic confidence score 0.0-1.0")
    sources: List[CitationSource] = Field(default_factory=list, description="Clinical reference sources")


class SessionItem(BaseModel):
    id: str
    thread_id: str
    title: str
    created_at: float
    updated_at: float
    message_count: int = 0


class SessionListResponse(BaseModel):
    sessions: List[SessionItem] = Field(default_factory=list)


class HistoricalMessage(BaseModel):
    id: str
    role: str  # 'user' | 'bot'
    text: str
    timestamp: str
    stage: Optional[str] = None
    is_complete: Optional[bool] = False
    symptom_facts: Optional[Dict[str, Any]] = None


class SessionHistoryResponse(BaseModel):
    thread_id: str
    messages: List[HistoricalMessage] = Field(default_factory=list)
    symptom_facts: Dict[str, Any] = Field(default_factory=dict)
    stage: str = "unknown"


# --- Ambulance / Hospital Models ---

class AmbulanceProvider(BaseModel):
    id: str
    name: str
    type: str
    distance: str
    eta: str
    phone: str
    status: str
    driver: str
    vehicleNo: str


class NearbyAmbulancesResponse(BaseModel):
    latitude: float
    longitude: float
    providers: List[AmbulanceProvider]


# --- User Profile & Settings Models ---

class UserProfile(BaseModel):
    user_id: str
    name: str = "Prashik K."
    email: str = "prashik@ragblucare.ai"
    phone: str = "+91 94038 71129"
    dob: str = "October 14, 1998"
    bloodGroup: str = "O Positive (O+)"
    allergies: str = "Penicillin, Dust Mites"
    emergencyContact: str = "Sanket K. (+91 98765 43210)"


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    bloodGroup: Optional[str] = None
    allergies: Optional[str] = None
    emergencyContact: Optional[str] = None


class UserSettings(BaseModel):
    user_id: str
    selectedProtocol: str = "standard-care"
    sensitivity: str = "85"


class UserSettingsUpdate(BaseModel):
    selectedProtocol: Optional[str] = None
    sensitivity: Optional[str] = None


# --- Document Upload Models ---

class DocumentUploadResponse(BaseModel):
    filename: str
    extracted_text: str
    summary: str
    detected_symptoms: List[str] = Field(default_factory=list)
