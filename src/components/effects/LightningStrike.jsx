import React from "react";
import { motion } from "framer-motion";

export default function LightningStrike() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="fixed inset-0 z-50 pointer-events-none"
    >
      {/* Flash overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.3, 0] }}
        transition={{ duration: 0.5, times: [0, 0.1, 0.3, 1] }}
        className="absolute inset-0 bg-yellow-300/40"
      />

      {/* Lightning bolt */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-full"
        viewBox="0 0 64 400"
        fill="none"
      >
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.4, times: [0, 0.1, 0.7, 1] }}
          d="M32 0 L28 80 L36 80 L30 140 L38 140 L28 240 L40 240 L26 400"
          stroke="url(#goldGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.4, times: [0, 0.1, 0.7, 1], delay: 0.05 }}
          d="M32 0 L28 80 L36 80 L30 140 L38 140 L28 240 L40 240 L26 400"
          stroke="#FCD34D"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Impact effect */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 2], opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.6, times: [0, 0.3, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-radial from-yellow-400/30 via-yellow-500/10 to-transparent"
      />
    </motion.div>
  );
}