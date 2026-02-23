import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, Users, AlertTriangle } from "lucide-react";

export default function ContrarianAnalysis({ analysis }) {
  if (!analysis) return null;

  const getContrairianColor = (score) => {
    if (score >= 7) return "text-purple-400";
    if (score >= 4) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl sm:rounded-2xl border border-purple-900/30 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 p-3 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
        <h3 className="text-sm sm:text-base font-bold text-purple-300">Contrarian Edge Analysis</h3>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Contrarian Score */}
        <div className="flex items-center justify-between p-3 bg-[hsl(160,10%,8%)] rounded-lg">
          <span className="text-xs sm:text-sm text-gray-400">Contrarian Score</span>
          <span className={`text-lg sm:text-xl font-bold ${getContrairianColor(analysis.contrarian_score)}`}>
            {analysis.contrarian_score}/10
          </span>
        </div>

        {/* Public vs Sharp Split */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-blue-400 mb-1">Public Betting</p>
              <p className="text-xs sm:text-sm text-gray-300">{analysis.public_betting}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400 mb-1">Sharp Money</p>
              <p className="text-xs sm:text-sm text-gray-300">{analysis.sharp_money}</p>
            </div>
          </div>
        </div>

        {/* Contrarian Opportunity */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-purple-300 leading-relaxed">
            <strong>Contrarian Play:</strong> {analysis.contrarian_opportunity}
          </p>
        </div>
      </div>
    </motion.div>
  );
}