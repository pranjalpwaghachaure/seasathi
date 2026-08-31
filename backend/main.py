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

# Import the graph builder and OrcaState type from Aradhya's orchestrator
from orchestrator import build_orca_graph, OrcaState

# Compile the LangGraph engine on startup
orca_pipeline = build_orca_graph()

app = FastAPI(
    title="SeaSathi Marine Intelligence Backend",
    version="1.0.0",
    description="Agentic Decision Support Backend for Ocean State, PFZ, and Safety Monitoring"
)

# Enable CORS for Pranjal's React/Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_target_coordinates(query: str = None, lat: float = None, lon: float = None):
    if lat is not None and lon is not None:
        return float(lat), float(lon)
    if query:
        coords = re.findall(r"[-+]?\d*\.\d+|\d+", query)
        if len(coords) >= 2:
            return float(coords[0]), float(coords[1])
    return 18.9, 72.8

@app.get("/health")
def health_check():
    return {"status": "online", "engine": "SeaSathi ORCA Multi-Agent"}

@app.post("/api/v1/advisory", response_model=MarineAdvisoryResponse)
async def generate_marine_advisory(payload: AdvisoryRequest):
    try:
        target_lat, target_lon = parse_target_coordinates(
            query=payload.query,
            lat=payload.latitude,
            lon=payload.longitude
        )

        formatted_query = payload.query or f"Evaluate coordinates ({target_lat}, {target_lon})"

        # Initialize the LangGraph state matching Aradhya's OrcaState
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

        # Execute the multi-agent graph
        state_output = orca_pipeline.invoke(initial_state)

        pfz = state_output.get("pfz_data") or {}
        weather = state_output.get("weather_data") or {}
        geo = state_output.get("geospatial_data") or {}
        final_markdown = state_output.get("final_report") or ""

        # Map to structured schema
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
            imbl_sector=geo.get("nearest_boundary_sector", "Unknown"),
            geofence_warning=geo.get("geofence_alert", "CLEAR"),
            safe_buffer_km=float(geo.get("minimum_safe_buffer_km", 15.0))
        )

        return MarineAdvisoryResponse(
            latitude=state_output.get("latitude", target_lat),
            longitude=state_output.get("longitude", target_lon),
            verdict=verdict,
            conditions=conditions,
            safety=safety,
            raw_markdown_report=final_markdown
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advisory generation failed: {str(e)}")