import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, TrendingUp, Trophy, Target, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6995f76e1fdeeacc4c78fb97/9475f9cff_OWALogoTransparent.png";

export default function Recap() {
  const queryClient = useQueryClient();

  // Get today's plays only (created today)
  const { data: allPlays = [], isLoading } = useQuery({
    queryKey: ["recapPlays"],
    queryFn: () => base44.entities.ParsedPlay.list("-created_date", 100),
  });

  // Filter to today's plays only
  const todayPlays = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return allPlays.filter((p) => {
      if (!p.created_date) return false;
      const playDate = format(new Date(p.created_date), "yyyy-MM-dd");
      return playDate === todayStr && p.status === "complete";
    });
  }, [allPlays]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ParsedPlay.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recapPlays"] }),
  });

  const markOutcome = (play, outcome) => {
    updateMutation.mutate({
      id: play.id,
      data: {
        recap_outcome: outcome,
        game_concluded: true,
        recap_checked_at: new Date().toISOString(),
      },
    });
  };

  // Stats
  const concluded = todayPlays.filter((p) => p.game_concluded);
  const hits = concluded.filter((p) => p.recap_outcome === "hit");
  const misses = concluded.filter((p) => p.recap_outcome === "miss");
  const na = concluded.filter((p) => p.recap_outcome === "na");
  const pending = todayPlays.filter((p) => !p.game_concluded);
  const tracked = hits.length + misses.length;
  const hitRate = tracked > 0 ? Math.round((hits.length / tracked) * 100) : 0;

  const hitRateColor =
    hitRate >= 70 ? "text-emerald-400" : hitRate >= 50 ? "text-yellow-400" : hitRate > 0 ? "text-red-400" : "text-gray-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Daily <span className="text-emerald-400">Recap</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")} — Resets at midnight
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["recapPlays"] })}
          className="border-emerald-700/40 text-emerald-400 hover:bg-emerald-500/10"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon={Target} label="Total Plays" value={todayPlays.length} color="text-white" />
        <StatCard icon={CheckCircle} label="Hits" value={hits.length} color="text-emerald-400" />
        <StatCard icon={XCircle} label="Misses" value={misses.length} color="text-red-400" />
        <StatCard icon={Clock} label="N/A" value={na.length} color="text-gray-500" />
        <div className="rounded-xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-4 text-center glow-green">
          <Trophy className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Hit Rate</p>
          <p className={`text-3xl font-extrabold ${hitRateColor}`}>
            {tracked > 0 ? `${hitRate}%` : "—"}
          </p>
        </div>
      </div>

      {/* Plays List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : todayPlays.length === 0 ? (
        <div className="text-center py-16">
          <img src={LOGO_URL} alt="" className="w-16 h-16 mx-auto mb-4 rounded-full opacity-30" />
          <p className="text-gray-600 font-medium">No plays researched today</p>
          <p className="text-gray-700 text-sm mt-1">Upload a screenshot to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {todayPlays.map((play, i) => (
              <motion.div
                key={play.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Play Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
                      >
                        {play.sport_type || "Sport"}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-gray-800 text-gray-400 border-gray-700 text-[10px]"
                      >
                        {play.market_type?.replace(/_/g, " ") || "Market"}
                      </Badge>
                      {play.timing === "live" && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/20 text-[10px]">LIVE</Badge>
                      )}
                    </div>
                    <p className="text-white font-semibold text-sm truncate">
                      {play.teams || "Unknown Teams"}{play.player ? ` — ${play.player}` : ""}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Line: {play.line || "—"} · {play.segment || "Full Game"}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      play.recommendation?.includes("Over")
                        ? "bg-emerald-500/15 text-emerald-400"
                        : play.recommendation?.includes("Under")
                        ? "bg-red-500/15 text-red-400"
                        : "bg-gray-800 text-gray-400"
                    }`}>
                      {play.recommendation || "—"}
                    </div>

                    {/* Outcome Buttons */}
                    {play.game_concluded ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => markOutcome(play, "hit")}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                            play.recap_outcome === "hit"
                              ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"
                              : "bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/15"
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">HIT</span>
                        </button>
                        <button
                          onClick={() => markOutcome(play, "miss")}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                            play.recap_outcome === "miss"
                              ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                              : "bg-red-500/5 text-red-700 hover:bg-red-500/15"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">MISS</span>
                        </button>
                        <button
                          onClick={() => markOutcome(play, "na")}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                            play.recap_outcome === "na"
                              ? "bg-gray-500/20 text-gray-400 ring-1 ring-gray-500/50"
                              : "bg-gray-500/5 text-gray-600 hover:bg-gray-500/15"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">N/A</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-yellow-500" />
                        <button
                          onClick={() => markOutcome(play, "hit")}
                          className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-medium transition-colors"
                        >
                          ✓ Hit
                        </button>
                        <button
                          onClick={() => markOutcome(play, "miss")}
                          className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-medium transition-colors"
                        >
                          ✗ Miss
                        </button>
                        <button
                          onClick={() => markOutcome(play, "na")}
                          className="px-2 py-1 rounded-md bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 text-[10px] font-medium transition-colors"
                        >
                          — N/A
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-4 text-center">
      <Icon className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}