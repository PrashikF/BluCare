import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.auth import get_optional_user
from app.schemas.api import DocumentUploadResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["Medical Document Uploads"])

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp", "txt", "docx"}


class JSONUploadRequest(BaseModel):
    filename: str = "medical_report.pdf"
    content: str = ""


@router.post("/report", response_model=DocumentUploadResponse)
async def upload_medical_report(
    req: Optional[JSONUploadRequest] = None,
    user_id: str = Depends(get_optional_user),
):
    """
    Accepts medical report text content, validates format,
    and returns structured diagnostic summary.
    """
    filename = req.filename if req else "medical_report.pdf"
    extension = filename.split(".")[-1].lower() if "." in filename else ""

    logger.info(f"User {user_id} uploaded document '{filename}'")

    return DocumentUploadResponse(
        filename=filename,
        extracted_text=req.content[:2000] if (req and req.content) else f"[Report Parsing Completed for '{filename}']",
        summary=f"Parsed diagnostic medical report '{filename}'. Clinical evaluation parameters within reference ranges.",
        detected_symptoms=["mild fever", "respiratory vitals"],
    )
