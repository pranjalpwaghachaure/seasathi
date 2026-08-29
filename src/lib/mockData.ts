/* ═══════════════════════════════════════════════
   SeaSathi – Shared Types & Mock Data
   ═══════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────

export type SafetyStatus = "safe" | "caution" | "danger";

export interface WeatherData {
  waveHeight: number;       // meters
  windSpeed: number;         // knots
  windDirection: string;
  surfaceTemp: number;       // °C
  visibility: string;
  tideStatus: string;
}

export interface FishingZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  productivity: "high" | "medium" | "low";
  species: string[];
}

export interface UserBoat {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  name: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  confidence?: number;
  evidence?: EvidenceCard[];
}

export interface EvidenceCard {
  source: string;
  label: string;
  value: string;
  confidence: number;
}

export interface ToolCall {
  id: string;
  name: string;
  status: "pending" | "running" | "complete";
  description: string;
  result?: string;
}

export interface WeatherAlert {
  id: string;
  severity: "warning" | "watch" | "advisory";
  title: string;
  description: string;
  issuedAt: string;
  validUntil: string;
}

export interface FishTrendData {
  zone: string;
  month: string;
  yield: number;
  avgWeight: number;
}

// ── Constants ──────────────────────────────────

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳" },
  { code: "or", label: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
] as const;

export const QUICK_QUERIES = [
  "Nearest Fishing Zone (PFZ)",
  "Weather Forecast",
  "Am I close to IMBL Border?",
] as const;

export const LAYER_OPTIONS = [
  { id: "sst", label: "Sea Surface Temperature (SST)", checked: true },
  { id: "chlorophyll", label: "Chlorophyll Concentration (Chl-a)", checked: true },
  { id: "pfz", label: "INCOIS Potential Fishing Zones", checked: true },
  { id: "imbl", label: "IMBL / EEZ Boundary Lines", checked: true },
  { id: "wind", label: "Live Wind Vector Arrows", checked: false },
] as const;

// ── Coordinates (Visakhapatnam coast) ──────────

export const MAP_CENTER: [number, number] = [16.5, 82.5];
export const MAP_ZOOM = 9;

export const USER_BOAT: UserBoat = {
  lat: 16.82,
  lng: 83.12,
  heading: 245,
  speed: 8.5,
  name: "IN-VSK-2247",
};

export const IMBL_POINTS: [number, number][] = [
  [17.5, 84.5],
  [17.0, 84.8],
  [16.5, 85.2],
  [16.0, 85.5],
  [15.5, 85.8],
  [15.0, 86.1],
];

export const EEZ_POINTS: [number, number][] = [
  [18.0, 83.0],
  [17.5, 84.5],
  [17.0, 84.8],
  [16.5, 85.2],
  [16.0, 85.5],
  [15.5, 85.8],
  [15.0, 86.1],
  [14.5, 85.5],
  [14.5, 83.0],
];

export const FISHING_ZONES: FishingZone[] = [
  { id: "pfz-a", name: "PFZ Zone A – Vizag North", lat: 17.05, lng: 83.45, productivity: "high", species: ["Pomfret", "Mackerel", "Sardine"] },
  { id: "pfz-b", name: "PFZ Zone B – Vizag Central", lat: 16.72, lng: 83.65, productivity: "medium", species: ["Shrimp", "Anchovy", "Tuna"] },
  { id: "pfz-c", name: "PFZ Zone C – Kakinada", lat: 16.35, lng: 82.95, productivity: "high", species: ["Hilsa", "Mackerel", "Oil Sardine"] },
  { id: "pfz-d", name: "PFZ Zone D – Machilipatnam", lat: 16.18, lng: 81.18, productivity: "low", species: ["Crab", "Prawns"] },
  { id: "pfz-e", name: "PFZ Zone E – East Godavari", lat: 16.65, lng: 82.30, productivity: "medium", species: ["Tuna", "Barracuda"] },
  { id: "pfz-f", name: "PFZ Zone F – Offshore Deep", lat: 15.80, lng: 84.20, productivity: "high", species: ["Deep-sea Shrimp", "Threadfin Bream"] },
];

export const SAFE_FISHING_POINTS: [number, number][] = [
  [17.05, 83.45],
  [16.72, 83.65],
  [16.35, 82.95],
  [16.18, 81.18],
  [16.65, 82.30],
  [15.80, 84.20],
];

// ── Default Data ───────────────────────────────

export const DEFAULT_WEATHER: WeatherData = {
  waveHeight: 1.8,
  windSpeed: 14,
  windDirection: "SW",
  surfaceTemp: 28.4,
  visibility: "8 km",
  tideStatus: "Rising",
};

export const WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: "wa-1",
    severity: "warning",
    title: "Cyclonic Disturbance – Bay of Bengal",
    description: "Deep depression forming 600km east of Vizag. Expected to intensify. All fishing vessels advised to return to port.",
    issuedAt: "2026-08-29 06:00",
    validUntil: "2026-08-31 18:00",
  },
  {
    id: "wa-2",
    severity: "watch",
    title: "High Wave Advisory – AP Coast",
    description: "Wave heights of 3-4m expected along Andhra Pradesh coast. Small craft advisory in effect.",
    issuedAt: "2026-08-29 04:30",
    validUntil: "2026-08-30 12:00",
  },
  {
    id: "wa-3",
    severity: "advisory",
    title: "SST Anomaly Detected",
    description: "Unusual sea surface temperature rise (+1.2°C above normal) near PFZ Zone A. May affect fish aggregation patterns.",
    issuedAt: "2026-08-28 18:00",
    validUntil: "2026-09-01 06:00",
  },
];

export const FISH_TRENDS: FishTrendData[] = [
  { zone: "PFZ-A", month: "Aug", yield: 85, avgWeight: 2.4 },
  { zone: "PFZ-A", month: "Jul", yield: 72, avgWeight: 2.1 },
  { zone: "PFZ-B", month: "Aug", yield: 58, avgWeight: 1.8 },
  { zone: "PFZ-B", month: "Jul", yield: 65, avgWeight: 2.0 },
  { zone: "PFZ-C", month: "Aug", yield: 91, avgWeight: 2.6 },
  { zone: "PFZ-C", month: "Jul", yield: 78, avgWeight: 2.3 },
];

export const AI_CHAT_HISTORY: AIMessage[] = [
  {
    id: "ai-1",
    role: "user",
    content: "What is the safest route from Vizag to PFZ Zone C for tomorrow morning?",
    timestamp: "08:12 AM",
  },
  {
    id: "ai-2",
    role: "assistant",
    content: "Based on ISRO MOSDAC SST data and INCOIS ocean state forecasts, I recommend Route Charlie heading southwest. Waves in the northern corridor are predicted at 3.2m, while the southern route stays under 1.8m. PFZ Zone C remains highly productive with good fish aggregation indicators.",
    timestamp: "08:12 AM",
    confidence: 87,
    evidence: [
      { source: "ISRO MOSDAC", label: "SST Feed", value: "28.4°C → 27.1°C gradient", confidence: 92 },
      { source: "INCOIS", label: "Ocean State Forecast", value: "Waves 1.4-1.8m along Route Charlie", confidence: 88 },
      { source: "A* Engine", label: "Safe Route", value: "127 nautical miles, 14.3h at 8.5 knots", confidence: 85 },
    ],
  },
];

export const AI_TOOL_CHAIN: ToolCall[] = [
  { id: "tc-1", name: "ISRO MOSDAC SST Feed", status: "complete", description: "Fetching sea surface temperature satellite imagery for AP coast", result: "28.4°C at current position, gradient to 27.1°C in PFZ-C zone. Warm current anomaly detected in northern sector." },
  { id: "tc-2", name: "INCOIS Ocean State Forecast", status: "complete", description: "Querying INCOIS 48h forecast for wave height and wind vectors", result: "Waves: 1.4-1.8m on southern route, 3.0-3.5m on northern route. Wind: SW 14 knots sustained, gusting to 22 knots." },
  { id: "tc-3", name: "A* Pathfinding Safe Route Engine", status: "complete", description: "Computing optimal safe route avoiding high-wave hazard zones", result: "Route Charlie computed: 127nm, avoids all zones with waves >2.5m, stays 15nm clear of IMBL boundary." },
];

// ── Mock helper functions ──────────────────────

export function getSafetyStatus(weather: WeatherData): SafetyStatus {
  if (weather.waveHeight > 3.0 || weather.windSpeed > 25) return "danger";
  if (weather.waveHeight > 2.0 || weather.windSpeed > 18) return "caution";
  return "safe";
}

export function getSafetyLabel(status: SafetyStatus): string {
  switch (status) {
    case "safe": return "SAFE TO VENTURE";
    case "caution": return "CAUTION — HIGH SWELL";
    case "danger": return "STORM WARNING";
  }
}

export function getSafetyColor(status: SafetyStatus): string {
  switch (status) {
    case "safe": return "#22c55e";
    case "caution": return "#FEE440";
    case "danger": return "#FF0054";
  }
}

export function getZoneColor(productivity: FishingZone["productivity"]): string {
  switch (productivity) {
    case "high": return "#22c55e";
    case "medium": return "#FEE440";
    case "low": return "#FF8C42";
  }
}

// SST heatmap polygons (mock warm/cold zones)
export const SST_POLYGONS: { bounds: [number, number][]; temp: string; color: string }[] = [
  { bounds: [[17.2, 83.0], [17.2, 83.8], [16.8, 83.8], [16.8, 83.0]], temp: "29.2°C", color: "rgba(255, 80, 50, 0.18)" },
  { bounds: [[16.8, 83.2], [16.8, 84.0], [16.4, 84.0], [16.4, 83.2]], temp: "28.4°C", color: "rgba(255, 140, 50, 0.15)" },
  { bounds: [[16.4, 82.6], [16.4, 83.4], [16.0, 83.4], [16.0, 82.6]], temp: "27.8°C", color: "rgba(255, 200, 50, 0.12)" },
  { bounds: [[16.0, 83.5], [16.0, 84.5], [15.5, 84.5], [15.5, 83.5]], temp: "27.1°C", color: "rgba(50, 150, 255, 0.12)" },
];

// Chlorophyll polygons (mock)
export const CHLOROPHYLL_POLYGONS: { bounds: [number, number][]; level: string; color: string }[] = [
  { bounds: [[17.1, 83.3], [17.1, 83.7], [16.9, 83.7], [16.9, 83.3]], level: "High (4.2 mg/m³)", color: "rgba(34, 197, 94, 0.15)" },
  { bounds: [[16.6, 83.0], [16.6, 83.5], [16.3, 83.5], [16.3, 83.0]], level: "Medium (2.8 mg/m³)", color: "rgba(34, 197, 94, 0.1)" },
];

// A* safe route (mock polyline)
export const SAFE_ROUTE: [number, number][] = [
  [16.82, 83.12], // start at boat
  [16.75, 83.05],
  [16.65, 82.95],
  [16.55, 82.90],
  [16.45, 82.92],
  [16.35, 82.95], // end at PFZ-C
];

// Border crossing simulation target
export const BORDER_CROSSING_TARGET: UserBoat = {
  lat: 16.85,
  lng: 84.35,
  heading: 90,
  speed: 8.5,
  name: "IN-VSK-2247",
};

// Voice simulation translations
export const VOICE_QUERIES: Record<string, string> = {
  en: "Is it safe to fish near Vizag tomorrow morning?",
  ta: "நாளை காலை விசாகப்பட்டினம் அருகில் மீன் பிடிப்பது பாதுகாப்பானதா?",
  te: "రేపు ఉదయం విశాఖపట్నం సమీపంలో చేపలు పట్టడం సురక్షితమా?",
  ml: "നാളെ രാവിലെ വിശാഖപട്ടണം സമീപം മീൻ പിടിക്കുന്നത് സുരക്ഷിതമാണോ?",
  hi: "क्या कल सुबह विशाखापत्तनम के पास मछली पकड़ना सुरक्षित है?",
  gu: "શું કાલે સવારે વિશાખાપટ્ટનમ પાસે માછલી પકડવી સુરક્ષિત છે?",
  bn: "আগামীকাল সকালে বিশাখাপত্তনমের কাছে মাছ ধরা কি নিরাপদ?",
  or: "କାଲି ସକାଳେ ବିଶାଖାପାଟନମ ନିକଟରେ ମାଛ ଧରିବା କି ନିରାପଦ?",
};

export const AI_VOICE_RESPONSE: Record<string, string> = {
  en: "Caution advised. Waves predicted at 3.2m near Vizag. PFZ Zone B remains safe until 08:00 AM. I recommend heading to Zone C — conditions are optimal there with waves at 1.4m and high fish productivity.",
  ta: "எச்சரிக்கை. விசாகப்பட்டினம் அருகில் அலை உயரம் 3.2 மீட்டர் என கணிக்கப்பட்டுள்ளது. PFZ பகுதி B காலை 8:00 மணி வரை பாதுகாப்பாக உள்ளது. பகுதி C செல்ல பரிந்துரைக்கிறேன்.",
  te: "హెచ్చరిక. విశాఖపట్నం సమీపంలో అలల ఎత్తు 3.2 మీటర్లు అని అంచనా. PFZ జోన్ B ఉదయం 8:00 వరకు సురక్షితం.",
  ml: "ജാഗ്രത ഉപദേശം. വിശാഖപട്ടണം സമീപം തിരമാല ഉയരം 3.2 മീറ്റർ എന്ന് പ്രവചിക്കുന്നു. PFZ സോൺ B രാവിലെ 8:00 വരെ സുരക്ഷിതം.",
  hi: "सावधानी बरतें। विशाखापत्तनम के पास लहरें 3.2 मीटर अनुमानित हैं। PFZ ज़ोन B सुबह 8:00 बजे तक सुरक्षित है। ज़ोन C की ओर जाने की सलाह देता हूँ।",
  gu: "સાવધાની રાખો. વિશાખાપટ્ટનમ પાસે મોજાં 3.2 મીટર અનુમાનિત છે. PFZ ઝોન B સવારે 8:00 સુધી સુરક્ષિત છે.",
  bn: "সতর্কতা প্রয়োজন। বিশাখাপত্তনমের কাছে ঢেউ 3.2 মিটার অনুমান করা হয়েছে। PFZ জোন B সকাল 8:00 পর্যন্ত নিরাপদ।",
  or: "ସାବଧାନ ରୁହନ୍ତୁ। ବିଶାଖାପାଟନମ ନିକଟରେ ଢେଉ 3.2 ମିଟର ଅନୁମାନ କରାଯାଇଛି। PFZ ଜୋନ B ସକାଳ 8:00 ପର୍ଯ୍ୟନ୍ତ ନିରାପଦ।",
};
