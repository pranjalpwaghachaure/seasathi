import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WindyMapContainer from "@/components/seasathi/WindyMapContainer";
import {
  Send,
  ChevronDown,
  ChevronRight,
  Brain,
  CheckCircle2,
  Loader2,
  Layers,
  AlertTriangle,
  Radio,
  TrendingUp,
  Zap,
  Bot,
  Clock,
  Fish,
  Volume2,
  Waves,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import FuelSavingsCard from "@/components/seasathi/FuelSavingsCard";
import { fetchMarineConditions, fetchCopernicusMarineData } from "@/lib/marineApi";
import type { MarineConditions, CopernicusMarineData } from "@/lib/marineApi";
import {
  MAP_CENTER,
  WEATHER_ALERTS,
  FISH_TRENDS,
  AI_CHAT_HISTORY,
  AI_TOOL_CHAIN,
  LAYER_OPTIONS,
  REGION_PRESETS,
  type AIMessage,
  type ToolCall,
} from "@/lib/mockData";

/* ── Main Command Center ───────────────────── */
export default function CommandCenter() {
  const [messages, setMessages] = useState<AIMessage[]>(AI_CHAT_HISTORY);
  const [input, setInput] = useState("");
  const [toolChain, setToolChain] = useState<ToolCall[]>(AI_TOOL_CHAIN);
  const [chainOpen, setChainOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState<string[]>(
    LAYER_OPTIONS.filter((l) => l.checked).map((l) => l.id),
  );
  const [isThinking, setIsThinking] = useState(false);
  const [marineData, setMarineData] = useState<MarineConditions | null>(null);
  const [copernicusData, setCopernicusData] = useState<CopernicusMarineData | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch live marine conditions from Open-Meteo
  useEffect(() => {
    fetchMarineConditions(MAP_CENTER[0], MAP_CENTER[1]).then(setMarineData);
  }, []);

  // Fetch Copernicus Marine Service data (CMEMS PHY_001_024)
  useEffect(() => {
    fetchCopernicusMarineData(MAP_CENTER[0], MAP_CENTER[1]).then(setCopernicusData);
  }, []);

  const toggleLayer = useCallback((id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isThinking) return;

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    // Simulate AI thinking with tool chain
    setToolChain((prev) =>
      prev.map((tc, i) => ({
        ...tc,
        status: i === 0 ? ("running" as const) : ("pending" as const),
      })),
    );
    setChainOpen(true);

    setTimeout(() => {
      setToolChain((prev) =>
        prev.map((tc, i) => {
          if (i === 0) return { ...tc, status: "complete" as const };
          if (i === 1) return { ...tc, status: "running" as const };
          return tc;
        }),
      );
    }, 800);

    setTimeout(() => {
      setToolChain((prev) =>
        prev.map((tc, i) => {
          if (i <= 1) return { ...tc, status: "complete" as const };
          if (i === 2) return { ...tc, status: "running" as const };
          return tc;
        }),
      );
    }, 1600);

    setTimeout(() => {
      setToolChain((prev) => prev.map((tc) => ({ ...tc, status: "complete" as const })));
      setIsThinking(false);

      const aiMsg: AIMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          "Analysis complete. Based on combined ISRO MOSDAC and INCOIS data feeds, current conditions along your queried route are favorable. Sea surface temperatures show a mild gradient, and wind vectors indicate manageable conditions for the next 12 hours. I recommend the southern route via Waypoint Delta to avoid the developing low-pressure system in the northeast sector.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        confidence: 89,
        evidence: [
          { source: "ISRO MOSDAC", label: "SST Feed", value: "28.4°C stable, minor gradient", confidence: 91 },
          { source: "INCOIS", label: "Ocean State", value: "Waves 1.6m avg, Wind SW 12kn", confidence: 87 },
          { source: "A* Engine", label: "Route", value: "Via Waypoint Delta, 134nm", confidence: 85 },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 2400);
  }, [input, isThinking]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* ═══ LEFT SIDEBAR: AI Chat ═══ */}
      <div className="w-[340px] flex-shrink-0 border-r border-cyan-500/10 bg-[#061424] flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-[#FACC15]/10 p-1.5">
              <Brain className="size-4 text-[#FACC15]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Intelligence</h2>
              <p className="text-[10px] text-white/40">Agentic Reasoning & Evidence Chain</p>
            </div>
          </div>

          {/* Tool Chain Drawer */}
          <button
            className="mt-2 flex w-full items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white/50 hover:bg-white/[0.04] transition-colors"
            onClick={() => setChainOpen(!chainOpen)}
          >
            <Zap className="size-3 text-[#FACC15]" />
            <span className="font-medium">AI Execution Chain</span>
            <span className="ml-auto text-[10px] text-white/30">
              {toolChain.filter((t) => t.status === "complete").length}/{toolChain.length}
            </span>
            {chainOpen ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </button>

          <AnimatePresence>
            {chainOpen && (
              <motion.div
                className="mt-2 space-y-1.5"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {toolChain.map((tc, i) => (
                  <motion.div
                    key={tc.id}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      {tc.status === "complete" ? (
                        <CheckCircle2 className="size-3 text-emerald-400" />
                      ) : tc.status === "running" ? (
                        <Loader2 className="size-3 text-[#FACC15] animate-spin" />
                      ) : (
                        <div className="size-3 rounded-full border border-white/20" />
                      )}
                      <span className="text-[11px] font-medium text-white/70">
                        Tool {i + 1}: {tc.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1 ml-5">{tc.description}</p>
                    {tc.status === "complete" && tc.result && (
                      <p className="text-[10px] text-emerald-400/70 mt-1 ml-5 leading-relaxed">
                        → {tc.result}
                      </p>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center rounded-lg bg-[#FACC15]/10 p-1.5">
                      <Bot className="size-3.5 text-[#FACC15]" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2.5 ${
                    msg.role === "user"
                      ? "bg-[#FACC15] text-[#061424] rounded-tr-sm"
                      : "bg-white/[0.04] text-white/80 rounded-tl-sm border border-white/[0.06]"
                  }`}
                >
                  <p className="text-xs leading-relaxed">{msg.content}</p>
                  {msg.confidence && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#FACC15]"
                          style={{ width: `${msg.confidence}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-[#FACC15]/70 font-medium">
                        {msg.confidence}%
                      </span>
                    </div>
                  )}
                  {msg.evidence && (
                    <div className="mt-2 space-y-1.5">
                      {msg.evidence.map((ev, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#FACC15]/70 uppercase tracking-wider">
                              {ev.source}
                            </span>
                            <span className="text-[9px] text-white/30">{ev.confidence}%</span>
                          </div>
                          <p className="text-[10px] text-white/50 mt-0.5">{ev.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[9px] text-white/30 flex items-center gap-1">
                      <Clock className="size-2.5" />
                      {msg.timestamp}
                    </span>
                    {msg.role === "assistant" && (
                      <button
                        className="text-[9px] text-cyan-400/60 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        onClick={() => {
                          try {
                            const synth = window.speechSynthesis;
                            synth.cancel();
                            const u = new SpeechSynthesisUtterance(msg.content.replace(/[🐟🌊⚠️⛈️✅]/g, ""));
                            u.rate = 0.9;
                            synth.speak(u);
                          } catch { /* ignore */ }
                        }}
                      >
                        <Volume2 className="size-2.5" />
                        Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center rounded-lg bg-[#FACC15]/10 p-1.5">
                    <Bot className="size-3.5 text-[#FACC15]" />
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 rounded-tl-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-3 text-[#FACC15] animate-spin" />
                    <span className="text-xs text-white/50">Analyzing data sources...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <input
              className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
              placeholder="Ask a question about ocean conditions, routes, or safety..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isThinking}
            />
            <Button
              size="icon-sm"
              className="bg-[#FACC15] hover:bg-[#FACC15]/80 text-[#061424] rounded-lg"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ CENTER: Windy ECMWF Live Map Canvas ═══ */}
      <div className="flex-1 relative">
        <WindyMapContainer />

        {/* Region Quick-Jump Badges (informational — Windy has its own controls) */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-1.5">
          {REGION_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="rounded-full frost-glass px-2.5 py-1 text-[10px] text-white/70 shadow-lg"
            >
              {preset.emoji} {preset.label}
            </div>
          ))}
        </div>

        {/* Frost Weather Badge */}
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="frost-badge rounded-xl px-3 py-2 text-[10px] text-white/70">
            <div className="flex items-center gap-3">
              <span>🧊 SST: {marineData?.seaSurfaceTemperature?.toFixed(1) ?? '18.4'}°C</span>
              <span className="text-white/40">|</span>
              <span>💨 Wind: {marineData?.oceanCurrentVelocity?.toFixed(0) ?? '16'}kn NW</span>
              <span className="text-white/40">|</span>
              <span>🌊 Waves: {marineData?.waveHeight?.toFixed(1) ?? '2.1'}m</span>
            </div>
          </div>
        </div>

        {/* Layer Control Panel */}
        <div className="absolute top-3 right-3 z-[1000] w-56 rounded-xl frost-glass p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="size-3.5 text-[#FACC15]" />
            <span className="text-xs font-bold text-white">Layer Controls</span>
          </div>
          <div className="space-y-1.5">
            {LAYER_OPTIONS.map((layer) => (
              <label
                key={layer.id}
                className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/[0.03] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={activeLayers.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                  className="sr-only peer"
                />
                <div
                  className={`flex items-center justify-center size-4 rounded border transition-colors ${
                    activeLayers.includes(layer.id)
                      ? "bg-[#FACC15] border-[#FACC15]"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {activeLayers.includes(layer.id) && (
                    <CheckCircle2 className="size-3 text-[#061424]" />
                  )}
                </div>
                <span className="text-[11px] text-white/60 peer-checked:text-white/90">
                  {layer.label}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[10px] text-white/30">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span>Powered by Windy ECMWF Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT SIDEBAR: Analytics ═══ */}
      <div className="w-[300px] flex-shrink-0 border-l border-cyan-500/10 bg-[#061424] flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          {/* Live Marine Telemetry (Open-Meteo) */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Waves className="size-3.5 text-[#00D2FF]" />
              <span className="text-xs font-bold text-white">Live Ocean Telemetry</span>
            </div>
            {marineData ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2">
                  <div className="text-[9px] text-white/40 uppercase tracking-wider">Wave Height</div>
                  <div className="text-sm font-bold text-white">{marineData.waveHeight?.toFixed(1) ?? "—"}<span className="text-[10px] text-white/40">m</span></div>
                </div>
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2">
                  <div className="text-[9px] text-white/40 uppercase tracking-wider">Current</div>
                  <div className="text-sm font-bold text-white">{marineData.oceanCurrentVelocity?.toFixed(1) ?? "—"}<span className="text-[10px] text-white/40">m/s</span></div>
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-2">
                  <div className="text-[9px] text-white/40 uppercase tracking-wider">SST</div>
                  <div className="text-sm font-bold text-white">{marineData.seaSurfaceTemperature?.toFixed(1) ?? "—"}<span className="text-[10px] text-white/40">°C</span></div>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                  <div className="text-[9px] text-white/40 uppercase tracking-wider">Swell</div>
                  <div className="text-sm font-bold text-white">{marineData.swellWaveHeight?.toFixed(1) ?? "—"}<span className="text-[10px] text-white/40">m</span></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-white/30">
                <Loader2 className="size-3 animate-spin" />
                <span>Fetching marine data...</span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/25">
              <Radio className="size-2.5" />
              <span>Source: Open-Meteo Marine API</span>
            </div>
            {/* Copernicus Marine Service Attribution */}
            <div className="mt-2 flex items-center gap-1.5 text-[8px] text-cyan-400/40">
              <Globe className="size-2" />
              <span>🌐 Data Source: Copernicus Marine Service | GLOBAL_ANALYSISFORECAST_PHY_001_024</span>
            </div>
            {/* 3D Ocean Parameters from CMEMS */}
            {copernicusData && (
              <div className="mt-2 rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-2">
                <div className="text-[9px] text-cyan-400/60 uppercase tracking-wider font-bold mb-1.5">CMEMS 3D Ocean Profile</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="text-center">
                    <div className="text-[8px] text-white/30 uppercase">Current</div>
                    <div className="text-[11px] font-bold text-cyan-300">{copernicusData.surfaceCurrentVelocity?.toFixed(2) ?? '—'}<span className="text-[8px] text-white/30"> m/s</span></div>
                    <div className="text-[7px] text-white/20">Dir: {copernicusData.surfaceCurrentDirection?.toFixed(0) ?? '—'}°</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] text-white/30 uppercase">Salinity</div>
                    <div className="text-[11px] font-bold text-cyan-300">{copernicusData.salinity?.toFixed(1) ?? '—'}<span className="text-[8px] text-white/30"> PSU</span></div>
                    <div className="text-[7px] text-white/20">Surface layer</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] text-white/30 uppercase">SSHA</div>
                    <div className="text-[11px] font-bold text-cyan-300">{copernicusData.seaSurfaceHeightAnomaly ?? '—'}<span className="text-[8px] text-white/30"> cm</span></div>
                    <div className="text-[7px] text-white/20">Anomaly</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] text-white/30 uppercase">Depth</div>
                    <div className="text-[11px] font-bold text-cyan-300">50<span className="text-[8px] text-white/30"> levels</span></div>
                    <div className="text-[7px] text-white/20">0 – 5000m</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weather Alerts */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-3.5 text-[#EF4444]" />
              <span className="text-xs font-bold text-white">IMD Weather Alerts</span>
            </div>
            <div className="space-y-2">
              {WEATHER_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-2.5 ${
                    alert.severity === "warning"
                      ? "border-[#EF4444]/30 bg-[#EF4444]/5"
                      : alert.severity === "watch"
                        ? "border-[#FACC15]/30 bg-[#FACC15]/5"
                        : "border-blue-400/30 bg-blue-400/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className={`size-1.5 rounded-full ${
                        alert.severity === "warning"
                          ? "bg-[#EF4444]"
                          : alert.severity === "watch"
                            ? "bg-[#FACC15]"
                            : "bg-blue-400"
                      }`}
                    />
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-white/70">{alert.title}</p>
                  <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{alert.description}</p>
                  <div className="mt-1.5 text-[9px] text-white/25">
                    Valid: {alert.validUntil}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fish Productivity Trends */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Fish className="size-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white">Fish Productivity</span>
            </div>
            <div className="space-y-3">
              {["PFZ-A", "PFZ-B", "PFZ-C"].map((zone) => {
                const zoneData = FISH_TRENDS.filter((d) => d.zone === zone);
                const latest = zoneData.find((d) => d.month === "Aug");
                const prev = zoneData.find((d) => d.month === "Jul");
                const trend = latest && prev ? latest.yield - prev.yield : 0;
                return (
                  <div key={zone} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-white/70">{zone}</span>
                      <div className="flex items-center gap-1">
                        {trend >= 0 ? (
                          <TrendingUp className="size-3 text-emerald-400" />
                        ) : (
                          <TrendingUp className="size-3 text-[#EF4444] rotate-180" />
                        )}
                        <span className={`text-[10px] font-medium ${trend >= 0 ? "text-emerald-400" : "text-[#EF4444]"}`}>
                          {trend >= 0 ? "+" : ""}{trend}%
                        </span>
                      </div>
                    </div>
                    {/* Bar chart */}
                    <div className="flex items-end gap-1 h-8">
                      {zoneData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div
                            className="w-full rounded-sm"
                            style={{
                              height: `${(d.yield / 100) * 32}px`,
                              backgroundColor: d.month === "Aug" ? "#FACC15" : "rgba(255,255,255,0.15)",
                            }}
                          />
                          <span className="text-[8px] text-white/30">{d.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-white/30">
                      <span>Yield: {latest?.yield ?? 0}%</span>
                      <span>Avg: {latest?.avgWeight ?? 0}kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fuel Savings */}
          <div className="p-3 border-b border-white/[0.06]">
            <FuelSavingsCard />
          </div>

          {/* Emergency Broadcast */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="size-3.5 text-[#EF4444]" />
              <span className="text-xs font-bold text-white">Vernacular Broadcast</span>
            </div>
            <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-4">
              <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
                Send urgent safety alerts to all fishing vessels in range, translated into local vernacular languages automatically.
              </p>
              <Button
                size="sm"
                className="w-full bg-[#EF4444] hover:bg-[#EF4444]/80 text-white font-bold text-xs gap-2"
              >
                <Radio className="size-3.5" />
                Broadcast Safety Alert
              </Button>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Tamil", "Telugu", "Malayalam", "Hindi", "Bengali"].map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-white/40"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
