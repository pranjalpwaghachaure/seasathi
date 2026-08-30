// ── Basemap Tile Options ──────────────────────

export type BasemapId = "dark" | "satellite" | "nautical";

export const BASEMAP_TILES: Record<BasemapId, { label: string; url: string; emoji: string }> = {
  dark: {
    label: "Arctic Dark Canvas",
    emoji: "🌌",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  },
  satellite: {
    label: "Arctic Satellite View",
    emoji: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  nautical: {
    label: "OpenStreetMap Nautical",
    emoji: "🌊",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
};

// ── Region Preset Definitions ──────────────────

export interface RegionPreset {
  id: string;
  label: string;
  emoji: string;
  center: [number, number];
  zoom: number;
}

export const REGION_PRESETS: RegionPreset[] = [
  { id: "india", label: "Indian Ocean", emoji: "🇮🇳", center: [15, 78], zoom: 5 },
  { id: "global", label: "Global View", emoji: "🌍", center: [20, 0], zoom: 3 },
  { id: "pacific", label: "Pacific Ocean", emoji: "🌊", center: [0, 160], zoom: 3 },
  { id: "atlantic", label: "Atlantic & Mediterranean", emoji: "🇪🇺", center: [30, 0], zoom: 3 },
];

// ── Layer Control Options ──────────────────────

export const LAYER_OPTIONS = [
  { id: "sst", label: "Sea Surface Temperature (SST)", checked: true },
  { id: "chlorophyll", label: "Chlorophyll Concentration", checked: true },
  { id: "pfz", label: "INCOIS Potential Fishing Zones", checked: true },
  { id: "imbl", label: "IMBL / EEZ Boundary Lines", checked: true },
  { id: "wind", label: "Live Wind Vector Arrows", checked: false },
  { id: "aqualink", label: "Aqualink Live Ocean Buoys", checked: true },
  { id: "incois", label: "INCOIS PFZ / Chlorophyll WMS", checked: false },
  { id: "vessels", label: "Live Vessel Traffic (AIS)", checked: true },
  { id: "copernicus", label: "Copernicus Ocean Currents (PHY)", checked: false },
] as const;

// ── Fishing Zone Data ──────────────────────────

export interface FishingZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  productivity: "high" | "medium" | "low";
  species: string[];
}

export const FISHING_ZONES: FishingZone[] = [
  { id: "pfz-a", name: "PFZ Zone A – Vizag North", lat: 17.9, lng: 83.5, productivity: "high", species: ["Indian Mackerel", "Sardine", "Anchovy"] },
  { id: "pfz-b", name: "PFZ Zone B – Kakinada Deep", lat: 16.8, lng: 82.5, productivity: "medium", species: ["Pomfret", "Hilsa", "Catfish"] },
  { id: "pfz-c", name: "PFZ Zone C – Machilipatnam", lat: 15.9, lng: 80.8, productivity: "high", species: ["Shrimp", "Cuttlefish", "Squid"] },
  { id: "pfz-d", name: "PFZ Zone D – Gopalpur Offshore", lat: 18.8, lng: 84.6, productivity: "low", species: ["Tuna", "Barracuda"] },
  { id: "pfz-e", name: "PFZ Zone E – Puri Continental", lat: 19.5, lng: 85.8, productivity: "medium", species: ["Pomfret", "Ribbonfish", "Emperor"] },
];

// ── User Boat Data ─────────────────────────────

export interface UserBoat {
  name: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
}

export const USER_BOAT: UserBoat = {
  name: "Fishing Vessel AP-4082",
  lat: 17.6868,
  lng: 83.2185,
  speed: 8,
  heading: 135,
};

// ── IMBL / EEZ Boundary Data ───────────────────

export const IMBL_POINTS: [number, number][] = [
  [13.0, 80.0], [14.5, 80.2], [16.0, 80.0],
  [17.0, 79.8], [18.5, 79.5], [20.0, 85.0],
];

export const EEZ_POINTS: [number, number][] = [
  [13.0, 79.5], [14.5, 79.7], [16.0, 79.5],
  [17.0, 79.3], [18.5, 79.0], [20.0, 84.5],
  [20.0, 86.0], [18.5, 80.5], [17.0, 80.3],
  [16.0, 80.5], [14.5, 80.7], [13.0, 80.5],
];

// ── Safe Fishing Points ────────────────────────

export const SAFE_FISHING_POINTS: [number, number][] = [
  [17.82, 83.35], [17.65, 83.45], [17.50, 83.15],
  [17.90, 83.60], [17.72, 83.28],
];

// ── Border Crossing Simulation ─────────────────

export const BORDER_CROSSING_TARGET: { lat: number; lng: number } = {
  lat: 16.2,
  lng: 79.9,
};

// ── Weather Data ───────────────────────────────

export interface WeatherData {
  waveHeight: number;
  windSpeed: number;
  windDirection: string;
  surfaceTemp: number;
  visibility: string;
  tideStatus: string;
}

export const DEFAULT_WEATHER: WeatherData = {
  waveHeight: 1.8,
  windSpeed: 14,
  windDirection: "SW",
  surfaceTemp: 28.4,
  visibility: "Good (8 km)",
  tideStatus: "Rising",
};

// ── Quick Query Chips ──────────────────────────

export const QUICK_QUERIES = [
  "🐟 Where is the nearest PFZ?",
  "🌊 Is it safe to fish today?",
  "⚠️ How far am I from IMBL?",
  "⛈️ Any storm warnings?",
];

export const VOICE_QUERIES: Record<string, string> = {
  en: "Is it safe to fish near Vizag tomorrow morning?",
  ta: "விசாகப்பட்டினம் அருகே நாளை காலை மீன்பிடிக்க பாதுகாப்பா?",
  te: "విశాఖపట్నం దగ్గర రేపు ఉదయం చేపలు పట్టడం సురక్షితమా?",
  hi: "विशाखापत्तनम के पास कल सुबह मछली पकड़ना सुरक्षित है?",
  ml: "വിശാഖപട്ടണത്തിന് സമീപം നാളെ രാവിലെ മീൻപിടിക്കുന്നത് സുരക്ഷിതമാണോ?",
  gu: "વિશાખાપટ્ટનમ પાસે કાલે સવારે માછલી પકડવી સુરક્ષિત છે?",
  bn: "বিশাখাপত্তনমের কাছে আগামী সকালে মাছ ধরা নিরাপদ?",
  or: "ବିଶାଖାପଟ୍ଟନମ ନିକଟରେ ଆସନ୍ତା ସକାଳେ ମାଛ ଧରିବା ନିରାପଦ?",
};

export const AI_VOICE_RESPONSE: Record<string, string> = {
  en: "⚠️ Caution advised. Waves predicted at 3.2m near Vizag. PFZ Zone B remains safe until 08:00 AM. Recommend departing within 1 hour.",
  ta: "⚠️ எச்சரிக்கை. விசாகப்பட்டினம் அருகே 3.2மீ அலைகள் கணிக்கப்பட்டுள்ளன. PFZ மண்டலம் B காலை 8:00 வரை பாதுகாப்பானது.",
  te: "⚠️ హెచ్చరిక. విశాఖపట్నం సమీపంలో 3.2మీ అలలు అంచనా వేయబడ్డాయి. PFZ జోన్ B ఉదయం 8:00 వరకు సురక్షితం.",
  hi: "⚠️ सावधानी बरतें। विशाखापत्तनम के पास 3.2मी तरंगें अनुमानित हैं। PFZ ज़ोन B सुबह 8:00 बजे तक सुरक्षित है।",
};

// ── SST Overlay Polygons ──────────────────────

export const SST_POLYGONS = [
  { bounds: [[16, 82], [16.5, 82], [16.5, 82.5], [16, 82.5]] as [number, number][], temp: "26.8°C", color: "#06B6D4" },
  { bounds: [[17, 83], [17.5, 83], [17.5, 83.5], [17, 83.5]] as [number, number][], temp: "28.4°C", color: "#F59E0B" },
  { bounds: [[18, 84], [18.5, 84], [18.5, 84.5], [18, 84.5]] as [number, number][], temp: "29.1°C", color: "#EF4444" },
];

// ── Chlorophyll Overlay Polygons ───────────────

export const CHLOROPHYLL_POLYGONS = [
  { bounds: [[15, 80], [15.5, 80], [15.5, 80.5], [15, 80.5]] as [number, number][], level: "0.8 mg/m³", color: "#22C55E" },
  { bounds: [[17, 81], [17.5, 81], [17.5, 81.5], [17, 81.5]] as [number, number][], level: "1.2 mg/m³", color: "#14B8A6" },
  { bounds: [[19, 85], [19.5, 85], [19.5, 85.5], [19, 85.5]] as [number, number][], level: "0.5 mg/m³", color: "#06B6D4" },
];

// ── A* Safe Navigation Route ───────────────────

export const SAFE_ROUTE: [number, number][] = [
  [17.6868, 83.2185], [17.72, 83.25], [17.75, 83.30],
  [17.78, 83.35], [17.80, 83.40], [17.82, 83.45],
];

// ── Weather Alerts ─────────────────────────────

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "watch" | "advisory";
  validUntil: string;
}

export const WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: "wa-1",
    title: "High Wave Advisory – AP Coast",
    description: "Sea conditions rough with waves 3-4m. Small craft advised to stay in port. Fishermen exercise extreme caution.",
    severity: "warning",
    validUntil: "Aug 30, 2026 18:00 IST",
  },
  {
    id: "wa-2",
    title: "Cyclonic Disturbance Watch – Bay of Bengal",
    description: "Deep depression forming 600km east of Vizag. Expected intensification over 48 hours. Monitor updates.",
    severity: "watch",
    validUntil: "Aug 31, 2026 06:00 IST",
  },
  {
    id: "wa-3",
    title: "Fisheries Oceanographic Advisory",
    description: "INCOIS PFZ bulletin: High productivity zones detected along 16-17°N latitude. Recommended for commercial trawlers.",
    severity: "advisory",
    validUntil: "Aug 30, 2026 12:00 IST",
  },
];

// ── Fish Productivity Trends ───────────────────

export const FISH_TRENDS = [
  { zone: "PFZ-A", month: "May", yield: 45, avgWeight: 2.1 },
  { zone: "PFZ-A", month: "Jun", yield: 52, avgWeight: 2.4 },
  { zone: "PFZ-A", month: "Jul", yield: 61, avgWeight: 2.8 },
  { zone: "PFZ-A", month: "Aug", yield: 73, avgWeight: 3.1 },
  { zone: "PFZ-B", month: "May", yield: 38, avgWeight: 1.8 },
  { zone: "PFZ-B", month: "Jun", yield: 44, avgWeight: 2.0 },
  { zone: "PFZ-B", month: "Jul", yield: 55, avgWeight: 2.5 },
  { zone: "PFZ-B", month: "Aug", yield: 62, avgWeight: 2.7 },
  { zone: "PFZ-C", month: "May", yield: 50, avgWeight: 2.3 },
  { zone: "PFZ-C", month: "Jun", yield: 58, avgWeight: 2.6 },
  { zone: "PFZ-C", month: "Jul", yield: 65, avgWeight: 2.9 },
  { zone: "PFZ-C", month: "Aug", yield: 70, avgWeight: 3.0 },
];

// ── AI Chat History ────────────────────────────

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  confidence?: number;
  evidence?: { source: string; label: string; value: string; confidence: number }[];
}

export const AI_CHAT_HISTORY: AIMessage[] = [
  {
    id: "u-1",
    role: "user",
    content: "What are the current sea conditions near Vizag and is it safe for fishing boats to venture out?",
    timestamp: "09:15 AM",
  },
  {
    id: "a-1",
    role: "assistant",
    content: "Based on combined ISRO MOSDAC and INCOIS data, sea conditions near Vizag show wave heights of 1.8m with southwest winds at 14 knots. PFZ Zone A (Vizag North) shows high productivity potential. I recommend the southern route via Waypoint Delta to avoid the developing low-pressure system in the northeast sector.",
    timestamp: "09:15 AM",
    confidence: 89,
    evidence: [
      { source: "ISRO MOSDAC", label: "SST Feed", value: "28.4°C stable, minor gradient", confidence: 91 },
      { source: "INCOIS", label: "Ocean State", value: "Waves 1.6m avg, Wind SW 12kn", confidence: 87 },
      { source: "A* Engine", label: "Route", value: "Via Waypoint Delta, 134nm", confidence: 85 },
    ],
  },
];

// ── AI Tool Chain ──────────────────────────────

export interface ToolCall {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "complete";
  result?: string;
}

export const AI_TOOL_CHAIN: ToolCall[] = [
  { id: "tc-1", name: "ISRO MOSDAC SST Feed", description: "Fetching sea surface temperature data from ISRO satellite feed", status: "pending", result: "SST: 28.4°C, Gradient: stable" },
  { id: "tc-2", name: "INCOIS Ocean State Forecast", description: "Retrieving INCOIS oceanographic advisory data", status: "pending", result: "Waves: 1.6m, Wind: SW 12kn" },
  { id: "tc-3", name: "A* Pathfinding Safe Route Engine", description: "Computing optimal safe navigation route", status: "pending", result: "Route: Vizag → Delta → PFZ-A, 134nm" },
];

// ── Map Center & Zoom ──────────────────────────

export const MAP_CENTER: [number, number] = [17.5, 82.5];
export const MAP_ZOOM = 7;

// ── Safety Status Helpers ──────────────────────

export function getSafetyStatus(weather: WeatherData): "safe" | "caution" | "danger" {
  if (weather.waveHeight >= 3.0 || weather.windSpeed >= 25) return "danger";
  if (weather.waveHeight >= 2.0 || weather.windSpeed >= 18) return "caution";
  return "safe";
}

export function getSafetyLabel(status: "safe" | "caution" | "danger"): string {
  switch (status) {
    case "safe": return "🟢 SAFE TO VENTURE";
    case "caution": return "🟡 CAUTION – HIGH SWELL";
    case "danger": return "🔴 STORM WARNING";
  }
}

export function getSafetyColor(status: "safe" | "caution" | "danger"): string {
  switch (status) {
    case "safe": return "#22C55E";
    case "caution": return "#FACC15";
    case "danger": return "#EF4444";
  }
}

// ── Zone Color Helper ──────────────────────────

export function getZoneColor(productivity: "high" | "medium" | "low"): string {
  switch (productivity) {
    case "high": return "#22C55E";
    case "medium": return "#FACC15";
    case "low": return "#94A3B8";
  }
}

// ── Global Maritime Boundary Lines ─────────────

export const GLOBAL_EEZ_POLYLINES: [number, number][][] = [
  // India EEZ (simplified)
  [[5, 68], [15, 68], [20, 72], [25, 88], [22, 92], [15, 95], [8, 92], [5, 78]],
  // Sri Lanka EEZ
  [[5, 79], [10, 79], [10, 82], [5, 82]],
  // Maldives EEZ
  [[-1, 72], [7, 72], [7, 74], [-1, 74]],
  // Thailand EEZ
  [[5, 98], [12, 98], [12, 102], [5, 102]],
  // Oman EEZ
  [[15, 57], [25, 57], [25, 60], [15, 60]],
  // Seychelles EEZ
  [[-5, 48], [5, 48], [5, 52], [-5, 52]],
];

// ── Global Wind Vector Positions ───────────────

export const GLOBAL_WIND_POSITIONS: [number, number][] = [
  // Indian Ocean
  [10, 70], [15, 75], [20, 80], [5, 65], [0, 73],
  // Arabian Sea
  [18, 65], [12, 62], [22, 60],
  // Bay of Bengal
  [14, 88], [18, 90], [10, 85],
  // Atlantic
  [20, -30], [30, -20], [10, -40], [0, -25], [40, -15],
  // Pacific
  [10, 140], [0, 160], [-10, 180], [20, 120], [5, 100],
  // South China Sea
  [15, 112], [10, 110], [20, 115],
  // Mediterranean
  [35, 15], [38, 10], [40, 5], [36, 20],
  // South Atlantic
  [-15, -10], [-20, 0], [-25, -5], [-30, 10],
  // Southern Ocean
  [-45, 0], [-50, 20], [-55, 40], [-60, 60], [-40, -20],
];

// ── Language Options ──────────────────────────

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ta", label: "Tamil", flag: "🇮🇳" },
  { code: "te", label: "Telugu", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", flag: "🇮🇳" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "or", label: "Odia", flag: "🇮🇳" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

