import React from "react";
import { TrendingUp, TrendingDown, ArrowRight, Ban } from "lucide-react";
import { motion } from "framer-motion";

const REC_CONFIG = {
  "Over": { color: "from-emerald-600 to-emerald-500", icon: TrendingUp, text: "OVER" },
  "Under": { color: "from-red-600 to-red-500", icon: TrendingDown, text: "UNDER" },
  "Home": { color: "from-blue-600 to-blue-500", icon: ArrowRight, text: "HOME" },
  "Away": { color: "from-purple-600 to-purple-500", icon: ArrowRight, text: "AWAY" },
  "Pass": { color: "from-gray-600 to-gray-500", icon: Ban, text: "PASS" },
};

export default function RecommendationBadge({ recommendation, confidence }) {
  const config = REC_CONFIG[recommendation] || REC_CONFIG["Pass"];
  const Icon = config.icon;
  
  const confidenceColor = confidence >= 8 ? "text-emerald-400" : confidence >= 6 ? "text-yellow-400" : confidence >= 4 ? "text-orange-400" : "text-red-400";
  const confidenceBg = confidence >= 8 ? "bg-emerald-500/10" : confidence >= 6 ? "bg-yellow-500/10" : confidence >= 4 ? "bg-orange-500/10" : "bg-red-500/10";
  const confidenceLabel = confidence >= 8 ? "Strong" : confidence >= 6 ? "Moderate" : confidence >= 4 ? "Weak" : "Very Weak";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center gap-4"
    >
      <div className={`bg-gradient-to-r ${config.color} rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg glow-green-strong`}>
        <Icon className="w-6 h-6 text-white" />
        <span className="text-white font-extrabold text-2xl tracking-wide">{config.text}</span>
      </div>
      <div className={`${confidenceBg} rounded-xl px-5 py-2.5 text-center`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Confidence</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-extrabold text-2xl ${confidenceColor}`}>{confidence}</span>
          <span className="text-gray-500 text-sm font-medium">/10</span>
          <span className={`text-xs font-semibold ml-1 ${confidenceColor}`}>• {confidenceLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}