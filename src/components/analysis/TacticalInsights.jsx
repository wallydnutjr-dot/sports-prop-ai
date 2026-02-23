import React from "react";
import { motion } from "framer-motion";
import { Target, Zap, Shield, Activity } from "lucide-react";

export default function TacticalInsights({ insights }) {
  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 bg-gradient-to-br from-orange-900/10 to-red-900/10 border-2 border-orange-500/30"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-bold text-orange-300">Tactical Insights</h3>
      </div>

      <div className="grid gap-4">
        {/* Opponent Weaknesses */}
        {insights.opponent_weaknesses && insights.opponent_weaknesses.length > 0 && (
          <div className="bg-[hsl(160,15%,6%)] rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-semibold text-red-300">Opponent Weaknesses</h4>
            </div>
            <div className="space-y-2">
              {insights.opponent_weaknesses.map((weakness, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">{weakness}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pace Adjustments */}
        {insights.pace_adjustments && (
          <div className="bg-[hsl(160,15%,6%)] rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-orange-300">Pace & Flow Analysis</h4>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{insights.pace_adjustments}</p>
          </div>
        )}

        {/* Exploitation Strategy */}
        {insights.exploitation_strategy && (
          <div className="bg-[hsl(160,15%,6%)] rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-emerald-300">How to Exploit</h4>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{insights.exploitation_strategy}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}