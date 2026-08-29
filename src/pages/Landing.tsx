import { motion } from "framer-motion";
import {
  Waves,
  Shield,
  Satellite,
  Globe,
  ChevronRight,
  Ship,
  Radio,
  Eye,
  Brain,
  Map,
  MessageSquare,
  Users,
  Radar,
  CloudLightning,
  FileSearch,
  Target,
  AlertTriangle,
  Database,
  Wifi,
  Fish,
} from "lucide-react";

interface LandingProps {
  onEnterMode: (mode: "fishermen" | "command") => void;
}

/* ── Data ───────────────────────────────────── */

const metrics = [
  { value: "5+", label: "Specialized AI Agents", icon: Brain },
  { value: "10+", label: "Data Sources Integrated", icon: Database },
  { value: "8", label: "Regional Languages", icon: Globe },
  { value: "24/7", label: "Real-Time Monitoring", icon: Wifi },
];

const capabilities = [
  {
    icon: MessageSquare,
    title: "Natural Language Interface",
    desc: "Multi-turn voice and text queries across 8 Indian languages, powered by Bhashini. No technical expertise required.",
    color: "#00D2FF",
  },
  {
    icon: Users,
    title: "Agentic AI Architecture",
    desc: "Collaborative multi-agent system where specialized agents plan, discover data, reason, and deliver actionable insights.",
    color: "#6366f1",
  },
  {
    icon: Satellite,
    title: "Satellite EO Integration",
    desc: "Live feeds from ISRO Oceansat-3, MODIS Aqua, sea surface temperature, and chlorophyll-a concentration layers.",
    color: "#22c55e",
  },
  {
    icon: Eye,
    title: "Explainable Recommendations",
    desc: "Every suggestion includes source data attribution, confidence scores, and transparent reasoning chains.",
    color: "#FACC15",
  },
  {
    icon: AlertTriangle,
    title: "Proactive Safety Alerts",
    desc: "Cyclone warnings, high-wave advisories, lightning proximity, and IMBL geofencing — all delivered in real time.",
    color: "#EF4444",
  },
  {
    icon: Map,
    title: "Interactive Visualizations",
    desc: "Vector maps with toggleable spatial layers, SST heatmaps, chlorophyll overlays, and A* safe route planning.",
    color: "#06b6d4",
  },
];

const agents = [
  {
    icon: Target,
    name: "Planning Agent",
    desc: "Decomposes complex queries into actionable sub-tasks and orchestrates the agent pipeline.",
    color: "#6366f1",
  },
  {
    icon: FileSearch,
    name: "Data Discovery Agent",
    desc: "Identifies and retrieves relevant datasets from ISRO, INCOIS, IMD, and other authoritative sources.",
    color: "#00D2FF",
  },
  {
    icon: CloudLightning,
    name: "Weather Intel Agent",
    desc: "Analyzes IMD and INCOIS forecasts for wave height, wind vectors, and cyclone trajectory predictions.",
    color: "#38bdf8",
  },
  {
    icon: Fish,
    name: "Fishing Intel Agent",
    desc: "Correlates chlorophyll-a, SST gradients, and historical catch data to locate high-yield fishing zones.",
    color: "#22c55e",
  },
  {
    icon: Radar,
    name: "Geospatial Reasoning Agent",
    desc: "Runs A* pathfinding across spatial hazard layers to compute safe routes avoiding storm corridors.",
    color: "#FACC15",
  },
  {
    icon: Shield,
    name: "Safety & Alerts Agent",
    desc: "Monitors IMBL proximity, generates border warnings, and broadcasts multilingual emergency alerts.",
    color: "#EF4444",
  },
];

const steps = [
  {
    num: "01",
    title: "Understand Intent",
    desc: "The Planning Agent parses your natural-language query — whether spoken in Tamil or typed in English — and breaks it into structured sub-tasks.",
  },
  {
    num: "02",
    title: "Discover & Retrieve Data",
    desc: "The Data Discovery Agent pulls live feeds from ISRO MOSDAC, INCOIS, IMD, and satellite EO sources relevant to your query.",
  },
  {
    num: "03",
    title: "Reason & Correlate",
    desc: "Specialized agents cross-reference weather forecasts, fish productivity models, and geospatial hazard layers to build a unified picture.",
  },
  {
    num: "04",
    title: "Deliver Insights",
    desc: "The system returns actionable recommendations — safe routes, fishing zones, safety alerts — with source attribution and confidence scores.",
  },
];

const sources = [
  "ISRO MOSDAC",
  "INCOIS Advisories",
  "IMD Forecasts",
  "MODIS Aqua",
  "NOAA VIIRS",
  "ECMWF ERA5",
  "Bhashini AI",
];

/* ── Component ──────────────────────────────── */

export default function Landing({ onEnterMode }: LandingProps) {
  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════════
          HERO SECTION — Dark Oceanic
         ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#061424] via-[#0B253C] to-[#0B253C]">
        {/* Animated wave layers */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] wave-anim opacity-15"
          viewBox="0 0 2400 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 C400,40 800,160 1200,100 C1600,40 2000,160 2400,100 L2400,200 L0,200 Z"
            fill="url(#heroWave)"
          />
          <defs>
            <linearGradient id="heroWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D2FF" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#00D2FF" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="absolute bottom-0 left-0 w-[200%] opacity-[0.07]"
          viewBox="0 0 2400 200"
          preserveAspectRatio="none"
          style={{ animation: "wave-drift 18s linear infinite" }}
        >
          <path
            d="M0,120 C300,60 600,180 1200,120 C1800,60 2100,180 2400,120 L2400,200 L0,200 Z"
            fill="#00D2FF"
          />
        </svg>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + i * 1.5,
              height: 3 + i * 1.5,
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
              backgroundColor: i % 2 === 0 ? "rgba(0,210,255,0.25)" : "rgba(254,228,64,0.2)",
            }}
            animate={{ y: [0, -25, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.35 }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Pill badge */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-[#00D2FF]/25 bg-[#00D2FF]/8 px-4 py-1.5 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Radio className="size-3.5 text-[#00D2FF] animate-pulse" />
              <span className="text-xs font-medium text-[#00D2FF]">
                ((•)) AI-Powered Marine Intelligence Platform
              </span>
            </motion.div>

            {/* Title */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <Waves className="size-12 text-[#00D2FF]" />
              <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white">
                Sea<span className="text-[#00D2FF]">Sathi</span>
              </h1>
            </div>

            {/* Main Slogan */}
            <p className="text-xl sm:text-2xl font-bold text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Every 12 minutes, a fishing boat leaves Indian shores.
              <br />
              <span className="bg-gradient-to-r from-[#00D2FF] to-[#22c55e] bg-clip-text text-transparent font-black">
                SeaSathi ensures they return.
              </span>
            </p>

            {/* Feature pills */}
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
                className="flex items-center gap-2 rounded-xl bg-[#00D2FF] px-8 py-3.5 text-sm font-bold text-[#061424] shadow-2xl shadow-[#00D2FF]/25 hover:shadow-[#00D2FF]/40 transition-shadow"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEnterMode("fishermen")}
              >
                <span className="text-base">⛵</span>
                Open Field Mode
                <ChevronRight className="size-4" />
              </motion.button>
              <motion.button
                className="flex items-center gap-2 rounded-xl border border-slate-500/30 bg-slate-900/40 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-md shadow-lg hover:bg-slate-800/50 hover:border-slate-400/40 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEnterMode("command")}
              >
                <span className="text-base">🌐</span>
                Open Command Center
                <ChevronRight className="size-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          IMPACT METRICS BAR — Light
         ═══════════════════════════════════════════ */}
      <section className="bg-gray-100 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center rounded-xl bg-[#061424]/5 p-3 mb-3">
                  <m.icon className="size-6 text-[#0B253C]" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-1">{m.value}</div>
                <div className="text-sm text-gray-500 font-medium">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CAPABILITIES GRID — "Marine Intelligence, Reimagined"
         ═══════════════════════════════════════════ */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="inline-block rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-semibold px-3 py-1 mb-4">
              CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-3">
              Marine Intelligence, <span className="text-[#00D2FF]">Reimagined</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A purpose-built platform that fuses satellite data, ocean science, and
              vernacular AI to keep India's fishermen safe and productive.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div
                  className="mb-4 inline-flex items-center justify-center rounded-xl p-2.5"
                  style={{ backgroundColor: `${cap.color}12` }}
                >
                  <cap.icon className="size-5" style={{ color: cap.color }} />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">{cap.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SPECIALIZED AI AGENTS
         ═══════════════════════════════════════════ */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="inline-block rounded-full bg-[#6366f1]/10 text-[#6366f1] text-xs font-semibold px-3 py-1 mb-4">
              AGENTIC AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-3">
              Specialized AI Agents <span className="text-[#6366f1]">Working Together</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Six focused agents collaborate in a pipeline — each an expert in its domain — to deliver
              comprehensive marine intelligence from a single query.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-0.5 opacity-60"
                  style={{ backgroundColor: agent.color }}
                />
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 inline-flex items-center justify-center rounded-lg p-2"
                    style={{ backgroundColor: `${agent.color}12` }}
                  >
                    <agent.icon className="size-5" style={{ color: agent.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] mb-1">{agent.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{agent.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Vertical Timeline
         ═══════════════════════════════════════════ */}
      <section className="bg-[#F8FAFC] py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="inline-block rounded-full bg-[#0B253C]/10 text-[#0B253C] text-xs font-semibold px-3 py-1 mb-4">
              PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-3">
              From Query to <span className="text-[#0B253C]">Recommendation</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Ask a question in your language. The agentic pipeline handles the rest.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="relative flex gap-5"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  viewport={{ once: true }}
                >
                  {/* Step number circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex items-center justify-center size-12 rounded-full bg-[#0B253C] text-white text-sm font-black shadow-lg">
                      {step.num}
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex-1 hover:shadow-md transition-shadow">
                    <h3 className="text-base font-bold text-[#0F172A] mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          POWERED BY TRUSTED SOURCES
         ═══════════════════════════════════════════ */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="inline-block rounded-full bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 mb-4">
              DATA SOURCES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-8">
              Powered by <span className="text-[#00D2FF]">Trusted Sources</span>
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {sources.map((src, i) => (
                <motion.span
                  key={src}
                  className="rounded-full border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-medium text-[#0F172A] hover:border-[#00D2FF]/40 hover:bg-[#00D2FF]/5 transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                >
                  {src}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BOTTOM CTA — Dark
         ═══════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-[#061424] to-[#0B253C] py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="size-12 text-[#00D2FF] mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Protecting Those Who <span className="text-[#22c55e]">Feed a Nation</span>
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              India's fishermen venture into unpredictable waters every single day. SeaSathi
              equips them — and the authorities who protect them — with the intelligence
              to act, not guess.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                className="flex items-center gap-2 rounded-xl bg-[#00D2FF] px-8 py-3.5 text-sm font-bold text-[#061424] shadow-2xl shadow-[#00D2FF]/25"
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

      {/* ═══════════════════════════════════════════
          FOOTER — Light
         ═══════════════════════════════════════════ */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Waves className="size-4 text-[#0B253C]" />
            <span className="text-sm font-bold text-[#0F172A]">SeaSathi</span>
            <span className="text-xs text-gray-400">— Marine Safety Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>ISRO • INCOIS • Bhashini</span>
            <span>Built for India's Coast</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
