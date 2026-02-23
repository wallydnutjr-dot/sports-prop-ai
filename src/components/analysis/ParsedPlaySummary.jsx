import React from "react";
import { Trophy, Clock, Target, Users, Gamepad2, BarChart } from "lucide-react";
import { motion } from "framer-motion";

export default function ParsedPlaySummary({ play }) {
  const items = [
    { icon: Trophy, label: "Sport", value: play.sport_type },
    { icon: BarChart, label: "League", value: play.league_or_competition },
    { icon: Users, label: "Teams", value: play.teams || play.player },
    { icon: Target, label: "Market", value: play.market_type?.replace(/_/g, " ") },
    { icon: Clock, label: "Timing", value: play.timing },
    play.player && { icon: Gamepad2, label: "Player", value: play.player },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-5"
    >
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Parsed Play</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <item.icon className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm text-white font-medium capitalize">{item.value || "—"}</p>
            </div>
          </div>
        ))}
      </div>
      {play.line && (
        <div className="mt-4 pt-3 border-t border-emerald-900/20 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Line</p>
            <p className="text-lg text-emerald-400 font-bold">{play.line}</p>
          </div>
          {play.odds && (
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Odds / Payout</p>
              <p className="text-base text-white font-bold">{play.odds}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {play.odds.includes('-') ? 'Bet to win $100' : play.odds.includes('+') ? `Win $${play.odds.replace('+', '')} on $100` : 'Standard odds'}
              </p>
            </div>
          )}
          {play.segment && (
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Segment</p>
              <p className="text-sm text-gray-300 font-medium capitalize">{play.segment}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}