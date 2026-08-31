import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, ROLE_LABELS, ROLE_EMOJI, type UserRole } from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = "login" | "signup";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "fisherman", label: "Fisherman / Boat Captain" },
  { value: "coast_guard", label: "Coast Guard / Admin" },
  { value: "vessel_operator", label: "Vessel Operator" },
];

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("fisherman");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("fisherman");
    setOtpSent(false);
    setOtpValue("");
    setAuthMethod("password");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock auth — generate a user and log in
    const user = {
      id: `user_${Date.now()}`,
      name: view === "signup" ? name : "Capt. Rajesh",
      email,
      role,
    };
    login(user);
    handleClose();
  };

  const handleGoogleAuth = () => {
    // Mock Google auth
    const user = {
      id: `g_${Date.now()}`,
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      role,
    };
    login(user);
    handleClose();
  };

  const handleSendOTP = () => {
    setOtpSent(true);
    // In production, this would call an API
  };

  const handleVerifyOTP = () => {
    const user = {
      id: `otp_${Date.now()}`,
      name: view === "signup" ? name : "Capt. Rajesh",
      email,
      role,
    };
    login(user);
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#0B1929] shadow-2xl shadow-cyan-500/10"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/seasathi-logo.svg"
                    alt="SeaSathi"
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* View Toggle */}
              <div className="mx-6 mt-5 flex rounded-lg bg-white/[0.04] p-0.5">
                {(["login", "signup"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setView(v);
                      resetForm();
                    }}
                    className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                      view === v
                        ? "bg-[#00D2FF] text-[#061424] shadow-lg shadow-[#00D2FF]/20"
                        : "text-white/50 hover:text-white/70"
                    }`}
                  >
                    {v === "login" ? "Log In" : "Sign Up"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Name (signup only) */}
                <AnimatePresence mode="wait">
                  {view === "signup" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="mb-1.5 block text-xs font-medium text-white/50">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Capt. Rajesh Kumar"
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#00D2FF]/40 focus:outline-none focus:ring-1 focus:ring-[#00D2FF]/20 transition-colors"
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email / Mobile */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rajesh@example.com or +91 98765 43210"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#00D2FF]/40 focus:outline-none focus:ring-1 focus:ring-[#00D2FF]/20 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Auth Method Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod("password")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      authMethod === "password"
                        ? "bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30"
                        : "text-white/40 border border-white/10 hover:text-white/60"
                    }`}
                  >
                    <Lock className="size-3" />
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod("otp")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      authMethod === "otp"
                        ? "bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30"
                        : "text-white/40 border border-white/10 hover:text-white/60"
                    }`}
                  >
                    <Phone className="size-3" />
                    Mobile OTP
                  </button>
                </div>

                {/* Password Field */}
                {authMethod === "password" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/25 focus:border-[#00D2FF]/40 focus:outline-none focus:ring-1 focus:ring-[#00D2FF]/20 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* OTP Field */}
                {authMethod === "otp" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">
                      {otpSent ? "Enter OTP" : "One-Time Password"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        placeholder={otpSent ? "123456" : "Tap to send OTP"}
                        disabled={!otpSent}
                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[#00D2FF]/40 focus:outline-none focus:ring-1 focus:ring-[#00D2FF]/20 transition-colors disabled:opacity-40"
                      />
                      {!otpSent ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSendOTP}
                          className="border-[#00D2FF]/30 text-[#00D2FF] hover:bg-[#00D2FF]/10 shrink-0"
                        >
                          Send OTP
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleVerifyOTP}
                          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 shrink-0"
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Role Selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-[11px] font-medium transition-all ${
                          role === r.value
                            ? "border-[#00D2FF]/40 bg-[#00D2FF]/10 text-[#00D2FF]"
                            : "border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/60"
                        }`}
                      >
                        <span className="text-base">{ROLE_EMOJI[r.value]}</span>
                        <span className="leading-tight text-center">
                          {ROLE_LABELS[r.value]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                {authMethod === "otp" && otpSent ? (
                  <Button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="w-full bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#061424] font-bold py-2.5 shadow-lg shadow-[#00D2FF]/20"
                  >
                    Verify OTP & Continue
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#061424] font-bold py-2.5 shadow-lg shadow-[#00D2FF]/20"
                  >
                    {view === "login" ? "Log In" : "Create Account"}
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                )}
              </form>

              {/* Divider */}
              <div className="px-6 pb-4">
                <div className="relative flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                    or
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              </div>

              {/* Social Auth */}
              <div className="px-6 pb-6 space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
