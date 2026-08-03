import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.rag.store import warm_up
from app.schemas.api import StartSessionRequest, StartSessionResponse, ChatMessageRequest, ChatMessageResponse
from app.core.session_service import SessionService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up: warming up RAG store (Qdrant + embeddings + reranker)...")
    # init_tracing() # Currently using LangSmith via env vars automatically
    warm_up()
    logger.info("Startup complete. Server ready to accept requests.")
    yield
    logger.info("Shutting down.")

app = FastAPI(title="Medical Triage Agent API", lifespan=lifespan)

from app.core.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import FastAPI, HTTPException

@app.post("/session/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest):
    try:
        thread_id, msg = SessionService.start_session(req.initial_message)
        return StartSessionResponse(thread_id=thread_id, message=msg)
    except Exception as e:
        logger.error(f"Error starting session: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during session creation")

@app.post("/session/message", response_model=ChatMessageResponse)
def send_message(req: ChatMessageRequest):
    try:
        result = SessionService.process_message(req.thread_id, req.message)
        return ChatMessageResponse(**result)
    except Exception as e:
        logger.error(f"Error processing message for thread {req.thread_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during graph execution")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
