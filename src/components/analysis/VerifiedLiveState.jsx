import React from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Clock, AlertCircle, Database } from "lucide-react";

export default function VerifiedLiveState({ liveState }) {
  if (!liveState) return null;

  const lastUpdated = liveState.last_updated ? new Date(liveState.last_updated) : null;
  const secondsAgo = lastUpdated ? Math.floor((new Date() - lastUpdated) / 1000) : null;

  let freshnessColor = "text-emerald-400";
  let freshnessStatus = "ESPN Verified";
  let freshnessIcon = <CheckCircle2 className="w-4 h-4" />;

  if (secondsAgo !== null) {
    if (secondsAgo > 60) {
      freshnessColor = "text-red-400";
      freshnessStatus = "Stale Data";
      freshnessIcon = <AlertCircle className="w-4 h-4" />;
    } else if (secondsAgo > 30) {
      freshnessColor = "text-yellow-400";
      freshnessStatus = "Updating...";
      freshnessIcon = <Clock className="w-4 h-4" />;
    }
  }

  const isOddsAPI = liveState.source?.includes("Odds API") || liveState.data_source?.includes("Odds API");
  const providerColor = isOddsAPI ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
  const providerText = liveState.data_source || liveState.source || "Data Source Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 p-6 shadow-lg glow-green"
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Shield className="w-6 h-6 text-emerald-400" />
        <h3 className="text-base font-black text-emerald-400 uppercase tracking-wider">
          ✅ Live Game State Verified
        </h3>
        <div className={`ml-auto flex items-center gap-1.5 ${freshnessColor}`}>
          {freshnessIcon}
          <span className="text-xs font-semibold">{freshnessStatus}</span>
        </div>
      </div>

      {/* Data Provider Badge - Prominent */}
      <div className="mb-6">
        <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border-3 ${providerColor} font-black text-base shadow-lg`}>
          <Database className="w-6 h-6" />
          <div>
            <div className="text-xs opacity-75 uppercase tracking-wider">Data Source</div>
            <div className="font-black">{providerText}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Game</p>
          <p className="text-sm font-bold text-white">{liveState.teams}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Sport</p>
          <p className="text-sm font-bold text-white">{liveState.sport}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center rounded-xl bg-[hsl(160,15%,5%)] p-4 border-2 border-emerald-600/40">
          <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1 font-bold">Score</p>
          <p className="text-2xl font-black text-emerald-400">{liveState.score}</p>
        </div>
        <div className="text-center rounded-xl bg-[hsl(160,15%,5%)] p-4 border-2 border-emerald-600/40">
          <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1 font-bold">Quarter/Period</p>
          <p className="text-2xl font-black text-white">{liveState.period}</p>
        </div>
        <div className="text-center rounded-xl bg-[hsl(160,15%,5%)] p-4 border-2 border-emerald-600/40">
          <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1 font-bold">Time Remaining</p>
          <p className="text-2xl font-black text-white">{liveState.time_remaining}</p>
        </div>
      </div>

      {/* Comprehensive Team Statistics */}
      {!liveState.is_simulated && (
        <div className="mb-4 space-y-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <h4 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
              📊 Team Statistics
              <span className="text-xs text-gray-500 font-normal">({liveState.stats_source || "ESPN"})</span>
            </h4>
            
            {/* Shooting Stats */}
            {(liveState.fg_percentage_home && liveState.fg_percentage_home !== "N/A") && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase mb-2 font-semibold">Shooting Efficiency</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[hsl(160,15%,7%)]/50 rounded-lg p-3 border border-blue-500/20">
                    <p className="text-[10px] text-gray-500 mb-1">Field Goal %</p>
                    <p className="text-lg font-bold text-white">{liveState.fg_percentage_home} / {liveState.fg_percentage_away}</p>
                  </div>
                  {liveState.three_pt_percentage_home && liveState.three_pt_percentage_home !== "N/A" && (
                    <div className="bg-[hsl(160,15%,7%)]/50 rounded-lg p-3 border border-blue-500/20">
                      <p className="text-[10px] text-gray-500 mb-1">Three Point %</p>
                      <p className="text-lg font-bold text-white">{liveState.three_pt_percentage_home} / {liveState.three_pt_percentage_away}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Game Flow Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {liveState.turnovers_home && liveState.turnovers_home !== "N/A" && (
                <div className="bg-[hsl(160,15%,7%)]/50 rounded-lg p-3 border border-purple-500/20">
                  <p className="text-[10px] text-gray-500 mb-1">Turnovers</p>
                  <p className="text-base font-bold text-orange-400">{liveState.turnovers_home} / {liveState.turnovers_away}</p>
                </div>
              )}
              {liveState.team_fouls_home && liveState.team_fouls_home !== "N/A" && (
                <div className="bg-[hsl(160,15%,7%)]/50 rounded-lg p-3 border border-purple-500/20">
                  <p className="text-[10px] text-gray-500 mb-1">Team Fouls</p>
                  <p className="text-base font-bold text-yellow-400">{liveState.team_fouls_home} / {liveState.team_fouls_away}</p>
                </div>
              )}
              {liveState.timeouts_home && liveState.timeouts_home !== "N/A" && (
                <div className="bg-[hsl(160,15%,7%)]/50 rounded-lg p-3 border border-purple-500/20">
                  <p className="text-[10px] text-gray-500 mb-1">Timeouts Left</p>
                  <p className="text-base font-bold text-emerald-400">{liveState.timeouts_home} / {liveState.timeouts_away}</p>
                </div>
              )}
              {liveState.pace_tempo && liveState.pace_tempo !== "N/A" && (
                <div className="bg-[hsl(160,15%,7%)]/50 rounded-lg p-3 border border-purple-500/20">
                  <p className="text-[10px] text-gray-500 mb-1">Pace</p>
                  <p className="text-base font-bold text-blue-400">{liveState.pace_tempo}</p>
                </div>
              )}
            </div>

            {/* Momentum Indicator */}
            {liveState.momentum && liveState.momentum !== "N/A" && (
              <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <p className="text-xs text-amber-400 font-semibold flex items-center gap-2">
                  🔥 Momentum: <span className="text-white">{liveState.momentum}</span>
                </p>
              </div>
            )}
          </div>

          {/* Top Performers */}
          {liveState.key_player_stats && liveState.key_player_stats.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <h4 className="text-sm font-bold text-purple-400 uppercase mb-3">⭐ Top Performers</h4>
              <div className="space-y-2">
                {liveState.key_player_stats.map((playerStat, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[hsl(160,15%,7%)]/50 rounded-lg p-2 border border-purple-500/20">
                    <span className="text-sm font-semibold text-white">{playerStat.player}</span>
                    <span className="text-xs text-purple-300">{playerStat.stats}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Plays */}
          {liveState.recent_plays && liveState.recent_plays.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
              <h4 className="text-sm font-bold text-emerald-400 uppercase mb-3">📝 Recent Plays</h4>
              <div className="space-y-1.5 text-xs">
                {liveState.recent_plays.slice(0, 5).map((play, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="text-emerald-500 font-bold min-w-[16px]">{idx + 1}.</span>
                    <span>{play}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-3 border-t border-emerald-900/30 flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-500">Data:</span>{" "}
          <span className="text-emerald-400 font-bold">{liveState.source}</span>
          {liveState.stats_source && liveState.stats_source !== "N/A" && (
            <>
              {" • "}
              <span className="text-gray-500">Stats:</span>{" "}
              <span className="text-emerald-400 font-bold">{liveState.stats_source}</span>
            </>
          )}
        </div>
        {secondsAgo !== null && (
          <div className={freshnessColor}>
            {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
          </div>
        )}
      </div>

      {secondsAgo !== null && secondsAgo > 90 && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-red-400 flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4" />
            Warning: Data is significantly stale. Click "Re-Analyze" for fresh verification.
          </p>
        </div>
      )}
    </motion.div>
  );
}