import React from "react";
import { motion } from "framer-motion";
import { Crosshair, ArrowUpDown, Percent } from "lucide-react";

export default function ProjectionStats({ projection, fairLine, edgePercent }) {
  const stats = [
    { icon: Crosshair, label: "Projection", value: projection, color: "text-emerald-400" },
    { icon: ArrowUpDown, label: "Fair Line", value: fairLine, color: "text-white" },
    { icon: Percent, label: "Edge", value: edgePercent != null ? `${edgePercent.toFixed(1)}%` : "—", color: edgePercent > 0 ? "text-emerald-400" : "text-red-400" },
  ].filter(s => s.value);

  if (!stats.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-3"
    >
      {stats.map((stat, i) => (
        <div key={i} className="rounded-xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-4 text-center">
          <stat.icon className="w-4 h-4 text-emerald-600 mx-auto mb-2" />
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{stat.label}</p>
          <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </motion.div>
  );
}