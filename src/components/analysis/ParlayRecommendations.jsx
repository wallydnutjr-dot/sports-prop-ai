import React from "react";
import { motion } from "framer-motion";
import { Layers, Zap, AlertTriangle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ParlayRecommendations({ parlays, bankroll }) {
  if (!parlays || parlays.length === 0) return null;

  const getCorrelationColor = (level) => {
    if (level === "low") return "text-emerald-400 bg-emerald-500/10";
    if (level === "medium") return "text-yellow-400 bg-yellow-500/10";
    return "text-red-400 bg-red-500/10";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl sm:rounded-2xl border border-indigo-900/30 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 p-3 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
        <h3 className="text-sm sm:text-base font-bold text-indigo-300">AI Parlay Builder</h3>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {parlays.map((parlay, idx) => (
          <div key={idx} className="p-4 bg-[hsl(160,10%,8%)] rounded-lg border border-indigo-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-sm sm:text-base font-bold text-white">{parlay.legs}-Leg Parlay</span>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                +{parlay.payout_odds}
              </Badge>
            </div>

            <div className="space-y-2 mb-3">
              {parlay.plays.map((play, playIdx) => (
                <div key={playIdx} className="text-xs sm:text-sm p-2 bg-[hsl(160,8%,12%)] rounded">
                  <span className="text-gray-400">Leg {playIdx + 1}:</span>{" "}
                  <span className="text-emerald-400 font-medium">{play}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center p-2 bg-[hsl(160,8%,12%)] rounded">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Combined Odds</p>
                <p className="text-sm sm:text-base font-bold text-white">{parlay.combined_odds}</p>
              </div>
              <div className="text-center p-2 bg-[hsl(160,8%,12%)] rounded">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Win Probability</p>
                <p className="text-sm sm:text-base font-bold text-indigo-400">{parlay.win_probability}%</p>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getCorrelationColor(parlay.correlation_risk).split(' ')[0]}`} />
              <div>
                <p className="text-xs sm:text-sm font-semibold mb-1">
                  <span className={getCorrelationColor(parlay.correlation_risk).split(' ')[0]}>
                    {parlay.correlation_risk.toUpperCase()} Correlation Risk
                  </span>
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400">{parlay.correlation_analysis}</p>
              </div>
            </div>

            {bankroll && (
              <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm text-emerald-400 font-medium">Suggested Stake:</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-emerald-400">
                  ${parlay.suggested_stake}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
        <p className="text-[10px] sm:text-xs text-indigo-400 text-center">
          ⚡ Parlay legs analyzed for correlation, market efficiency, and bankroll optimization
        </p>
      </div>
    </motion.div>
  );
}