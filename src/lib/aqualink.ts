// Aqualink Real-Time Ocean Telemetry API Service
// Fetches live buoy data from the Aqualink UC Davis endpoint

export interface AqualinkSite {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  topTemperature?: { value: number; time: string } | null;
  bottomTemperature?: { value: number; time: string } | null;
  weeklyAlertLevel?: number;
  [key: string]: unknown;
}

const API_URL = "https://ocean-systems.uc.r.appspot.com/api/sites";

/**
 * Check whether a coordinate pair is a valid finite number.
 */
export function isValidCoord(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

/**
 * Extract latitude/longitude from a site, handling key variations.
 * Returns null if coordinates are invalid.
 */
export function getSiteCoords(site: AqualinkSite): [number, number] | null {
  const lat = site.latitude ?? (site as Record<string, unknown>).lat as number | undefined;
  const lng = site.longitude ??
    (site as Record<string, unknown>).lng as number | undefined ??
    (site as Record<string, unknown>).lon as number | undefined;
  if (!isValidCoord(lat, lng)) return null;
  return [lat as number, lng as number];
}

/**
 * Filter sites to only those with valid coordinates.
 */
export function getValidSites(sites: AqualinkSite[]): AqualinkSite[] {
  return sites.filter((s) => getSiteCoords(s) !== null);
}

/**
 * Fetch all Aqualink buoy sites. Returns empty array on error.
 */
export async function fetchAqualinkSites(): Promise<AqualinkSite[]> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data as AqualinkSite[];
  } catch {
    return [];
  }
}

/**
 * Filter sites within a geographic bounding box.
 */
export function filterSitesInBbox(
  sites: AqualinkSite[],
  bbox: { latMin: number; latMax: number; lngMin: number; lngMax: number },
): AqualinkSite[] {
  return sites.filter(
    (s) =>
      s.latitude >= bbox.latMin &&
      s.latitude <= bbox.latMax &&
      s.longitude >= bbox.lngMin &&
      s.longitude <= bbox.lngMax,
  );
}

/**
 * Color-code marker based on sea surface temperature (°C) — Cold Polar Theme.
 * Deep Freeze  < 15°C → Deep Sapphire Blue
 * Cold Waters  15–22°C → Electric Cyan
 * Cool Temperate 22–27°C → Aquamarine Teal
 * Warm  27–29.5°C → Amber
 * Extreme  > 29.5°C → Coral Red
 */
export function getSstColor(temp: number): string {
  if (temp < 15) return "#0F172A"; // deep sapphire blue
  if (temp <= 22) return "#06B6D4"; // electric cyan
  if (temp <= 27) return "#14B8A6"; // aquamarine teal
  if (temp <= 29.5) return "#F59E0B"; // amber
  return "#EF4444"; // coral red
}

/**
 * Determine if the marker should have a pulsating glow.
 */
export function hasAlert(site: AqualinkSite): boolean {
  return (site.weeklyAlertLevel ?? 0) >= 1;
}

/**
 * Find the nearest Aqualink site to a given lat/lng.
 */
export function findNearestSite(
  sites: AqualinkSite[],
  lat: number,
  lng: number,
): AqualinkSite | null {
  const valid = getValidSites(sites);
  if (valid.length === 0) return null;
  let nearest = valid[0];
  let minDist = Infinity;
  for (const s of valid) {
    const coords = getSiteCoords(s);
    if (!coords) continue;
    const d = Math.sqrt((coords[0] - lat) ** 2 + (coords[1] - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }
  return nearest;
}
