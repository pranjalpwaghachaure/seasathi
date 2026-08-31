import { useState, useCallback } from "react";
import Header, { type AppMode } from "@/components/seasathi/Header";
import Landing from "@/pages/Landing";
import FishermenMode from "@/pages/FishermenMode";
import CommandCenter from "@/pages/CommandCenter";
import SOSModal from "@/components/seasathi/SOSModal";
import AuthModal from "@/components/seasathi/AuthModal";
import { AuthProvider } from "@/lib/auth";

export default function SeaSathiApp() {
  return (
    <AuthProvider>
      <SeaSathiAppInner />
    </AuthProvider>
  );
}

function SeaSathiAppInner() {
  const [mode, setMode] = useState<AppMode>("landing");
  const [language, setLanguage] = useState("en");
  const [sosOpen, setSosOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
  }, []);

  const handleEnterMode = useCallback((m: "fishermen" | "command") => {
    setMode(m);
  }, []);

  const handleSOS = useCallback(() => {
    setSosOpen(true);
  }, []);

  const handleOpenAuth = useCallback(() => {
    setAuthOpen(true);
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
        onOpenAuth={handleOpenAuth}
      />

      {/* Main content area - offset for fixed header */}
      <main className="pt-16">
        {mode === "landing" && <Landing onEnterMode={handleEnterMode} />}
        {mode === "command" && <CommandCenter />}
      </main>

      {/* Modals */}
      <SOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
