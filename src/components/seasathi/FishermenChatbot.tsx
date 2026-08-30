import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Mic,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FISHING_ZONES,
  USER_BOAT,
  DEFAULT_WEATHER,
  getZoneColor,
} from "@/lib/mockData";
import { fetchAqualinkSites, getSstColor, hasAlert, findNearestSite } from "@/lib/aqualink";
import type { AqualinkSite } from "@/lib/aqualink";

/* ── Types ─────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface FishermenChatbotProps {
  language: string;
}

/* ── Quick Action Chips ─────────────────────── */

const QUICK_CHIPS = [
  { icon: "🐟", label: "Where is the nearest PFZ today?", keyword: "pfz" },
  { icon: "🌊", label: "Is wave height safe near me?", keyword: "wave" },
  { icon: "⚠️", label: "How far am I from the IMBL Border?", keyword: "imbl" },
  { icon: "⛈️", label: "Any storm or cyclone warning today?", keyword: "storm" },
];

/* ── Context-Aware Response Engine ──────────── */

function getAIResponse(query: string, aqualinkData: AqualinkSite[]): string {
  const q = query.toLowerCase();

  // PFZ query
  if (q.includes("pfz") || q.includes("fishing zone") || q.includes("nearest") || q.includes("fish")) {
    const nearest = FISHING_ZONES[0];
    const dist = "12.4";
    const bearing = "SW 225°";
    let aqualinkInfo = "";
    if (aqualinkData.length > 0) {
      const nearestBuoy = findNearestSite(aqualinkData, USER_BOAT.lat, USER_BOAT.lng);
      if (nearestBuoy) {
        const buoyTemp = nearestBuoy.topTemperature?.value ?? 0;
        aqualinkInfo = `\n\n📡 Aqualink Buoy Data (${nearestBuoy.name}):\nSurface Temp: ${buoyTemp.toFixed(1)}°C ${hasAlert(nearestBuoy) ? "⚠️ Thermal Alert" : "✅ Normal"}\nBottom Temp: ${nearestBuoy.bottomTemperature?.value?.toFixed(1) ?? "N/A"}°C\nWeekly Alert Level: ${nearestBuoy.weeklyAlertLevel ?? 0}`;
      }
    }
    return `🐟 Nearest Potential Fishing Zone: ${nearest.name}\n\nDistance: ${dist} nautical miles ${bearing}\nProductivity: ${nearest.productivity.toUpperCase()}\nSpecies found: ${nearest.species.join(", ")}\n\nWater temp: ${DEFAULT_WEATHER.surfaceTemp}°C — ideal for ${nearest.species[0]} aggregation. I recommend departing within the next 2 hours for the best catch window.${aqualinkInfo}`;
  }

  // Wave/weather query
  if (q.includes("wave") || q.includes("weather") || q.includes("safe") || q.includes("wind")) {
    const w = DEFAULT_WEATHER;
    const safe = w.waveHeight < 2.5;
    return `🌊 Current Sea Conditions:\n\nWave Height: ${w.waveHeight}m ${safe ? "✅ SAFE" : "⚠️ CAUTION"}\nWind: ${w.windSpeed} knots ${w.windDirection}\nSurface Temp: ${w.surfaceTemp}°C\nVisibility: ${w.visibility}\nTide: ${w.tideStatus}\n\n${safe ? "Conditions are safe for fishing. Waves are within acceptable limits." : "Caution advised. Waves are building. Consider delaying departure or heading to sheltered zones."}`;
  }

  // IMBL query
  if (q.includes("imbl") || q.includes("border") || q.includes("boundary") || q.includes("international")) {
    const distNM = "18.4";
    return `⚠️ International Maritime Boundary Line (IMBL)\n\nYour distance from IMBL: ${distNM} nautical miles\nCurrent position: SAFE ZONE ✅\n\nYou are well within Indian waters. Maintain your current heading. GPS geofencing is active — you will receive an automatic alert if you approach within 2 nautical miles of the boundary.`;
  }

  // Storm/cyclone query
  if (q.includes("storm") || q.includes("cyclone") || q.includes("warning") || q.includes("alert")) {
    return `⛈️ Weather Alert Summary:\n\n⚠️ CYCLONIC DISTURBANCE WATCH\nA deep depression is forming 600km east of Vizag in the Bay of Bengal. Expected to intensify over the next 48 hours.\n\nHigh Wave Advisory: 3-4m waves expected along AP coast.\nSmall craft advisory in effect until further notice.\n\n🔴 Recommendation: Return to port if currently at sea. Avoid venturing out until the advisory is lifted. SeaSathi will notify you when conditions improve.`;
  }

  // Default fallback
  return `I can help you with:\n\n🐟 Find the nearest fishing zone (PFZ)\n🌊 Check wave height and weather conditions\n⚠️ Check your distance from the IMBL border\n⛈️ View storm and cyclone warnings\n\nTry asking about any of these topics, or tap a quick question below.`;
}

/* ── Component ──────────────────────────────── */

export default function FishermenChatbot({ language }: FishermenChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Namaste! 🙏 I am SeaSathi AI. Ask me anything about fishing zones, weather, sea safety, or border alerts. You can speak or type your question.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[🐟🌊⚠️⛈️✅🔊]/g, ""));
    utterance.rate = 0.9;
    utterance.pitch = 1;
    // Try to set a Hindi voice for Indian context
    const voices = synthRef.current.getVoices();
    const hindiVoice = voices.find((v) => v.lang.startsWith("hi"));
    if (hindiVoice) utterance.voice = hindiVoice;
    synthRef.current.speak(utterance);
  }, [ttsEnabled]);

  const addMessage = useCallback((content: string, role: "user" | "assistant") => {
    const msg: ChatMessage = {
      id: `${role}-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
    if (role === "assistant") {
      speak(content);
    }
  }, [speak]);

  const handleSend = useCallback((text?: string) => {
    const query = text || input.trim();
    if (!query || isThinking) return;

    addMessage(query, "user");
    setInput("");
    setIsThinking(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = getAIResponse(query, aqualinkSites);
      addMessage(response, "assistant");
      setIsThinking(false);
    }, 800 + Math.random() * 600);
  }, [input, isThinking, addMessage]);

  // Aqualink state
  const [aqualinkSites, setAqualinkSites] = useState<AqualinkSite[]>([]);

  useEffect(() => {
    fetchAqualinkSites().then((sites) => {
      setAqualinkSites(sites);
    });
  }, []);

  const handleMicPress = useCallback(() => {
    if (isListening) return;
    setIsListening(true);

    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      const simulatedQuery = "Is it safe to fish near Vizag tomorrow morning?";
      setInput(simulatedQuery);
      // Auto-send after brief pause
      setTimeout(() => handleSend(simulatedQuery), 300);
    }, 2000);
  }, [isListening, handleSend]);

  const handleChipTap = useCallback((keyword: string) => {
    const chip = QUICK_CHIPS.find((c) => c.keyword === keyword);
    if (chip) handleSend(chip.label);
  }, [handleSend]);

  return (
    <>
      {/* ═══ Floating Trigger Button ═══ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-[999] flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#0EA5E9] px-5 py-3 text-sm font-bold text-[#061424] shadow-2xl shadow-[#00D2FF]/30 hover:shadow-[#00D2FF]/50 transition-shadow"
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="size-5" />
            <span className="hidden sm:inline">Ask SeaSathi AI</span>
            <span className="sm:hidden">💬</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══ Chat Drawer ═══ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[400px] z-[999] flex flex-col max-h-[75vh] rounded-2xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur-md shadow-2xl shadow-[#00D2FF]/10 overflow-hidden"
          >
            {/* ── Header ─────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-[#00D2FF]/15">
                  <Bot className="size-4 text-[#00D2FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SeaSathi AI</h3>
                  <p className="text-[10px] text-cyan-400/60">Fisherman Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  title={ttsEnabled ? "Mute voice responses" : "Enable voice responses"}
                >
                  {ttsEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </button>
                <button
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ───────────────────── */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center size-7 rounded-lg bg-[#00D2FF]/10">
                        <Bot className="size-3.5 text-[#00D2FF]" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-[#00D2FF] text-[#061424] rounded-tr-sm"
                        : "bg-white/[0.06] text-white/90 rounded-tl-sm border border-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                    {msg.role === "assistant" && ttsEnabled && (
                      <button
                        className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-400/70 hover:text-cyan-300 transition-colors"
                        onClick={() => speak(msg.content)}
                      >
                        <Volume2 className="size-3" />
                        Listen to Response
                      </button>
                    )}
                    <div className="mt-1 text-[9px] text-white/25">
                      {msg.timestamp}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center size-7 rounded-lg bg-white/10">
                        <User className="size-3.5 text-white/60" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center size-7 rounded-lg bg-[#00D2FF]/10">
                      <Bot className="size-3.5 text-[#00D2FF]" />
                    </div>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/[0.06] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-3 text-[#FACC15] animate-spin" />
                      <span className="text-xs text-white/50">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ── Quick Chips ────────────────── */}
            <div className="px-3 py-2 border-t border-slate-700/30">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.keyword}
                    className="shrink-0 flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-[11px] text-cyan-300/80 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-colors"
                    onClick={() => handleChipTap(chip.keyword)}
                  >
                    <span>{chip.icon}</span>
                    <span className="whitespace-nowrap">{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Input Bar ──────────────────── */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2">
                {/* Mic Button with ripple + waveform */}
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <button
                      className={`relative z-10 flex items-center justify-center size-12 rounded-full transition-all ${
                        isListening
                          ? "bg-[#EF4444] shadow-lg shadow-[#EF4444]/30"
                          : "bg-[#FACC15] hover:bg-[#FACC15]/90 shadow-lg shadow-[#FACC15]/20"
                      }`}
                      onClick={handleMicPress}
                      disabled={isListening || isThinking}
                      title="Hold to speak in your language"
                    >
                      <Mic className={`size-5 ${isListening ? "text-white" : "text-[#061424]"}`} />
                    </button>
                    {/* Ripple rings */}
                    {isListening && (
                      <>
                        <div className="mic-ripple-ring absolute inset-0 rounded-full border-2 border-[#EF4444]/50" />
                        <div className="mic-ripple-ring absolute inset-0 rounded-full border-2 border-[#EF4444]/35" />
                        <div className="mic-ripple-ring absolute inset-0 rounded-full border border-[#EF4444]/20" />
                      </>
                    )}
                  </div>
                  {/* Audio waveform visualizer */}
                  {isListening && (
                    <div className="flex items-end gap-0.5 h-5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="waveform-bar bg-[#EF4444]" style={{ height: 8 + Math.random() * 12 }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Text Input */}
                <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-600/40 bg-slate-800/50 px-3 py-2">
                  <input
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                    placeholder="Type your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isThinking}
                  />
                  <Button
                    size="icon-sm"
                    className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#061428] rounded-lg"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isThinking}
                  >
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-center text-[9px] text-white/20 mt-2">
                {isListening ? "Listening... Speak in your language" : "Tap mic to speak or type your question"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
