import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Volume2, VolumeX } from "lucide-react";

interface IMBLAlertBannerProps {
  isActive: boolean;
  distanceNM: number;
}

export default function IMBLAlertBanner({ isActive, distanceNM }: IMBLAlertBannerProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [flashOn, setFlashOn] = useState(false);

  // Flash effect when active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setFlashOn((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, [isActive]);

  // Simulated audio ping
  useEffect(() => {
    if (!isActive || !audioEnabled) return;
    // Create a simple beep using Web Audio API
    const interval = setInterval(() => {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.value = 0.1;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
      } catch {
        // Audio context may be blocked
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isActive, audioEnabled]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] max-w-xl w-[calc(100%-2rem)] frost-glass"
        >
          <div
            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 shadow-2xl transition-colors hazard-flash-active ${
              flashOn
                ? "border-[#EF4444] border-2 bg-[#EF4444]/15 shadow-[#EF4444]/30"
                : "border-[#EF4444]/40 border-2 bg-[#EF4444]/8 shadow-[#EF4444]/10"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="size-5 text-[#EF4444] shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-black text-[#EF4444] tracking-wide">
                  ⚠️ BORDER ALERT
                </p>
                <p className="text-[11px] text-white/70">
                  {distanceNM.toFixed(1)} NM from IMBL | Audio Ping {audioEnabled ? "Active" : "Muted"}
                </p>
              </div>
            </div>
            <button
              className="flex-shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? (
                <Volume2 className="size-4 text-[#EF4444]" />
              ) : (
                <VolumeX className="size-4 text-white/40" />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
