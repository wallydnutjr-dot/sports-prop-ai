import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", icon: "🎯" },
  { id: "total", label: "Totals", icon: "📊" },
  { id: "spread", label: "Spreads", icon: "📈" },
  { id: "moneyline", label: "Moneylines", icon: "💰" },
  { id: "player_prop", label: "Player Props", icon: "👤" }
];

export default function PlayFilterNav({ 
  activeFilter, 
  onFilterChange, 
  playCount = {} 
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const activeLabel = CATEGORIES.find(c => c.id === activeFilter)?.label || "All Plays";
  const activeIcon = CATEGORIES.find(c => c.id === activeFilter)?.icon || "🎯";

  return (
    <div className="bg-[hsl(160,20%,4%)]/98 backdrop-blur-xl border-b border-emerald-900/30 mb-6 rounded-xl">
      <div className="space-y-3 max-w-7xl mx-auto px-4 py-3">
      {/* Desktop Horizontal Tabs */}
      <div className="hidden sm:block">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => onFilterChange(category.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                activeFilter === category.id
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                  : "bg-[hsl(160,15%,7%)] text-gray-400 hover:text-white hover:bg-[hsl(160,15%,10%)] border border-emerald-900/30"
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              {category.label}
              {playCount[category.id] > 0 && (
                <span className="ml-1 text-xs font-bold opacity-80">
                  ({playCount[category.id]})
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl flex items-center justify-between shadow-lg shadow-emerald-500/50"
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">{activeIcon}</span>
            {activeLabel}
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-2 right-2 top-16 z-50 bg-[hsl(160,15%,7%)] border-2 border-emerald-500/40 rounded-xl overflow-hidden"
            >
              {CATEGORIES.filter(c => c.id !== activeFilter).map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onFilterChange(category.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left font-semibold flex items-center gap-3 transition-colors border-b border-emerald-900/20 last:border-b-0 ${
                    activeFilter === category.id
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "text-gray-400 hover:text-white hover:bg-[hsl(160,15%,10%)]"
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  {category.label}
                  {playCount[category.id] > 0 && (
                    <span className="ml-auto text-xs font-bold opacity-70">
                      ({playCount[category.id]})
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        Sorted by confidence • Strongest to weakest
      </p>
      </div>
    </div>
  );
}