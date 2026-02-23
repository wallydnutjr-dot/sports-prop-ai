import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StructuredFactors({ 
  benchProbability,
  blowoutProbability,
  foulInflationRisk,
  rotationRisk,
  driveCertainty,
  gameScript,
  paceFactor,
  shotPaceFactor,
  emptyNetProbability,
  powerPlayFrequency,
  regressionProbability,
  volatilityRisk
}) {
  const getFactorIcon = (value) => {
    if (!value) return null;
    const val = value.toLowerCase();
    if (val === 'positive' || val === 'high' || val === 'low' && value.includes('Volatility')) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (val === 'negative' || val === 'high') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getFactorColor = (value, isProbability = false) => {
    if (!value) return "text-gray-500";
    if (isProbability) {
      const val = parseFloat(value);
      if (val >= 70) return "text-red-500";
      if (val >= 50) return "text-yellow-500";
      return "text-green-500";
    }
    const val = value.toLowerCase();
    if (val === 'positive' || val === 'high' && value.includes('certainty')) return "text-green-500";
    if (val === 'negative' || val === 'high') return "text-red-500";
    if (val === 'low') return "text-green-500";
    return "text-yellow-500";
  };

  const factors = [
    benchProbability !== undefined && { label: "Bench Probability", value: `${benchProbability}%`, isProbability: true },
    blowoutProbability !== undefined && { label: "Blowout Probability", value: `${blowoutProbability}%`, isProbability: true },
    foulInflationRisk && { label: "Foul Inflation Risk", value: foulInflationRisk },
    rotationRisk && { label: "Rotation Risk", value: rotationRisk },
    driveCertainty && { label: "Drive Certainty", value: driveCertainty },
    gameScript && { label: "Game Script", value: gameScript },
    paceFactor && { label: "Pace Factor", value: paceFactor },
    shotPaceFactor && { label: "Shot Pace", value: shotPaceFactor },
    emptyNetProbability !== undefined && { label: "Empty Net Risk", value: `${emptyNetProbability}%`, isProbability: true },
    powerPlayFrequency && { label: "Power Play Frequency", value: powerPlayFrequency },
    regressionProbability !== undefined && { label: "Regression Probability", value: `${regressionProbability}%`, isProbability: true },
    volatilityRisk && { label: "Volatility Risk", value: volatilityRisk }
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-[hsl(160,15%,7%)] border border-emerald-900/30 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-emerald-400" />
        <h4 className="text-white font-bold text-sm">Factor Breakdown</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {factors.map((factor, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-[hsl(160,10%,10%)] rounded-lg px-3 py-2.5"
          >
            <span className="text-gray-400 text-xs font-medium">{factor.label}:</span>
            <div className="flex items-center gap-2">
              {getFactorIcon(factor.value)}
              <span className={`font-bold text-sm ${getFactorColor(factor.value, factor.isProbability)}`}>
                {factor.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}