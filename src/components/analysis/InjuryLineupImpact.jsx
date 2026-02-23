import React from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export default function InjuryLineupImpact({ impact }) {
  if (!impact || impact.length === 0) return null;

  const getImpactIcon = (direction) => {
    if (direction === "positive") return TrendingUp;
    if (direction === "negative") return TrendingDown;
    return AlertCircle;
  };

  const getImpactColor = (direction) => {
    if (direction === "positive") return "text-emerald-400 bg-emerald-500/10";
    if (direction === "negative") return "text-red-400 bg-red-500/10";
    return "text-yellow-400 bg-yellow-500/10";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl sm:rounded-2xl border border-orange-900/30 bg-gradient-to-br from-orange-900/10 to-red-900/10 p-3 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
        <h3 className="text-sm sm:text-base font-bold text-orange-300">Injury & Lineup Impact</h3>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {impact.map((item, idx) => {
          const Icon = getImpactIcon(item.impact_direction);
          return (
            <div key={idx} className="p-3 bg-[hsl(160,10%,8%)] rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getImpactColor(item.impact_direction).split(' ')[0]}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-semibold text-white">{item.player}</span>
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${getImpactColor(item.impact_direction)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">{item.analysis}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}