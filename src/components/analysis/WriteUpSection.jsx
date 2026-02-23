import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function WriteUpSection({ writeUp, recommendation }) {
  if (!writeUp) return null;

  // Highlight the recommended side in green within the write-up
  const highlightRecommendation = (text) => {
    if (!recommendation || recommendation === "Pass") return text;
    
    // Create regex to match the recommendation word (case-insensitive, word boundary)
    const regex = new RegExp(`\\b(${recommendation})\\b`, 'gi');
    
    // Replace with green highlighted version
    return text.replace(regex, (match) => `🟢 **${match.toUpperCase()}**`);
  };

  const highlightedWriteUp = highlightRecommendation(writeUp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl sm:rounded-2xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-3 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
        <h3 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Deep Research Analysis</h3>
      </div>
      <div className="prose prose-sm prose-invert max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-2 sm:mb-3 text-xs sm:text-sm">{children}</p>,
            strong: ({ children }) => {
              // Check if this is our highlighted recommendation
              const text = children?.toString() || '';
              if (text.includes('OVER') || text.includes('UNDER') || text.includes('HOME') || text.includes('AWAY')) {
                return <strong className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">{children}</strong>;
              }
              return <strong className="text-emerald-400 font-semibold">{children}</strong>;
            },
            em: ({ children }) => <em className="text-gray-400">{children}</em>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">{children}</ul>,
            li: ({ children }) => <li className="text-gray-300">{children}</li>,
            h1: ({ children }) => <h1 className="text-white font-bold text-base sm:text-lg mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-white font-bold text-sm sm:text-base mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-emerald-400 font-semibold text-xs sm:text-sm mb-1">{children}</h3>,
          }}
        >
          {highlightedWriteUp}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}