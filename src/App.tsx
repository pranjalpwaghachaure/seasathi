import { useState, useCallback } from "react";
import Header, { type AppMode } from "@/components/seasathi/Header";
import Landing from "@/pages/Landing";
import FishermenMode from "@/pages/FishermenMode";
import CommandCenter from "@/pages/CommandCenter";
import SOSModal from "@/components/seasathi/SOSModal";

export default function SeaSathiApp() {
  const [mode, setMode] = useState<AppMode>("landing");
  const [language, setLanguage] = useState("en");
  const [sosOpen, setSosOpen] = useState(false);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
  }, []);

  const handleEnterMode = useCallback((m: "fishermen" | "command") => {
    setMode(m);
  }, []);

  const handleSOS = useCallback(() => {
    setSosOpen(true);
  }, []);

  // FishermenMode is a self-contained PWA — renders full-screen without header
  if (mode === "fishermen") {
    return (
      <div className="min-h-screen bg-[#061424]">
        <FishermenMode language={language} />
        <SOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061424]">
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
        {mode === "command" && <CommandCenter />}
      </main>

      {/* SOS Modal */}
      <SOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
}
