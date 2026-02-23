import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, MessageSquare, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

export default function AIInsights({ insights, playData }) {
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(null);
  const [answers, setAnswers] = useState({});

  if (!insights) return null;

  const handleQuestionClick = async (question, idx) => {
    if (answers[idx]) {
      setExpandedAnswer(expandedAnswer === idx ? null : idx);
      return;
    }

    setLoadingQuestion(idx);
    setExpandedAnswer(idx);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing this sports betting play. Answer this specific follow-up question with detailed analysis.

Play: ${playData?.teams || 'N/A'} - ${playData?.market_type || 'N/A'}
${playData?.player ? `Player: ${playData.player}` : ''}
Line: ${playData?.line || 'N/A'}
Recommendation: ${playData?.recommendation || 'N/A'}

Question: ${question}

Provide a comprehensive 4-6 sentence answer with specific data and actionable insights.`,
        add_context_from_internet: true
      });

      setAnswers(prev => ({ ...prev, [idx]: response }));
    } catch (error) {
      console.error('Follow-up question error:', error);
      setAnswers(prev => ({ ...prev, [idx]: 'Unable to generate answer. Please try again.' }));
    } finally {
      setLoadingQuestion(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-2xl p-6 bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-2 border-purple-500/30"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-purple-300">AI Statistical Insights</h3>
      </div>

      {/* Key Trends */}
      {insights.key_trends && insights.key_trends.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-gray-300">Key Statistical Trends</h4>
          </div>
          <div className="grid gap-2">
            {insights.key_trends.map((trend, idx) => (
              <div key={idx} className="bg-[hsl(160,15%,6%)] rounded-lg p-3 border border-purple-500/20">
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs mt-0.5">
                    {trend.category}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 font-medium">{trend.trend}</p>
                    <p className="text-xs text-gray-500 mt-1">{trend.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {insights.summary && (
        <div className="bg-[hsl(160,15%,6%)] rounded-lg p-4 border border-blue-500/20">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Statistical Summary</h4>
          <p className="text-sm text-gray-300 leading-relaxed">{insights.summary}</p>
        </div>
      )}

      {/* Follow-up Questions */}
      {insights.follow_up_questions && insights.follow_up_questions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-gray-300">Suggested Follow-up Angles</h4>
          </div>
          <div className="space-y-2">
            {insights.follow_up_questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionClick(q, idx)}
                className="w-full bg-[hsl(160,15%,6%)] rounded-lg p-3 border border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/5 transition-all text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-blue-300 flex-1">💡 {q}</p>
                  {loadingQuestion === idx && (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                  )}
                </div>
                {expandedAnswer === idx && answers[idx] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-blue-500/20"
                  >
                    <p className="text-sm text-gray-300 leading-relaxed">{answers[idx]}</p>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}