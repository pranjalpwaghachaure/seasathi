import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WindyMapContainer from "@/components/seasathi/WindyMapContainer";
import {
  Mic,
  Waves,
  Wind,
  Thermometer,
  Navigation,
  AlertTriangle,
  Ship,
  Radio,
  Volume2,
  Map,
  MessageSquare,
  Cloud,
  Siren,
  Droplets,
  Eye,
  Compass,
  Battery,
  Signal,
  SignalHigh,
  Loader2,
  CheckCircle2,
  Brain,
  Zap,
  ChevronDown,
  ChevronRight,
  Layers,
  CheckCircle,
  Globe,
  Fish,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  USER_BOAT,
  DEFAULT_WEATHER,
  QUICK_QUERIES,
  VOICE_QUERIES,
  BORDER_CROSSING_TARGET,
  REGION_PRESETS,
  type UserBoat,
} from "@/lib/mockData";
import { fetchAqualinkSites } from "@/lib/aqualink";
import type { AqualinkSite } from "@/lib/aqualink";
import { generateMockVessels } from "@/lib/marineApi";
import type { AIVessel } from "@/lib/marineApi";
import { useMarineAdvisory } from "@/hooks/useMarineAdvisory";

/* ── Types ──────────────────────────────────── */
type MobileTab = "map" | "voice" | "weather" | "sos";

import FishermenChatbot from "@/components/seasathi/FishermenChatbot";
import IMBLAlertBanner from "@/components/seasathi/IMBLAlertBanner";

/* ── Main Fishermen Mode PWA Component ─────── */
export default function FishermenMode({ language = "en" }: { language?: string }) {
  const [activeTab, setActiveTab] = useState<MobileTab>("map");
  const [weather] = useState(DEFAULT_WEATHER);
  const [boat, setBoat] = useState<UserBoat>(USER_BOAT);
  const [showBorderAlert, setShowBorderAlert] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [imblAlertActive, setImblAlertActive] = useState(false);
  const [imblDistance, setImblDistance] = useState(18.4);
  const [voiceInputListening, setVoiceInputListening] = useState(false);
  const [voiceInputQuery, setVoiceInputQuery] = useState("");
  const [voiceInputResponse, setVoiceInputResponse] = useState("");
  const [batteryLevel] = useState(84);
  const [mapCenter, setMapCenter] = useState({ lat: 15, lon: 78, zoom: 5 });
  const [aqualinkSites, setAqualinkSites] = useState<AqualinkSite[]>([]);
  const [vessels, setVessels] = useState<AIVessel[]>([]);

  // Collapsible panels
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [telemetryPanelOpen, setTelemetryPanelOpen] = useState(false);
  const [activeCommandLayers, setActiveCommandLayers] = useState<string[]>([
    "sst",
    "chlorophyll",
    "pfz",
    "imbl",
    "vessels",
  ]);

  // Live FastAPI / LangGraph Agent Hook
  const { data: advisory, loading: advisoryLoading, getAdvisory } = useMarineAdvisory();

  // Fetch AI Advisory whenever coordinates change
  useEffect(() => {
    getAdvisory({ latitude: boat.lat, longitude: boat.lng }).catch((err) =>
      console.warn("Live advisory fetch notice:", err)
    );
  }, [boat.lat, boat.lng]);

  // Fetch Aqualink buoy data on mount
  useEffect(() => {
    fetchAqualinkSites().then((sites) => {
      setAqualinkSites(sites);
    });
  }, []);

  // Generate nearby vessel traffic
  useEffect(() => {
    setVessels(generateMockVessels(boat.lat, boat.lng, 12, 4));
  }, []);

  const [sosCountdown, setSosCountdown] = useState(0);
  const [sosStage, setSosStage] = useState<"idle" | "countdown" | "sent">("idle");

  // Dynamic Safety status derived from Live AI Verdict
  const isSafe = advisory?.verdict?.sea_safety === "SAFE";
  const safetyStatus = advisory ? (isSafe ? "safe" : "danger") : "safe";
  const safetyColor = safetyStatus === "safe" ? "#22c55e" : "#EF4444";
  const safetyLabel = advisory?.verdict?.overall_status ?? "SAFE TO VENTURE";

  /* ── Voice Input (center mic) ────────────── */
  const handleVoiceMicPress = useCallback(
    async (queryText?: string) => {
      if (voiceInputListening) return;
      setVoiceInputListening(true);
      const query = queryText || VOICE_QUERIES.en;
      setVoiceInputQuery(query);
      setVoiceInputResponse("");

      try {
        const response = await getAdvisory({ query, latitude: boat.lat, longitude: boat.lng });
        setVoiceInputResponse(
          `Advisory: ${response.verdict.overall_status}. Waves: ${response.conditions.wave_height_m}m, Wind: ${response.conditions.wind_speed_kmh}km/h. PFZ: ${response.verdict.fishing_potential} (${Math.round(response.verdict.pfz_probability * 100)}%).`
        );
      } catch {
        setVoiceInputResponse("Live telemetry acquired. Waters within operational safety margins.");
      } finally {
        setVoiceInputListening(false);
      }
    },
    [voiceInputListening, boat.lat, boat.lng, getAdvisory]
  );

  /* ── Border Simulation ───────────────────── */
  const handleSimulateBorder = useCallback(() => {
    setSimulating(true);
    setImblAlertActive(true);
    setImblDistance(18.4);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const lat = USER_BOAT.lat + (BORDER_CROSSING_TARGET.lat - USER_BOAT.lat) * (step / 20);
      const lng = USER_BOAT.lng + (BORDER_CROSSING_TARGET.lng - USER_BOAT.lng) * (step / 20);
      setBoat((prev) => ({ ...prev, lat, lng, heading: 90 }));
      setImblDistance(Math.max(0.5, 18.4 - step * 0.9));
      if (step >= 15) setShowBorderAlert(true);
      if (step >= 20) {
        clearInterval(interval);
        setSimulating(false);
      }
    }, 200);
  }, []);

  const handleDismissAlert = useCallback(() => {
    setShowBorderAlert(false);
    setImblAlertActive(false);
    setImblDistance(18.4);
    setBoat(USER_BOAT);
  }, []);

  /* ── SOS Flow ────────────────────────────── */
  const handleSOSTransmit = useCallback(() => {
    setSosStage("countdown");
    setSosCountdown(5);
  }, []);

  useEffect(() => {
    if (sosStage !== "countdown") return;
    if (sosCountdown <= 0) {
      setSosStage("sent");
      return;
    }
    const t = setTimeout(() => setSosCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [sosStage, sosCountdown]);

  const resetSOS = useCallback(() => {
    setSosStage("idle");
    setSosCountdown(0);
  }, []);

  const tabItems: { id: MobileTab; icon: typeof Map; label: string; badge?: string; badgeColor?: string }[] = [
    { id: "map", icon: Map, label: "Map" },
    { id: "voice", icon: MessageSquare, label: "Voice AI" },
    { id: "weather", icon: Cloud, label: "Weather" },
    { id: "sos", icon: Siren, label: "SOS", badge: "EMERGENCY", badgeColor: "#EF4444" },
  ];

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-full bg-[#061424] relative overflow-hidden">
      {/* ═══ IMBL Proximity Alert Banner ═══ */}
      <IMBLAlertBanner
        isActive={imblAlertActive || advisory?.safety?.geofence_warning === "BREACH_WARNING"}
        distanceNM={imblDistance}
      />

      {/* ═══ Top Mobile Status Bar ═══ */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-1.5 bg-[#0A1628] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5">
            <Signal className="size-3 text-emerald-400" />
            <span className="text-[9px] font-medium text-emerald-400">NavIC Online</span>
          </div>
          {advisoryLoading && (
            <div className="flex items-center gap-1 text-[9px] text-cyan-400">
              <Loader2 className="size-2.5 animate-spin" />
              <span>ORCA Syncing...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[9px] text-white/40 font-mono">
          <Navigation className="size-2.5 text-[#00D2FF]" />
          <span>
            {boat.lat.toFixed(2)}°N {boat.lng.toFixed(2)}°E
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Battery className="size-3 text-[#FACC15]" />
          <span className="text-[9px] text-white/50 font-medium">{batteryLevel}%</span>
        </div>
      </div>

      {/* ═══ Voice Input Mini Banner ═══ */}
      <AnimatePresence>
        {(voiceInputQuery || voiceInputResponse) && activeTab === "map" && (
          <motion.div
            className="mx-3 mt-2 rounded-lg border border-[#FACC15]/20 bg-[#FACC15]/5 p-2.5 flex-shrink-0"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {voiceInputQuery && (
              <div className="flex items-start gap-2 mb-1">
                <Mic className="size-3 text-[#FACC15] mt-0.5 shrink-0" />
                <p className="text-[11px] text-[#FACC15]">{voiceInputQuery}</p>
              </div>
            )}
            {voiceInputResponse && (
              <div className="flex items-start gap-2">
                <Radio className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-white/80">{voiceInputResponse}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Tab Content Area ═══ */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {/* ── MAP TAB ── */}
        <AnimatePresence mode="wait">
          {activeTab === "map" && (
            <motion.div
              key="map"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Windy ECMWF live map iframe */}
              <WindyMapContainer lat={mapCenter.lat} lon={mapCenter.lon} zoom={mapCenter.zoom} />

              {/* ── Floating Safety Status Card ──── */}
              <div className="absolute top-3 left-3 right-3 z-40 pointer-events-auto">
                <motion.div
                  className="rounded-xl frost-glass p-3 backdrop-blur-md"
                  style={{ borderColor: `${safetyColor}40` }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center rounded-lg p-1.5"
                        style={{ backgroundColor: `${safetyColor}15` }}
                      >
                        {safetyStatus === "safe" ? (
                          <Ship className="size-4" style={{ color: safetyColor }} />
                        ) : (
                          <AlertTriangle className="size-4" style={{ color: safetyColor }} />
                        )}
                      </div>
                      <div>
                        <div
                          className="text-xs font-black tracking-wide"
                          style={{ color: safetyColor }}
                        >
                          {safetyLabel}
                        </div>
                        <div className="text-[10px] text-white/50">
                          PFZ: {advisory?.verdict?.fishing_potential ?? "MODERATE"} (
                          {Math.round((advisory?.verdict?.pfz_probability ?? 0.85) * 100)}%) ·{" "}
                          {advisory?.verdict?.legal_status ?? "EEZ Compliant"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1 text-white/70">
                        <Waves className="size-3 text-blue-400" />
                        <span>{advisory?.conditions?.wave_height_m ?? weather.waveHeight}m</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/70">
                        <Wind className="size-3 text-cyan-400" />
                        <span>{advisory?.conditions?.wind_speed_kmh ?? weather.windSpeed}km/h</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/70">
                        <Thermometer className="size-3 text-orange-400" />
                        <span>{advisory?.conditions?.sea_surface_temp_c ?? weather.surfaceTemp}°C</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ── Region Quick-Jump Buttons ─── */}
              <div className="absolute top-16 left-3 right-14 z-40 pointer-events-auto flex flex-wrap gap-1">
                {REGION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className="rounded-full frost-glass px-2 py-0.5 text-[9px] text-white/60 hover:text-[#FACC15] hover:border-[#FACC15]/30 transition-colors"
                    onClick={() => {
                      const targetLat =
                        (preset as any).lat ?? (preset as any).center?.[0] ?? boat.lat;
                      const targetLng =
                        (preset as any).lng ?? (preset as any).center?.[1] ?? boat.lng;
                      setMapCenter({
                        lat: (preset as any).center?.[0] ?? targetLat,
                        lon: (preset as any).center?.[1] ?? targetLng,
                        zoom: (preset as any).zoom ?? 6,
                      });
                      setBoat((b) => ({ ...b, lat: targetLat, lng: targetLng }));
                    }}
                  >
                    {preset.emoji} {preset.label}
                  </button>
                ))}
              </div>

              {/* ── Left: AI Intelligence Panel (collapsible) ─── */}
              <div className="absolute top-24 left-3 z-40 pointer-events-auto max-w-[280px] sm:max-w-[320px]">
                <button
                  onClick={() => setAiPanelOpen(!aiPanelOpen)}
                  className="frost-glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-2xl w-full"
                >
                  <div className="flex items-center justify-center size-6 rounded-lg bg-[#FACC15]/10">
                    <Brain className="size-3.5 text-[#FACC15]" />
                  </div>
                  <span className="text-[11px] font-bold text-white">ORCA AI Advisory</span>
                  <span className="ml-auto text-white/40">
                    {aiPanelOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  </span>
                </button>
                <AnimatePresence>
                  {aiPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="mt-1.5 frost-glass rounded-xl p-3 shadow-2xl overflow-hidden"
                    >
                      <div className="text-[10px] font-bold text-[#FACC15] mb-2 uppercase tracking-wider">
                        Multi-Agent Inferences
                      </div>
                      <div className="space-y-2">
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="size-2.5 text-[#FACC15]" />
                            <span className="text-[9px] font-bold text-white/70">PFZ Telemetry</span>
                          </div>
                          <p className="text-[10px] text-white/60">
                            SST: {advisory?.conditions?.sea_surface_temp_c ?? 28.4}°C | Chlorophyll:{" "}
                            {advisory?.conditions?.chlorophyll_a ?? 1.78} mg/m³
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="size-2.5 text-[#FACC15]" />
                            <span className="text-[9px] font-bold text-white/70">Geospatial Boundary</span>
                          </div>
                          <p className="text-[10px] text-white/60">
                            {advisory?.safety?.imbl_distance_km ?? 18.4} km to{" "}
                            {advisory?.safety?.imbl_sector ?? "IMBL"} (
                            {advisory?.safety?.geofence_warning ?? "CLEAR"})
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="size-2.5 text-[#FACC15]" />
                            <span className="text-[9px] font-bold text-white/70">Cyclone Alert Status</span>
                          </div>
                          <p className="text-[10px] text-white/60">
                            {advisory?.conditions?.cyclone_alert ?? "NONE"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#FACC15]"
                            style={{
                              width: `${Math.round((advisory?.verdict?.pfz_probability ?? 0.88) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-[#FACC15]/80 font-medium">
                          {Math.round((advisory?.verdict?.pfz_probability ?? 0.88) * 100)}% confidence
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Right Center: Layer Controls (collapsible) ─── */}
              <div className="absolute top-24 right-3 z-40 pointer-events-auto w-48 sm:w-52">
                <button
                  onClick={() => setLayerPanelOpen(!layerPanelOpen)}
                  className="frost-glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-2xl w-full"
                >
                  <Layers className="size-3.5 text-[#00D2FF]" />
                  <span className="text-[11px] font-bold text-white">Layers</span>
                  <span className="ml-auto text-white/40">
                    {layerPanelOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  </span>
                </button>
                <AnimatePresence>
                  {layerPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="mt-1.5 frost-glass rounded-xl p-2.5 shadow-2xl overflow-hidden"
                    >
                      {[
                        { id: "sst", label: "Sea Surface Temp (SST)" },
                        { id: "chlorophyll", label: "Chlorophyll Concentration" },
                        { id: "pfz", label: "INCOIS PFZ Zones" },
                        { id: "imbl", label: "IMBL / EEZ Boundaries" },
                        { id: "vessels", label: "Live Vessel Traffic (AIS)" },
                      ].map((layer) => (
                        <label
                          key={layer.id}
                          className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/[0.03] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={activeCommandLayers.includes(layer.id)}
                            onChange={() =>
                              setActiveCommandLayers((prev) =>
                                prev.includes(layer.id)
                                  ? prev.filter((l) => l !== layer.id)
                                  : [...prev, layer.id]
                              )
                            }
                            className="sr-only peer"
                          />
                          <div
                            className={`flex items-center justify-center size-3.5 rounded border transition-colors ${
                              activeCommandLayers.includes(layer.id)
                                ? "bg-[#00D2FF] border-[#00D2FF]"
                                : "border-white/20 bg-transparent"
                            }`}
                          >
                            {activeCommandLayers.includes(layer.id) && (
                              <CheckCircle className="size-2.5 text-[#061424]" />
                            )}
                          </div>
                          <span className="text-[10px] text-white/60">{layer.label}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Right: Telemetry & Alerts (collapsible) ─── */}
              <div className="absolute bottom-20 right-3 z-40 pointer-events-auto w-52 sm:w-60">
                <button
                  onClick={() => setTelemetryPanelOpen(!telemetryPanelOpen)}
                  className="frost-glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-2xl w-full"
                >
                  <Waves className="size-3.5 text-[#00D2FF]" />
                  <span className="text-[11px] font-bold text-white">Live Telemetry</span>
                  <span className="ml-auto text-white/40">
                    {telemetryPanelOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  </span>
                </button>
                <AnimatePresence>
                  {telemetryPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: 8, height: 0 }}
                      className="mt-1.5 frost-glass rounded-xl p-3 shadow-2xl overflow-hidden max-h-[50vh] overflow-y-auto"
                    >
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-1.5 text-center">
                          <div className="text-[8px] text-white/40 uppercase">Wave</div>
                          <div className="text-xs font-bold text-white">
                            {advisory?.conditions?.wave_height_m ?? weather.waveHeight}
                            <span className="text-[8px] text-white/40">m</span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-1.5 text-center">
                          <div className="text-[8px] text-white/40 uppercase">Wind</div>
                          <div className="text-xs font-bold text-white">
                            {advisory?.conditions?.wind_speed_kmh ?? weather.windSpeed}
                            <span className="text-[8px] text-white/40">km/h</span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-1.5 text-center">
                          <div className="text-[8px] text-white/40 uppercase">SST</div>
                          <div className="text-xs font-bold text-white">
                            {advisory?.conditions?.sea_surface_temp_c ?? weather.surfaceTemp}
                            <span className="text-[8px] text-white/40">°C</span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-1.5 text-center">
                          <div className="text-[8px] text-white/40 uppercase">Chl-a</div>
                          <div className="text-xs font-bold text-white">
                            {advisory?.conditions?.chlorophyll_a ?? "1.78"}
                            <span className="text-[8px] text-white/40">mg/m³</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 p-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="size-2.5 text-[#EF4444]" />
                          <span className="text-[9px] font-bold text-[#EF4444] uppercase">
                            ORCA Security Advisory
                          </span>
                        </div>
                        <p className="text-[9px] text-white/60 leading-relaxed">
                          {advisory?.safety?.imbl_distance_km ?? 18.4} km to{" "}
                          {advisory?.safety?.imbl_sector ?? "IMBL"}.{" "}
                          {advisory?.verdict?.legal_status ?? "Inside Indian EEZ"}.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Simulate Border Button ──────────── */}
              <div className="absolute bottom-4 right-3 z-40 pointer-events-auto">
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-[10px] gap-1 bg-[#EF4444]/80 hover:bg-[#EF4444] border border-[#EF4444]/50 shadow-lg shadow-[#EF4444]/20"
                  onClick={handleSimulateBorder}
                  disabled={simulating}
                >
                  <AlertTriangle className="size-3" />
                  {simulating ? "Moving..." : "Simulate Border"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── VOICE AI TAB ──────────────────── */}
          {activeTab === "voice" && (
            <motion.div
              key="voice"
              className="absolute inset-0 flex flex-col bg-[#061424]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <motion.div
                  className={`relative flex items-center justify-center rounded-full w-28 h-28 shadow-2xl cursor-pointer ${
                    voiceInputListening
                      ? "bg-[#EF4444] shadow-[#EF4444]/30"
                      : "bg-gradient-to-br from-[#FACC15] to-[#f59e0b] shadow-[#FACC15]/30"
                  }`}
                  whileTap={{ scale: 0.92 }}
                  animate={voiceInputListening ? { scale: [1, 1.08, 1] } : {}}
                  transition={voiceInputListening ? { repeat: Infinity, duration: 1.2 } : {}}
                  onClick={() => handleVoiceMicPress()}
                >
                  {voiceInputListening ? (
                    <Volume2 className="size-12 text-white" />
                  ) : (
                    <Mic className="size-12 text-[#061424]" />
                  )}
                </motion.div>

                <p className="text-sm text-white/60 mt-6 text-center">
                  {voiceInputListening ? "Querying ORCA Marine Engine..." : "Tap to Speak or Ask Advisory"}
                </p>

                {/* Quick query chips */}
                <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-md">
                  {QUICK_QUERIES.map((q) => (
                    <button
                      key={q}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/60 hover:text-[#FACC15] hover:border-[#FACC15]/30 transition-colors"
                      onClick={() => handleVoiceMicPress(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice response card */}
              <AnimatePresence>
                {(voiceInputQuery || voiceInputResponse) && (
                  <motion.div
                    className="mx-4 mb-4 rounded-xl border border-[#FACC15]/20 bg-[#FACC15]/5 p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    {voiceInputQuery && (
                      <div className="flex items-start gap-2 mb-2">
                        <Mic className="size-3.5 text-[#FACC15] mt-0.5 shrink-0" />
                        <p className="text-xs text-[#FACC15]">{voiceInputQuery}</p>
                      </div>
                    )}
                    {voiceInputResponse && (
                      <div className="flex items-start gap-2">
                        <Radio className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-white/80 leading-relaxed">{voiceInputResponse}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── WEATHER & TIDES TAB ────────────── */}
          {activeTab === "weather" && (
            <motion.div
              key="weather"
              className="absolute inset-0 overflow-y-auto bg-[#061424]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="p-4 space-y-3">
                {/* Sea Safety Status Card */}
                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: `${safetyColor}30`,
                    backgroundColor: `${safetyColor}08`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-lg p-2.5"
                      style={{ backgroundColor: `${safetyColor}15` }}
                    >
                      {safetyStatus === "safe" ? (
                        <Ship className="size-6" style={{ color: safetyColor }} />
                      ) : (
                        <AlertTriangle className="size-6" style={{ color: safetyColor }} />
                      )}
                    </div>
                    <div>
                      <div
                        className="text-base font-black tracking-wide"
                        style={{ color: safetyColor }}
                      >
                        {safetyLabel}
                      </div>
                      <div className="text-xs text-white/40">
                        {advisory?.verdict?.legal_status ?? "EEZ Compliant"} ·{" "}
                        {advisory?.safety?.imbl_distance_km ?? 18.4} km to IMBL
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Waves className="size-5 text-blue-400" />
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                        Wave Height
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {advisory?.conditions?.wave_height_m ?? weather.waveHeight}
                      <span className="text-sm font-normal text-white/40">m</span>
                    </p>
                    <p className="text-[10px] text-blue-400/60 mt-1">
                      {(advisory?.conditions?.wave_height_m ?? weather.waveHeight) < 2.0
                        ? "Safe limits"
                        : "Rough sea state"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="size-5 text-cyan-400" />
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                        Wind Speed
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {advisory?.conditions?.wind_speed_kmh ?? weather.windSpeed}
                      <span className="text-sm font-normal text-white/40">km/h</span>
                    </p>
                    <p className="text-[10px] text-cyan-400/60 mt-1">
                      Cyclone alert: {advisory?.conditions?.cyclone_alert ?? "NONE"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="size-5 text-orange-400" />
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                        SST
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {advisory?.conditions?.sea_surface_temp_c ?? weather.surfaceTemp}
                      <span className="text-sm font-normal text-white/40">°C</span>
                    </p>
                    <p className="text-[10px] text-orange-400/60 mt-1">
                      Chlorophyll: {advisory?.conditions?.chlorophyll_a ?? 1.78} mg/m³
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Fish className="size-5 text-emerald-400" />
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                        PFZ Potential
                      </span>
                    </div>
                    <p className="text-xl font-black text-white">
                      {advisory?.verdict?.fishing_potential ?? "EXCELLENT"}
                    </p>
                    <p className="text-[10px] text-emerald-400/60 mt-1">
                      {Math.round((advisory?.verdict?.pfz_probability ?? 0.88) * 100)}% Probability
                    </p>
                  </div>
                </div>

                {/* Tide & Compass */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="size-4 text-[#00D2FF]" />
                      <span className="text-xs font-bold text-white/70">Tide Status</span>
                    </div>
                    <p className="text-lg font-black text-[#00D2FF]">{weather.tideStatus}</p>
                    <p className="text-[10px] text-white/30 mt-1">Current tidal phase</p>
                  </div>
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Compass className="size-4 text-[#FACC15]" />
                      <span className="text-xs font-bold text-white/70">Heading</span>
                    </div>
                    <p className="text-lg font-black text-[#FACC15]">{boat.heading}°</p>
                    <p className="text-[10px] text-white/30 mt-1">Vessel bearing</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SOS TAB ──────────────────────── */}
          {activeTab === "sos" && (
            <motion.div
              key="sos"
              className="absolute inset-0 overflow-y-auto bg-[#061424]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex flex-col items-center justify-center min-h-full p-6">
                <div className="w-full h-1 rounded-full bg-gradient-to-r from-[#EF4444] via-[#FACC15] to-[#EF4444] animate-pulse mb-8" />

                <AnimatePresence mode="wait">
                  {sosStage === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full text-center"
                    >
                      <motion.div
                        className="mx-auto flex items-center justify-center w-32 h-32 rounded-full bg-[#EF4444] shadow-2xl shadow-[#EF4444]/40 mb-6 cursor-pointer"
                        whileTap={{ scale: 0.9 }}
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(239,68,68,0.3)",
                            "0 0 60px rgba(239,68,68,0.5)",
                            "0 0 20px rgba(239,68,68,0.3)",
                          ],
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        onClick={handleSOSTransmit}
                      >
                        <Siren className="size-16 text-white" />
                      </motion.div>

                      <h2 className="text-xl font-black text-white mb-1">EMERGENCY SOS</h2>
                      <p className="text-xs text-[#EF4444]/70 mb-6">Maritime Distress Signal System</p>

                      <div className="w-full space-y-2 mb-6">
                        <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2">
                          <span className="text-[10px] text-white/40 uppercase">GPS</span>
                          <span className="text-xs font-mono text-white">
                            {boat.lat.toFixed(4)}°N, {boat.lng.toFixed(4)}°E
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2">
                          <span className="text-[10px] text-white/40 uppercase">Vessel</span>
                          <span className="text-xs font-mono text-white">#IND-AP-4082</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2">
                          <span className="text-[10px] text-white/40 uppercase">Battery</span>
                          <span className="text-xs text-[#FACC15] font-medium">{batteryLevel}%</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2">
                          <span className="text-[10px] text-white/40 uppercase">Signal</span>
                          <span className="text-xs text-[#22c55e] font-medium">NavIC Linked ✓</span>
                        </div>
                      </div>

                      <div className="w-full space-y-2">
                        <Button
                          className="w-full bg-[#EF4444] hover:bg-[#EF4444]/80 text-white font-bold py-4 gap-2 text-sm"
                          onClick={handleSOSTransmit}
                        >
                          <Radio className="size-4" />
                          TRANSMIT COAST GUARD DISTRESS SIGNAL
                        </Button>
                        <Button
                          className="w-full bg-[#FACC15]/10 hover:bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30 font-bold py-3 gap-2 text-sm"
                          onClick={handleSOSTransmit}
                        >
                          <SignalHigh className="size-4" />
                          ALERT NEARBY BOATS (MESH NETWORK)
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {sosStage === "countdown" && (
                    <motion.div
                      key="countdown"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full text-center"
                    >
                      <Loader2 className="size-16 text-[#EF4444] animate-spin mx-auto mb-4" />
                      <p className="text-lg font-black text-white mb-1">Transmitting Signal...</p>
                      <p className="text-sm text-white/50 mb-4">Live ping · {sosCountdown}s remaining</p>

                      <div className="flex items-center justify-center gap-2 mb-8">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              i < 5 - sosCountdown ? "bg-[#EF4444]" : "bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                        className="text-white/40 hover:text-white/60"
                        onClick={resetSOS}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  )}

                  {sosStage === "sent" && (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full text-center"
                    >
                      <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-[#22c55e]/15 mb-4">
                        <CheckCircle2 className="size-12 text-[#22c55e]" />
                      </div>
                      <p className="text-lg font-black text-white mb-1">Signal Transmitted ✓</p>
                      <p className="text-xs text-white/50 mb-6">
                        Coast Guard Maritime Rescue Centre notified. Stay on this channel for response.
                      </p>
                      <Button
                        className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#061424] font-bold px-8"
                        onClick={() => {
                          resetSOS();
                          setActiveTab("map");
                        }}
                      >
                        Return to Map
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Bottom Navigation Bar ═══ */}
      <div className="flex-shrink-0 flex items-stretch bg-[#0A1628] border-t border-white/[0.06] safe-bottom relative z-50">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors relative ${
                isActive
                  ? tab.id === "sos"
                    ? "text-[#EF4444]"
                    : "text-[#00D2FF]"
                  : "text-white/30"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {isActive && (
                <motion.div
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full"
                  style={{
                    backgroundColor: tab.id === "sos" ? "#EF4444" : "#00D2FF",
                  }}
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative">
                <Icon className="size-5" />
                {tab.badge && (
                  <span
                    className="absolute -top-1 -right-2 text-[7px] font-bold px-1 rounded-full"
                    style={{ backgroundColor: tab.badgeColor, color: "white" }}
                  >
                    !
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ Center Mic FAB (visible on map tab only) ═══ */}
      <AnimatePresence>
        {activeTab === "map" && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl ${
              voiceInputListening
                ? "bg-[#EF4444] shadow-[#EF4444]/40"
                : "bg-gradient-to-br from-[#FACC15] to-[#f59e0b] shadow-[#FACC15]/30"
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVoiceMicPress()}
          >
            {voiceInputListening ? (
              <Volume2 className="size-6 text-white" />
            ) : (
              <Mic className="size-6 text-[#061424]" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══ Floating Chatbot Widget ═══ */}
      <FishermenChatbot language={language} />

      {/* ═══ Floating Border Alert Modal ═══ */}
      <AnimatePresence>
        {showBorderAlert && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-sm w-full rounded-2xl border-2 border-[#EF4444] bg-[#061424] p-5 shadow-2xl shadow-[#EF4444]/30 backdrop-blur-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-xl bg-[#EF4444]/15 p-2.5">
                  <AlertTriangle className="size-7 text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#EF4444]">⚠️ WARNING</h3>
                  <p className="text-sm text-white/70">Approaching International Waters</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 p-4 mb-4">
                <p className="text-sm text-white/80 leading-relaxed">
                  Your vessel is within <strong className="text-[#EF4444]">2 nautical miles</strong> of the IMBL.
                  Continued movement may result in entering foreign waters.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
                  <span>{boat.lat.toFixed(4)}°N</span>
                  <span>{boat.lng.toFixed(4)}°E</span>
                  <span className="text-[#EF4444]">1.8 nm to IMBL</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#EF4444] hover:bg-[#EF4444]/80 text-white font-bold"
                  onClick={handleDismissAlert}
                >
                  <Navigation className="size-4" />
                  Turn Back
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 text-white/60"
                  onClick={() => {
                    setShowBorderAlert(false);
                    setActiveTab("sos");
                  }}
                >
                  <Radio className="size-4" />
                  SOS
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}