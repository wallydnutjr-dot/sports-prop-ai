import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function DriveProjection({ drivesRemaining }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border-2 border-blue-500/60 bg-blue-500/20 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h4 className="text-white font-semibold text-sm">Estimated Drives Remaining</h4>
      </div>
      <div className="text-4xl font-black text-blue-400 mb-2">
        {drivesRemaining.toFixed(1)}
      </div>
      <p className="text-gray-400 text-xs">
        Drive-based projection accounts for game script, pace, and time remaining.
      </p>
    </motion.div>
  );
}