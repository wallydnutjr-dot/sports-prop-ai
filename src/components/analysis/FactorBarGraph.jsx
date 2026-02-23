import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function FactorBarGraph({ factors }) {
  if (!factors?.length) return null;

  return (
    <div className="rounded-2xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Factor Breakdown</h3>
      <div className="space-y-3">
        {factors.map((factor, i) => {
          const isSupporting = factor.direction === "supports";
          const isOpposing = factor.direction === "opposes";
          const isNeutral = factor.direction === "neutral";
          
          const Icon = isSupporting ? TrendingUp : isOpposing ? TrendingDown : Minus;
          const barColor = isSupporting ? "bg-green-500" : isOpposing ? "bg-red-500" : "bg-gray-500";
          const textColor = isSupporting ? "text-green-400" : isOpposing ? "text-red-400" : "text-gray-400";
          const bgColor = isSupporting ? "bg-green-500/10" : isOpposing ? "bg-red-500/10" : "bg-gray-500/10";
          const borderColor = isSupporting ? "border-green-500/20" : isOpposing ? "border-red-500/20" : "border-gray-500/20";
          
          const weight = factor.weight || 0;
          const widthPercent = (weight / 10) * 100;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-3 rounded-lg border ${borderColor} ${bgColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${textColor}`} />
                  <span className="text-sm font-medium text-white">{factor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${textColor} uppercase`}>
                    {isSupporting ? "✓ For" : isOpposing ? "✗ Against" : "○ Neutral"}
                  </span>
                  <span className={`text-base font-bold ${textColor}`}>
                    {weight}/10
                  </span>
                </div>
              </div>
              <div className="relative h-2.5 bg-[hsl(160,8%,12%)] rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.5, ease: "easeOut" }}
                  className={`h-full ${barColor} rounded-full`}
                />
              </div>
              {factor.description && (
                <p className="text-xs text-gray-400 leading-relaxed">{factor.description}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-emerald-900/20 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">Supports Projection</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">Opposes Projection</span>
        </div>
      </div>
    </div>
  );
}