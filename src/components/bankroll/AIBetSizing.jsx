import React from "react";
import { motion } from "framer-motion";
import { Brain, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIBetSizing({ strategy, bankroll }) {
  if (!strategy) return null;

  const riskLevelConfig = {
    "Conservative": { color: "text-blue-400", bg: "bg-blue-500/10", icon: "🛡️" },
    "Moderate": { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "⚖️" },
    "Aggressive": { color: "text-red-400", bg: "bg-red-500/10", icon: "🔥" }
  };

  const config = riskLevelConfig[strategy.risk_level] || riskLevelConfig["Moderate"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border-2 border-indigo-500/30"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-indigo-300">AI Bet Sizing Strategy</h3>
      </div>

      <div className="grid gap-4">
        {/* Recommended Stake */}
        <div className="bg-[hsl(160,15%,6%)] rounded-xl p-4 border border-indigo-500/30 glow-green">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Recommended Stake</span>
            <Badge className={`${config.bg} ${config.color} text-xs`}>
              {config.icon} {strategy.risk_level}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span className="text-3xl font-bold text-emerald-400">
              {strategy.recommended_stake.toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm">
              ({strategy.stake_percentage.toFixed(1)}% of bankroll)
            </span>
          </div>
        </div>

        {/* Strategy Breakdown */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-[hsl(160,15%,6%)] rounded-lg p-3 border border-indigo-500/20">
            <div className="text-xs text-gray-500 mb-1">Kelly Criterion</div>
            <div className="text-lg font-bold text-indigo-300">{strategy.kelly_fraction}%</div>
          </div>
          <div className="bg-[hsl(160,15%,6%)] rounded-lg p-3 border border-indigo-500/20">
            <div className="text-xs text-gray-500 mb-1">Edge Confidence</div>
            <div className="text-lg font-bold text-indigo-300">{strategy.edge_confidence}/10</div>
          </div>
        </div>

        {/* Rationale */}
        <div className="bg-[hsl(160,15%,6%)] rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-purple-300">Sizing Rationale</h4>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{strategy.rationale}</p>
        </div>

        {/* Risk Warnings */}
        {strategy.risk_warnings && strategy.risk_warnings.length > 0 && (
          <div className="bg-red-900/10 rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-semibold text-red-300">Risk Factors</h4>
            </div>
            <div className="space-y-1">
              {strategy.risk_warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}