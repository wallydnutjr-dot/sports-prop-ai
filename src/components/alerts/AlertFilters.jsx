import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

const SPORTS = ["All", "NBA", "NCAAM", "NCAAW", "NFL", "NCAAF", "MLB", "NHL", "Soccer", "KBL"];
const BET_TYPES = ["All", "Moneyline", "Spread", "Total"];
const STRIKE_TIMINGS = ["All", "STRIKE NOW", "WAIT", "MONITOR"];
const SORT_OPTIONS = [
  { value: "confidence-desc", label: "Confidence (High to Low)" },
  { value: "confidence-asc", label: "Confidence (Low to High)" },
  { value: "regression-desc", label: "Regression % (High to Low)" },
  { value: "spike-desc", label: "Spike % (High to Low)" },
  { value: "updated-desc", label: "Recently Updated" },
];

export default function AlertFilters({ filters, onFilterChange, onSortChange }) {
  const activeFilterCount = [
    filters.sport !== "All",
    filters.betType !== "All",
    filters.strikeTiming !== "All",
    filters.minConfidence > 1,
    filters.maxConfidence < 10,
    filters.keyword.trim() !== ""
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFilterChange({
      sport: "All",
      betType: "All",
      strikeTiming: "All",
      minConfidence: 1,
      maxConfidence: 10,
      keyword: ""
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-gray-300">Filters & Sorting</h3>
          {activeFilterCount > 0 && (
            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Sport Filter */}
        <div>
          <label className="text-xs text-gray-600 mb-1.5 block">Sport</label>
          <Select value={filters.sport} onValueChange={(v) => onFilterChange({ ...filters, sport: v })}>
            <SelectTrigger className="bg-[hsl(160,15%,6%)] border-emerald-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Bet Type Filter */}
        <div>
          <label className="text-xs text-gray-600 mb-1.5 block">Bet Type</label>
          <Select value={filters.betType} onValueChange={(v) => onFilterChange({ ...filters, betType: v })}>
            <SelectTrigger className="bg-[hsl(160,15%,6%)] border-emerald-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BET_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Strike Timing Filter */}
        <div>
          <label className="text-xs text-gray-600 mb-1.5 block">Strike Timing</label>
          <Select value={filters.strikeTiming} onValueChange={(v) => onFilterChange({ ...filters, strikeTiming: v })}>
            <SelectTrigger className="bg-[hsl(160,15%,6%)] border-emerald-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STRIKE_TIMINGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Min Confidence */}
        <div>
          <label className="text-xs text-gray-600 mb-1.5 block">Min Confidence</label>
          <Select 
            value={filters.minConfidence.toString()} 
            onValueChange={(v) => onFilterChange({ ...filters, minConfidence: parseInt(v) })}
          >
            <SelectTrigger className="bg-[hsl(160,15%,6%)] border-emerald-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Max Confidence */}
        <div>
          <label className="text-xs text-gray-600 mb-1.5 block">Max Confidence</label>
          <Select 
            value={filters.maxConfidence.toString()} 
            onValueChange={(v) => onFilterChange({ ...filters, maxConfidence: parseInt(v) })}
          >
            <SelectTrigger className="bg-[hsl(160,15%,6%)] border-emerald-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-xs text-gray-600 mb-1.5 block">Sort By</label>
          <Select value={filters.sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-[hsl(160,15%,6%)] border-emerald-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Keyword Search */}
      <div>
        <label className="text-xs text-gray-600 mb-1.5 block">Search Keywords</label>
        <Input
          placeholder="e.g., 'blowout risk', 'regression', 'pace'"
          value={filters.keyword}
          onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value })}
          className="bg-[hsl(160,15%,6%)] border-emerald-900/30 text-white placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}