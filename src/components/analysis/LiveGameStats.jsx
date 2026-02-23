import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, TrendingUp, AlertCircle, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function LiveGameStats({ teams, sport, league, onLiveDataUpdate }) {
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLiveData = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('fetchLiveGameData', {
        teams,
        sport_type: sport,
        league
      });
      
      if (response.data?.success && response.data?.data?.is_live) {
        setLiveData(response.data.data);
        setLastUpdated(new Date());
        if (onLiveDataUpdate) {
          onLiveDataUpdate(response.data.data);
        }
      } else {
        setLiveData({ is_live: false });
      }
    } catch (error) {
      console.error('Live data fetch error:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchLiveData();
    
    // Set up auto-refresh for live games
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchLiveData();
      }
    }, 20000); // Refresh every 20 seconds for more frequent updates
    
    return () => clearInterval(interval);
  }, [teams, autoRefresh]);

  if (!liveData) {
    return (
      <div className="rounded-xl bg-gray-900/30 border border-gray-800/50 p-4 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
        <p className="text-gray-500 text-sm">Fetching live game data...</p>
      </div>
    );
  }
  
  if (!liveData.is_live) {
    return (
      <div className="rounded-xl bg-gray-900/30 border border-gray-800/50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">Game not currently live. Live stats will appear when game starts.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLiveData}
            disabled={isLoading}
            className="border-gray-700/40 text-gray-400 hover:bg-gray-500/10"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Live Indicator Header */}
      <div className="rounded-xl bg-gradient-to-r from-red-600/20 to-red-500/20 border-2 border-red-500/60 p-4 shadow-lg shadow-red-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-6 h-6 text-red-500" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-xl">🔴 LIVE GAME</h3>
              <p className="text-red-400 text-sm font-bold uppercase tracking-wide">{liveData.game_status || "In Progress"}</p>
            </div>
          </div>
          <Button
            size="default"
            onClick={fetchLiveData}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-500 text-white font-bold border-2 border-red-400/30"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Update Now
          </Button>
        </div>

        {/* Data Freshness Indicator */}
        {lastUpdated && (
          <div className="bg-red-900/30 rounded-lg px-3 py-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-300 font-semibold">📡 Data from ESPN</span>
              <span className="text-red-400">
                Updated: {lastUpdated.toLocaleTimeString()} ({Math.floor((Date.now() - lastUpdated) / 1000)}s ago)
              </span>
            </div>
          </div>
        )}

        {/* Live Score - More Prominent */}
        <div className="grid grid-cols-3 gap-4 mb-3 bg-black/20 rounded-xl p-4 border border-red-500/20">
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Home</p>
            <p className="text-white font-black text-4xl">{liveData.score_home || "-"}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Clock className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-red-400 font-black text-lg uppercase tracking-wider">{liveData.period || "-"}</p>
            <p className="text-red-300 text-sm font-bold mt-1">{liveData.time_remaining || "-"}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Away</p>
            <p className="text-white font-black text-4xl">{liveData.score_away || "-"}</p>
          </div>
        </div>

        {liveData.possession && (
          <div className="text-center py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-emerald-400 text-xs font-medium">
              <Zap className="w-3 h-3 inline mr-1" />
              Possession: {liveData.possession}
            </p>
          </div>
        )}
      </div>

      {/* Momentum & Pace */}
      {(liveData.momentum || liveData.pace_tempo) && (
        <div className="rounded-xl bg-[hsl(160,15%,7%)] border border-emerald-900/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-white font-semibold text-sm">Game Flow</h4>
          </div>
          {liveData.momentum && (
            <div className="mb-2">
              <p className="text-gray-400 text-xs mb-1">Momentum:</p>
              <p className="text-white text-sm">
                {typeof liveData.momentum === 'object' 
                  ? JSON.stringify(liveData.momentum, null, 2)
                  : liveData.momentum}
              </p>
            </div>
          )}
          {liveData.pace_tempo && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Pace:</p>
              <p className="text-white text-sm">
                {typeof liveData.pace_tempo === 'object' 
                  ? JSON.stringify(liveData.pace_tempo, null, 2)
                  : liveData.pace_tempo}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Plays */}
      {liveData.recent_plays && liveData.recent_plays.length > 0 && (
        <div className="rounded-xl bg-[hsl(160,15%,7%)] border border-emerald-900/30 p-4">
          <h4 className="text-white font-semibold text-sm mb-2">Recent Plays</h4>
          <div className="space-y-1.5">
            {liveData.recent_plays.slice(0, 5).map((play, idx) => (
              <div key={idx} className="text-gray-300 text-xs py-1.5 px-2 bg-[hsl(160,10%,10%)] rounded">
                {play}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Player Stats */}
      {liveData.key_player_stats && liveData.key_player_stats.length > 0 && (
        <div className="rounded-xl bg-[hsl(160,15%,7%)] border border-emerald-900/30 p-4">
          <h4 className="text-white font-semibold text-sm mb-2">Key Player Performance</h4>
          <div className="space-y-2">
            {liveData.key_player_stats.map((player, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 px-2 bg-[hsl(160,10%,10%)] rounded">
                <span className="text-emerald-400 text-sm font-medium">{player.player}</span>
                <span className="text-gray-300 text-xs">{player.stats}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Stats */}
      {liveData.team_stats && (
        <div className="rounded-xl bg-[hsl(160,15%,7%)] border border-emerald-900/30 p-4">
          <h4 className="text-white font-semibold text-sm mb-2">Team Stats</h4>
          <p className="text-gray-300 text-xs leading-relaxed">
            {typeof liveData.team_stats === 'object' 
              ? JSON.stringify(liveData.team_stats, null, 2)
              : liveData.team_stats}
          </p>
        </div>
      )}

      {/* Injuries */}
      {liveData.injuries && (
        <div className="rounded-xl bg-yellow-900/20 border border-yellow-800/30 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-yellow-400 font-semibold text-xs mb-1">Injury Updates</h4>
              <div className="text-yellow-600 text-xs">
                {Array.isArray(liveData.injuries) ? (
                  <div className="space-y-1">
                    {liveData.injuries.map((injury, idx) => (
                      <div key={idx}>
                        {typeof injury === 'object' 
                          ? `${injury.player || 'Player'}: ${injury.status || 'Unknown'} - ${injury.injury || 'Injury'}${injury.estimated_return ? ` (${injury.estimated_return})` : ''}`
                          : injury}
                      </div>
                    ))}
                  </div>
                ) : typeof liveData.injuries === 'object' ? (
                  JSON.stringify(liveData.injuries, null, 2)
                ) : (
                  liveData.injuries
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh Toggle */}
      <div className="rounded-xl bg-[hsl(160,15%,7%)] border border-emerald-900/30 p-3">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              autoRefresh 
                ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40' 
                : 'bg-gray-700/20 text-gray-500 border-2 border-gray-600/30 hover:border-gray-500/50'
            }`}
          >
            {autoRefresh ? '✓ Auto-Update Enabled (20s)' : 'Enable Auto-Update'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}