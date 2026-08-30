import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, AlertTriangle, ChevronDown, ArrowLeft } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08] bg-[#061424]/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Back (when in mode) + Logo */}
        <div className="flex items-center gap-2">
          {mode !== "landing" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-[#00D2FF] hover:bg-[#00D2FF]/10"
              onClick={() => onModeChange("landing")}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onModeChange("landing")}>
            <Waves className="size-6 text-[#00D2FF]" />
            <span className="text-lg font-bold tracking-tight text-white">
              SeaSathi
            </span>
          </div>
        </div>

        {/* Center: Satellite Status (when in mode) */}
        {mode !== "landing" && (
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
              <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400">
                NavIC Satellite Link: Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">
              <div className="size-1.5 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-medium text-cyan-400">
                Mesh Cache: Ready
              </span>
            </div>
          </div>
        )}

        {/* Right: Language Selector + SOS */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/70 hover:text-[#00D2FF] hover:bg-[#00D2FF]/10 text-xs"
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
                            ? "bg-[#00D2FF]/10 text-[#00D2FF]"
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

          {/* SOS Button */}
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 bg-[#EF4444] hover:bg-[#EF4444]/80 text-white shadow-lg shadow-[#EF4444]/20 font-bold text-xs sos-glow-active"
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
