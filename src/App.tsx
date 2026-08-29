import { useState, useCallback } from "react";
import Header, { type AppMode } from "@/components/seasathi/Header";
import Landing from "@/pages/Landing";
import FishermenMode from "@/pages/FishermenMode";
import CommandCenter from "@/pages/CommandCenter";

export default function SeaSathiApp() {
  const [mode, setMode] = useState<AppMode>("landing");
  const [language, setLanguage] = useState("en");
  const [sosActive, setSosActive] = useState(false);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
  }, []);

  const handleEnterMode = useCallback((m: "fishermen" | "command") => {
    setMode(m);
  }, []);

  const handleSOS = useCallback(() => {
    setSosActive(true);
    setTimeout(() => setSosActive(false), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-[#071A2E]">
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        language={language}
        onLanguageChange={setLanguage}
        onSOS={handleSOS}
      />

      {/* Main content area - offset for fixed header */}
      <main className="pt-16">
        {mode === "landing" && <Landing onEnterMode={handleEnterMode} />}
        {mode === "fishermen" && <FishermenMode />}
        {mode === "command" && <CommandCenter />}
      </main>

      {/* SOS Overlay */}
      {sosActive && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
          <div className="bg-[#FF0054] text-white px-8 py-4 rounded-xl text-xl font-black shadow-2xl shadow-[#FF0054]/50 animate-pulse">
            🚨 SOS SIGNAL TRANSMITTED — Help is on the way
          </div>
        </div>
      )}
    </div>
  );
}
