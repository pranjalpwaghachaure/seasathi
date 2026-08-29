import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import {
  Mic,
  Waves,
  Wind,
  Thermometer,
  Navigation,
  AlertTriangle,
  Ship,
  Target,
  Radio,
  X,
  Volume2,
  AudioLines,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MAP_CENTER,
  MAP_ZOOM,
  USER_BOAT,
  FISHING_ZONES,
  IMBL_POINTS,
  SAFE_FISHING_POINTS,
  DEFAULT_WEATHER,
  QUICK_QUERIES,
  VOICE_QUERIES,
  AI_VOICE_RESPONSE,
  BORDER_CROSSING_TARGET,
  getSafetyStatus,
  getSafetyLabel,
  getSafetyColor,
  getZoneColor,
  type UserBoat,
} from "@/lib/mockData";

/* ── Boat Tracker (reacts to state) ────────── */
function BoatTracker({ boat }: { boat: UserBoat }) {
  return (
    <>
      {/* Pulse ring */}
      <CircleMarker
        center={[boat.lat, boat.lng]}
        radius={16}
        pathOptions={{
          fillColor: "#38bdf8",
          fillOpacity: 0.15,
          color: "#38bdf8",
          weight: 1,
          opacity: 0.3,
        }}
      >
        <Popup>
          <strong>{boat.name}</strong>
          <br />
          Speed: {boat.speed} knots
        </Popup>
      </CircleMarker>
      {/* Boat dot */}
      <CircleMarker
        center={[boat.lat, boat.lng]}
        radius={7}
        pathOptions={{
          fillColor: "#38bdf8",
          fillOpacity: 1,
          color: "#fff",
          weight: 2,
        }}
      >
        <Popup>
          <strong>{boat.name}</strong>
          <br />
          Heading: {boat.heading}° | Speed: {boat.speed} kn
        </Popup>
      </CircleMarker>
    </>
  );
}

/* ── Map Invalidator (re-centers on boat) ──── */
function MapInvalidator({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1 });
  }, [center, map]);
  return null;
}

import FishermenChatbot from "@/components/seasathi/FishermenChatbot";
import IMBLAlertBanner from "@/components/seasathi/IMBLAlertBanner";

/* ── Main Fishermen Mode Component ─────────── */
export default function FishermenMode({ language = "en" }: { language?: string }) {
  const [weather] = useState(DEFAULT_WEATHER);
  const [boat, setBoat] = useState<UserBoat>(USER_BOAT);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showBorderAlert, setShowBorderAlert] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [imblAlertActive, setImblAlertActive] = useState(false);
  const [imblDistance, setImblDistance] = useState(18.4);
  const waveformRef = useRef<HTMLDivElement>(null);

  const status = getSafetyStatus(weather);

  const handleMicPress = useCallback(() => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setVoiceQuery("");
    setAiResponse("");

    // Simulate voice recognition
    setTimeout(() => {
      setVoiceQuery(VOICE_QUERIES.en);
      setTimeout(() => {
        setIsSpeaking(false);
        setAiResponse(AI_VOICE_RESPONSE.en);
      }, 800);
    }, 1500);
  }, [isSpeaking]);

  const handleQuickQuery = useCallback((query: string) => {
    setIsSpeaking(true);
    setVoiceQuery(query);
    setAiResponse("");

    setTimeout(() => {
      setIsSpeaking(false);
      if (query.includes("IMBL")) {                setAiResponse("You are 18.4 nautical miles from the International Maritime Boundary Line. Your current position is within the safe zone. Maintain your heading and keep monitoring GPS alerts.");
      } else if (query.includes("PFZ")) {                setAiResponse("Nearest Potential Fishing Zone: Zone B, approximately 12 nautical miles southwest. High fish productivity is expected. Water temperature is optimal at 28.4°C. I recommend departing within the next two hours for the best catch window.");
      } else {                setAiResponse("Next 24-hour forecast: Waves currently at 1.8 metres, rising to 2.4 metres by evening. South-westerly winds building from 14 to 18 knots. A morning departure is strongly recommended. Sea surface temperature stable at 28.4°C.");
      }
    }, 1200);
  }, []);

  const handleSimulateBorder = useCallback(() => {
    setSimulating(true);
    setImblAlertActive(true);
    setImblDistance(18.4);
    // Gradually move boat towards IMBL
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const lat = USER_BOAT.lat + (BORDER_CROSSING_TARGET.lat - USER_BOAT.lat) * (step / 20);
      const lng = USER_BOAT.lng + (BORDER_CROSSING_TARGET.lng - USER_BOAT.lng) * (step / 20);
      setBoat((prev) => ({ ...prev, lat, lng, heading: 90 }));
      setImblDistance(Math.max(0.5, 18.4 - step * 0.9));

      if (step >= 15) {
        setShowBorderAlert(true);
      }
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* IMBL Proximity Alert Banner */}
      <IMBLAlertBanner isActive={imblAlertActive} distanceNM={imblDistance} />
      {/* ── Safety Status Banner ────────────────────── */}
      <motion.div
        className="relative mx-3 mt-3 rounded-xl border p-4 flex-shrink-0"
        style={{
          borderColor: `${getSafetyColor(status)}30`,
          backgroundColor: `${getSafetyColor(status)}08`,
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-lg p-2"
              style={{ backgroundColor: `${getSafetyColor(status)}15` }}
            >
              {status === "safe" ? (
                <Ship className="size-5" style={{ color: getSafetyColor(status) }} />
              ) : status === "caution" ? (
                <AlertTriangle className="size-5" style={{ color: getSafetyColor(status) }} />
              ) : (
                <AlertTriangle className="size-5" style={{ color: getSafetyColor(status) }} />
              )}
            </div>
            <div>
              <div
                className="text-sm font-black tracking-wide"
                style={{ color: getSafetyColor(status) }}
              >
                {getSafetyLabel(status)}
              </div>
              <div className="text-[11px] text-white/40">
                {weather.tideStatus} tide • {weather.visibility} visibility
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-white/60">
              <Waves className="size-3.5 text-blue-400" />
              <span>{weather.waveHeight}m</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Wind className="size-3.5 text-cyan-400" />
              <span>{weather.windSpeed} kn {weather.windDirection}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Thermometer className="size-3.5 text-orange-400" />
              <span>{weather.surfaceTemp}°C</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Voice Query Display ─────────────────────── */}
      <AnimatePresence>
        {(voiceQuery || aiResponse) && (
          <motion.div
            className="mx-3 mt-2 rounded-lg border border-[#FACC15]/20 bg-[#FACC15]/5 p-3 flex-shrink-0"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {voiceQuery && (
              <div className="flex items-start gap-2 mb-2">
                <Mic className="size-3.5 text-[#FACC15] mt-0.5 shrink-0" />
                <p className="text-xs text-[#FACC15]">{voiceQuery}</p>
              </div>
            )}
            {aiResponse && (
              <div className="flex items-start gap-2">
                <Radio className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-white/80">{aiResponse}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map ─────────────────────────────────────── */}
      <div className="flex-1 relative mx-3 mt-2 rounded-xl overflow-hidden border border-white/[0.06]">
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          className="w-full h-full"
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapInvalidator center={[boat.lat, boat.lng]} />

          {/* Safe Fishing Zones */}
          {FISHING_ZONES.map((zone) => (
            <CircleMarker
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={10}
              pathOptions={{
                fillColor: getZoneColor(zone.productivity),
                fillOpacity: 0.3,
                color: getZoneColor(zone.productivity),
                weight: 2,
                opacity: 0.7,
              }}
            >
              <Popup>
                <strong>{zone.name}</strong>
                <br />
                Productivity: {zone.productivity}
                <br />
                Species: {zone.species.join(", ")}
              </Popup>
            </CircleMarker>
          ))}

          {/* IMBL Line */}
          <Polyline
            positions={IMBL_POINTS}
            pathOptions={{
              color: "#EF4444",
              weight: 2.5,
              dashArray: "8, 6",
              opacity: 0.8,
            }}
          />

          {/* Safe Fishing Points */}
          {SAFE_FISHING_POINTS.map((point, i) => (
            <CircleMarker
              key={`sf-${i}`}
              center={point}
              radius={5}
              pathOptions={{
                fillColor: "#22c55e",
                fillOpacity: 0.5,
                color: "#22c55e",
                weight: 1,
              }}
            />
          ))}

          {/* User Boat */}
          <BoatTracker boat={boat} />
        </MapContainer>

        {/* Simulate Border Button */}
        <div className="absolute top-3 right-3 z-[1000]">
          <Button
            size="sm"
            variant="destructive"
            className="text-[10px] gap-1 bg-[#EF4444]/80 hover:bg-[#EF4444] border border-[#EF4444]/50"
            onClick={handleSimulateBorder}
            disabled={simulating}
          >
            <AlertTriangle className="size-3" />
            {simulating ? "Moving..." : "Simulate Border Crossing"}
          </Button>
        </div>
      </div>

      {/* ── Voice Bar ───────────────────────────────── */}
      <div className="flex-shrink-0 p-3">
        {/* Quick query chips */}
        <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_QUERIES.map((q) => (
            <button
              key={q}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60 hover:text-[#FACC15] hover:border-[#FACC15]/30 hover:bg-[#FACC15]/5 transition-colors"
              onClick={() => handleQuickQuery(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Mic button */}
        <div className="flex items-center justify-center">
          <motion.button
            className={`relative flex items-center justify-center rounded-full ${
              isSpeaking
                ? "bg-[#EF4444] mic-active"
                : "bg-[#FACC15] mic-active"
            } w-16 h-16 shadow-2xl ${
              isSpeaking ? "shadow-[#EF4444]/30" : "shadow-[#FACC15]/30"
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={handleMicPress}
            disabled={isSpeaking}
          >
            {isSpeaking ? (
              <Volume2 className="size-7 text-white" />
            ) : (
              <Mic className="size-7 text-[#061424]" />
            )}

            {/* Waveform bars */}
            {isSpeaking && (
              <div className="absolute -bottom-8 flex items-center gap-0.5">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-[#EF4444] rounded-full waveform-bar"
                    style={{
                      height: 4,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-white/30 mt-3">
          {isSpeaking ? "Listening..." : "Tap & Hold to Speak in Vernacular"}
        </p>
      </div>

      {/* ── Floating Border Alert ────────────────────── */}
      <AnimatePresence>
        {showBorderAlert && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-4 max-w-md w-full rounded-2xl border-2 border-[#EF4444] bg-[#061424] p-6 shadow-2xl shadow-[#EF4444]/30 backdrop-blur-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-xl bg-[#EF4444]/15 p-3">
                  <AlertTriangle className="size-8 text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#EF4444]">
                    ⚠️ WARNING
                  </h3>
                  <p className="text-sm text-white/70">
                    Approaching International Waters
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 p-4 mb-4">
                <p className="text-sm text-white/80 leading-relaxed">
                  Your vessel is within <strong className="text-[#EF4444]">2 nautical miles</strong> of
                  the International Maritime Boundary Line (IMBL). Continued movement
                  in this direction may result in entering foreign waters.
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
                  <span>Lat: {boat.lat.toFixed(4)}</span>
                  <span>Lng: {boat.lng.toFixed(4)}</span>
                  <span>Dist to IMBL: 1.8 nm</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#EF4444] hover:bg-[#EF4444]/80 text-white font-bold"
                  onClick={handleDismissAlert}
                >
                  <Navigation className="size-4" />
                  Turn Back Now
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 text-white/60"
                  onClick={() => {
                    // Emergency broadcast
                    setShowBorderAlert(false);
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

      {/* AI Chatbot Widget */}
      <FishermenChatbot language={language} />
    </div>
  );
}
