import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Database } from "lucide-react";

export default function AIAnalysisSummary({ summary, dataSource }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-[hsl(160,15%,7%)] border border-emerald-900/30 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <h4 className="text-white font-bold text-sm">AI Analysis Summary</h4>
      </div>

      <div className="prose prose-sm prose-invert max-w-none">
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {summary}
        </p>
      </div>

      {dataSource && (
        <div className="mt-4 pt-4 border-t border-emerald-900/20">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-400 text-xs font-semibold">
              Data Source: {dataSource}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}