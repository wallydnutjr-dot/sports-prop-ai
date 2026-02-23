import React from "react";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function SuggestedStake({ confidenceScore, bankroll }) {
  if (!bankroll || !confidenceScore) return null;

  // Kelly Criterion-inspired stake calculation based on confidence
  // Confidence 1-3: 0.5% of bankroll
  // Confidence 4-5: 1% of bankroll
  // Confidence 6-7: 2% of bankroll
  // Confidence 8-9: 3% of bankroll
  // Confidence 10: 5% of bankroll
  
  let percentage;
  if (confidenceScore <= 3) percentage = 0.5;
  else if (confidenceScore <= 5) percentage = 1;
  else if (confidenceScore <= 7) percentage = 2;
  else if (confidenceScore <= 9) percentage = 3;
  else percentage = 5;

  const suggestedAmount = (bankroll * percentage / 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 p-4"
    >
      <div className="flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">Suggested Stake</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-blue-400">${suggestedAmount}</p>
            <p className="text-xs text-gray-500">({percentage}% of bankroll)</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Based on confidence {confidenceScore}/10 and current bankroll ${bankroll.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}