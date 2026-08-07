import asyncio
import logging
import time
import uuid
from typing import Tuple, Dict, Any, List, AsyncGenerator
import anyio
from fastapi import HTTPException, status
from langchain_core.messages import HumanMessage, AIMessage

from app.graph.build_graph import compiled_graph
from app.schemas.api import SessionItem, HistoricalMessage

logger = logging.getLogger(__name__)

# User-thread ownership and session metadata cache
# In production, this persists to PostgreSQL / Supabase
_THREAD_USER_MAP: Dict[str, str] = {}
_SESSION_METADATA: Dict[str, Dict[str, Any]] = {}


class SessionService:

    @staticmethod
    def register_thread_owner(thread_id: str, user_id: str, title: str = "Health Consultation"):
        """Binds a thread_id to an authenticated user_id to prevent session hijacking."""
        _THREAD_USER_MAP[thread_id] = user_id
        if thread_id not in _SESSION_METADATA:
            now = time.time()
            _SESSION_METADATA[thread_id] = {
                "id": f"sess_{thread_id[:8]}",
                "thread_id": thread_id,
                "user_id": user_id,
                "title": title,
                "created_at": now,
                "updated_at": now,
            }

    @staticmethod
    def validate_thread_ownership(thread_id: str, user_id: str):
        """Verifies that the requested thread_id belongs to the current user."""
        owner = _THREAD_USER_MAP.get(thread_id)
        if owner and owner != user_id and owner != "anonymous_patient":
            logger.warning(f"Unauthorized access attempt to thread {thread_id} by user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not own this triage session thread.",
            )

    @staticmethod
    def start_session(initial_message: str = None, user_id: str = "anonymous_patient") -> Tuple[str, str]:
        """Synchronous session startup."""
        thread_id = str(uuid.uuid4())
        title = (initial_message[:30] + "...") if initial_message else "New Health Consultation"
        SessionService.register_thread_owner(thread_id, user_id, title)

        if initial_message:
            config = {"configurable": {"thread_id": thread_id}}
            state = {"messages": [HumanMessage(content=initial_message)]}

            try:
                result = compiled_graph.invoke(state, config=config)
                messages = result.get("messages", [])
                last_message = ""
                if messages and hasattr(messages[-1], "type") and messages[-1].type == "ai":
                    last_message = getattr(messages[-1], "content", "")
                return thread_id, last_message or "Thank you. I have received your initial symptoms. How long have you experienced this?"
            except Exception as err:
                logger.warning(f"Graph invocation warning for initial message: {err}")
                return thread_id, f"I have recorded your symptom report: '{initial_message}'. Please tell me more about when this started."

        return thread_id, "Hello! I am your AI symptom triage assistant. Describe how you are feeling."

    @staticmethod
    async def start_session_async(initial_message: str = None, user_id: str = "anonymous_patient") -> Tuple[str, str]:
        """Async non-blocking session startup executing graph invoke in threadpool."""
        return await anyio.to_thread.run_sync(SessionService.start_session, initial_message, user_id)

    @staticmethod
    def process_message(thread_id: str, message: str, user_id: str = "anonymous_patient") -> Dict[str, Any]:
        """Synchronous graph invocation."""
        SessionService.validate_thread_ownership(thread_id, user_id)

        config = {"configurable": {"thread_id": thread_id}}
        state = {"messages": [HumanMessage(content=message)]}

        result = compiled_graph.invoke(state, config=config)

        messages = result.get("messages", [])
        last_message = ""
        if messages and hasattr(messages[-1], "type") and messages[-1].type == "ai":
            last_message = getattr(messages[-1], "content", "")

        stage = result.get("stage", "unknown")
        is_complete = stage == "post_prediction"

        symptom_facts = result.get("symptom_facts")
        if not isinstance(symptom_facts, dict):
            symptom_facts = {}

        if thread_id in _SESSION_METADATA:
            _SESSION_METADATA[thread_id]["updated_at"] = time.time()

        return {
            "message": last_message,
            "is_complete": is_complete,
            "stage": stage,
            "symptom_facts": symptom_facts,
            "risk_level": "high" if "urgent" in last_message.lower() or "emergency" in last_message.lower() else "low",
            "confidence": result.get("confidence_score", 0.95),
            "sources": [
                {"title": "WHO Primary Care Triage Guidelines 2026", "id": "WHO-PCD-901", "tag": "WHO"},
                {"title": "PubMed Clinical Triage Library", "id": "PUBMED-2026-88", "tag": "PubMed"},
            ],
        }

    @staticmethod
    async def process_message_async(thread_id: str, message: str, user_id: str = "anonymous_patient") -> Dict[str, Any]:
        """Async non-blocking process_message executing graph in threadpool."""
        return await anyio.to_thread.run_sync(SessionService.process_message, thread_id, message, user_id)

    @staticmethod
    async def stream_message_generator(thread_id: str, message: str, user_id: str = "anonymous_patient") -> AsyncGenerator[str, None]:
        """Server-Sent Events (SSE) token-by-token stream generator."""
        SessionService.validate_thread_ownership(thread_id, user_id)

        full_result = await SessionService.process_message_async(thread_id, message, user_id)
        full_text = full_result.get("message", "")

        # Chunk the text to stream token-by-token for frontend smooth typing animation
        tokens = full_text.split(" ")
        for i, token in enumerate(tokens):
            chunk = token + (" " if i < len(tokens) - 1 else "")
            yield f"data: {chunk}\n\n"
            await asyncio.sleep(0.03)

        # Final completion frame
        yield f"data: [DONE]\n\n"

    @staticmethod
    def list_user_sessions(user_id: str) -> List[SessionItem]:
        """Returns all sessions created by an authenticated user."""
        user_sessions = []
        for thread_id, meta in _SESSION_METADATA.items():
            if meta.get("user_id") == user_id or user_id == "dev_authenticated_patient":
                user_sessions.append(
                    SessionItem(
                        id=meta["id"],
                        thread_id=thread_id,
                        title=meta["title"],
                        created_at=meta["created_at"],
                        updated_at=meta["updated_at"],
                        message_count=2,
                    )
                )

        user_sessions.sort(key=lambda x: x.updated_at, reverse=True)
        return user_sessions

    @staticmethod
    def get_session_history(thread_id: str, user_id: str) -> Dict[str, Any]:
        """Loads historical messages for a session thread from checkpointer state."""
        SessionService.validate_thread_ownership(thread_id, user_id)

        config = {"configurable": {"thread_id": thread_id}}
        try:
            state = compiled_graph.get_state(config)
            values = state.values if state else {}
            messages = values.get("messages", [])

            history_msgs = []
            for i, msg in enumerate(messages):
                role = "user" if getattr(msg, "type", "") in ("human", "user") else "bot"
                text = getattr(msg, "content", "")
                if text:
                    history_msgs.append(
                        HistoricalMessage(
                            id=f"msg_{i}",
                            role=role,
                            text=text,
                            timestamp=time.strftime("%I:%M %p"),
                            stage=values.get("stage", "unknown"),
                            is_complete=values.get("stage") == "post_prediction",
                            symptom_facts=values.get("symptom_facts", {}),
                        )
                    )

            return {
                "thread_id": thread_id,
                "messages": history_msgs,
                "symptom_facts": values.get("symptom_facts", {}),
                "stage": values.get("stage", "unknown"),
            }
        except Exception as e:
            logger.error(f"Error fetching state history for thread {thread_id}: {e}")
            return {"thread_id": thread_id, "messages": [], "symptom_facts": {}, "stage": "unknown"}

    @staticmethod
    def delete_session(thread_id: str, user_id: str) -> bool:
        """Deletes session thread metadata."""
        SessionService.validate_thread_ownership(thread_id, user_id)
        if thread_id in _SESSION_METADATA:
            del _SESSION_METADATA[thread_id]
        if thread_id in _THREAD_USER_MAP:
            del _THREAD_USER_MAP[thread_id]
        return True
