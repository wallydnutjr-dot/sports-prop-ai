import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, Search, ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

import ParsedPlaySummary from "../components/analysis/ParsedPlaySummary";
import RecommendationBadge from "../components/analysis/RecommendationBadge";
import ProjectionStats from "../components/analysis/ProjectionStats";
import FactorBarGraph from "../components/analysis/FactorBarGraph";
import WriteUpSection from "../components/analysis/WriteUpSection";
import SafeAlternate from "../components/analysis/SafeAlternate";
import RecapSection from "../components/analysis/RecapSection";
import SuggestedStake from "../components/bankroll/SuggestedStake";
import LogBetButton from "../components/bankroll/LogBetButton";
import AIInsights from "../components/analysis/AIInsights";
import TacticalInsights from "../components/analysis/TacticalInsights";
import AIBetSizing from "../components/bankroll/AIBetSizing";
import PlayFilterNav from "../components/analysis/PlayFilterNav";

export default function History() {
  const queryClient = useQueryClient();
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const scrollRef = useRef(null);
  const startY = useRef(0);

  const { data: plays = [], isLoading, refetch } = useQuery({
    queryKey: ["historyPlays"],
    queryFn: () => base44.entities.ParsedPlay.filter({ status: "complete" }, "-created_date", 100),
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const allPlays = await base44.entities.ParsedPlay.filter({});
      for (const play of allPlays) {
        await base44.entities.ParsedPlay.delete(play.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historyPlays'] });
      setSelectedPlay(null);
    },
  });

  const { data: bankrollSettings } = useQuery({
    queryKey: ['bankrollSettings'],
    queryFn: async () => {
      const result = await base44.entities.BankrollSettings.list();
      return result[0] || null;
    },
  });

  const filteredPlays = plays
    .filter(p => {
      // Search filter
      const searchMatch = !searchQuery || 
        p.teams?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sport_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.player?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const categoryMatch = categoryFilter === "all" || p.market_type === categoryFilter;
      
      return searchMatch && categoryMatch;
    })
    .sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0)); // Sort by confidence

  const handlePullRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (scrollRef.current?.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 80) {
        handlePullRefresh();
      }
    }
  };

  // Generate AI analysis when play is selected
  React.useEffect(() => {
    if (selectedPlay && !aiAnalysis && !isLoadingAI) {
      const generateAIAnalysis = async () => {
        setIsLoadingAI(true);
        try {
          // Generate AI Insights
          const aiInsights = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a Professional Sports Betting Statistical Analyst. Analyze this research and extract actionable statistical insights.

Play: ${selectedPlay.teams} - ${selectedPlay.market_type}
${selectedPlay.player ? `Player: ${selectedPlay.player}` : ''}
Line: ${selectedPlay.line} | Odds: ${selectedPlay.odds}
Recommendation: ${selectedPlay.recommendation || "N/A"}
Confidence: ${selectedPlay.confidence_score || 5}/10
Edge: ${selectedPlay.edge_percent || 0}%

Research Analysis:
${selectedPlay.write_up || ""}

YOUR TASK: Extract data-driven statistical insights that increase conviction in this play.

1. KEY TRENDS (Provide 4-6 specific, actionable trends):
- Recent Form, H2H, Splits, Pace, Advanced Metrics, Situational Factors

2. STATISTICAL SUMMARY: 3-4 sentence data-driven summary

3. FOLLOW-UP QUESTIONS: 3-4 specific research angles`,
            response_json_schema: {
              type: "object",
              properties: {
                key_trends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      trend: { type: "string" },
                      impact: { type: "string" }
                    }
                  },
                  minItems: 4
                },
                summary: { type: "string" },
                follow_up_questions: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3
                }
              }
            }
          });

          // Generate Tactical Insights
          const tacticalInsights = await base44.integrations.Core.InvokeLLM({
            prompt: `Extract tactical edges from this analysis.

Play: ${selectedPlay.teams} - ${selectedPlay.market_type}
${selectedPlay.player ? `Player: ${selectedPlay.player}` : ''}
Analysis: ${selectedPlay.write_up || ""}

1. OPPONENT WEAKNESSES (4-6 specific exploitable weaknesses)
2. PACE & FLOW ADJUSTMENTS (3-4 sentences)
3. EXPLOITATION STRATEGY (3-4 sentences)`,
            response_json_schema: {
              type: "object",
              properties: {
                opponent_weaknesses: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 4
                },
                pace_adjustments: { type: "string" },
                exploitation_strategy: { type: "string" }
              }
            }
          });

          // Generate Bet Sizing if bankroll exists
          let betSizingStrategy = null;
          if (bankrollSettings?.current_bankroll) {
            betSizingStrategy = await base44.integrations.Core.InvokeLLM({
              prompt: `Calculate optimal bet sizing for this play.

Recommendation: ${selectedPlay.recommendation}
Confidence: ${selectedPlay.confidence_score}/10
Edge: ${selectedPlay.edge_percent}%
Bankroll: $${bankrollSettings.current_bankroll}

Use Modified Kelly Criterion. Provide:
1. RECOMMENDED STAKE
2. STAKE PERCENTAGE
3. KELLY FRACTION
4. EDGE CONFIDENCE (1-10)
5. RISK LEVEL (Conservative/Moderate/Aggressive)
6. RATIONALE (3-4 sentences)
7. RISK WARNINGS (3-4 factors)`,
              response_json_schema: {
                type: "object",
                properties: {
                  recommended_stake: { type: "number" },
                  stake_percentage: { type: "number" },
                  kelly_fraction: { type: "number" },
                  edge_confidence: { type: "number" },
                  risk_level: { type: "string" },
                  rationale: { type: "string" },
                  risk_warnings: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3
                  }
                }
              }
            });
          }

          setAiAnalysis({
            aiInsights,
            tacticalInsights,
            betSizingStrategy
          });
        } catch (error) {
          console.error('AI analysis error:', error);
          setAiAnalysis({ error: true });
        } finally {
          setIsLoadingAI(false);
        }
      };

      generateAIAnalysis();
    }
  }, [selectedPlay, bankrollSettings]);

  if (selectedPlay) {
    return (
      <div className="space-y-5 max-w-3xl mx-auto">
        <div className="sticky top-16 z-40 -mx-4 px-4 py-3 bg-[hsl(160,20%,4%)]/95 backdrop-blur-xl border-b border-emerald-900/20 mb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setSelectedPlay(null);
                setAiAnalysis(null);
                setIsLoadingAI(false);
              }}
              variant="ghost"
              size="sm"
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h2 className="text-lg font-semibold text-white">Play Details</h2>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-xs">
              {format(new Date(selectedPlay.created_date), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <RecommendationBadge
            recommendation={selectedPlay.recommendation}
            confidence={selectedPlay.confidence_score}
          />
        </div>

        <ProjectionStats
          projection={selectedPlay.projection}
          fairLine={selectedPlay.fair_line}
          edgePercent={selectedPlay.edge_percent}
        />

        <ParsedPlaySummary play={selectedPlay} />

        <SafeAlternate
          alternate={selectedPlay.safe_alternate}
          explanation={selectedPlay.safe_alternate_explanation}
        />

        <FactorBarGraph factors={selectedPlay.factors} />

        <WriteUpSection writeUp={selectedPlay.write_up} recommendation={selectedPlay.recommendation} />

        {/* AI Analysis - Loading or Display */}
        {isLoadingAI && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-emerald-400 text-sm font-medium">Generating AI analysis...</p>
          </div>
        )}

        {!isLoadingAI && aiAnalysis && !aiAnalysis.error && (
          <>
            {aiAnalysis.aiInsights && <AIInsights insights={aiAnalysis.aiInsights} playData={selectedPlay} />}
            {aiAnalysis.tacticalInsights && <TacticalInsights insights={aiAnalysis.tacticalInsights} />}
            {aiAnalysis.betSizingStrategy && bankrollSettings && (
              <AIBetSizing 
                strategy={aiAnalysis.betSizingStrategy} 
                bankroll={bankrollSettings.current_bankroll}
              />
            )}
          </>
        )}

        <RecapSection 
          play={selectedPlay}
          onUpdate={() => refetch()}
        />

        {bankrollSettings && (
          <>
            <SuggestedStake 
              confidenceScore={selectedPlay.confidence_score}
              bankroll={bankrollSettings.current_bankroll}
            />
            <LogBetButton 
              play={selectedPlay}
              suggestedStake={
                selectedPlay.confidence_score <= 3 ? (bankrollSettings.current_bankroll * 0.005).toFixed(2) :
                selectedPlay.confidence_score <= 5 ? (bankrollSettings.current_bankroll * 0.01).toFixed(2) :
                selectedPlay.confidence_score <= 7 ? (bankrollSettings.current_bankroll * 0.02).toFixed(2) :
                selectedPlay.confidence_score <= 9 ? (bankrollSettings.current_bankroll * 0.03).toFixed(2) :
                (bankrollSettings.current_bankroll * 0.05).toFixed(2)
              }
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="space-y-6"
    >
      {isRefreshing && (
        <div className="flex justify-center py-2">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Research <span className="text-emerald-400">History</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">View all your past analyses</p>
          </div>
          {plays.length > 0 && (
            <Button
              onClick={() => {
                if (window.confirm('Are you sure you want to erase all plays? This cannot be undone.')) {
                  deleteAllMutation.mutate();
                }
              }}
              variant="outline"
              size="sm"
              className="border-red-700/40 text-red-400 hover:bg-red-500/10"
              disabled={deleteAllMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Erase All
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <PlayFilterNav 
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        playCount={{
          all: plays.length,
          total: plays.filter(p => p.market_type === "total").length,
          player_prop: plays.filter(p => p.market_type === "player_prop").length,
          moneyline: plays.filter(p => p.market_type === "moneyline").length,
          spread: plays.filter(p => p.market_type === "spread").length
        }}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <Input
          placeholder="Search by team, sport, or player..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[hsl(160,15%,6%)] border-emerald-900/30 text-white placeholder:text-gray-600 focus:ring-emerald-500/30 focus:border-emerald-600/50"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredPlays.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 font-medium">
            {searchQuery ? "No plays found" : "No research history yet"}
          </p>
          <p className="text-gray-700 text-sm mt-1">
            {searchQuery ? "Try a different search" : "Upload a screenshot to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlays.map((play, i) => (
            <motion.button
              key={play.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedPlay(play)}
              className="w-full rounded-xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-4 hover:bg-emerald-950/20 hover:border-emerald-700/40 transition-all text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                    {play.teams || "Unknown Teams"}
                    {play.player ? ` — ${play.player}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                  <p className="text-gray-500 text-xs">
                    {format(new Date(play.created_date), "MMM d, h:mm a")}
                  </p>
                  <div
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                      play.recommendation === "Pass"
                        ? "bg-gray-800 text-gray-400"
                        : "bg-emerald-500/15 text-emerald-400"
                    }`}
                  >
                    {play.recommendation !== "Pass" && <span>🟢</span>}
                    {play.recommendation}
                  </div>
                    {play.recap_outcome && play.recap_outcome !== "pending" && (
                      <div
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          play.recap_outcome === "hit"
                            ? "bg-green-500/15 text-green-400"
                            : play.recap_outcome === "miss"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-yellow-500/15 text-yellow-400"
                        }`}
                      >
                        {play.recap_outcome.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}