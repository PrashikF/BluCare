import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_optional_user
from app.schemas.api import (
    UserProfile,
    UserProfileUpdate,
    UserSettings,
    UserSettingsUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["User Profile & Settings"])

# In-memory storage for user profiles & settings
_USER_PROFILES: Dict[str, UserProfile] = {}
_USER_SETTINGS: Dict[str, UserSettings] = {}


@router.get("/profile", response_model=UserProfile)
async def get_profile(user_id: str = Depends(get_optional_user)):
    """Fetches demographics, allergies, and emergency contacts for current user."""
    if user_id not in _USER_PROFILES:
        _USER_PROFILES[user_id] = UserProfile(user_id=user_id)
    return _USER_PROFILES[user_id]


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    updates: UserProfileUpdate,
    user_id: str = Depends(get_optional_user),
):
    """Updates demographics, allergies, or emergency contacts for current user."""
    profile = await get_profile(user_id)
    updated_data = profile.model_dump()

    for field, val in updates.model_dump(exclude_unset=True).items():
        if val is not None:
            updated_data[field] = val

    _USER_PROFILES[user_id] = UserProfile(**updated_data)
    return _USER_PROFILES[user_id]


@router.get("/settings", response_model=UserSettings)
async def get_settings(user_id: str = Depends(get_optional_user)):
    """Fetches clinical care protocol and sensitivity preferences for current user."""
    if user_id not in _USER_SETTINGS:
        _USER_SETTINGS[user_id] = UserSettings(user_id=user_id)
    return _USER_SETTINGS[user_id]


@router.put("/settings", response_model=UserSettings)
async def update_settings(
    updates: UserSettingsUpdate,
    user_id: str = Depends(get_optional_user),
):
    """Updates care protocol standard or symptom matching sensitivity for current user."""
    settings_obj = await get_settings(user_id)
    updated_data = settings_obj.model_dump()

    for field, val in updates.model_dump(exclude_unset=True).items():
        if val is not None:
            updated_data[field] = val

    _USER_SETTINGS[user_id] = UserSettings(**updated_data)
    return _USER_SETTINGS[user_id]
