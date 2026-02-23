import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, AlertTriangle } from "lucide-react";

export default function BlowoutProbability({ probability }) {
  const getProbabilityColor = (prob) => {
    if (prob >= 70) return "text-red-500";
    if (prob >= 50) return "text-orange-500";
    return "text-green-500";
  };

  const getProbabilityBg = (prob) => {
    if (prob >= 70) return "bg-red-500/20 border-red-500/60";
    if (prob >= 50) return "bg-orange-500/20 border-orange-500/60";
    return "bg-green-500/20 border-green-500/60";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl border-2 p-4 ${getProbabilityBg(probability)}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-gray-400" />
        <h4 className="text-white font-semibold text-sm">Blowout Probability</h4>
      </div>
      <div className={`text-4xl font-black mb-2 ${getProbabilityColor(probability)}`}>
        {probability}%
      </div>
      <p className="text-gray-400 text-xs">
        {probability >= 70 
          ? "🔴 VERY HIGH - Game out of hand. Pace suppression likely." 
          : probability >= 50 
          ? "🟠 MODERATE - Could become non-competitive." 
          : "🟢 LOW - Competitive game expected."}
      </p>
      {probability >= 65 && (
        <div className="mt-3 flex items-center gap-2 bg-red-900/30 rounded-lg px-3 py-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-xs font-semibold">PACE SUPPRESSION + UNDER BIAS</span>
        </div>
      )}
    </motion.div>
  );
}