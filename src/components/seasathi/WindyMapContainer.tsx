import { Zap } from "lucide-react";

const WINDY_EMBED_URL =
  "https://embed.windy.com/embed2.html?" +
  "lat=20.5937&lon=78.9629" +
  "&detailLat=17.6868&detailLon=83.2185" +
  "&width=100%25&height=100%25" +
  "&zoom=5&level=surface" +
  "&overlay=wind&product=ecmwf" +
  "&menu=&message=true&marker=true" +
  "&calendar=now&pressure=true" +
  "&type=map&location=coordinates&detail=true" +
  "&metricWind=kt&metricTemp=%C2%B0C" +
  "&radarRange=-1";

interface WindyMapContainerProps {
  /** Altitude level for the wind overlay (e.g. "surface", "950h", "850h") */
  level?: string;
}

export default function WindyMapContainer({ level = "surface" }: WindyMapContainerProps) {
  const url = WINDY_EMBED_URL.replace("level=surface", `level=${level}`);

  return (
    <div className="relative w-full h-full">
      {/* Windy iframe — fullscreen, no border */}
      <iframe
        src={url}
        title="SeaSathi Live Wind Map — Windy ECMWF Engine"
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Floating SeaSathi telemetry badge */}
      <div className="absolute top-4 left-4 z-[1000]">
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
      </div>
    </div>
  );
}
