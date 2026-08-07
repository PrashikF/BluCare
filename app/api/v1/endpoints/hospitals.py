import logging
from typing import List
from fastapi import APIRouter, Depends, Query

from app.core.auth import get_optional_user
from app.schemas.api import AmbulanceProvider, NearbyAmbulancesResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hospitals", tags=["Ambulance & Hospitals"])

MOCK_AMBULANCES: List[AmbulanceProvider] = [
    AmbulanceProvider(
        id="amb-1",
        name="Apex Cardiac ALS Ambulance Unit",
        type="Advanced Life Support (ALS)",
        distance="1.2 km away",
        eta="4 - 6 mins",
        phone="+91 98765 12345",
        status="Available 24/7",
        driver="Suresh M.",
        vehicleNo="MH-12-EQ-4092",
    ),
    AmbulanceProvider(
        id="amb-2",
        name="City Fast-Response Emergency Care",
        type="Basic Life Support (BLS)",
        distance="2.4 km away",
        eta="6 - 8 mins",
        phone="+91 98765 67890",
        status="On-Duty",
        driver="Ramesh K.",
        vehicleNo="MH-12-EM-9912",
    ),
    AmbulanceProvider(
        id="amb-3",
        name="St. Jude Mobile ICU Service",
        type="Neonatal & Pediatric ICU",
        distance="3.8 km away",
        eta="9 - 12 mins",
        phone="+91 98765 54321",
        status="Available 24/7",
        driver="Vikram S.",
        vehicleNo="MH-12-ICU-1088",
    ),
    AmbulanceProvider(
        id="amb-4",
        name="Apollo Emergency Trauma Dispatch",
        type="Trauma & Cardiac Care",
        distance="4.5 km away",
        eta="11 - 14 mins",
        phone="+91 98765 99887",
        status="Available 24/7",
        driver="Anil P.",
        vehicleNo="MH-12-TR-7721",
    ),
]


@router.get("/nearby", response_model=NearbyAmbulancesResponse)
async def get_nearby_ambulances(
    lat: float = Query(..., description="Latitude coordinate"),
    lng: float = Query(..., description="Longitude coordinate"),
    user_id: str = Depends(get_optional_user),
):
    """Returns nearby emergency ambulance providers for current coordinates."""
    logger.info(f"User {user_id} requested nearby ambulances for lat={lat}, lng={lng}")
    return NearbyAmbulancesResponse(
        latitude=lat,
        longitude=lng,
        providers=MOCK_AMBULANCES,
    )
