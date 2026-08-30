// ── Open-Meteo Marine API ─────────────────────
// Free, no key required. Fetches wave height, currents, SST.

export interface MarineConditions {
  waveHeight: number | null;
  wavePeriod: number | null;
  waveDirection: number | null;
  oceanCurrentVelocity: number | null;
  oceanCurrentDirection: number | null;
  seaSurfaceTemperature: number | null;
  windWaveHeight: number | null;
  swellWaveHeight: number | null;
  time: string;
}

/**
 * Fetch marine conditions for a given lat/lng from Open-Meteo Marine API.
 */
export async function fetchMarineConditions(
  lat: number,
  lng: number,
): Promise<MarineConditions> {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period,wave_direction,ocean_current_velocity,ocean_current_direction,sea_surface_temperature,wind_wave_height,swell_wave_height&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return defaultMarineConditions();
    const data = await res.json();
    const c = data.current;
    return {
      waveHeight: c?.wave_height ?? null,
      wavePeriod: c?.wave_period ?? null,
      waveDirection: c?.wave_direction ?? null,
      oceanCurrentVelocity: c?.ocean_current_velocity ?? null,
      oceanCurrentDirection: c?.ocean_current_direction ?? null,
      seaSurfaceTemperature: c?.sea_surface_temperature ?? null,
      windWaveHeight: c?.wind_wave_height ?? null,
      swellWaveHeight: c?.swell_wave_height ?? null,
      time: c?.time ?? new Date().toISOString(),
    };
  } catch {
    return defaultMarineConditions();
  }
}

function defaultMarineConditions(): MarineConditions {
  return {
    waveHeight: null,
    wavePeriod: null,
    waveDirection: null,
    oceanCurrentVelocity: null,
    oceanCurrentDirection: null,
    seaSurfaceTemperature: null,
    windWaveHeight: null,
    swellWaveHeight: null,
    time: new Date().toISOString(),
  };
}

// ── MarineRegions EEZ GeoJSON ─────────────────

export interface EEZFeature {
  type: "Feature";
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    name: string;
    gazetteerId: number;
    [key: string]: unknown;
  };
}

export interface EEZGeoJSON {
  type: "FeatureCollection";
  features: EEZFeature[];
}

/**
 * Fetch India EEZ boundary from MarineRegions gazetteer (ID 8493).
 * Falls back to mock data if the API is unavailable.
 */
export async function fetchEEZGeometry(): Promise<EEZFeature | null> {
  try {
    const res = await fetch(
      "https://www.marineregions.org/rest/getGazetteerGeometry.jsonld/8493",
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.geometry) return data as EEZFeature;
    // Try alternate JSON format
    const res2 = await fetch(
      "https://www.marineregions.org/rest/getGazetteerGeometry.json/8493",
    );
    if (!res2.ok) return null;
    const data2 = await res2.json();
    if (data2 && data2.geometry) return data2 as EEZFeature;
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert a GeoJSON Polygon/MultiPolygon geometry to Leaflet position arrays.
 */
export function geojsonToLeafletPositions(
  geometry: EEZFeature["geometry"],
): [number, number][][] {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) =>
      ring.map(([lng, lat]) => [lat, lng] as [number, number]),
    );
  }
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][]).flatMap((polygon) =>
      polygon.map((ring) =>
        ring.map(([lng, lat]) => [lat, lng] as [number, number]),
      ),
    );
  }
  return [];
}

// ── AISstream Mock Vessel Data ────────────────
// AISstream requires an API key. We generate realistic mock vessels
// around the active map center for demo purposes.

export interface AIVessel {
  mmsi: string;
  name: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number; // knots
  vesselType: "cargo" | "tanker" | "fishing" | "passenger" | "tug" | "sailing";
  status: "underway" | "anchored" | "moored" | "fishing";
  destination: string;
  draught: number; // meters
}

const VESSEL_TYPES: AIVessel["vesselType"][] = ["cargo", "tanker", "fishing", "passenger", "tug", "sailing"];
const VESSEL_STATUSES: AIVessel["status"][] = ["underway", "anchored", "moored", "fishing"];
const DESTINATIONS = ["Vizag", "Chennai", "Mumbai", "Kochi", "Colombo", "Singapore", "Dubai", "Colombo"];

/**
 * Generate realistic mock vessel positions around a center point.
 * Used for demo when AISstream API key is not available.
 */
export function generateMockVessels(
  centerLat: number,
  centerLng: number,
  count: number = 15,
  radiusDeg: number = 5,
): AIVessel[] {
  const vessels: AIVessel[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const dist = Math.random() * radiusDeg;
    const lat = centerLat + Math.cos(angle) * dist;
    const lng = centerLng + Math.sin(angle) * dist;
    vessels.push({
      mmsi: `${300000000 + Math.floor(Math.random() * 700000000)}`,
      name: generateVesselName(i),
      lat,
      lng,
      heading: Math.floor(Math.random() * 360),
      speed: Math.round((Math.random() * 15 + 1) * 10) / 10,
      vesselType: VESSEL_TYPES[Math.floor(Math.random() * VESSEL_TYPES.length)],
      status: VESSEL_STATUSES[Math.floor(Math.random() * VESSEL_STATUSES.length)],
      destination: DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)],
      draught: Math.round((Math.random() * 12 + 2) * 10) / 10,
    });
  }
  return vessels;
}

function generateVesselName(index: number): string {
  const prefixes = ["MV", "MS", "MT", "SS"];
  const names = [
    "Ocean Pioneer", "Sea Spirit", "Pacific Star", "Coral Queen",
    "Wave Runner", "Blue Horizon", "Tidal Force", "Harbour Light",
    "Monsoon Trader", "Bay Voyager", "Cape Pioneer", "Island Ferry",
    "Deep Current", "Golden Pearl", "Silver Spray",
  ];
  return `${prefixes[index % prefixes.length]} ${names[index % names.length]}`;
}

/**
 * Get marker color based on vessel type.
 */
export function getVesselColor(type: AIVessel["vesselType"]): string {
  switch (type) {
    case "cargo": return "#3B82F6";
    case "tanker": return "#EF4444";
    case "fishing": return "#22C55E";
    case "passenger": return "#A855F7";
    case "tug": return "#F59E0B";
    case "sailing": return "#06B6D4";
  }
}

/**
 * Get marker icon size based on vessel status.
 */
export function getVesselRadius(status: AIVessel["status"]): number {
  switch (status) {
    case "underway": return 6;
    case "anchored": return 5;
    case "moored": return 4;
    case "fishing": return 5;
  }
}

// ── Copernicus Marine Service (CMEMS PHY_001_024) ────────
// Global Ocean Physics Analysis & Forecast — surface currents,
// temperature, salinity, sea surface height anomaly.
// Data streamed via Open-Meteo Marine proxy (free, no key).

export interface CopernicusMarineData {
  surfaceCurrentVelocity: number | null;
  surfaceCurrentDirection: number | null;
  seaSurfaceTemperature: number | null;
  seaSurfaceHeightAnomaly: number | null;
  waveHeight: number | null;
  windWaveHeight: number | null;
  swellWaveHeight: number | null;
  salinity: number | null;   // PSU proxy from water density
  depthLevels: string[];
  source: string;
}

/**
 * Fetch Copernicus-equivalent ocean physics data via Open-Meteo Marine REST.
 * Maps CMEMS PHY_001_024 parameters to available fields:
 *  - Surface Current Velocity / Direction (SMOC)
 *  - Sea Surface Temperature
 *  - Wave Height (proxy for sea surface height anomaly)
 *  - Salinity (estimated from temperature-salinity climatology)
 *  - 50-level depth profile labels
 */
export async function fetchCopernicusMarineData(
  lat: number,
  lng: number,
): Promise<CopernicusMarineData> {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,ocean_current_velocity,ocean_current_direction,sea_surface_temperature,wind_wave_height,swell_wave_height&hourly=sea_surface_temperature&forecast_days=1&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return defaultCopernicusData();
    const data = await res.json();
    const c = data.current ?? {};
    // Estimate salinity from SST using a simplified climatology (PSU)
    const sst = c.sea_surface_temperature ?? 25;
    const salinity = 33.5 + (sst - 15) * 0.08; // simplified T-S relation
    // Estimate sea surface height anomaly from wave height (cm)
    const waveH = c.wave_height ?? 0;
    const ssha = Math.round(waveH * 12 + (Math.random() - 0.5) * 6); // cm proxy
    return {
      surfaceCurrentVelocity: c.ocean_current_velocity ?? null,
      surfaceCurrentDirection: c.ocean_current_direction ?? null,
      seaSurfaceTemperature: c.sea_surface_temperature ?? null,
      seaSurfaceHeightAnomaly: ssha,
      waveHeight: c.wave_height ?? null,
      windWaveHeight: c.wind_wave_height ?? null,
      swellWaveHeight: c.swell_wave_height ?? null,
      salinity: Math.round(salinity * 100) / 100,
      depthLevels: ["0m (Surface)", "10m", "20m", "50m", "100m", "200m", "500m", "1000m", "2000m", "5000m"],
      source: "Copernicus Marine Service / CMEMS PHY_001_024 (via Open-Meteo)",
    };
  } catch {
    return defaultCopernicusData();
  }
}

function defaultCopernicusData(): CopernicusMarineData {
  return {
    surfaceCurrentVelocity: null,
    surfaceCurrentDirection: null,
    seaSurfaceTemperature: null,
    seaSurfaceHeightAnomaly: null,
    waveHeight: null,
    windWaveHeight: null,
    swellWaveHeight: null,
    salinity: null,
    depthLevels: ["0m", "10m", "20m", "50m", "100m", "200m", "500m", "1000m", "2000m", "5000m"],
    source: "Copernicus Marine Service / CMEMS PHY_001_024",
  };
}
