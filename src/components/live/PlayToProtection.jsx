import React from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function PlayToProtection({ 
  recommendation, 
  currentLine, 
  playToLine, 
  edgeCompromised 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 p-5 ${
        edgeCompromised 
          ? "bg-red-900/20 border-red-500/60" 
          : "bg-emerald-500/10 border-emerald-500/40"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield className={`w-5 h-5 ${edgeCompromised ? 'text-red-500' : 'text-emerald-400'}`} />
        <h4 className="text-white font-bold text-sm">Play-To Price Protection</h4>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Recommended:</span>
          <span className="text-white font-bold text-lg">
            {recommendation} {currentLine}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Play To:</span>
          <span className={`font-black text-xl ${edgeCompromised ? 'text-red-500' : 'text-emerald-400'}`}>
            {recommendation} {playToLine}
          </span>
        </div>

        {edgeCompromised ? (
          <div className="mt-4 flex items-start gap-2 bg-red-900/30 rounded-lg px-3 py-2.5 border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-bold text-sm">⚠ Edge Compromised</p>
              <p className="text-red-300 text-xs mt-1">
                Line has exceeded Play-To threshold. Edge significantly reduced or eliminated.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-2 bg-emerald-900/20 rounded-lg px-3 py-2.5 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-400 font-bold text-sm">✓ Edge Protected</p>
              <p className="text-emerald-300 text-xs mt-1">
                Play remains +EV up to {recommendation} {playToLine}. Beyond that, edge weakens.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <p className="text-gray-500 text-xs leading-relaxed">
          <strong className="text-gray-400">Play-To Explained:</strong> Maximum/minimum price where statistical edge still exists. 
          Protects against line movement during analysis.
        </p>
      </div>
    </motion.div>
  );
}