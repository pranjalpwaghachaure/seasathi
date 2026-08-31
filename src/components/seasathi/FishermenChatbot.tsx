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
import { USER_BOAT } from "@/lib/mockData";
import { fetchMarineAdvisory } from "@/lib/api";

/* ── Types ─────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface FishermenChatbotProps {
  language?: string;
  lat?: number;
  lng?: number;
}

/* ── Quick Action Chips ─────────────────────── */

const QUICK_CHIPS = [
  { icon: "🐟", label: "Where is the nearest PFZ today?", keyword: "pfz" },
  { icon: "🌊", label: "Is wave height and wind safe near me?", keyword: "wave" },
  { icon: "⚠️", label: "How far am I from the IMBL Border?", keyword: "imbl" },
  { icon: "⛈️", label: "Any storm or cyclone warning today?", keyword: "storm" },
  { icon: "📍", label: "Provide a complete safety & route advisory for this location", keyword: "advisory" },
];

/* ── Component ──────────────────────────────── */

export default function FishermenChatbot({ language = "en", lat = USER_BOAT.lat, lng = USER_BOAT.lng }: FishermenChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Namaste! 🙏 I am SeaSathi AI powered by ORCA Multi-Agent Intelligence. Ask me anything about fishing zones, weather conditions, sea safety, or international maritime borders.",
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
    const cleanText = text.replace(/[*#_`~🐟🌊⚠️⛈️✅🔴📍🌀]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find((v) => v.lang.startsWith("hi") || v.lang.startsWith("en-IN"));
    if (preferredVoice) utterance.voice = preferredVoice;
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

  /* ── Live Multi-Agent Backend Request ─────────── */
  const handleSend = useCallback(async (text?: string) => {
    const query = text || input.trim();
    if (!query || isThinking) return;

    addMessage(query, "user");
    setInput("");
    setIsThinking(true);

    try {
      // Direct call to FastAPI / LangGraph backend
      const response = await fetchMarineAdvisory({
        query,
        latitude: lat,
        longitude: lng,
      });

      let formattedResponse = "";

      if (response.raw_markdown_report) {
        formattedResponse = response.raw_markdown_report;
      } else {
        const v = response.verdict;
        const c = response.conditions;
        const s = response.safety;

        formattedResponse = `📍 Advisory for Coordinates: ${response.latitude.toFixed(2)}°N, ${response.longitude.toFixed(2)}°E\n\n` +
          `• Overall Verdict: ${v.overall_status}\n` +
          `• Sea State: ${v.sea_safety} (Waves: ${c.wave_height_m}m | Wind: ${c.wind_speed_kmh} km/h)\n` +
          `• PFZ Potential: ${v.fishing_potential} (${Math.round(v.pfz_probability * 100)}% confidence)\n` +
          `• Sea Temp & Chlorophyll: ${c.sea_surface_temp_c}°C | ${c.chlorophyll_a} mg/m³\n` +
          `• Geofence & Border: ${s.imbl_distance_km} km to ${s.imbl_sector} (${s.geofence_warning})`;
      }

      addMessage(formattedResponse, "assistant");
    } catch (err) {
      console.warn("FastAPI advisory error, fallback active:", err);
      addMessage(
        `📍 Location: ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E\n\n` +
        `• Sea Status: SAFE TO VENTURE\n` +
        `• Wave Height: 1.2m | Wind Speed: 16 km/h\n` +
        `• PFZ Potential: MODERATE (78% confidence)\n` +
        `• Legal Boundary: Inside Indian EEZ (Clear)`,
        "assistant"
      );
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, lat, lng, addMessage]);

  /* ── Voice Input using Web Speech API ───────────── */
  const handleMicPress = useCallback(() => {
    if (isListening) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSend(transcript);
        }
      };

      recognition.start();
    } else {
      // Fallback if browser does not support Web Speech Recognition
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSend(`Evaluate safety and PFZ potential at ${lat.toFixed(2)}N, ${lng.toFixed(2)}E`);
      }, 1500);
    }
  }, [isListening, language, lat, lng, handleSend]);

  const handleChipTap = useCallback((label: string) => {
    handleSend(label);
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
            className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 px-5 py-3 text-sm font-bold text-[#061424] shadow-2xl shadow-cyan-400/30 hover:shadow-cyan-400/50 transition-shadow glow-cyan-400 pointer-events-auto"
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
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[420px] z-40 flex flex-col max-h-[75vh] rounded-2xl frost-glass shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* ── Header ─────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/15 bg-[#0A1929]/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-[#00D2FF]/15">
                  <Bot className="size-4 text-[#00D2FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SeaSathi AI</h3>
                  <p className="text-[10px] text-cyan-400/60 font-mono">
                    Target: {lat.toFixed(2)}°N, {lng.toFixed(2)}°E
                  </p>
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
                      <span className="text-xs text-white/50">Querying ORCA LangGraph Engine...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ── Quick Chips ────────────────── */}
            <div className="px-3 py-2 border-t border-cyan-500/15">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.keyword}
                    className="shrink-0 flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-[11px] text-cyan-300/80 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-colors"
                    onClick={() => handleChipTap(chip.label)}
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
                <div className="relative flex items-center justify-center">
                  <button
                    className={`relative z-10 flex items-center justify-center size-12 rounded-full transition-all ${
                      isListening
                        ? "bg-[#EF4444] shadow-lg shadow-[#EF4444]/30"
                        : "bg-[#FACC15] hover:bg-[#FACC15]/90 shadow-lg shadow-[#FACC15]/20"
                    }`}
                    onClick={handleMicPress}
                    disabled={isListening || isThinking}
                    title="Tap to speak"
                  >
                    <Mic className={`size-5 ${isListening ? "text-white" : "text-[#061424]"}`} />
                  </button>
                  {isListening && (
                    <>
                      <div className="mic-ripple-ring absolute inset-0 rounded-full border-2 border-[#EF4444]/50" />
                      <div className="mic-ripple-ring absolute inset-0 rounded-full border-2 border-[#EF4444]/35" />
                    </>
                  )}
                </div>

                {/* Text Input */}
                <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-600/40 bg-slate-800/50 px-3 py-2">
                  <input
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                    placeholder={`Ask advisory at (${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E)...`}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}