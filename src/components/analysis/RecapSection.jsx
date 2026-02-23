import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, MinusCircle, Clock, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const OUTCOME_CONFIG = {
  hit: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    label: "HIT ✓"
  },
  miss: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    label: "MISS ✗"
  },
  push: {
    icon: MinusCircle,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    label: "PUSH"
  },
  pending: {
    icon: Clock,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    label: "PENDING"
  }
};

export default function RecapSection({ play, onUpdate }) {
  const [isChecking, setIsChecking] = useState(false);

  const checkOutcome = async () => {
    setIsChecking(true);
    try {
      await base44.functions.invoke('checkPlayOutcome', { play_id: play.id });
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error checking outcome:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const outcome = play.recap_outcome || 'pending';
  const config = OUTCOME_CONFIG[outcome];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-5 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${config.color}`} />
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recap</h3>
            <p className={`text-2xl font-bold ${config.color} mt-1`}>{config.label}</p>
          </div>
        </div>
        <Button
          onClick={checkOutcome}
          disabled={isChecking}
          size="sm"
          variant="outline"
          className="border-emerald-700/40 text-emerald-400 hover:bg-emerald-500/10"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Check Result'}
        </Button>
      </div>

      {play.game_concluded && (
        <div className="space-y-2 text-sm">
          {play.final_score && (
            <div>
              <span className="text-gray-500">Final Score:</span>
              <span className="text-white ml-2 font-medium">{play.final_score}</span>
            </div>
          )}
          {play.actual_stat && (
            <div>
              <span className="text-gray-500">Actual Stat:</span>
              <span className="text-white ml-2 font-medium">{play.actual_stat}</span>
            </div>
          )}
          {play.outcome_explanation && (
            <div className="mt-3 pt-3 border-t border-gray-700/30">
              <p className="text-gray-400 text-xs leading-relaxed">{play.outcome_explanation}</p>
            </div>
          )}
        </div>
      )}

      {!play.game_concluded && outcome === 'pending' && (
        <p className="text-gray-500 text-xs">
          Game has not concluded yet. Check back after the game ends.
        </p>
      )}

      {play.recap_checked_at && (
        <p className="text-gray-600 text-[10px] mt-3">
          Last checked: {new Date(play.recap_checked_at).toLocaleString()}
        </p>
      )}
    </motion.div>
  );
}