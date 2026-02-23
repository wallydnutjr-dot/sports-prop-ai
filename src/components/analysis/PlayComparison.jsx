import React from "react";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, Target, Zap, BarChart } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayComparison({ plays, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-auto p-4"
    >
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Play Comparison</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className={`grid ${plays.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
          {plays.map((play, idx) => (
            <div
              key={idx}
              className="rounded-2xl border-2 border-emerald-900/30 bg-[hsl(160,15%,5%)] p-5 space-y-4"
            >
              {/* Header */}
              <div className="border-b border-emerald-900/20 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Play {idx + 1}</span>
                  <span className={`text-lg font-bold ${
                    play.research.confidence_score >= 8 ? 'text-emerald-400' :
                    play.research.confidence_score >= 6 ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {play.research.confidence_score}/10
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{play.parsed.teams}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {play.parsed.sport_type} • {play.parsed.market_type?.replace(/_/g, " ")}
                </p>
              </div>

              {/* Recommendation */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Recommendation</p>
                <p className="text-lg font-bold text-emerald-400">{play.research.recommendation}</p>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Projection</p>
                    <p className="text-sm text-white font-bold">{play.research.projection || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <BarChart className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Fair Line</p>
                    <p className="text-sm text-white font-bold">{play.research.fair_line || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Edge</p>
                    <p className={`text-sm font-bold ${
                      (play.research.edge_percent || 0) > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {play.research.edge_percent ? `${play.research.edge_percent > 0 ? '+' : ''}${play.research.edge_percent}%` : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Line / Odds</p>
                    <p className="text-sm text-white font-medium">{play.parsed.line || "—"}</p>
                    <p className="text-xs text-gray-500">{play.parsed.odds || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Safe Alternate */}
              {play.research.safe_alternate && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Safe Alternate</p>
                  <p className="text-sm text-blue-400 font-semibold">{play.research.safe_alternate}</p>
                  <p className="text-xs text-gray-500 mt-1">{play.research.safe_alternate_explanation}</p>
                </div>
              )}

              {/* Key Write-Up Points */}
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Key Points</p>
                <div className="text-xs text-gray-400 leading-relaxed line-clamp-6">
                  {play.research.write_up?.split('.').slice(0, 3).join('. ')}...
                </div>
              </div>

              {/* Top Factors */}
              {play.research.factors && play.research.factors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">Top Factors</p>
                  {play.research.factors.slice(0, 3).map((factor, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        factor.direction === 'supports' ? 'bg-green-500' :
                        factor.direction === 'opposes' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-xs text-gray-400">{factor.name}</span>
                      <span className="text-xs text-gray-600 ml-auto">{factor.weight}/10</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            Close Comparison
          </Button>
        </div>
      </div>
    </motion.div>
  );
}