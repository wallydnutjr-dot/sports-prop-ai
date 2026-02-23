import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Zap } from "lucide-react";

export default function MasterAnalysisDisplay({ analysis, bankroll }) {
  if (!analysis || !analysis.research) return null;

  const { parsed, research } = analysis;
  const confidence = research.confidence_score || 5;
  const rec = research.recommendation;
  const factors = research.factors || [];

  // Confidence color mapping
  const getConfidenceColor = (score) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-yellow-400";
    if (score >= 4) return "text-orange-400";
    return "text-red-400";
  };

  const getConfidenceBg = (score) => {
    if (score >= 8) return "bg-emerald-500/20 border-emerald-500/50";
    if (score >= 6) return "bg-yellow-500/20 border-yellow-500/50";
    if (score >= 4) return "bg-orange-500/20 border-orange-500/50";
    return "bg-red-500/20 border-red-500/50";
  };

  const recColor = {
    Over: "text-emerald-400",
    Under: "text-blue-400",
    Home: "text-purple-400",
    Away: "text-orange-400",
    Pass: "text-gray-400"
  };

  // Calculate suggested stake
  const suggestedStake = bankroll ? 
    confidence <= 3 ? (bankroll * 0.005).toFixed(0) :
    confidence <= 5 ? (bankroll * 0.01).toFixed(0) :
    confidence <= 7 ? (bankroll * 0.02).toFixed(0) :
    confidence <= 9 ? (bankroll * 0.03).toFixed(0) :
    (bankroll * 0.05).toFixed(0) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-900/20 to-emerald-800/10"
    >
      {/* HEADER: Play/Team | Prop | Line | Direction */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 p-6 border-b-2 border-emerald-500/30">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h3 className="text-3xl sm:text-4xl font-black text-white flex-1">
            {parsed.player || parsed.teams}
          </h3>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getConfidenceBg(confidence)}`}>
            <span className="text-sm font-bold text-gray-300">Confidence</span>
            <span className={`text-3xl font-black ${getConfidenceColor(confidence)}`}>{confidence}</span>
            <span className="text-xs text-gray-400">/10</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 text-sm font-bold">
          <div className="text-gray-400 uppercase text-xs">Prop</div>
          <div className="text-gray-400 uppercase text-xs">Line</div>
          <div className="text-gray-400 uppercase text-xs">Decision</div>
          <div className="text-gray-400 uppercase text-xs">Edge</div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-2">
          <div className="text-white font-bold capitalize">{parsed.market_type.replace(/_/g, " ")}</div>
          <div className="text-emerald-400 font-bold text-lg">{parsed.line}</div>
          <div className={`font-black text-lg ${recColor[rec]}`}>{rec}</div>
          <div className="text-yellow-400 font-bold">{(research.edge_percent || 0).toFixed(1)}%</div>
        </div>
      </div>

      {/* AI ANALYSIS */}
      <div className="px-6 py-4 space-y-2 border-b border-emerald-900/20">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📊 AI Analysis</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{research.write_up}</p>
      </div>

      {/* FACTOR BREAKDOWN */}
      <div className="px-6 py-4 space-y-3 border-b border-emerald-900/20">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🔍 Factor Breakdown</h4>
        <div className="space-y-2">
          {factors.map((factor, idx) => {
            const isFavorable = factor.direction === "supports";
            const isNeutral = factor.direction === "neutral";
            const color = isFavorable ? "text-emerald-400" : isNeutral ? "text-gray-400" : "text-red-400";
            const icon = isFavorable ? "🟢" : isNeutral ? "⚪" : "🔴";
            return (
              <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-[hsl(160,15%,5%)]/50">
                <span className="text-lg">{icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-sm ${color}`}>{factor.name}</p>
                    <span className="text-xs text-gray-500">{(factor.weight * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{factor.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BANKROLL RECOMMENDATION */}
      {bankroll && suggestedStake && (
        <div className="px-6 py-4 space-y-2 border-b border-emerald-900/20 bg-blue-500/10 border-l-4 border-l-blue-500">
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">💰 Bankroll Recommendation</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Suggested Stake:</span>
            <span className="text-2xl font-black text-blue-400">${suggestedStake}</span>
          </div>
          <p className="text-xs text-gray-400">Based on {confidence}/10 confidence & ${bankroll} bankroll</p>
        </div>
      )}

      {/* STATISTICAL SUMMARY */}
      <div className="px-6 py-4 space-y-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-t border-emerald-900/20">
        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">📈 Statistical Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-[hsl(160,15%,5%)]/50 rounded-lg p-3 border border-purple-500/20">
            <p className="text-[10px] text-gray-500 uppercase mb-1">Projection</p>
            <p className="text-lg font-bold text-white">{research.projection}</p>
          </div>
          <div className="bg-[hsl(160,15%,5%)]/50 rounded-lg p-3 border border-purple-500/20">
            <p className="text-[10px] text-gray-500 uppercase mb-1">Fair Line</p>
            <p className="text-lg font-bold text-emerald-400">{research.fair_line}</p>
          </div>
          <div className="bg-[hsl(160,15%,5%)]/50 rounded-lg p-3 border border-purple-500/20">
            <p className="text-[10px] text-gray-500 uppercase mb-1">Edge</p>
            <p className="text-lg font-bold text-yellow-400">{(research.edge_percent || 0).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {rec === "Pass" && (
        <div className="mx-6 mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-xs text-yellow-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>PASS - Analysis suggests insufficient edge. Consider waiting for better market conditions.</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}