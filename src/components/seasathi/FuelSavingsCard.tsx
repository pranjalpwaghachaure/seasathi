import { motion } from "framer-motion";
import { Fuel, Route, Leaf, TrendingDown } from "lucide-react";

interface FuelSavingsCardProps {
  compact?: boolean;
}

export default function FuelSavingsCard({ compact = false }: FuelSavingsCardProps) {
  const metrics = [
    {
      icon: Route,
      label: "Distance Saved",
      value: "14.2",
      unit: "NM",
      color: "#00D2FF",
    },
    {
      icon: Fuel,
      label: "Fuel Saved",
      value: "18",
      unit: "Liters",
      subtext: "~₹1,620",
      color: "#FACC15",
    },
    {
      icon: Leaf,
      label: "Carbon Reduced",
      value: "48",
      unit: "kg CO₂",
      color: "#22c55e",
    },
  ];

  return (
    <div className={`rounded-xl border border-slate-700/40 bg-slate-900/50 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center size-7 rounded-lg bg-[#22c55e]/10">
          <TrendingDown className="size-3.5 text-[#22c55e]" />
        </div>
        <h4 className="text-xs font-bold text-white">Route Optimization Yield</h4>
      </div>

      <div className={`grid ${compact ? "grid-cols-1 gap-2" : "grid-cols-3 gap-3"}`}>
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <m.icon className="size-3" style={{ color: m.color }} />
              <span className="text-[9px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white">{m.value}</span>
              <span className="text-[10px] text-white/40">{m.unit}</span>
            </div>
            {m.subtext && (
              <p className="text-[10px] text-[#FACC15]/60 mt-0.5">{m.subtext}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
