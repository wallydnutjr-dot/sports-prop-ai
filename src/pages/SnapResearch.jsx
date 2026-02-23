import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, GitCompare, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

import MultiTabUploadZone from "../components/snap/MultiTabUploadZone";
import LoadingResearch from "../components/common/LoadingResearch";
import ParsedPlaySummary from "../components/analysis/ParsedPlaySummary";
import AIPredictionPanel from "../components/analysis/AIPredictionPanel";
import RecommendationBadge from "../components/analysis/RecommendationBadge";
import ProjectionStats from "../components/analysis/ProjectionStats";
import FactorBarGraph from "../components/analysis/FactorBarGraph";
import WriteUpSection from "../components/analysis/WriteUpSection";
import SafeAlternate from "../components/analysis/SafeAlternate";
import LightningStrike from "../components/effects/LightningStrike";
import PlayComparison from "../components/analysis/PlayComparison";
import RecapSection from "../components/analysis/RecapSection";
import SuggestedStake from "../components/bankroll/SuggestedStake";
import LogBetButton from "../components/bankroll/LogBetButton";
import AIInsights from "../components/analysis/AIInsights";
import TacticalInsights from "../components/analysis/TacticalInsights";
import AIBetSizing from "../components/bankroll/AIBetSizing";
import LiveGameStats from "../components/analysis/LiveGameStats";
import ContrarianAnalysis from "../components/analysis/ContrarianAnalysis";
import InjuryLineupImpact from "../components/analysis/InjuryLineupImpact";
import MarketInefficiencies from "../components/analysis/MarketInefficiencies";
import ParlayRecommendations from "../components/analysis/ParlayRecommendations";
import VerifiedLiveState from "../components/analysis/VerifiedLiveState";
import UniversalAnalysisDisplay from "../components/analysis/UniversalAnalysisDisplay";
import PlayFilterNav from "../components/analysis/PlayFilterNav";
import MasterAnalysisDisplay from "../components/analysis/MasterAnalysisDisplay";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6995f76e1fdeeacc4c78fb97/9475f9cff_OWALogoTransparent.png";

export default function SnapResearch() {
  const location = useLocation();
  const [fileUrls, setFileUrls] = useState([]);
  const [criteria, setCriteria] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [multipleAnalysis, setMultipleAnalysis] = useState(null);
  const [showLightning, setShowLightning] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [inputMode, setInputMode] = useState("screenshot");
  const [manualInput, setManualInput] = useState("");
  const [researchProgress, setResearchProgress] = useState(0);
  const [liveDataMap, setLiveDataMap] = useState(new Map());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [verifiedLiveStates, setVerifiedLiveStates] = useState(new Map());
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Handle preloaded play from Alert Plays
  useEffect(() => {
    if (location.state?.preloadPlay) {
      setInputMode("manual");
      setManualInput(location.state.preloadPlay);
      if (location.state.autoRun) {
        setTimeout(() => runResearch(), 500);
      }
    }
  }, [location.state]);

  // Handle reset from navigation - only on mount and when explicitly requested
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      resetForm();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // Empty dependency - only runs on mount

  // Persist research state to localStorage
  React.useEffect(() => {
    if (isResearching) {
      localStorage.setItem('owp_researching', 'true');
      localStorage.setItem('owp_research_start', Date.now().toString());
    } else {
      localStorage.removeItem('owp_researching');
      localStorage.removeItem('owp_research_start');
    }
  }, [isResearching]);

  // Check for ongoing research on mount
  React.useEffect(() => {
    const wasResearching = localStorage.getItem('owp_researching');
    const startTime = localStorage.getItem('owp_research_start');
    if (wasResearching && startTime) {
      const elapsed = Date.now() - parseInt(startTime);
      if (elapsed < 120000) {
        // Research might still be running - show message
        console.log('Research may still be running in background');
      } else {
        localStorage.removeItem('owp_researching');
        localStorage.removeItem('owp_research_start');
      }
    }
  }, []);

  const { data: bankrollSettings } = useQuery({
    queryKey: ['bankrollSettings'],
    queryFn: async () => {
      const result = await base44.entities.BankrollSettings.list();
      return result[0] || null;
    },
  });

  const runResearch = async () => {
    if (inputMode === "screenshot" && (!fileUrls || fileUrls.length === 0)) return;
    if (inputMode === "manual" && !manualInput.trim()) return;
    setIsResearching(true);
    setMultipleAnalysis(null);
    setResearchProgress(0);

    try {
      await performResearch();
    } catch (error) {
        console.error('Research error:', error);
        const errorMsg = error.message || 'Research failed';
        if (errorMsg.includes('timeout') || errorMsg.includes('verification')) {
          toast.error('Research window (120s) exceeded. Data verification incomplete — retry with fewer plays or clearer game state.', {
            duration: 6000,
          });
        } else if (errorMsg.includes('502')) {
          toast.error('Server error. Please retry.', {
            duration: 5000,
          });
        } else {
          toast.error(errorMsg, {
            duration: 5000,
          });
        }
        setIsResearching(false);
        setResearchProgress(0);
      }
  };

  const getPlayUniqueKey = (parsed) => {
    const { sport_type, teams, market_type, player, line, segment, timing } = parsed;
    const playerPart = player && market_type === "player_prop" ? `-${player.toLowerCase().trim()}` : '';
    const linePart = line ? `-${line.toLowerCase().trim()}` : '';
    const segmentPart = segment ? `-${segment.toLowerCase().trim()}` : '';
    return `${sport_type?.toLowerCase()}-${teams?.toLowerCase().trim()}-${market_type}${playerPart}${linePart}${segmentPart}-${timing}`;
  };

  const performResearch = async () => {
    const allPlays = [];
    setResearchProgress(5);

    // Step 1: Parse input (screenshot or manual)
    if (inputMode === "manual" && manualInput.trim()) {
      // Parse manual text input
      setResearchProgress(15);
      const parseResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse this betting play description into structured format:
      "${manualInput}"

      CRITICAL: Extract line as NEUTRAL NUMBER ONLY. Strip all directional words (Over, Under, O, U, +, -).

      Extract:
      - sport_type: the sport (NBA, NFL, MLB, NHL, CS2, Dota2, LoL, UFC, Soccer, etc.)
      - league_or_competition: the league or tournament
      - teams: the teams or contestants
      - market_type: one of (total, spread, moneyline, player_prop, team_prop, quarter_prop, half_prop, map_handicap, series_market, other)
      - timing: "pregame" or "live"
      - segment: full game, 1st half, 2nd half, 1Q, 2Q, 3Q, 4Q, etc.
      - player: player name if it's a player prop
      - line: ONLY the numeric value (e.g., "224.5", "7.5", "21.5") — NO directional words
      - odds: the odds if mentioned
      - game_state: if live, any score/time info mentioned

      Return a single play object.`,
        response_json_schema: {
          type: "object",
          properties: {
            sport_type: { type: "string" },
            league_or_competition: { type: "string" },
            teams: { type: "string" },
            market_type: { type: "string" },
            timing: { type: "string" },
            segment: { type: "string" },
            player: { type: "string" },
            line: { type: "string" },
            odds: { type: "string" },
            game_state: { type: "string" }
          }
        }
      });

      allPlays.push(parseResult);
      setResearchProgress(25);
    } else if (inputMode === "screenshot" && fileUrls.length > 0) {
      // Parse screenshots - limit to 3 to avoid timeouts
      const filesToParse = fileUrls.slice(0, 3);
      if (fileUrls.length > 3) {
        toast.warning('Processing first 3 screenshots. For best results, analyze 1-3 plays at a time.', {
          duration: 4000,
        });
      }
      
      let parsedCount = 0;
      for (const fileUrl of filesToParse) {
        setResearchProgress(5 + (parsedCount / filesToParse.length) * 20);
        
        try {
          const parseResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a sports betting screenshot parser. Analyze this sportsbook screenshot and extract ALL betting plays visible.

          This screenshot may contain 1 or more plays. Extract each play separately.

          CRITICAL: Extract line as NEUTRAL NUMBER ONLY. Strip all directional words (Over, Under, O, U, +, -).

          For each play, extract these fields:
          - sport_type: the sport (NBA, NFL, MLB, NHL, CS2, Dota2, LoL, UFC, Soccer, etc.)
          - league_or_competition: the league or tournament
          - teams: the teams or contestants
          - market_type: one of (total, spread, moneyline, player_prop, team_prop, quarter_prop, half_prop, map_handicap, series_market, other)
          - timing: "pregame" or "live"
          - segment: full game, 1st half, 2nd half, 1Q, 2Q, 3Q, 4Q, specific map (Map 1, Map 2, Map 3, Maps 1-3), etc.
          - player: CRITICAL - Extract the player/gamer name prominently displayed. For esports, this is often shown at the top with team name. Look for names like "Lyonz", "Isles", player handles, or athlete names. NEVER leave this blank if a player name is visible.
          - line: ONLY the numeric value (e.g., "224.5", "7.5", "21.5", "1.5") — NO directional words like Over, Under, O, U
          - odds: the odds shown
          - game_state: if live, any visible score/period/time info as a string

          IMPORTANT: For esports player props, the player name is usually prominently displayed at the top of the interface. Extract it carefully.

          Return an array of plays.`,
        file_urls: [fileUrl],
        response_json_schema: {
          type: "object",
          properties: {
            plays: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sport_type: { type: "string" },
                  league_or_competition: { type: "string" },
                  teams: { type: "string" },
                  market_type: { type: "string" },
                  timing: { type: "string" },
                  segment: { type: "string" },
                  player: { type: "string" },
                  line: { type: "string" },
                  odds: { type: "string" },
                  game_state: { type: "string" }
                }
              }
            }
          }
        }
      });

          const plays = parseResult.plays || [];
          plays.forEach(play => {
            play.screenshot_url = fileUrl;
            allPlays.push(play);
          });
          parsedCount++;
          setResearchProgress(5 + (parsedCount / filesToParse.length) * 20);
        } catch (parseError) {
          console.error('Parse error for screenshot:', parseError);
          // Continue with other screenshots even if one fails
          parsedCount++;
        }
      }
      
      if (allPlays.length === 0) {
        throw new Error('Could not parse any plays from screenshots. Please try again or use manual input.');
      }
    }

    // Step 2: Check for existing plays and research new ones
    setResearchProgress(30);
    
    // Get all existing plays from the last 7 days
    const recentPlays = await base44.entities.ParsedPlay.list('-created_date', 500);
    const recentPlaysMap = new Map();
    
    // Create a map of recent plays by their unique key
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    recentPlays.forEach(play => {
      const playDate = new Date(play.created_date);
      if (playDate >= sevenDaysAgo && play.status === "complete") {
        const key = getPlayUniqueKey(play);
        if (!recentPlaysMap.has(key) || new Date(play.created_date) > new Date(recentPlaysMap.get(key).created_date)) {
          recentPlaysMap.set(key, play);
        }
      }
    });

    const analysisPromises = allPlays.map(async (parsed, idx) => {
      // Check if we already have this play analyzed
      const playKey = getPlayUniqueKey(parsed);
      const existingPlay = recentPlaysMap.get(playKey);
      
      if (existingPlay) {
        // Return existing analysis instead of re-running
        return {
          parsed: { ...parsed, screenshot_url: parsed.screenshot_url || "" },
          research: {
            game_time: existingPlay.game_time,
            live_game_state: existingPlay.game_state,
            recommendation: existingPlay.recommendation,
            projection: existingPlay.projection,
            fair_line: existingPlay.fair_line,
            edge_percent: existingPlay.edge_percent,
            confidence_score: existingPlay.confidence_score,
            safe_alternate: existingPlay.safe_alternate,
            safe_alternate_explanation: existingPlay.safe_alternate_explanation,
            write_up: existingPlay.write_up,
            factors: existingPlay.factors
          },
          savedPlay: existingPlay,
          isExisting: true
        };
      }
      
      // Run new research for plays we haven't seen before
      const isLive = parsed.timing === "live";
      
      // LIVE VERIFICATION PROTOCOL - Lightweight, timeout-protected
      let verifiedLiveState = null;
      if (isLive) {
        try {
          const liveVerification = await Promise.race([
            base44.functions.invoke('fetchLiveGameData', {
              teams: parsed.teams,
              sport_type: parsed.sport_type,
              league: parsed.league_or_competition
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Live verification timeout')), 5000)
            )
          ]);

          if (liveVerification?.data?.is_live) {
            verifiedLiveState = {
              teams: parsed.teams,
              sport: parsed.sport_type,
              score: `${liveVerification.data.score_home}-${liveVerification.data.score_away}`,
              period: liveVerification.data.period,
              time_remaining: liveVerification.data.time_remaining,
              source: "The Odds API",
              data_source: "The Odds API",
              is_live: true,
              last_updated: new Date().toISOString()
            };

            parsed.game_state = JSON.stringify({
              score_home: liveVerification.data.score_home,
              score_away: liveVerification.data.score_away,
              verified: true
            });

            setVerifiedLiveStates(prev => {
              const updated = new Map(prev);
              updated.set(idx, verifiedLiveState);
              return updated;
            });
          }
        } catch (liveVerifyError) {
          console.warn('Live verification skipped - proceeding with screenshot data');
        }
      }

      // Deep research
      const isPlayerProp = parsed.market_type === "player_prop";
      const sportLower = parsed.sport_type?.toLowerCase() || '';
      const isNBA = sportLower.includes('nba');
      const isNCAA = sportLower.includes('ncaab') || sportLower.includes('college basketball');
      const isNFL = sportLower.includes('nfl');
      const isNCAAF = sportLower.includes('ncaaf') || sportLower.includes('college football');
      const isNHL = sportLower.includes('nhl') || sportLower.includes('hockey');
      const isTennis = sportLower.includes('tennis');
      const isEsports = sportLower.includes('cs2') || sportLower.includes('cs:go') || sportLower.includes('valorant') || sportLower.includes('dota') || sportLower.includes('league') || sportLower.includes('lol') || sportLower.includes('call of duty') || sportLower.includes('esports');
      const isSoccer = sportLower.includes('soccer') || sportLower.includes('football');
      const isBasketball = isNBA || isNCAA;
      const isFootball = isNFL || isNCAAF;

      const researchPrompt = isPlayerProp ? `PLAYER PROP ANALYSIS - ${parsed.sport_type}
      PLAYER: ${parsed.player || 'N/A'}
      GAME: ${parsed.teams}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      ${parsed.timing === "live" ? "⚡ LIVE GAME" : "📅 PREGAME"}

      ${isNBA ? `
      ═══════════════════════════════════════════
      🏀 NBA RESEARCH MODULE (10-LAYER FRAMEWORK)
      ═══════════════════════════════════════════

      🧮 MODELING LAYERS (APPLY ALL FOR NBA):

      1️⃣ GAME ENVIRONMENT:
      - Team pace (season + last 10 games)
      - Opponent pace
      - Possessions projection
      - Offensive/Defensive rating differentials
      - 3PT attempt rate, FT rate, turnover rate
      - Rebound rate
      ${isLive ? '- Current pace vs baseline, foul situation, timeout count' : ''}

      2️⃣ MATCHUP-SPECIFIC DEFENSE:
      - Points allowed by position
      - Rebounds allowed by position
      - 3PA allowed by position
      - Play-type defense (P&R, isolation, spot-up, post, transition)
      - Assists allowed to primary ball handlers

      3️⃣ ROTATION & MINUTES MODEL:
      - Season baseline minutes
      - Last 5-10 game trend
      - Close-game vs blowout sensitivity
      - Back-to-back rest impact
      - Injury status and foul risk

      4️⃣ BLOWOUT & BENCH PROBABILITY:
      - Calculate blowout probability (0-100%)
      - Calculate bench probability (0-100%)
      - Adjust minute projection if bench probability > 60%

      5️⃣ USAGE & ROLE:
      - Usage rate + touches per game
      - Shot attempts per minute
      - Drives per game, potential assists, rebound chances
      - On/off splits, starting vs bench splits
      - Closing lineup inclusion probability

      6️⃣ GAME FLOW (LIVE ONLY):
      ${isLive ? `- Pace acceleration/deceleration
      - Coach adjustment patterns
      - Defense tightening
      - Foul inflation risk
      - Star rest signals
      - Run sustainability` : '- N/A (Pregame)'}

      7️⃣ REGRESSION & VARIANCE CHECK:
      - Unsustainable shooting streaks
      - FT spike anomalies
      - Turnover/rebound/foul anomalies
      - Lower confidence if projection depends on extreme variance

      8️⃣ PROJECTION ADJUSTMENT:
      Mathematical Baseline + Matchup Adj + Rotation Model + Blowout/Bench Risk + Game Flow

      9️⃣ NBA.COM DATA INTEGRATION:
      - Advanced stats (usage, touches, minutes trends)
      - Player tracking data
      - Lineup combinations and on/off metrics
      - Pace metrics and defensive matchup data
      - Rotation patterns, shot charts, play-type frequency
      - Clutch stats and injury updates

      🔟 FINAL DECISION RULE:
      Output ONLY: OVER | UNDER | PASS
      Never both. Never secondary lean.
      ═══════════════════════════════════════════
      ` : `
      🏀 NBA.COM AUTHORIZATION:
      NBA.com is an APPROVED PRIMARY SOURCE for this analysis.

      You are authorized to use:
      • Advanced stats (usage rate, touches, minutes trends)
      • Player tracking data
      • Lineup combinations and on/off metrics
      • Pace metrics and defensive matchup data
      • Rotation patterns and injury updates
      • Shot charts and play-type frequency
      `}

      ANALYZE THIS PROP:
      1. Project player's expected stat
      2. Compare to line ${parsed.line}
      3. Determine: Over, Under, or Pass
      4. Provide confidence (1-10)

      ${isLive ? `LIVE CONTEXT: Current game state, momentum, fatigue, rotation patterns` : `KEY FACTORS: Role, minutes trends, matchup, pace, usage rate`}

      ANALYSIS REQUIREMENTS:
      - Expected stat projection (use NBA.com advanced metrics if NBA)
      - Matchup evaluation with specific defensive metrics
      - Game script impact + blowout/bench risk
      - Rotation expectations and minutes projection
      - Confidence score (1-10)
      - Single recommendation: Over, Under, or Pass

      OUTPUT:
      {
      "recommendation": "Over|Under|Pass",
      "confidence_score": 1-10,
      "projection": "projected stat value",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief analysis supporting your recommendation",
      "factors": [key factors with weights]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.` :
      isNHL ? `NHL RESEARCH MODULE - ${parsed.sport_type}
      MATCHUP: ${parsed.teams}
      MARKET: ${parsed.market_type}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      ${parsed.timing === "live" ? "⚡ LIVE GAME" : "📅 PREGAME"}

      ═══════════════════════════════════════════
      🏒 NHL 12-LAYER RESEARCH FRAMEWORK
      ═══════════════════════════════════════════

      1️⃣ GOALIE MODEL (PRIMARY DRIVER)
      • Starting goalie, Backup risk, Save % (recent vs baseline)
      • High-danger save %, Goals Saved Above Expected concept
      • Rebound control, Rest days, Travel fatigue
      → Goalie uncertain? Lower confidence. Elite goalie? Lower total baseline.

      2️⃣ TEAM STYLE & PACE MODEL
      • Shot attempts per game, High-danger chances for/against
      • Corsi/Fenwick shot share (conceptually)
      • Transition speed vs structured offense, Offensive/Defensive zone time
      → One team dominates shot share? Adjust ML/puck line.

      3️⃣ SPECIAL TEAMS MODEL (CRITICAL)
      • Power play efficiency, Penalty kill efficiency
      • Penalty rate per game, Ref tendencies, Discipline differences
      → High-penalty matchup? Increase volatility/total. Both elite PK? Suppress total.

      4️⃣ LINE MATCHUPS & DEPLOYMENT
      • Top line vs shutdown line, Home ice last change advantage
      • Defensive pair vs star forwards, TOI distribution
      • Top-6 vs bottom-6 scoring reliance
      → Star line heavily favored? Increase player shot/point projection.

      5️⃣ INJURY & DEPTH IMPACT
      • Top-6 forward availability, Top-4 defensemen availability
      • Backup goalie forced start, Special teams unit changes
      → Top defenseman out? Increase opponent scoring.

      6️⃣ SHOOTING VARIANCE & REGRESSION MODEL
      • Shooting % spikes, Save % spikes, PDO-style variance
      • Recent finishing luck, Unsustainable hot streaks
      → Scoring at unsustainable rate? Expect downward regression.

      7️⃣ LIVE ADJUSTMENT (IF LIVE)
      • Score, Period, Time remaining, Shot count
      • High-danger trend, Empty net probability
      • Goalie pull timing, Penalty trouble, Momentum shifts
      → Heavy shot dominance but tied? Increase scoring probability.

      8️⃣ PLAYER PROP MODELING

      Shots on Goal:
      TOI × Shot Rate × Matchup Quality × PP Time
      Adjust for: Top PP unit vs secondary, Defensive suppression

      Points / Goals:
      Ice time × Shot quality × Line chemistry × Opponent weakness
      Adjust for: PP usage, Goalie weakness

      Goalie Saves:
      Expected shots against × Save % baseline
      Adjust for: Opponent pace, Defensive suppression, Score effects

      9️⃣ TOTALS MODEL
      Expected Shot Volume + High-Danger Rate + Goalie Strength + Special Teams + Empty Net
      → Close late? Increase empty net risk/over boost. Defensive + elite goalies? Suppress total.

      🔟 ML / PUCK LINE MODEL
      • Shot quality differential, Goalie advantage
      • Special teams edge, Depth scoring advantage, Home ice impact
      → Translate to win probability and margin projection.

      1️⃣1️⃣ PROJECTION INTEGRATION
      Goalie + Shot Share + Special Teams + Line Matchups + Injury Impact
      → Multiple volatile variables? Reduce confidence.

      1️⃣2️⃣ FINAL DECISION RULE
      Output ONLY: OVER | UNDER | SIDE | PASS
      Never both. Never hedge.

      ═══════════════════════════════════════════

      ANALYZE THIS PLAY:
      1. Apply all 12 NHL layers
      2. Project outcome
      3. Compare to line ${parsed.line}
      4. Single recommendation: Over/Under/Side/Pass
      5. Confidence (1-10)

      OUTPUT:
      {
      "recommendation": "Over|Under|Side|Pass",
      "confidence_score": 1-10,
      "projection": "projected outcome",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief NHL-focused analysis",
      "factors": [key factors]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.` :
      isSoccer ? `SOCCER RESEARCH MODULE - ${parsed.sport_type}
      MATCHUP: ${parsed.teams}
      MARKET: ${parsed.market_type}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      ${parsed.timing === "live" ? "⚡ LIVE MATCH" : "📅 PREGAME"}

      ═══════════════════════════════════════════
      ⚽ SOCCER 11-LAYER RESEARCH FRAMEWORK
      ═══════════════════════════════════════════

      1️⃣ LINEUP & AVAILABILITY (MANDATORY)
      • Starting XI confirmation, Injuries, Suspensions
      • Rotation risk, Fixture congestion, Travel fatigue
      → Star striker out? Lower team goal projection.
      → CB pairing weakened? Increase opponent scoring.

      2️⃣ TACTICAL MATCHUP MODEL
      • Formation vs formation, Press intensity vs build-up
      • High line vs counterattack threat, Low block vs possession
      • Wing-heavy vs central play
      → Pressing team vs weak defense? Increase turnover chances.

      3️⃣ CHANCE CREATION MODEL
      • Shots per match, Shots on target per match
      • Big chances created/conceded, Set piece strength
      • Corner frequency, Expected goals patterns
      → Both teams high-quality chance generators? Increase total.

      4️⃣ GAME IMPORTANCE & MOTIVATION
      • Must-win scenario, Relegation pressure
      • Title race implications, Cup sandwich spot
      • Rotation risk before big match
      → Motivation shifts pace and aggression.

      5️⃣ WEATHER & PITCH ADJUSTMENT
      • Rain (slower tempo, sloppy defense)
      • Wind (cross quality impact), Heat (second half fade)
      • Pitch quality degradation
      → Poor conditions suppress total slightly.

      6️⃣ RED CARD RISK (IF LIVE)
      • Historical discipline rate, Referee assignment
      • Tactical fouling tendencies
      → Red card drastically alters projections (immediate adjustment needed).

      7️⃣ GAME FLOW INTERPRETATION (IF LIVE)
      • Expected goals dominance vs scoreboard
      • Pace changes post-goal, Press intensity trending
      • Trailing team urgency, Leading team structure
      → Project future trajectory, not just current score.

      8️⃣ LATE-GAME DYNAMICS (IF LIVE 70+)
      • Urgency level, Defensive bunker mode
      • Substitution patterns, Counterattack space
      → Close matches often inflate over probability late.

      9️⃣ TOTAL GOALS MODEL
      Expected Chances + Defensive Structure + Tactical Tempo + Game State + Red Card Risk
      → Conservative both teams? Suppress total. Open, high-press? Increase total.

      🔟 SIDE / HANDICAP MODEL
      • True quality differential, Tactical edge
      • Depth advantage, Home field impact
      • Set piece edge (corners, throw-ins)
      → Translate into win probability and margin.

      1️⃣1️⃣ REGRESSION & VARIANCE CHECK
      • Finishing variance, Keeper overperformance
      • Unsustainable conversion, Fluke goals
      → Projection depends on rare finishing? Lower confidence.

      FINAL INTEGRATION:
      Lineup + Tactical + Chance Creation + Motivation + Weather + Game State + Variance
      → Thin edge = PASS.

      ═══════════════════════════════════════════

      ANALYZE THIS PLAY:
      1. Apply all 11 Soccer layers
      2. Project outcome
      3. Compare to line ${parsed.line}
      4. Single recommendation: Over/Under/Side/Pass
      5. Confidence (1-10)

      OUTPUT:
      {
      "recommendation": "Over|Under|Side|Pass",
      "confidence_score": 1-10,
      "projection": "projected outcome",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief Soccer-focused analysis",
      "factors": [key factors]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.` :
      isEsports && parsed.timing === "pregame" ? `ESPORTS PREGAME RESEARCH MODULE - ${parsed.sport_type}
      MATCHUP: ${parsed.teams}
      MARKET: ${parsed.market_type}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      FORMAT: Pre-Game

      ═══════════════════════════════════════════
      🎮 ESPORTS 11-LAYER PREGAME FRAMEWORK
      ═══════════════════════════════════════════

      1️⃣ IDENTIFY GAME TITLE (MANDATORY)
      Detect: CS2 / CS:GO / Valorant / League of Legends / Dota 2 / Call of Duty / Other
      → Model logic must match game type. Do NOT mix FPS with MOBA logic.

      2️⃣ FORMAT & STRUCTURE MODEL
      • BO1 / BO3 / BO5, LAN vs Online
      • Group stage vs Elimination, Tournament pressure level
      → BO1 = high variance, lower confidence
      → BO3/BO5 = moderate/lower variance, skill depth matters

      3️⃣ MAP POOL & VETO MODEL (FPS TITLES)
      For CS2/Valorant:
      • Each team's strongest/weakest maps
      • Expected veto order, Map win % splits
      • Side preference (CT/T or Attack/Defense)
      • Pistol win %, Eco round conversion %
      → Heavy pool advantage? Increase ML/spread confidence.
      → Mirrored pools? Increase total maps probability.

      4️⃣ TEAM FORM & STABILITY MODEL
      • Last 5-10 series, Opponent strength weighting
      • Roster stability, Recent roster/IGL/coaching changes
      • LAN vs Online performance differential
      → New roster? Increase volatility, reduce confidence.
      → Established roster? Higher confidence.

      5️⃣ ROLE & PLAYER IMPACT MODEL
      • Star carry consistency, Entry frag/AWP stability (FPS)
      • Kill participation, Objective involvement (MOBA)
      • Clutch rate, Economy dependence (FPS)
      • Scaling champion reliance (MOBA)
      → Overly dependent on one star? Increase upset volatility.

      6️⃣ META / PATCH IMPACT MODEL
      • Recent patch changes, Weapon/meta shifts
      • Champion balance shifts, Strategy shifts
      → Patch changed recently? Increase variance, reduce confidence slightly.

      7️⃣ SERIES TOTAL MODEL
      For Over/Under Maps:
      • Map competitiveness gap, Clutch variance likelihood
      • Skill gap width, Map pool overlap, Format
      → Evenly matched? Lean Over. Severe skill gap? Lean Under (sweep risk).

      8️⃣ PLAYER PROP MODEL (PREGAME)
      Project based on:
      • Expected maps played, Role stability
      • Average kills/assists per map
      • Team tempo, Match competitiveness
      • Blowout/sweep risk
      → Sweep likely? Reduce player stat ceiling.

      9️⃣ VARIANCE & CHAOS CHECK
      • BO1 randomness, Meta volatility
      • Momentum-dependent teams, LAN nerves
      • Roster instability
      → Fragile assumptions? Lower confidence or PASS.

      🔟 PROJECTION INTEGRATION
      Map Pool Edge + Role Stability + Format Variance + Form/Roster + Meta Impact
      → Thin edge = PASS.

      1️⃣1️⃣ FINAL DECISION RULE
      Output ONLY: OVER | UNDER | SIDE | PASS
      Never both. Never secondary lean.

      ═══════════════════════════════════════════

      ANALYZE THIS PLAY:
      1. Apply all 11 Esports layers
      2. Project outcome
      3. Compare to line ${parsed.line}
      4. Single recommendation: Over/Under/Side/Pass
      5. Confidence (1-10)

      OUTPUT:
      {
      "recommendation": "Over|Under|Side|Pass",
      "confidence_score": 1-10,
      "projection": "projected outcome",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief Esports-focused analysis",
      "factors": [key factors]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.` :
      isTennis ? `TENNIS RESEARCH MODULE - ${parsed.sport_type}
      MATCHUP: ${parsed.teams}
      MARKET: ${parsed.market_type}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      ${parsed.timing === "live" ? "⚡ LIVE MATCH" : "📅 PREGAME"}

      ═══════════════════════════════════════════
      🎾 TENNIS 14-LAYER RESEARCH FRAMEWORK
      ═══════════════════════════════════════════

      1️⃣ MATCH CONTEXT MODEL (MANDATORY)
      • Tournament level (Grand Slam / ATP 1000 / 500 / 250 / Challenger)
      • Surface (Hard / Clay / Grass / Indoor Hard)
      • Format (Best of 3 vs Best of 5)
      • Indoor vs Outdoor, Weather (wind impacts serve heavily)
      → Surface must meaningfully influence projection.

      2️⃣ SERVE MODEL (PRIMARY DRIVER)
      • Hold %, 1st serve %, 1st/2nd serve points won
      • Ace rate, Double fault rate, Break point save %
      • Tiebreak frequency
      → Big server on grass? Increase hold stability. Poor 2nd serve vs strong returner? Increase break probability.

      3️⃣ RETURN MODEL
      • Break %, Return points won, Return games won
      • Performance vs big servers, vs lefty/righty
      → Return dominance heavily impacts spreads and totals.

      4️⃣ SURFACE-SPECIFIC ADJUSTMENT
      Clay: More breaks, longer rallies, higher physical demand, fewer tiebreaks
      Grass: Serve-dominant, more tiebreaks, faster points
      Indoor Hard: High serve efficiency, less wind variance
      → Adjust total games projection accordingly.

      5️⃣ MATCHUP FIT MODEL
      • Lefty vs righty, Backhand weakness exposure
      • Rally tolerance, Aggressor vs counterpuncher
      • Net play advantage, Cross-court vs down-the-line patterns
      → Stylistic mismatch? Adjust ML meaningfully.

      6️⃣ FITNESS & FATIGUE MODEL
      • Previous match length, 3-set vs 5-set fatigue
      • Medical timeouts prior, Injury history
      • Travel time, Back-to-back match days
      → Recent 3-hour match? Reduce late-set stamina.

      7️⃣ MENTAL & CLOSING PROFILE
      • Tiebreak performance, Pressure serving patterns
      • Break conversion %, Set-closing ability
      → Use measurable patterns only, not narrative.

      8️⃣ LIVE ADJUSTMENT (IF LIVE)
      • Current set score, Game score, Break differential
      • Momentum shifts, Serve dominance holding
      • Physical fade risk, Break trend sustainability
      • Tiebreak likelihood
      → Adjust forward-looking, not reactive only.

      9️⃣ TOTAL GAMES MODEL
      Expected hold probability + Break likelihood + Tiebreak probability + Surface adjustment + Fitness impact
      → Both strong servers? Higher over. Strong returner vs weak server? Higher under.

      🔟 SPREAD MODEL
      Expected set patterns + Break distribution + Surface break frequency
      → Heavy favorite but both hold strong? Spread fragile.

      1️⃣1️⃣ ML MODEL
      Serve strength + Return strength + Surface edge + Fitness + Matchup style + Pressure resilience
      → Translate to win probability.

      1️⃣2️⃣ VARIANCE & CHAOS CHECK
      • Retirement risk, Injury mid-match
      • Weather interruption, Serve rhythm loss
      → Fragile projection? Lower confidence.

      1️⃣3️⃣ PROJECTION INTEGRATION
      Serve + Return + Surface + Fitness + Matchup Fit
      → Thin edge = PASS.

      1️⃣4️⃣ FINAL DECISION RULE
      Output ONLY: OVER | UNDER | SIDE | PASS
      Never both. Never hedge.

      ═══════════════════════════════════════════

      ANALYZE THIS PLAY:
      1. Apply all 14 Tennis layers
      2. Project outcome
      3. Compare to line ${parsed.line}
      4. Single recommendation: Over/Under/Side/Pass
      5. Confidence (1-10)

      OUTPUT:
      {
      "recommendation": "Over|Under|Side|Pass",
      "confidence_score": 1-10,
      "projection": "projected outcome",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief Tennis-focused analysis",
      "factors": [key factors]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.` :
      isMLB ? `MLB RESEARCH MODULE - ${parsed.sport_type}
      MATCHUP: ${parsed.teams}
      MARKET: ${parsed.market_type}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      ${parsed.timing === "live" ? "⚡ LIVE GAME" : "📅 PREGAME"}

      ═══════════════════════════════════════════
      ⚾ MLB 11-LAYER RESEARCH FRAMEWORK
      ═══════════════════════════════════════════

      1️⃣ STARTING PITCHER MODEL (PRIMARY DRIVER)
      For both pitchers evaluate:
      • Handedness, K%, BB%, HR/9
      • GB% / FB%, Hard-hit rate, Barrel rate
      • Pitch count trends
      • 1st / 2nd / 3rd time through order splits
      • Home vs Away splits, Recent velocity trend
      • Injury return or pitch limit risk

      If pitcher has short leash → Increase bullpen impact weighting.

      2️⃣ BULLPEN MODEL (CRITICAL FOR ML & TOTALS)
      • Bullpen ERA / WHIP trend
      • Recent usage (last 3 days innings)
      • High-leverage arms availability
      • Closer usage patterns, Setup depth
      • Left/right specialist availability

      If bullpen heavily used prior day → Increase late-inning scoring probability.

      3️⃣ LINEUP & PLATOON MATCHUP MODEL
      • Official starting lineup, Late scratches, Rest days
      • Platoon splits (LHP vs RHP performance)
      • K-prone hitters vs high-K pitcher
      • Power profile vs fly-ball pitcher
      • OBP chain at top of order

      If multiple hitters struggle vs pitcher handedness → Adjust run projection downward.

      4️⃣ PARK & WEATHER MODEL (MANDATORY)
      • Park factor (HR-friendly, pitcher-friendly)
      • Wind direction & speed, Temperature (ball carry)
      • Humidity, Dome vs outdoor, Rain delay risk

      If wind blowing out strongly → Increase HR & total projection.
      If wind blowing in → Suppress power output.

      5️⃣ DEFENSIVE & CATCHER MODEL
      • Team defensive quality
      • Catcher framing (K props impact)
      • Catcher pop time (SB props)
      • Defensive alignment trends

      If elite framing catcher → Increase strikeout projection slightly.

      6️⃣ RUN EXPECTANCY & GAME SCRIPT MODEL
      • Run support mismatch
      • Offense strength differential
      • Likelihood of bullpen usage early
      • Extra innings probability

      ${parsed.timing === "live" ? "• Inning, Outs, Base runners, Current pitcher pitch count, Bullpen warming, Run sustainability" : ""}

      7️⃣ PLAYER PROP MODELING

      Pitcher Strikeouts:
      Pitch count ceiling × K rate × Opponent K% × Ump zone
      Adjust for: Pitch count leash, Blowout removal risk, Contact-heavy opponent

      Hitter Props (Hits/TB/HR):
      Plate Appearances × Contact Quality × Pitcher matchup × Park & weather × Bullpen exposure
      Adjust for: Platoon disadvantage, Elite closer late

      8️⃣ REGRESSION & VARIANCE CHECK
      • BABIP spikes, HR/FB unsustainable trends
      • Strand rate anomalies, Bullpen meltdown reliance

      If projection relies on unsustainable HR surge → Lower confidence.

      9️⃣ PROJECTION INTEGRATION
      Starting Pitcher + Bullpen + Lineup Matchups + Park & Weather + Defensive Impact

      If edge thin → PASS.

      🔟 LIVE ADJUSTMENT (IF LIVE)
      ${parsed.timing === "live" ? "• Current pitcher fatigue, Pitch velocity drop, Manager hook tendencies, Bullpen readiness, Base runner traffic trend" : ""}

      1️⃣1️⃣ FINAL DECISION RULE
      Output ONLY: OVER | UNDER | SIDE | PASS
      Never both. Never hedge.

      ═══════════════════════════════════════════

      ANALYZE THIS PLAY:
      1. Apply all 11 MLB layers
      2. Project outcome
      3. Compare to line ${parsed.line}
      4. Single recommendation: Over/Under/Side/Pass
      5. Confidence (1-10)

      OUTPUT:
      {
      "recommendation": "Over|Under|Side|Pass",
      "confidence_score": 1-10,
      "projection": "projected outcome",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief MLB-focused analysis",
      "factors": [key factors]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.` :
      isSoccer ? `SOCCER GAME/SERIES ANALYSIS - ${parsed.sport_type}
      MATCHUP: ${parsed.teams}
      MARKET: ${parsed.market_type}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      ${parsed.timing === "live" ? "⚡ LIVE" : "📅 PREGAME"}

      ═══════════════════════════════════════════
      ⚽ SOCCER MATCH FRAMEWORK
      ═══════════════════════════════════════════

      1️⃣ TEAM QUALITY & DEPTH
      • Starting XI strength, Bench quality
      • Key player availability, Injury depth impact
      → Injuries to key positions reduce quality rating.

      2️⃣ TACTICAL SYSTEM
      • Formation fit, Positional balance
      • Manager philosophy (possession vs counter)
      • Formation flexibility vs opponent
      → Tactical advantage quantifiable through matchup fit.

      3️⃣ CHANCE QUALITY
      • xG per match (both teams)
      • Conversion rate trending
      • Shot quality patterns
      → High xG difference = stronger projection confidence.

      4️⃣ POSSESSION & CONTROL
      • Expected possession %, Pace tempo
      • Build-up style vs direct play
      • Transition frequency
      → Control indicates quality but not always goals.

      5️⃣ DEFENSIVE STRUCTURE
      • Defensive line height, Press scheme
      • Back four coordination, Keeper distribution
      • Set piece defense vulnerability
      → Defensive lapses create chance architecture.

      6️⃣ SET PIECE STRENGTH
      • Corner conversion rate, Free kick threat
      • Throw-in intensity, Defensive set piece leaks
      → Can swing totals and margins significantly.

      7️⃣ HOME/AWAY DIFFERENTIAL
      • Home form vs away form (both teams)
      • Crowd impact quality, Travel fatigue
      • Pitch familiarity
      → Home advantage quantifiable 0.3-0.5 goal swing.

      8️⃣ RECENT FORM & MOMENTUM
      • Last 5-10 match trend, Opponent quality weighting
      • Streak direction (up vs down)
      • Motivation confidence
      → Trending teams more predictable.

      9️⃣ LIVE STATE INTERPRETATION
      • Current score, Minute, Red cards
      • Shot count differential, Possession trend
      • Team positioning (siege vs bunker)
      → Forward-looking, not reactive-only.

      🔟 VARIANCE ASSESSMENT
      • Keeper form volatility
      • Finishing fortune variance
      • Fixture congestion impact
      → High variance = lower confidence.

      1️⃣1️⃣ FINAL DECISION RULE
      Output ONLY: OVER | UNDER | HOME | AWAY | PASS
      Never both. Never secondary lean.

      ═══════════════════════════════════════════

      ANALYZE THIS PLAY:
      1. Apply all 11 Soccer layers
      2. Project match outcome
      3. Compare to line ${parsed.line}
      4. Single recommendation: Over/Under/Home/Away/Pass
      5. Confidence (1-10)

      OUTPUT:
      {
      "recommendation": "Over|Under|Home|Away|Pass",
      "confidence_score": 1-10,
      "projection": "projected outcome",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief Soccer match analysis",
      "factors": [key factors]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.` :
      isEsports && parsed.timing === "pregame" ? `ESPORTS PREGAME GAME/SERIES ANALYSIS - ${parsed.sport_type}
      MATCHUP: ${parsed.teams}
      FORMAT: ${parsed.market_type === "total" ? "Series Total" : parsed.market_type === "spread" ? "Series Spread" : "Other"}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      TIMING: Pre-Game

      ═══════════════════════════════════════════
      🎮 ESPORTS PREGAME SERIES/MAP FRAMEWORK
      ═══════════════════════════════════════════

      1️⃣ GAME TITLE IDENTIFICATION
      Detect: CS2/CS:GO, Valorant, League, Dota 2, CoD, Other
      → Tailor model to game mechanics (FPS vs MOBA distinctions critical).

      2️⃣ FORMAT & STRUCTURE
      • BO1 (high variance), BO3 (moderate), BO5 (skill-dependent)
      • LAN vs Online impact, Tournament stage gravity
      → Higher stakes = better preparation, lower upsets.

      3️⃣ MAP POOL DYNAMICS (FPS TITLES)
      For CS2/Valorant series spreads:
      • Veto order advantage, Win % per map pair
      • Strongest/weakest map matchups
      • Side advantage (CT/T prevalence)
      • Anti-eco and full buy conversion trends
      → Veto advantage heavily impacts series spread.

      4️⃣ TEAM FORM (LAST 5-10 SERIES)
      • Win-loss trend, Opponent quality
      • Momentum trajectory, Consistency
      • Roster change impact
      → Strong uptrend + stable roster = higher confidence favorites.
      → Slump + roster issues = upset risk increases.

      5️⃣ ROLE DISTRIBUTION & STAR POWER
      • Star carry dominance tier
      • Support/utility role reliability (CS2: utility control)
      • Economy management (FPS) vs Scaling (MOBA)
      → Over-reliance on one player = vulnerability to counter-strats.

      6️⃣ META / PATCH RECENCY
      • Patch applied (< 1 week, 1-2 weeks, > 2 weeks)
      • Weapon balance shifts, Champion picks impact
      • Team meta preparation
      → Recent patch = higher preparation gap between teams matters more.

      7️⃣ SKILL GAP QUANTIFICATION
      • Elo/Rating differential
      • Head-to-head record if exists
      • Consistent performance spread
      → Large gap = lower series total (sweeps likely), higher spread favorites.
      → Small gap = higher series total (extended matches), closer spreads.

      8️⃣ LAN ENVIRONMENT ADJUSTMENT
      • Team LAN experience, Prep quality
      • Time zone / travel impact
      • Stage nerves risk (first LAN team?)
      → First LAN team more vulnerable. Seasoned LAN team more stable.

      9️⃣ SERIES TOTAL PROJECTION
      Expected maps + Competitiveness + Upset probability + Eco/Buy trends (FPS) + Scaling windows (MOBA)
      → Evenly matched = over total. Skill gap = under total.

      🔟 VARIANCE & CHAOS ASSESSMENT
      • BO1 swings, Meta volatility
      • Roster cohesion, LAN debut risk
      → Fragile projection = lower confidence or PASS.

      1️⃣1️⃣ FINAL DECISION RULE
      Output ONLY: OVER | UNDER | HOME | AWAY | PASS
      Never both. Never secondary lean.

      ═══════════════════════════════════════════

      ANALYZE THIS PLAY:
      1. Apply all 11 Esports Pregame layers
      2. Project series outcome/maps
      3. Compare to line ${parsed.line}
      4. Single recommendation: Over/Under/Home/Away/Pass
      5. Confidence (1-10)

      OUTPUT:
      {
      "recommendation": "Over|Under|Home|Away|Pass",
      "confidence_score": 1-10,
      "projection": "projected outcome",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief Esports Pregame analysis",
      "factors": [key factors]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.` : 
      `GAME TOTAL/SPREAD ANALYSIS - ${parsed.sport_type}
      GAME: ${parsed.teams}
      MARKET: ${parsed.market_type}
      LINE: ${parsed.line} | ODDS: ${parsed.odds}
      ${parsed.timing === "live" ? "⚡ LIVE GAME" : "📅 PREGAME"}

      ${isNBA ? `
      ═══════════════════════════════════════════
      🏀 NBA RESEARCH MODULE (10-LAYER FRAMEWORK)
      ═══════════════════════════════════════════

      🧮 MODELING LAYERS (APPLY ALL FOR NBA):

      1️⃣ GAME ENVIRONMENT:
      - Team pace (season + last 10 games)
      - Opponent pace
      - Possessions projection
      - Offensive/Defensive rating differentials
      - 3PT attempt rate, FT rate, turnover rate
      - Rebound rate
      ${isLive ? '- Current pace vs baseline, foul situation, timeout count' : ''}

      2️⃣ MATCHUP-SPECIFIC DEFENSE:
      - Points allowed by position
      - Rebounds allowed by position
      - 3PA allowed by position
      - Play-type defense (P&R ball handler, P&R roll man, isolation, spot-up, post, transition)
      - Assists allowed to primary ball handlers

      3️⃣ ROTATION & MINUTES MODEL:
      - Season baseline minutes
      - Last 5-10 game trend
      - Close-game vs blowout sensitivity
      - Back-to-back rest impact
      - Injury status and foul risk

      4️⃣ BLOWOUT & BENCH PROBABILITY:
      - Calculate blowout probability (0-100%)
      - Calculate bench probability (0-100%)
      - If bench probability > 60%, reduce player minute projection
      - Unders gain structural edge in high blowout risk scenarios

      5️⃣ TEAM TEMPO & PACE ANALYSIS:
      - Team pace (season + last 10 games)
      - Opponent pace
      - Possessions projection
      - Offensive/Defensive rating
      - Net rating differential

      6️⃣ GAME FLOW (LIVE ONLY):
      ${isLive ? `- Pace acceleration/deceleration
      - Coach adjustment patterns
      - Defense tightening
      - Foul inflation risk late
      - Intentional fouling probability
      - Star rest signals
      - Run sustainability` : '- N/A (Pregame)'}

      7️⃣ REGRESSION & VARIANCE CHECK:
      - Hot shooting (3PT unsustainable)
      - Free throw spikes
      - Turnover anomalies
      - Offensive rebounding spikes
      - Foul rate anomalies
      - Lower confidence if projection depends on extreme variance

      8️⃣ PROJECTION ADJUSTMENT:
      Mathematical Baseline + Matchup Adj + Rotation Model + Blowout/Bench Risk + Game Flow

      9️⃣ NBA.COM DATA INTEGRATION:
      - Advanced team stats and pace metrics
      - Lineup combinations and on/off metrics
      - Defensive matchup data
      - Injury updates and rotation patterns
      - Clutch stats and play-type frequency

      🔟 FINAL DECISION RULE:
      Output ONLY: OVER | UNDER | HOME | AWAY | PASS
      Never both. Never secondary lean.
      ═══════════════════════════════════════════
      ` : `
      🏀 NBA.COM AUTHORIZATION:
      NBA.com is an APPROVED PRIMARY SOURCE for this analysis.

      You are authorized to use:
      • Advanced team stats and pace metrics
      • Lineup combinations and on/off metrics
      • Defensive matchup data
      • Injury updates and rotation patterns
      • Clutch stats and play-type frequency
      `}

      ANALYZE:
      1. Project final outcome
      2. Compare to line ${parsed.line}
      3. Determine: Over/Under/Home/Away or Pass
      4. Confidence (1-10)

      ${isLive ? `LIVE FACTORS: Current score, pace trend, momentum, time left, lineup strength
      ` : `PREGAME: Pace, matchup, trends, lineup combinations`}

      ANALYSIS REQUIREMENTS:
      - Project final score/outcome (use NBA.com advanced metrics if NBA)
      - Evaluate game environment (pace, tempo, possessions)
      - Matchup-specific defensive analysis
      - Rotation and blowout impact
      - Calculate edge vs line
      - Confidence score (1-10)
      - Single recommendation: Over/Under/Home/Away or Pass

      OUTPUT:
      {
      "recommendation": "Over|Under|Home|Away|Pass",
      "confidence_score": 1-10,
      "projection": "projected total/spread",
      "fair_line": "fair line estimate",
      "edge_percent": number,
      "write_up": "Brief analysis supporting recommendation",
      "factors": [key factors]
      }

      DECISION RULE: Choose ONE side or Pass. No hedging.`;

      // Single optimized call with 45s timeout (reduced from 60s)
      const researchResult = await Promise.race([
        base44.integrations.Core.InvokeLLM({
          prompt: researchPrompt,
          ...(parsed.screenshot_url ? { file_urls: [parsed.screenshot_url] } : {}),
          response_json_schema: {
            type: "object",
            properties: {
              recommendation: { type: "string", enum: ["Over", "Under", "Home", "Away", "Pass"] },
              projection: { type: "string" },
              fair_line: { type: "string" },
              edge_percent: { type: "number" },
              confidence_score: { type: "number", minimum: 1, maximum: 10 },
              write_up: { type: "string" },
              factors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    direction: { type: "string", enum: ["supports", "opposes", "neutral"] },
                    weight: { type: "number" },
                    description: { type: "string" }
                  }
                }
              }
            }
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analysis timeout - try fewer plays')), 45000)
        )
      ]);

      // Extract game time and live state from research result
      parsed.game_time = researchResult?.game_time || "";
      if (isLive && researchResult?.live_game_state) {
        parsed.game_state = researchResult.live_game_state;
      }

      // Save to DB
      const playData = {
          screenshot_url: parsed.screenshot_url,
          ...parsed,
        recommendation: researchResult?.recommendation || "Pass",
        projection: researchResult?.projection || "",
        fair_line: researchResult?.fair_line || "",
        edge_percent: researchResult?.edge_percent || 0,
        confidence_score: researchResult?.confidence_score || 5,
        safe_alternate: researchResult?.safe_alternate || "",
        safe_alternate_explanation: researchResult?.safe_alternate_explanation || "",
        write_up: researchResult?.write_up || (researchResult?.recommendation === "Pass" ? "Analysis suggests a 'Pass' on this play. After evaluating all available data, the edge is unclear or insufficient for a confident recommendation. Consider waiting for better market conditions or more information." : ""),
        factors: researchResult?.factors || [],
        status: "complete",
        recap_outcome: "pending",
        game_concluded: false,
      };

      const savedPlay = await base44.entities.ParsedPlay.create(playData);
      setResearchProgress(30 + ((idx + 1) / allPlays.length) * 50);
      return { parsed, research: researchResult, savedPlay, isExisting: false };
    });

    // Execute all research in parallel (with extended timeout)
      let analysisResults;
      try {
        analysisResults = await Promise.race([
          Promise.all(analysisPromises),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analysis taking too long. Try analyzing 1 play at a time.')), 180000)
          )
        ]);
    } catch (timeoutError) {
      console.error('Research timeout:', timeoutError);
      throw new Error('Analysis timeout. Please try with 1 play at a time for best results.');
    }

    setResearchProgress(85);

      // Only generate bet sizing if needed (simplified - no extra insights)
      setResearchProgress(88);
      const analysisWithInsights = analysisResults.map(analysis => {
        // Just return analysis as-is, bet sizing will be generated later if bankroll exists
        return { ...analysis, betSizingStrategy: null };
      });
      setResearchProgress(95);

      // Remove duplicates from this batch (prefer highest confidence version only)
      const uniquePlaysMap = new Map();
      for (const analysis of analysisWithInsights) {
        const uniqueId = getPlayUniqueKey(analysis.parsed);
        const existing = uniquePlaysMap.get(uniqueId);
        const currentConfidence = analysis.research?.confidence_score || 0;
        const existingConfidence = existing?.research?.confidence_score || 0;

        // Keep the version with HIGHEST confidence, or newest if same confidence
        if (!existing || currentConfidence > existingConfidence) {
          uniquePlaysMap.set(uniqueId, analysis);
        }
      }

      const filteredResults = Array.from(uniquePlaysMap.values());

      // Step 3: Sort by confidence (strongest to weakest)
      filteredResults.sort((a, b) => (b.research.confidence_score || 0) - (a.research.confidence_score || 0));
      
      // Final safety check: remove any remaining duplicates from filtered results
      const finalDeduped = new Map();
      for (const analysis of filteredResults) {
        const uniqueId = getPlayUniqueKey(analysis.parsed);
        if (!finalDeduped.has(uniqueId)) {
          finalDeduped.set(uniqueId, analysis);
        }
      }
      const finalFilteredResults = Array.from(finalDeduped.values());
      finalFilteredResults.sort((a, b) => (b.research.confidence_score || 0) - (a.research.confidence_score || 0));

    setResearchProgress(100);
    setMultipleAnalysis({ 
      plays: finalFilteredResults,
      totalPlays: finalFilteredResults.length 
    });
    setShowLightning(true);
    setTimeout(() => setShowLightning(false), 1000);
    setIsResearching(false);
    setResearchProgress(0);
  };

  const resetForm = () => {
    setFileUrls([]);
    setCriteria("");
    setManualInput("");
    setMultipleAnalysis(null);
    setSelectedForComparison([]);
    setShowComparison(false);
    setCategoryFilter("all");
  };

  const togglePlaySelection = (idx) => {
    setSelectedForComparison(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else if (prev.length < 3) {
        return [...prev, idx];
      }
      return prev;
    });
  };

  const openComparison = () => {
    if (selectedForComparison.length >= 2) {
      setShowComparison(true);
    }
  };

  const reAnalyzeLivePlays = async () => {
    if (!multipleAnalysis) return;
    
    const livePlays = multipleAnalysis.plays.filter(p => p.parsed.timing === "live");
    if (livePlays.length === 0) {
      toast.info('No live plays to re-analyze');
      return;
    }
    
    setIsReanalyzing(true);
    toast.info(`Re-analyzing ${livePlays.length} live ${livePlays.length === 1 ? 'play' : 'plays'}...`);
    
    try {
      // Re-run research with fresh live verification
      await performResearch();
      toast.success('Live plays updated with current game state!');
    } catch (error) {
      console.error('Re-analyze error:', error);
      toast.error('Failed to re-analyze. Please try again.');
    } finally {
      setIsReanalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {showLightning && <LightningStrike />}
      {/* Hero */}
      {!multipleAnalysis && !isResearching && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 sm:py-6 px-4"
        >
          <img src={LOGO_URL} alt="OneWayProps" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full ring-2 ring-emerald-500/20" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">
            <span className="text-emerald-400">OneWay</span> Research
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto px-2">
            Upload 1-3 plays in a screenshot. Get instant analysis and see which play is strongest for your criteria.
          </p>
        </motion.div>
      )}

      {/* Research Form */}
      {!multipleAnalysis && !isResearching && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2 sm:px-0"
        >
          {/* Input Mode Toggle */}
          <div className="flex gap-2 p-1 bg-[hsl(160,15%,7%)] rounded-xl border border-emerald-900/30">
            <button
              onClick={() => setInputMode("screenshot")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                inputMode === "screenshot"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              📸 Screenshot
            </button>
            <button
              onClick={() => setInputMode("manual")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                inputMode === "manual"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              ⌨️ Type Play
            </button>
          </div>

          {inputMode === "screenshot" ? (
            <MultiTabUploadZone
              onFilesUploaded={setFileUrls}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          ) : (
            <Textarea
              placeholder="Type your play: e.g., 'Lakers vs Cavs Live total 131' or 'Josh Giddey Under 29.5 PRA'"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="bg-[hsl(160,15%,6%)] border-emerald-900/30 text-white placeholder:text-gray-600 resize-none h-24 focus:ring-emerald-500/30 focus:border-emerald-600/50"
            />
          )}

          <Textarea
            placeholder="What are you looking for? (e.g., 'Under Totals', 'Player Props', 'High Confidence Overs')"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            className="bg-[hsl(160,15%,6%)] border-emerald-900/30 text-white placeholder:text-gray-600 resize-none h-16 focus:ring-emerald-500/30 focus:border-emerald-600/50"
          />

          <Button
            onClick={runResearch}
            disabled={(inputMode === "screenshot" && fileUrls.length === 0) || (inputMode === "manual" && !manualInput.trim()) || isUploading}
            className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Run Deep Research
          </Button>
        </motion.div>
      )}

      {/* Loading */}
      {isResearching && <LoadingResearch progress={researchProgress} />}

      {/* Results */}
      {multipleAnalysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 sm:space-y-5 max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3 px-2 sm:px-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {multipleAnalysis.totalPlays === 1 ? "Analysis Result" : `${multipleAnalysis.totalPlays} Plays Analyzed`}
            </h2>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {multipleAnalysis.plays.some(p => p.parsed.timing === "live") && (
                <Button
                  onClick={reAnalyzeLivePlays}
                  disabled={isReanalyzing}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${isReanalyzing ? 'animate-spin' : ''}`} />
                  Re-Analyze Live
                </Button>
              )}
              {multipleAnalysis.totalPlays > 1 && selectedForComparison.length >= 2 && (
                <Button
                  onClick={openComparison}
                  className="bg-blue-600 hover:bg-blue-500 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-4"
                >
                  <GitCompare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Compare ({selectedForComparison.length})</span>
                  <span className="sm:hidden">({selectedForComparison.length})</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-emerald-700/40 text-emerald-400 hover:bg-emerald-500/10 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-4"
              >
                <span className="hidden sm:inline">New Research</span>
                <span className="sm:hidden">New</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Play Filter Navigation */}
          <PlayFilterNav 
            activeFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
            playCount={{
              all: multipleAnalysis.totalPlays,
              total: multipleAnalysis.plays.filter(p => p.parsed.market_type === "total").length,
              player_prop: multipleAnalysis.plays.filter(p => p.parsed.market_type === "player_prop").length,
              moneyline: multipleAnalysis.plays.filter(p => p.parsed.market_type === "moneyline").length,
              spread: multipleAnalysis.plays.filter(p => p.parsed.market_type === "spread").length
            }}
          />

          {multipleAnalysis.totalPlays > 1 && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 sm:p-4 text-center mx-2 sm:mx-0">
              <p className="text-emerald-400 font-semibold text-xs sm:text-sm">
                📊 Sorted by Confidence — Strongest to Weakest
              </p>
              <p className="text-gray-500 text-[10px] sm:text-xs mt-1">
                Select 2-3 plays to compare side-by-side
              </p>
            </div>
          )}

          {/* Play Cards */}
          <div className="grid gap-4 sm:gap-6 px-2 sm:px-0">
            {multipleAnalysis.plays.map((analysis, idx) => {
              // Category filter
              const matchesFilter = 
                categoryFilter === "all" ||
                (categoryFilter === "total" && analysis.parsed.market_type === "total") ||
                (categoryFilter === "player_prop" && analysis.parsed.market_type === "player_prop") ||
                (categoryFilter === "moneyline" && analysis.parsed.market_type === "moneyline") ||
                (categoryFilter === "spread" && analysis.parsed.market_type === "spread");

              if (!matchesFilter) return null;

              const isTop = idx === 0 && multipleAnalysis.totalPlays > 1;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`space-y-3 sm:space-y-4 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 transition-all ${
                    selectedForComparison.includes(idx)
                      ? "border-blue-500/60 bg-blue-500/5"
                      : isTop
                      ? "border-emerald-500/60 bg-emerald-500/5 shadow-lg shadow-emerald-500/20"
                      : "border-emerald-900/20 bg-[hsl(160,15%,5%)]"
                  }`}
                >
                  {/* Header Section - Game Prominent */}
                  <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 rounded-t-xl p-6 border-b-2 border-emerald-500/30">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-2">
                          {analysis.parsed.sport_type} • {analysis.parsed.market_type === "total" ? "Total" : analysis.parsed.market_type === "moneyline" ? "Moneyline" : analysis.parsed.market_type.replace(/_/g, ' ')}
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                          {typeof analysis.parsed.teams === 'object' 
                            ? Object.keys(analysis.parsed.teams).join(' vs ') 
                            : analysis.parsed.teams}
                        </h3>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500 uppercase tracking-wide">Line Under Research</div>
                          <p className="text-white text-lg sm:text-xl font-semibold">
                            {analysis.parsed.player || analysis.parsed.teams} — {analysis.parsed.market_type === "total" ? "Total" : analysis.parsed.market_type === "player_prop" ? "Points" : analysis.parsed.market_type.replace(/_/g, ' ')} — {analysis.parsed.line}
                          </p>
                          {analysis.parsed.odds && (
                            <span className="text-gray-400 text-sm">Odds: {analysis.parsed.odds}</span>
                          )}
                          <div className="pt-2 border-t border-emerald-700/30 mt-2">
                            <div className="text-xs text-gray-500 mb-1">🎯 Final Decision</div>
                            <p className={`text-2xl sm:text-3xl font-black flex items-center gap-2 ${
                              analysis.research?.recommendation === "Pass" ? "text-gray-400" : "text-emerald-400"
                            }`}>
                              {analysis.research?.recommendation && analysis.research.recommendation !== "Pass" && <span className="text-2xl">🟢</span>}
                              <span>{analysis.research?.recommendation?.toUpperCase() || 'ANALYZING'} {analysis.parsed.line}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      {isTop && (
                        <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold text-xs uppercase">Top Pick</span>
                        </div>
                      )}
                    </div>
                    {multipleAnalysis.totalPlays > 1 && (
                      <div className="flex items-center gap-2 pt-3 border-t border-emerald-700/30">
                        <Checkbox
                          checked={selectedForComparison.includes(idx)}
                          onCheckedChange={() => togglePlaySelection(idx)}
                          disabled={!selectedForComparison.includes(idx) && selectedForComparison.length >= 3}
                          className="border-emerald-700"
                        />
                        <span className="text-xs text-gray-500">Select to compare with other plays</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">

                    {/* AI Prediction Panel */}
                    {analysis.research && (
                      <div className="mb-5">
                        <AIPredictionPanel
                          recommendation={analysis.research.recommendation}
                          confidence={analysis.research.confidence_score}
                          projection={analysis.research.projection}
                          fairLine={analysis.research.fair_line}
                          currentLine={analysis.parsed.line}
                          isLive={analysis.parsed.timing === "live"}
                          momentum={null}
                          regressionProbability={null}
                          edgePercent={analysis.research.edge_percent}
                        />
                      </div>
                    )}

                    {/* Master Analysis Display - Consolidated Format */}
                    <MasterAnalysisDisplay 
                      analysis={analysis}
                      bankroll={bankrollSettings?.current_bankroll}
                    />

                    {/* Recap Section for past plays */}
                    {analysis.savedPlay && (
                    <div className="mt-5">
                      <RecapSection 
                        play={analysis.savedPlay}
                        onUpdate={() => {
                          window.location.reload();
                        }}
                      />
                    </div>
                    )}

                    {/* Logging bets on plays */}
                    {analysis.savedPlay && analysis.research && analysis.research.confidence_score && (
                      <div className="mt-5">
                        <LogBetButton 
                          play={analysis.savedPlay}
                          suggestedStake={
                            analysis.research.confidence_score <= 3 ? (bankrollSettings?.current_bankroll * 0.005).toFixed(2) :
                            analysis.research.confidence_score <= 5 ? (bankrollSettings?.current_bankroll * 0.01).toFixed(2) :
                            analysis.research.confidence_score <= 7 ? (bankrollSettings?.current_bankroll * 0.02).toFixed(2) :
                            analysis.research.confidence_score <= 9 ? (bankrollSettings?.current_bankroll * 0.03).toFixed(2) :
                            (bankrollSettings?.current_bankroll * 0.05).toFixed(2)
                          }
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
                );
                }).filter(Boolean)}
                </div>

          {/* Disclaimer */}
          <div className="rounded-xl bg-yellow-900/10 border border-yellow-800/20 p-2.5 sm:p-3 mx-2 sm:mx-0">
            <p className="text-[10px] sm:text-[11px] text-yellow-700 text-center leading-relaxed">
              This analysis is for informational purposes only. Always do your own research and gamble responsibly.
            </p>
          </div>
        </motion.div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <PlayComparison
          plays={selectedForComparison.map(idx => multipleAnalysis.plays[idx])}
          onClose={() => setShowComparison(false)}
        />
      )}
      </div>
      );
      }