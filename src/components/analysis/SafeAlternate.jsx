import React from "react";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function SafeAlternate({ alternate, explanation }) {
  if (!alternate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-700/30 bg-gradient-to-br from-emerald-950/40 to-emerald-900/10 p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Safe Alternate</h3>
      </div>
      <p className="text-white font-bold text-xl mb-2">{alternate}</p>
      {explanation && (
        <p className="text-gray-400 text-sm leading-relaxed">{explanation}</p>
      )}
    </motion.div>
  );
}