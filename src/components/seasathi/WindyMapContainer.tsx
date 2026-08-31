import { useState, useCallback, useRef } from "react";
import {
  Zap,
  Wind,
  CloudRain,
  Thermometer,
  Waves,
  AlertTriangle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Crosshair,
} from "lucide-react";

function buildWindyUrl(lat: number, lon: number, zoom: number, level: string, overlay: string): string {
  return (
    `https://embed.windy.com/embed2.html?` +
    `lat=${lat}&lon=${lon}` +
    `&detailLat=${lat}&detailLon=${lon}` +
    `&width=100%25&height=100%25` +
    `&zoom=${zoom}&level=${level}` +
    `&overlay=${overlay}&product=ecmwf` +
    `&menu=&message=true&marker=true` +
    `&calendar=none&pressure=true` +
    `&type=map&location=coordinates&detail=true` +
    `&metricWind=kt&metricTemp=%C2%B0C` +
    `&radarRange=-1`
  );
}

/* ── Layer Toggle Items ─────────────────── */
const LAYER_TOGGLES = [
  { id: "wind", icon: Wind, label: "Wind", color: "#00D2FF", windyOverlay: "wind" },
  { id: "radar", icon: CloudRain, label: "Radar", color: "#22c55e", windyOverlay: "radar" },
  { id: "temp", icon: Thermometer, label: "Temp", color: "#f97316", windyOverlay: "temp" },
  { id: "waves", icon: Waves, label: "Waves", color: "#8b5cf6", windyOverlay: "waves" },
  { id: "storms", icon: AlertTriangle, label: "Storms", color: "#EF4444", windyOverlay: "thunder" },
] as const;

function generateDateLabels(): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    labels.push(
      i === 0
        ? "Today"
        : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    );
  }
  return labels;
}

const WIND_SCALE = [
  { value: 0, label: "0" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 30, label: "30" },
  { value: 40, label: "40" },
  { value: 60, label: "60" },
];

interface WindyMapContainerProps {
  level?: string;
  lat?: number;
  lon?: number;
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function WindyMapContainer({
  level = "surface",
  lat = 15,
  lon = 78,
  zoom = 5,
  onLocationSelect,
}: WindyMapContainerProps) {
  const [activeLayer, setActiveLayer] = useState<string>("wind");
  const [windyOverlay, setWindyOverlay] = useState<string>("wind");
  const [pinMode, setPinMode] = useState(true);
  const [pinnedCoord, setPinnedCoord] = useState<{ lat: number; lng: number; x: number; y: number } | null>({
    lat,
    lng: lon,
    x: 50,
    y: 50,
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [dayIndex, setDayIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const url = buildWindyUrl(lat, lon, zoom, level, windyOverlay);
  const dateLabels = generateDateLabels();

  const handlePrev = useCallback(() => {
    setDayIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setDayIndex((prev) => Math.min(13, prev + 1));
  }, []);

  // Approximate coordinate mapping relative to map viewport center
  const handleMapOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = (clickX / rect.width) * 100;
    const percentY = (clickY / rect.height) * 100;

    // Convert pixel delta to lat/lon degrees based on zoom level
    const spanDeg = 360 / Math.pow(2, zoom);
    const deltaLon = ((clickX - rect.width / 2) / rect.width) * spanDeg * 1.2;
    const deltaLat = -((clickY - rect.height / 2) / rect.height) * (spanDeg / 1.6);

    const newLat = Number((lat + deltaLat).toFixed(4));
    const newLng = Number((lon + deltaLon).toFixed(4));

    setPinnedCoord({ lat: newLat, lng: newLng, x: percentX, y: percentY });

    if (onLocationSelect) {
      onLocationSelect(newLat, newLng);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden">
      {/* Windy iframe */}
      <iframe
        src={url}
        title="SeaSathi Live Wind Map — Windy ECMWF Engine"
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* ═══ Interactive Click / Pin Layer ═══ */}
      {pinMode && (
        <div
          onClick={handleMapOverlayClick}
          className="absolute inset-0 z-20 cursor-crosshair bg-transparent"
        >
          {pinnedCoord && (
            <div
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-300 flex flex-col items-center"
              style={{ left: `${pinnedCoord.x}%`, top: `${pinnedCoord.y}%` }}
            >
              <div className="rounded-lg bg-[#061424]/90 border border-[#FACC15] px-2 py-0.5 text-[9px] font-mono font-bold text-[#FACC15] shadow-xl whitespace-nowrap mb-1">
                📍 {pinnedCoord.lat}°N, {pinnedCoord.lng}°E
              </div>
              <div className="relative">
                <MapPin className="size-6 text-[#FACC15] fill-[#FACC15] drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-[#00D2FF] animate-ping" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Floating SeaSathi Badge & Pin Mode Toggle (top-left) ═══ */}
      <div className="absolute top-4 left-4 z-40 pointer-events-auto flex items-center gap-2">
        <div className="frost-glass rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-lg bg-[#FACC15]/10">
            <Zap className="size-4 text-[#FACC15]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white leading-tight">
              SeaSathi Live Telemetry
            </div>
            <div className="text-[9px] text-white/40 leading-tight">
              Powered by Windy ECMWF Engine
            </div>
          </div>
          <div className="ml-1 size-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <button
          onClick={() => setPinMode(!pinMode)}
          className={`frost-glass rounded-xl px-3 py-2.5 shadow-2xl flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
            pinMode
              ? "border-[#FACC15] text-[#FACC15] bg-[#FACC15]/10"
              : "text-white/60 hover:text-white"
          }`}
          title="Click to toggle Pin Coordinate mode"
        >
          <Crosshair className="size-3.5" />
          <span>{pinMode ? "Pin Mode ON" : "Pin Mode OFF"}</span>
        </button>
      </div>

      {/* ═══ Right Vertical Layer Toggles ═══ */}
      <div className="absolute top-4 right-4 z-40 pointer-events-auto flex flex-col gap-1.5">
        {LAYER_TOGGLES.map((layer) => {
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => {
                setActiveLayer(layer.id);
                setWindyOverlay(layer.windyOverlay);
              }}
              className={`frost-glass flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all ${
                isActive
                  ? "border-[2px] shadow-lg"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={
                isActive
                  ? {
                      borderColor: `${layer.color}80`,
                      boxShadow: `0 0 12px ${layer.color}30`,
                      color: layer.color,
                    }
                  : { color: "rgba(255,255,255,0.6)" }
              }
            >
              <layer.icon className="size-3.5" />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ Bottom Timeline Scrubber ═══ */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-40 pointer-events-auto w-[min(90%,600px)]">
        <div className="frost-glass rounded-xl px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={handlePrev}
              disabled={dayIndex === 0}
              className="size-6 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="size-7 flex items-center justify-center rounded-full text-[#061424] transition-colors"
              style={{ backgroundColor: "#00D2FF" }}
            >
              {isPlaying ? <Pause className="size-3" /> : <Play className="size-3 ml-0.5" />}
            </button>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1">
                {dateLabels.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setDayIndex(i)}
                    className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-medium transition-colors ${
                      i === dayIndex
                        ? "bg-[#00D2FF]/20 text-[#00D2FF]"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={dayIndex === 13}
              className="size-6 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={13}
            value={dayIndex}
            onChange={(e) => setDayIndex(Number(e.target.value))}
            className="timeline-track w-full h-1 appearance-none rounded-full bg-white/10 cursor-pointer"
          />

          <div className="mt-1.5 flex items-center justify-between text-[9px] text-white/35">
            <span>ECMWF 14-Day Forecast</span>
            <span className="text-[#00D2FF] font-medium">{dateLabels[dayIndex]}</span>
          </div>
        </div>
      </div>

      {/* ═══ Bottom-Right Thermal Legend Bar ═══ */}
      <div className="absolute bottom-14 right-4 z-40 pointer-events-auto">
        <div className="frost-glass rounded-xl px-3 py-2.5 shadow-2xl">
          <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider mb-1.5 text-center">
            Sea Surface Temperature
          </div>
          <div className="thermal-legend h-2.5 rounded-full w-48" />
          <div className="flex items-center justify-between mt-1">
            {WIND_SCALE.map((tick) => (
              <span key={tick.value} className="text-[7px] text-white/30 font-medium">
                {tick.label}
              </span>
            ))}
          </div>
          <div className="text-center text-[8px] text-white/25 mt-0.5">kt</div>
        </div>
      </div>
    </div>
  );
}