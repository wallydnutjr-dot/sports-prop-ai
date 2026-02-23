import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Bankroll() {
  const [initialAmount, setInitialAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['bankrollSettings'],
    queryFn: async () => {
      const result = await base44.entities.BankrollSettings.list();
      return result[0] || null;
    },
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['betLogs'],
    queryFn: () => base44.entities.BetLog.list('-created_date'),
    initialData: [],
  });

  const createSettingsMutation = useMutation({
    mutationFn: (amount) => base44.entities.BankrollSettings.create({
      initial_bankroll: amount,
      current_bankroll: amount,
      total_profit_loss: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankrollSettings'] });
      setInitialAmount("");
    },
  });

  const stats = useMemo(() => {
    const completed = bets.filter(b => b.outcome !== 'pending');
    const wins = completed.filter(b => b.outcome === 'win').length;
    const losses = completed.filter(b => b.outcome === 'loss').length;
    const totalStaked = bets.reduce((sum, b) => sum + (b.stake || 0), 0);
    const winRate = completed.length > 0 ? (wins / completed.length * 100).toFixed(1) : 0;
    
    return { wins, losses, totalStaked, winRate, totalBets: bets.length };
  }, [bets]);

  const handleSetBankroll = () => {
    const amount = parseFloat(initialAmount);
    if (amount && amount > 0) {
      createSettingsMutation.mutate(amount);
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6 py-12"
      >
        <div className="text-center">
          <Wallet className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Set Your Bankroll</h1>
          <p className="text-gray-500 text-sm">
            Enter your starting bankroll to track your betting performance
          </p>
        </div>

        <Card className="bg-[hsl(160,15%,6%)] border-emerald-900/30 p-6">
          <label className="text-sm text-gray-400 mb-2 block">Initial Bankroll Amount</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="1000"
                className="pl-9 bg-[hsl(160,15%,8%)] border-emerald-900/30 text-white"
              />
            </div>
            <Button
              onClick={handleSetBankroll}
              disabled={!initialAmount || parseFloat(initialAmount) <= 0}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Set Bankroll
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const profitLoss = settings.current_bankroll - settings.initial_bankroll;
  const profitLossPercent = ((profitLoss / settings.initial_bankroll) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          <span className="text-emerald-400">Bankroll</span> Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track your betting performance and manage your bankroll</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[hsl(160,15%,6%)] border-emerald-900/30 p-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase">Current Bankroll</p>
              <p className="text-xl font-bold text-white">${settings.current_bankroll.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className={`border-2 p-4 ${profitLoss >= 0 ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
          <div className="flex items-center gap-3">
            {profitLoss >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-400" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-400" />
            )}
            <div>
              <p className="text-xs text-gray-500 uppercase">Profit/Loss</p>
              <p className={`text-xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent}%)</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[hsl(160,15%,6%)] border-emerald-900/30 p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase">Win Rate</p>
              <p className="text-xl font-bold text-white">{stats.winRate}%</p>
              <p className="text-xs text-gray-500">{stats.wins}W - {stats.losses}L</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[hsl(160,15%,6%)] border-emerald-900/30 p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Staked</p>
              <p className="text-xl font-bold text-white">${stats.totalStaked.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{stats.totalBets} bets</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bet History */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Bet History</h2>
        {bets.length === 0 ? (
          <Card className="bg-[hsl(160,15%,6%)] border-emerald-900/30 p-8 text-center">
            <p className="text-gray-500">No bets logged yet. Log your first bet from your research results.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {bets.map((bet, idx) => (
              <motion.div
                key={bet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="rounded-xl border border-emerald-900/30 bg-[hsl(160,15%,6%)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">{bet.teams}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bet.recommendation?.includes("Over") ? "bg-emerald-500/15 text-emerald-400" :
                        bet.recommendation?.includes("Under") ? "bg-red-500/15 text-red-400" :
                        "bg-gray-800 text-gray-400"
                      }`}>
                        {bet.recommendation}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{format(new Date(bet.created_date), "MMM d, h:mm a")}</span>
                      <span>Stake: ${bet.stake}</span>
                      <span>Odds: {bet.odds}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                      bet.outcome === 'win' ? 'bg-green-500/15 text-green-400' :
                      bet.outcome === 'loss' ? 'bg-red-500/15 text-red-400' :
                      bet.outcome === 'push' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {bet.outcome === 'pending' ? 'PENDING' : 
                       bet.outcome === 'win' ? `+$${bet.profit_loss?.toFixed(2)}` :
                       bet.outcome === 'loss' ? `-$${Math.abs(bet.profit_loss || bet.stake).toFixed(2)}` :
                       'PUSH'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}