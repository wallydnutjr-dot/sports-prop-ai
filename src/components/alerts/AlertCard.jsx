import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Target, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";

const STRIKE_TIMING_CONFIG = {
  "STRIKE NOW": { color: "text-red-400", bg: "bg-red-500/10", icon: Zap, label: "STRIKE NOW" },
  "WAIT": { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Clock, label: "WAIT" },
  "MONITOR": { color: "text-blue-400", bg: "bg-blue-500/10", icon: Activity, label: "MONITOR" },
};

export default function AlertCard({ alert, onRunResearch, tier = "medium" }) {
  const timingConfig = STRIKE_TIMING_CONFIG[alert.strike_timing] || STRIKE_TIMING_CONFIG["MONITOR"];
  const TimingIcon = timingConfig.icon;
  
  const borderColor = tier === "high" 
    ? "border-emerald-500/60 bg-emerald-500/5 shadow-lg shadow-emerald-500/20" 
    : "border-yellow-500/40 bg-yellow-500/5";

  const confidenceColor = alert.confidence >= 8 
    ? "text-emerald-400" 
    : alert.confidence >= 6 
    ? "text-yellow-400" 
    : "text-orange-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-5 ${borderColor}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {alert.sport}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-gray-500">
              {alert.bet_type}
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-white">{alert.teams}</h3>
          <p className="text-sm text-gray-500">{alert.game_state}</p>
        </div>
        
        <div className={`text-right ${confidenceColor}`}>
          <div className="text-3xl font-extrabold">{alert.confidence}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Confidence</div>
        </div>
      </div>

      {/* Suggested Play */}
      <div className="bg-[hsl(160,15%,6%)] rounded-xl p-4 mb-4 border border-emerald-900/30">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-500 uppercase tracking-wider">Suggested Play</span>
        </div>
        <p className="text-xl font-bold text-emerald-400">{alert.suggested_play}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[hsl(160,15%,6%)] rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">Regression</div>
          <div className="text-lg font-bold text-white">{alert.regression_probability}%</div>
        </div>
        <div className="bg-[hsl(160,15%,6%)] rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">Spike</div>
          <div className="text-lg font-bold text-white">{alert.spike_probability}%</div>
        </div>
        <div className="bg-[hsl(160,15%,6%)] rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">Fair Line</div>
          <div className="text-lg font-bold text-white">{alert.fair_line}</div>
        </div>
      </div>

      {/* Strike Timing */}
      <div className={`${timingConfig.bg} rounded-lg p-3 mb-4 flex items-center gap-3`}>
        <TimingIcon className={`w-5 h-5 ${timingConfig.color}`} />
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-0.5">Strike Timing</div>
          <div className={`text-sm font-bold ${timingConfig.color}`}>{timingConfig.label}</div>
        </div>
      </div>

      {/* Edge Summary */}
      <div className="mb-4">
        <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Edge Summary</div>
        <p className="text-sm text-gray-300 leading-relaxed">{alert.edge_summary}</p>
      </div>

      {/* Action Button */}
      <Button
        onClick={onRunResearch}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        Run Full Research
      </Button>
    </motion.div>
  );
}