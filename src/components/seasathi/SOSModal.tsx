import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Radio,
  Wifi,
  X,
  Battery,
  MapPin,
  Ship,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TransmitStage = "idle" | "confirming" | "transmitting" | "sent";

export default function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const [stage, setStage] = useState<TransmitStage>("idle");
  const [countdown, setCountdown] = useState(5);
  const [battery] = useState(73);
  const [pingCount, setPingCount] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage("idle");
      setCountdown(5);
      setPingCount(0);
    }
  }, [isOpen]);

  // Countdown timer for transmission
  useEffect(() => {
    if (stage !== "transmitting") return;
    if (countdown <= 0) {
      setStage("sent");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, countdown]);

  // Ping counter during transmission
  useEffect(() => {
    if (stage !== "transmitting") return;
    const interval = setInterval(() => {
      setPingCount((p) => p + 1);
    }, 600);
    return () => clearInterval(interval);
  }, [stage]);

  const handleTransmit = useCallback(() => {
    setStage("transmitting");
    setCountdown(5);
  }, []);

  const handleBroadcast = useCallback(() => {
    setStage("transmitting");
    setCountdown(3);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg rounded-2xl border-2 border-[#EF4444]/60 bg-[#061424] shadow-2xl shadow-[#EF4444]/20 overflow-hidden"
          >
            {/* Flashing top bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#EF4444] via-[#FACC15] to-[#EF4444] animate-pulse" />

            {/* Close button */}
            {stage === "idle" && (
              <button
                className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
                onClick={onClose}
              >
                <X className="size-4" />
              </button>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center size-12 rounded-xl bg-[#EF4444]/15">
                  <AlertTriangle className="size-6 text-[#EF4444]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">EMERGENCY SOS</h2>
                  <p className="text-xs text-[#EF4444]/80">Maritime Distress Signal System</p>
                </div>
              </div>

              {/* Vessel Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="size-3 text-[#00D2FF]" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">GPS Position</span>
                  </div>
                  <p className="text-xs font-mono text-white font-medium">16.8200° N, 83.1200° E</p>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ship className="size-3 text-[#00D2FF]" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Vessel ID</span>
                  </div>
                  <p className="text-xs font-mono text-white font-medium">#IND-AP-4082</p>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Battery className="size-3 text-[#FACC15]" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Battery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FACC15]"
                        style={{ width: `${battery}%` }}
                      />
                    </div>
                    <span className="text-xs text-white font-medium">{battery}%</span>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Radio className="size-3 text-[#00D2FF]" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Signal</span>
                  </div>
                  <p className="text-xs text-[#22c55e] font-medium">NavIC Linked ✓</p>
                </div>
              </div>

              {/* Transmission status */}
              <AnimatePresence mode="wait">
                {stage === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <Button
                      className="w-full bg-[#EF4444] hover:bg-[#EF4444]/80 text-white font-bold py-3 gap-2 text-sm"
                      onClick={handleTransmit}
                    >
                      <Radio className="size-4" />
                      Transmit Coast Guard Distress Signal
                    </Button>
                    <Button
                      className="w-full bg-[#FACC15]/10 hover:bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30 font-bold py-3 gap-2 text-sm"
                      onClick={handleBroadcast}
                    >
                      <Wifi className="size-4" />
                      Broadcast to Nearby Boats (Mesh Network)
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-white/40 hover:text-white/60 hover:bg-white/5 py-2 text-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                )}

                {stage === "transmitting" && (
                  <motion.div
                    key="transmitting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4"
                  >
                    <Loader2 className="size-10 text-[#EF4444] animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold text-white mb-1">
                      Transmitting Distress Signal...
                    </p>
                    <p className="text-xs text-white/50 mb-3">
                      Live ping #{pingCount} • {countdown}s remaining
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i < (5 - countdown) ? "bg-[#EF4444]" : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {stage === "sent" && (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <CheckCircle2 className="size-12 text-[#22c55e] mx-auto mb-3" />
                    <p className="text-sm font-bold text-white mb-1">
                      ✅ Distress Signal Transmitted
                    </p>
                    <p className="text-xs text-white/50 mb-4">
                      Coast Guard Maritime Rescue Centre has been notified. Stay on this channel for response.
                    </p>
                    <Button
                      className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#061424] font-bold px-6"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
