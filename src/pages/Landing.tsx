import { motion } from "framer-motion";
import {
  Waves,
  Shield,
  Satellite,
  Cloud,
  Mic,
  Globe,
  Navigation,
  ChevronRight,
  Ship,
  Radio,
  Eye,
} from "lucide-react";

interface LandingProps {
  onEnterMode: (mode: "fishermen" | "command") => void;
}

const features = [
  {
    icon: Satellite,
    title: "ISRO MOSDAC Data",
    desc: "Real-time sea surface temperature feeds from ISRO's MOSDAC satellite constellation, tracking thermal gradients across the Bay of Bengal.",
    color: "#22c55e",
  },
  {
    icon: Cloud,
    title: "INCOIS Weather",
    desc: "Ocean state forecasts with wave heights, wind vectors, and tidal predictions from the Indian National Centre for Ocean Information Services.",
    color: "#38bdf8",
  },
  {
    icon: Mic,
    title: "Bhashini Voice",
    desc: "Speak in Tamil, Telugu, Malayalam, Gujarati, Bengali, Hindi, or English. The AI understands all of them — no typing required.",
    color: "#FEE440",
  },
  {
    icon: Shield,
    title: "Border Safety",
    desc: "Real-time geofencing against the International Maritime Boundary Line with instant visual and audio alerts.",
    color: "#FF0054",
  },
  {
    icon: Navigation,
    title: "A* Safe Routing",
    desc: "AI-powered A* pathfinding that charts safe routes, avoiding storm zones, high-swell corridors, and hazardous currents.",
    color: "#a78bfa",
  },
  {
    icon: Eye,
    title: "GIS Overlay System",
    desc: "Toggle sea surface temperature, chlorophyll concentration, potential fishing zones, and wind overlays on a unified map canvas.",
    color: "#2dd4bf",
  },
];

const stats = [
  { value: "2.1M+", label: "Fishermen Protected" },
  { value: "847K", label: "Boat Days Monitored" },
  { value: "12 min", label: "Avg Response Time" },
  { value: "99.2%", label: "Uptime Reliability" },
];

export default function Landing({ onEnterMode }: LandingProps) {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated ocean background */}
        <div className="absolute inset-0">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1128] via-[#0d1a3d] to-[#0A1128]" />

          {/* Animated wave layers */}
          <svg
            className="absolute bottom-0 left-0 w-[200%] wave-anim opacity-20"
            viewBox="0 0 2400 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 C400,40 800,160 1200,100 C1600,40 2000,160 2400,100 L2400,200 L0,200 Z"
              fill="url(#wave1)"
            />
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FEE440" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>

          <svg
            className="absolute bottom-0 left-0 w-[200%] opacity-10"
            viewBox="0 0 2400 200"
            preserveAspectRatio="none"
            style={{ animation: "wave-drift 18s linear infinite" }}
          >
            <path
              d="M0,120 C300,60 600,180 1200,120 C1800,60 2100,180 2400,120 L2400,200 L0,200 Z"
              fill="#38bdf8"
            />
          </svg>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#FEE440]/10"
              style={{
                width: 4 + i * 2,
                height: 4 + i * 2,
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-[#FEE440]/20 bg-[#FEE440]/5 px-4 py-1.5 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Radio className="size-3.5 text-[#FEE440]" />
              <span className="text-xs font-medium text-[#FEE440]/90">
                Marine Safety & Intelligence Platform
              </span>
            </motion.div>

            {/* Title */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <Waves className="size-10 text-[#FEE440]" />
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white">
                Sea<span className="text-[#FEE440]">Sathi</span>
              </h1>
            </div>

            <p className="text-xl sm:text-2xl font-bold text-white/80 mb-8">
              Every 12 minutes, a fishing boat leaves Indian shores.
              <br className="hidden sm:block" />
              <span className="text-[#FEE440]">SeaSathi ensures they return.</span>
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {["ISRO Satellite Data", "INCOIS Ocean Forecasts", "Bhashini Vernacular Voice", "IMBL Border Safety"].map(
                (tag, i) => (
                  <motion.span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {tag}
                  </motion.span>
                ),
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                className="flex items-center gap-2 rounded-xl bg-[#FEE440] px-8 py-3.5 text-sm font-bold text-[#0A1128] shadow-2xl shadow-[#FEE440]/20 hover:shadow-[#FEE440]/30 transition-shadow"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEnterMode("fishermen")}
              >
                <Ship className="size-4" />
                Open Field Mode
                <ChevronRight className="size-4" />
              </motion.button>
              <motion.button
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEnterMode("command")}
              >
                <Globe className="size-4" />
                Command Center
                <ChevronRight className="size-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────── */}
      <section className="relative py-16 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl sm:text-4xl font-black text-[#FEE440] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────── */}
      <section className="relative py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Intelligence from <span className="text-[#FEE440]">Space to Sea</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Combining ISRO satellite feeds, INCOIS ocean forecasting, vernacular AI, and
              real-time geofencing — all purpose-built to protect India's fishermen.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="group relative rounded-2xl border border-white/[0.06] bg-[#1A2238]/50 p-6 hover:border-white/15 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div
                  className="mb-4 inline-flex items-center justify-center rounded-xl p-2.5"
                  style={{ backgroundColor: `${feat.color}15` }}
                >
                  <feat.icon className="size-5" style={{ color: feat.color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="relative py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="size-12 text-[#FEE440] mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Protecting Those Who <span className="text-[#22c55e]">Feed a Nation</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              India's fishermen venture into unpredictable waters every single day. SeaSathi
              equips them — and the authorities who protect them — with the intelligence
              to act, not guess.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                className="flex items-center gap-2 rounded-xl bg-[#FEE440] px-8 py-3.5 text-sm font-bold text-[#0A1128] shadow-2xl shadow-[#FEE440]/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEnterMode("fishermen")}
              >
                <Ship className="size-4" />
                Open Field Mode
              </motion.button>
              <motion.button
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEnterMode("command")}
              >
                <Globe className="size-4" />
                Open Command Center
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Waves className="size-4 text-[#FEE440]" />
            <span className="text-sm font-bold text-white">SeaSathi</span>
            <span className="text-xs text-white/30">— Marine Safety Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>ISRO • INCOIS • Bhashini</span>
            <span>Built for India's Coast</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
