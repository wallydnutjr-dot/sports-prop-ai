import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import MultiTabUploadZone from "../components/snap/MultiTabUploadZone";
import LoadingResearch from "../components/common/LoadingResearch";
import VerifiedLiveState from "../components/analysis/VerifiedLiveState";
import AIPredictionPanel from "../components/analysis/AIPredictionPanel";

const LOGO_URL =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6995f76e1fdeeacc4c78fb97/9475f9cff_OWALogoTransparent.png";

export default function LiveSniper() {
  const [fileUrls, setFileUrls] = useState([]);
  const [manualInput, setManualInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [researchProgress, setResearchProgress] = useState(0);
  const [inputMode, setInputMode] = useState("manual");

  const runLiveAnalysis = async () => {
    if (inputMode === "screenshot" && fileUrls.length === 0) return;
    if (inputMode === "manual" && !manualInput.trim()) return;

    setIsAnalyzing(true);
    setLiveAnalysis(null);
    setResearchProgress(0);

    try {
      setResearchProgress(10);

      // -----------------------------
      // STEP 1: Parse Bet (45s timeout - image LLM takes longer)
          // -------------------------------------------------------
          let parsePrompt;
          let parseFiles = [];

          if (inputMode === "manual") {
            parsePrompt = `Extract sport_type, teams, numeric total line, and segment from:

      "${manualInput}"

      Return JSON:
      {
      "sport_type": "string",
      "teams": "string",
      "line": "number",
      "segment": "string"
      }`;
          } else {
            const filesToParse = fileUrls.slice(0, 3);
            if (fileUrls.length > 3) {
              toast.warning('Processing first 3 screenshots');
            }
            parsePrompt = `Parse this live TOTAL betting play from sportsbook screenshot(s):

      Extract sport_type, teams, numeric total line, and segment (e.g., 1H, 2H, 4Q, Full Game)

      Return JSON:
      {
      "sport_type": "string",
      "teams": "string",
      "line": "number",
      "segment": "string"
      }`;
            parseFiles = filesToParse;
          }

          const parseTimeout = parseFiles.length > 0 ? 45000 : 20000;
          const parseResult = await Promise.race([
            base44.integrations.Core.InvokeLLM({
              prompt: parsePrompt,
              ...(parseFiles.length > 0 && { file_urls: parseFiles }),
              response_json_schema: {
                type: "object",
                properties: {
                  sport_type: { type: "string" },
                  teams: { type: "string" },
                  line: { type: "string" },
                  segment: { type: "string" }
                }
              }
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Parse timeout (${parseTimeout / 1000}s)`)), parseTimeout)
            )
          ]);

          if (!parseResult?.sport_type || !parseResult?.teams || !parseResult?.line) {
            console.error("Parse result incomplete:", parseResult);
            throw new Error("Could not parse bet details. Try clearer screenshot or rephrase text.");
          }

          setResearchProgress(40);

      // --------------------------------
      // STEP 2: The Odds API (15s timeout)
      // --------------------------------
      let liveEngine;
      try {
        liveEngine = await Promise.race([
          base44.functions.invoke("scanAlertPlays", {
            sport_type: parseResult.sport_type
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("The Odds API timeout")), 15000)
          )
        ]);
      } catch (engineErr) {
        console.error("Engine error:", engineErr);
        throw new Error(`Live verification failed: ${engineErr.message}`);
      }

      if (!liveEngine?.data?.games?.length) {
        throw new Error("No live games found. Try a different sport or time.");
      }

      const lowerTeams = (parseResult.teams || "").toLowerCase();

      const matchedGame =
        liveEngine.data.games.find(g =>
          `${g.awayTeam} ${g.homeTeam}`
            .toLowerCase()
            .includes(lowerTeams)
        ) || liveEngine.data.games[0];

      const verifiedLiveState = {
        teams: `${matchedGame.awayTeam} vs ${matchedGame.homeTeam}`,
        sport: parseResult.sport_type,
        score: `${matchedGame.awayScore}–${matchedGame.homeScore}`,
        period: matchedGame.period || matchedGame.status,
        time_remaining: matchedGame.clock || "Live",
        source: "The Odds API",
        last_updated: new Date().toISOString(),
        projected_total: matchedGame.projectedTotal || null,
        pace_per_minute: matchedGame.pace || null
      };

      setResearchProgress(60);

      // --------------------------------
      // STEP 3: AI Projection (60s timeout)
      // --------------------------------
      let researchResult;
      try {
        researchResult = await Promise.race([
          base44.integrations.Core.InvokeLLM({
            prompt: `LIVE GAME ANALYSIS
      Game: ${verifiedLiveState.teams}
      Score: ${verifiedLiveState.score}
      Period: ${verifiedLiveState.period}
      Time: ${verifiedLiveState.time_remaining}
      Projected Total: ${verifiedLiveState.projected_total}
      Bet Line: ${parseResult.line}
      Segment: ${parseResult.segment || "Full Game"}

      Project final total and decide: Over, Under, or Pass.

      Return JSON:
      {
      "recommendation": "Over|Under|Pass",
      "projection": "number",
      "confidence_score": 1-10,
      "edge_percent": number,
      "ai_analysis_summary": "string"
      }`,
            response_json_schema: {
              type: "object",
              properties: {
                recommendation: { type: "string", enum: ["Over", "Under", "Pass"] },
                projection: { type: "string" },
                confidence_score: { type: "number" },
                edge_percent: { type: "number" },
                ai_analysis_summary: { type: "string" }
              }
            }
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI timeout")), 60000)
          )
        ]);
      } catch (aiErr) {
        console.error("AI error:", aiErr);
        throw new Error(`Analysis failed: ${aiErr.message}`);
      }

      if (!researchResult?.recommendation) {
        throw new Error("AI could not generate recommendation.");
      }

      setResearchProgress(100);

      setLiveAnalysis({
        plays: [
          {
            parsed: parseResult,
            verifiedLiveState,
            research: researchResult
          }
        ]
      });

      toast.success("Live analysis complete!");
    } catch (error) {
      console.error("Live analysis error:", error);
      toast.error(error.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
      setResearchProgress(0);
    }
  };

  const reAnalyzeLive = async () => {
    if (!liveAnalysis) return;
    toast.info("Re-analyzing with fresh data...");
    await runLiveAnalysis();
  };

  const resetForm = () => {
    setFileUrls([]);
    setManualInput("");
    setLiveAnalysis(null);
  };

  return (
    <div className="space-y-6">
      {!liveAnalysis && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 px-4"
        >
          <img
            src={LOGO_URL}
            alt="Live Sniper"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-white">
            🔴 LIVE TOTALS SNIPER
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Real-time live totals analysis powered by SportsDataIO
          </p>
        </motion.div>
      )}

      {!liveAnalysis && !isAnalyzing && (
        <div className="max-w-2xl mx-auto space-y-4 px-4">
          {/* Input Mode Toggle */}
          <div className="flex gap-2 p-1 bg-[hsl(160,15%,7%)] rounded-xl border border-red-900/30">
            <button
              onClick={() => setInputMode("screenshot")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                inputMode === "screenshot"
                  ? "bg-red-500/20 text-red-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              📸 Screenshot
            </button>
            <button
              onClick={() => setInputMode("manual")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                inputMode === "manual"
                  ? "bg-red-500/20 text-red-400"
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
              placeholder="Type live TOTAL: e.g., Lakers 4Q 56.5"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="bg-[hsl(160,15%,6%)] border-red-900/30 text-white placeholder:text-gray-600 resize-none h-24"
            />
          )}

          <Button
            onClick={runLiveAnalysis}
            disabled={(inputMode === "screenshot" && fileUrls.length === 0) || (inputMode === "manual" && !manualInput.trim()) || isUploading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4 mr-2" />
            Analyze Live Now
          </Button>
        </div>
      )}

      {isAnalyzing && <LoadingResearch progress={researchProgress} />}

      {liveAnalysis && (
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {liveAnalysis.plays.map((analysis, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-red-500/50 p-6 space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">
                {analysis.parsed.teams}
              </h2>

              <VerifiedLiveState
                liveState={analysis.verifiedLiveState}
              />

              <AIPredictionPanel
                recommendation={analysis.research.recommendation}
                confidence={analysis.research.confidence_score}
                projection={analysis.research.projection}
                currentLine={analysis.parsed.line}
                edgePercent={analysis.research.edge_percent}
                isLive={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}