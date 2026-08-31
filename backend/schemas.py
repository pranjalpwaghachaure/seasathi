from pydantic import BaseModel, Field
from typing import Optional

class AdvisoryRequest(BaseModel):
    query: Optional[str] = Field(None, example="18.9, 72.8")
    latitude: Optional[float] = Field(None, example=18.9)
    longitude: Optional[float] = Field(None, example=72.8)

class DirectVerdict(BaseModel):
    overall_status: str
    fishing_potential: str
    pfz_probability: float
    sea_safety: str
    legal_status: str

class ConditionsAnalysis(BaseModel):
    sea_surface_temp_c: float
    chlorophyll_a: float
    wave_height_m: float
    wind_speed_kmh: float
    cyclone_alert: str

class SafetyBoundary(BaseModel):
    eez_compliant: bool
    imbl_distance_km: float
    imbl_sector: str
    geofence_warning: str
    safe_buffer_km: float

class MarineAdvisoryResponse(BaseModel):
    latitude: float
    longitude: float
    verdict: DirectVerdict
    conditions: ConditionsAnalysis
    safety: SafetyBoundary
    raw_markdown_report: str