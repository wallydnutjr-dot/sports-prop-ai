import React from "react";
import { motion } from "framer-motion";
import { Target, DollarSign, TrendingUp } from "lucide-react";

export default function MarketInefficiencies({ inefficiencies }) {
  if (!inefficiencies || inefficiencies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl sm:rounded-2xl border border-cyan-900/30 bg-gradient-to-br from-cyan-900/10 to-blue-900/10 p-3 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
        <h3 className="text-sm sm:text-base font-bold text-cyan-300">Market Inefficiencies Detected</h3>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {inefficiencies.map((item, idx) => (
          <div key={idx} className="p-3 bg-[hsl(160,10%,8%)] rounded-lg border border-cyan-500/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-white">{item.sportsbook}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">+{item.value_rating}% value</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-2">{item.line_comparison}</p>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-cyan-400">
              <TrendingUp className="w-3 h-3" />
              <span>{item.opportunity}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <p className="text-[10px] sm:text-xs text-cyan-400 text-center">
          💡 Line shopping across books detected value discrepancies
        </p>
      </div>
    </motion.div>
  );
}