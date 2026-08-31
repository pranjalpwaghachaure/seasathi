import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    AdvisoryRequest,
    MarineAdvisoryResponse,
    DirectVerdict,
    ConditionsAnalysis,
    SafetyBoundary
)

from orchestrator import build_orca_graph, OrcaState

orca_pipeline = build_orca_graph()

app = FastAPI(
    title="SeaSathi Marine Intelligence Backend",
    version="1.0.0",
    description="Agentic Decision Support Backend for Ocean State, PFZ, and Safety Monitoring"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def resolve_coordinates(lat: float = None, lon: float = None, query: str = None):
    # Always prioritize explicit coordinates from map pin
    if lat is not None and lon is not None:
        return float(lat), float(lon)
    
    # Only regex coordinates if query explicitly has lat/lon patterns like "15.4, 73.8"
    if query:
        match = re.search(r"(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)", query)
        if match:
            return float(match.group(1)), float(match.group(2))

    return 15.0, 78.0  # Default Indian Ocean reference

@app.get("/health")
def health_check():
    return {"status": "online", "engine": "SeaSathi ORCA Multi-Agent"}

@app.post("/api/v1/advisory", response_model=MarineAdvisoryResponse)
async def generate_marine_advisory(payload: AdvisoryRequest):
    try:
        target_lat, target_lon = resolve_coordinates(
            lat=payload.latitude,
            lon=payload.longitude,
            query=payload.query
        )

        formatted_query = payload.query or f"Evaluate coordinates at latitude {target_lat}, longitude {target_lon}"

        initial_state: OrcaState = {
            "query": formatted_query,
            "latitude": target_lat,
            "longitude": target_lon,
            "target_date": None,
            "weather_data": None,
            "pfz_data": None,
            "geospatial_data": None,
            "final_report": None
        }

        # Run LangGraph pipeline
        state_output = orca_pipeline.invoke(initial_state)

        pfz = state_output.get("pfz_data") or {}
        weather = state_output.get("weather_data") or {}
        geo = state_output.get("geospatial_data") or {}
        final_markdown = state_output.get("final_report") or ""

        is_eez = geo.get("inside_indian_eez", True)
        safety_status = weather.get("safety_status", "SAFE")
        overall_status = "PROCEED WITH CAUTION" if safety_status == "SAFE" else "NO-GO / HIGH RISK"

        verdict = DirectVerdict(
            overall_status=overall_status,
            fishing_potential=pfz.get("confidence_level", "MODERATE"),
            pfz_probability=float(pfz.get("pfz_probability", 0.75)),
            sea_safety=safety_status,
            legal_status="CLEAR - Inside Indian EEZ" if is_eez else "WARNING - Outside Indian EEZ"
        )

        conditions = ConditionsAnalysis(
            sea_surface_temp_c=float(pfz.get("sst_celsius", 28.0)),
            chlorophyll_a=float(pfz.get("chlorophyll_mg_m3", 1.5)),
            wave_height_m=float(weather.get("wave_height_m", 1.2)),
            wind_speed_kmh=float(weather.get("wind_speed_kmh", 15.0)),
            cyclone_alert=weather.get("cyclone_alert", "NONE")
        )

        safety = SafetyBoundary(
            eez_compliant=is_eez,
            imbl_distance_km=float(geo.get("nearest_imbl_distance_km", 0.0)),
            imbl_sector=geo.get("nearest_boundary_sector", "Arabian Sea / Bay of Bengal"),
            geofence_warning=geo.get("geofence_alert", "CLEAR"),
            safe_buffer_km=float(geo.get("minimum_safe_buffer_km", 15.0))
        )

        return MarineAdvisoryResponse(
            latitude=target_lat,
            longitude=target_lon,
            verdict=verdict,
            conditions=conditions,
            safety=safety,
            raw_markdown_report=final_markdown
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advisory generation failed: {str(e)}")