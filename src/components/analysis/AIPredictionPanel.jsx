import React from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Target, Zap, AlertCircle } from "lucide-react";

export default function AIPredictionPanel({ 
  recommendation, 
  confidence, 
  projection, 
  fairLine, 
  currentLine,
  isLive = false,
  momentum = null,
  regressionProbability = null,
  edgePercent = null
}) {
  // Confidence tier mapping
  const getConfidenceTier = (score) => {
    if (score >= 9) return { label: "ELITE", color: "from-emerald-500 to-green-400", textColor: "text-emerald-400", bgColor: "bg-emerald-500/20", borderColor: "border-emerald-500" };
    if (score >= 7) return { label: "STRONG", color: "from-blue-500 to-cyan-400", textColor: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-500" };
    if (score >= 5) return { label: "MODERATE", color: "from-amber-500 to-yellow-400", textColor: "text-amber-400", bgColor: "bg-amber-500/20", borderColor: "border-amber-500" };
    if (score >= 3) return { label: "WEAK", color: "from-orange-500 to-red-400", textColor: "text-orange-400", bgColor: "bg-orange-500/20", borderColor: "border-orange-500" };
    return { label: "VERY WEAK", color: "from-red-500 to-rose-400", textColor: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500" };
  };

  const confidenceTier = getConfidenceTier(confidence || 0);
  const isPass = recommendation === "Pass";

  // Recommendation config
  const getRecommendationConfig = () => {
    if (isPass) return { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-500/10", label: "PASS" };
    if (recommendation === "Over") return { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "OVER" };
    if (recommendation === "Under") return { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/20", label: "UNDER" };
    if (recommendation === "Home") return { icon: Target, color: "text-blue-400", bg: "bg-blue-500/20", label: "HOME" };
    if (recommendation === "Away") return { icon: Target, color: "text-purple-400", bg: "bg-purple-500/20", label: "AWAY" };
    return { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-500/10", label: recommendation };
  };

  const recConfig = getRecommendationConfig();
  const RecIcon = recConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-3 ${confidenceTier.borderColor} p-6 bg-gradient-to-br ${confidenceTier.color}/10 shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${confidenceTier.bgColor} border-2 ${confidenceTier.borderColor}`}>
          <Brain className={`w-8 h-8 ${confidenceTier.textColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            AI PREDICTION
            {isLive && <span className="text-red-500 text-sm flex items-center gap-1"><Zap className="w-4 h-4 animate-pulse" /> LIVE</span>}
          </h3>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Deep Learning Analysis</p>
        </div>
      </div>

      {/* Main Prediction Display */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Recommendation */}
        <div className={`rounded-xl ${recConfig.bg} border-2 ${confidenceTier.borderColor} p-6 text-center`}>
          <p className="text-xs text-gray-400 uppercase mb-2">Recommended Play</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <RecIcon className={`w-10 h-10 ${recConfig.color}`} />
            <span className={`text-4xl font-black ${recConfig.color}`}>{recConfig.label}</span>
          </div>
          {currentLine && <p className="text-sm text-gray-300">Line: {currentLine}</p>}
        </div>

        {/* Confidence Score */}
        <div className={`rounded-xl ${confidenceTier.bgColor} border-2 ${confidenceTier.borderColor} p-6`}>
          <p className="text-xs text-gray-400 uppercase mb-2 text-center">Confidence Level</p>
          <div className="text-center mb-3">
            <span className={`text-5xl font-black ${confidenceTier.textColor}`}>{confidence}</span>
            <span className="text-2xl text-gray-500">/10</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(confidence / 10) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${confidenceTier.color}`}
            />
          </div>
          <p className={`text-center text-sm font-bold mt-2 ${confidenceTier.textColor}`}>{confidenceTier.label}</p>
        </div>
      </div>

      {/* Projection & Edge */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {projection && (
          <div className="rounded-lg bg-[hsl(160,15%,7%)]/60 border border-emerald-500/30 p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase mb-1">AI Projection</p>
            <p className="text-2xl font-black text-emerald-400">{projection}</p>
          </div>
        )}
        {fairLine && (
          <div className="rounded-lg bg-[hsl(160,15%,7%)]/60 border border-blue-500/30 p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase mb-1">Fair Line</p>
            <p className="text-2xl font-black text-blue-400">{fairLine}</p>
          </div>
        )}
        {edgePercent !== null && (
          <div className="rounded-lg bg-[hsl(160,15%,7%)]/60 border border-purple-500/30 p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase mb-1">Edge</p>
            <p className={`text-2xl font-black ${edgePercent > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {edgePercent > 0 ? '+' : ''}{edgePercent.toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Live Game Analysis */}
      {isLive && (
        <div className="grid md:grid-cols-2 gap-4">
          {momentum && momentum !== "N/A" && (
            <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-3">
              <p className="text-xs text-amber-400 font-semibold mb-1">🔥 Live Momentum</p>
              <p className="text-sm text-white font-bold">{momentum}</p>
            </div>
          )}
          {regressionProbability !== null && (
            <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-3">
              <p className="text-xs text-purple-400 font-semibold mb-1">📉 Regression Risk</p>
              <p className="text-sm text-white font-bold">{regressionProbability}%</p>
            </div>
          )}
        </div>
      )}

      {/* Pass Warning */}
      {isPass && (
        <div className="mt-4 p-4 rounded-lg bg-gray-500/10 border border-gray-500/30">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            AI recommends passing on this play due to insufficient edge or high uncertainty.
          </p>
        </div>
      )}
    </motion.div>
  );
}