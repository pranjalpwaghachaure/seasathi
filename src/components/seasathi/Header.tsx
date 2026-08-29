import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Waves,
  MapPin,
  Monitor,
  Smartphone,
  AlertTriangle,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/mockData";

export type AppMode = "landing" | "fishermen" | "command";

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  language: string;
  onLanguageChange: (code: string) => void;
  onSOS?: () => void;
}

export default function Header({
  mode,
  onModeChange,
  language,
  onLanguageChange,
  onSOS,
}: HeaderProps) {
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08] bg-[#0A1128]/90 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Back + Logo + Tagline */}
        <div className="flex items-center gap-3">
          {mode !== "landing" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-[#FEE440] hover:bg-[#FEE440]/10"
              onClick={() => onModeChange("landing")}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Waves className="size-6 text-[#FEE440]" />
            <span className="text-lg font-bold tracking-tight text-white">
              SeaSathi
            </span>
          </div>
          <span className="hidden md:inline-flex items-center rounded-full border border-[#FEE440]/20 bg-[#FEE440]/5 px-3 py-1 text-[11px] font-medium text-[#FEE440]/80">
            Every 12 minutes, a fishing boat leaves Indian shores. SeaSathi ensures they return.
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/70 hover:text-[#FEE440] hover:bg-[#FEE440]/10 text-xs"
              onClick={() => setLangOpen(!langOpen)}
            >
              <span>{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.label}</span>
              <ChevronDown className="size-3" />
            </Button>
            <AnimatePresence>
              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg border border-white/10 bg-[#1A2238] shadow-2xl overflow-hidden"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                          language === lang.code
                            ? "bg-[#FEE440]/10 text-[#FEE440]"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setLangOpen(false);
                        }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* GPS Status Pill */}
          {mode !== "landing" && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
              <MapPin className="size-3 text-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">
                GPS Active — Vizag Coast
              </span>
            </div>
          )}

          {/* Mode Toggle */}
          {mode !== "landing" && (
            <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  mode === "fishermen"
                    ? "bg-[#FEE440] text-[#0A1128] shadow-lg shadow-[#FEE440]/20"
                    : "text-white/50 hover:text-white/80"
                }`}
                onClick={() => onModeChange("fishermen")}
              >
                <Smartphone className="size-3.5" />
                <span className="hidden lg:inline">Fishermen Mode</span>
                <span className="lg:hidden">Field</span>
              </button>
              <button
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  mode === "command"
                    ? "bg-[#FEE440] text-[#0A1128] shadow-lg shadow-[#FEE440]/20"
                    : "text-white/50 hover:text-white/80"
                }`}
                onClick={() => onModeChange("command")}
              >
                <Monitor className="size-3.5" />
                <span className="hidden lg:inline">Command Center</span>
                <span className="lg:hidden">HQ</span>
              </button>
            </div>
          )}

          {/* SOS Button */}
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 bg-[#FF0054] hover:bg-[#FF0054]/80 text-white shadow-lg shadow-[#FF0054]/20 font-bold text-xs"
            onClick={onSOS}
          >
            <AlertTriangle className="size-3.5" />
            SOS
          </Button>
        </div>
      </div>
    </header>
  );
}
