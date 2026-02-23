import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Database, BarChart3, FileText, Brain, CheckCircle } from "lucide-react";

const STEPS = [
  { icon: Search, text: "Extracting play details from screenshot..." },
  { icon: Database, text: "Gathering data from multiple sources..." },
  { icon: Brain, text: "Running deep research analysis..." },
  { icon: BarChart3, text: "Building projections & factor model..." },
  { icon: FileText, text: "Writing detailed analysis..." },
  { icon: CheckCircle, text: "Finalizing recommendation..." },
];

export default function LoadingResearch({ progress = 0 }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="text-xl font-bold text-white mb-2">Running Deep Research</h2>
      <p className="text-gray-500 text-sm mb-6">This may take up to 2 minutes</p>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-lg font-bold text-emerald-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: isDone ? 0.5 : isActive ? 1 : 0.3 }}
              className="flex items-center gap-3"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                isDone ? "bg-emerald-500/20" : isActive ? "bg-emerald-500/30" : "bg-gray-800/50"
              }`}>
                {isDone ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400 animate-pulse" : "text-gray-600"}`} />
                )}
              </div>
              <span className={`text-xs font-medium ${
                isDone ? "text-emerald-600" : isActive ? "text-gray-300" : "text-gray-700"
              }`}>
                {s.text}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}