import React from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Zap } from "lucide-react";
import FactorBarGraph from "../analysis/FactorBarGraph";
import RecommendationBadge from "../analysis/RecommendationBadge";
import ProjectionStats from "../analysis/ProjectionStats";
import WriteUpSection from "../analysis/WriteUpSection";
import SafeAlternate from "../analysis/SafeAlternate";
import AIInsights from "../analysis/AIInsights";

export default function DiscrepancyAnalysis({ result, isTop }) {
  const { prop, analysis } = result;
  
  const isPass = analysis.recommended_direction === "Pass" || analysis.recommended_play?.toLowerCase().includes("pass");
  const isStrong = analysis.confidence >= 7;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-4 rounded-2xl p-5 border-2 transition-all ${
        isTop && !isPass
          ? "border-emerald-500/60 bg-emerald-500/5 shadow-lg shadow-emerald-500/20"
          : isPass
          ? "border-red-500/40 bg-red-500/5"
          : "border-emerald-900/20 bg-[hsl(160,15%,5%)]"
      }`}
    >
      {/* Header */}
      <div className="space-y-3">
        {/* DGF Alignment Warning */}
        {analysis.dgf_alignment === "Disagrees" && (
          <div className="rounded-xl bg-red-500/10 border-2 border-red-500/40 p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <h4 className="text-red-400 font-bold text-lg uppercase tracking-wide">
                Context Disagrees with DGF
              </h4>
            </div>
            <p className="text-red-300 text-sm leading-relaxed">
              {analysis.alignment_explanation}
            </p>
          </div>
        )}
        
        {/* DGF Alignment Support */}
        {analysis.dgf_alignment === "Agrees" && (
          <div className="rounded-xl bg-emerald-500/10 border-2 border-emerald-500/40 p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wide">
                Context Supports DGF
              </h4>
            </div>
            <p className="text-emerald-300 text-xs leading-relaxed">
              {analysis.alignment_explanation}
            </p>
          </div>
        )}

        {isTop && !isPass && (
          <div className="flex items-center justify-center gap-2 pb-3 border-b border-emerald-500/20">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">
              Highest Conviction
            </span>
          </div>
        )}
        
        <h3 className="text-2xl font-bold text-white">
          {prop.player_name}
        </h3>
        <p className="text-gray-400 text-sm">
          {prop.sport} • {prop.teams} • {prop.stat_type}
        </p>
      </div>

      {/* Primary Line */}
      <div className="rounded-xl bg-[hsl(160,15%,8%)] border border-emerald-900/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Primary Line</span>
        </div>
        <div className="text-lg font-bold text-white">
          {prop.primary_sportsbook}: {prop.primary_direction} {prop.primary_line} ({prop.primary_odds})
        </div>
      </div>

      {/* Alternative Lines */}
      {prop.discrepancies && prop.discrepancies.length > 0 && (
        <div className="rounded-xl bg-[hsl(160,15%,8%)] border border-emerald-900/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Alternative Lines</span>
          </div>
          <div className="space-y-2">
            {prop.discrepancies.map((disc, idx) => (
              <div key={idx} className="text-sm text-gray-300">
                {disc.sportsbook}: {disc.direction} {disc.line} ({disc.odds})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Badge */}
      <div className="flex justify-center">
        <RecommendationBadge
          recommendation={analysis.recommended_direction}
          confidence={analysis.confidence}
        />
      </div>

      {/* Projection Stats */}
      <ProjectionStats
        projection={analysis.projection}
        fairLine={analysis.fair_line}
        edgePercent={analysis.edge_percent}
      />

      {/* Factor Breakdown - Already color coded */}
      {analysis.factors && analysis.factors.length > 0 && (
        <FactorBarGraph factors={analysis.factors} />
      )}

      {/* Write-up */}
      {analysis.write_up && (
        <WriteUpSection writeUp={analysis.write_up} />
      )}

      {/* Safe Alternate */}
      {analysis.safe_alternate && (
        <SafeAlternate
          alternate={analysis.safe_alternate}
          explanation={analysis.safe_alternate_explanation}
        />
      )}

      {/* AI Insights - Always shown */}
      {analysis.ai_insights ? (
        <AIInsights insights={analysis.ai_insights} playData={prop} />
      ) : (
        <div className="rounded-xl bg-yellow-900/10 border border-yellow-800/30 p-4">
          <p className="text-yellow-600 text-sm">AI insights temporarily unavailable for this play.</p>
        </div>
      )}

      {/* Recommended Book Highlight */}
      {!isPass && analysis.recommended_book && (
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
              Recommended Sportsbook
            </span>
          </div>
          <p className="text-lg font-bold text-white">
            {analysis.recommended_book} — {analysis.recommended_direction} {analysis.recommended_line}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            This sportsbook offers the best line based on contextual research, not just discrepancy size.
          </p>
        </div>
      )}
    </motion.div>
  );
}