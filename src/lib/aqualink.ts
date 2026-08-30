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

// Indian Ocean / Arabian Sea / Bay of Bengal bounding box
const INDIA_BBOX = {
  latMin: -10,
  latMax: 30,
  lngMin: 50,
  lngMax: 100,
};

const API_URL = "https://ocean-systems.uc.r.appspot.com/api/sites";

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
 * Filter sites within the Indian Ocean bounding box.
 */
export function filterIndiaSites(sites: AqualinkSite[]): AqualinkSite[] {
  return sites.filter(
    (s) =>
      s.latitude >= INDIA_BBOX.latMin &&
      s.latitude <= INDIA_BBOX.latMax &&
      s.longitude >= INDIA_BBOX.lngMin &&
      s.longitude <= INDIA_BBOX.lngMax,
  );
}

/**
 * Color-code marker based on sea surface temperature (°C).
 * Teal  < 27°C  → Normal / Cold
 * Amber 27–29.5 → Warm / High Fish Activity
 * Red   > 29.5  → Extreme Thermal Stress
 */
export function getSstColor(temp: number): string {
  if (temp < 27) return "#06B6D4"; // teal
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
  if (sites.length === 0) return null;
  let nearest = sites[0];
  let minDist = Infinity;
  for (const s of sites) {
    const d = Math.sqrt((s.latitude - lat) ** 2 + (s.longitude - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }
  return nearest;
}
