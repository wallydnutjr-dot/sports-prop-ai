import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function LogBetButton({ play, suggestedStake }) {
  const [open, setOpen] = useState(false);
  const [stake, setStake] = useState(suggestedStake || "");
  const [outcome, setOutcome] = useState("pending");
  const queryClient = useQueryClient();

  const logBetMutation = useMutation({
    mutationFn: async (data) => {
      // Calculate profit/loss
      let profitLoss = 0;
      if (outcome === 'win') {
        // Parse American odds
        const oddsValue = parseFloat(play.odds?.replace(/[+\-]/g, '') || 100);
        const isPositive = play.odds?.includes('+');
        
        if (isPositive) {
          profitLoss = (parseFloat(stake) * oddsValue) / 100;
        } else {
          profitLoss = (parseFloat(stake) * 100) / oddsValue;
        }
      } else if (outcome === 'loss') {
        profitLoss = -parseFloat(stake);
      }

      // Log the bet
      await base44.entities.BetLog.create({
        play_id: play.id,
        stake: parseFloat(stake),
        odds: play.odds,
        outcome: outcome,
        profit_loss: profitLoss,
        teams: play.teams,
        recommendation: play.recommendation
      });

      // Update bankroll if not pending
      if (outcome !== 'pending') {
        const settings = await base44.entities.BankrollSettings.list();
        if (settings[0]) {
          await base44.entities.BankrollSettings.update(settings[0].id, {
            current_bankroll: settings[0].current_bankroll + profitLoss,
            total_profit_loss: (settings[0].total_profit_loss || 0) + profitLoss
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankrollSettings'] });
      queryClient.invalidateQueries({ queryKey: ['betLogs'] });
      toast.success('Bet logged successfully!');
      setOpen(false);
      setStake(suggestedStake || "");
      setOutcome("pending");
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log bet');
    }
  });

  const handleSubmit = () => {
    if (!stake || parseFloat(stake) <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }
    logBetMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500 w-full">
          <Plus className="w-4 h-4 mr-2" />
          Log Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[hsl(160,15%,5%)] border-emerald-900/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Log Your Bet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Stake Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="Enter stake"
                className="pl-9 bg-[hsl(160,15%,8%)] border-emerald-900/30 text-white"
              />
            </div>
            {suggestedStake && (
              <p className="text-xs text-gray-500 mt-1">Suggested: ${suggestedStake}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Outcome</label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger className="bg-[hsl(160,15%,8%)] border-emerald-900/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(160,15%,8%)] border-emerald-900/30 text-white">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
                <SelectItem value="push">Push</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={logBetMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {logBetMutation.isPending ? 'Logging...' : 'Log Bet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}