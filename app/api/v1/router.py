from fastapi import APIRouter

from app.api.v1.endpoints.session import router as session_router
from app.api.v1.endpoints.hospitals import router as hospitals_router
from app.api.v1.endpoints.user import router as user_router
from app.api.v1.endpoints.upload import router as upload_router

api_v1_router = APIRouter()

api_v1_router.include_router(session_router)
api_v1_router.include_router(hospitals_router)
api_v1_router.include_router(user_router)
api_v1_router.include_router(upload_router)
