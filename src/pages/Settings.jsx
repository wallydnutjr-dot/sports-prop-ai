import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Delete all user's data
      const plays = await base44.entities.ParsedPlay.filter({ created_by: user.email });
      const bets = await base44.entities.BetLog.filter({ created_by: user.email });
      const bankroll = await base44.entities.BankrollSettings.filter({ created_by: user.email });

      await Promise.all([
        ...plays.map(play => base44.entities.ParsedPlay.delete(play.id)),
        ...bets.map(bet => base44.entities.BetLog.delete(bet.id)),
        ...bankroll.map(b => base44.entities.BankrollSettings.delete(b.id)),
      ]);

      toast.success("Account data deleted successfully");
      
      // Logout and redirect
      setTimeout(() => {
        base44.auth.logout();
      }, 1000);
    } catch (error) {
      toast.error("Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

      <Card className="bg-[hsl(160,15%,6%)] border-emerald-900/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-emerald-400" />
            <div>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-gray-500">Your account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-white font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-white font-medium">{user?.full_name}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[hsl(160,15%,6%)] border-red-900/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-400" />
            <div>
              <CardTitle className="text-white">Danger Zone</CardTitle>
              <CardDescription className="text-gray-500">Irreversible actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[hsl(160,15%,6%)] border-red-900/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete your account and all your data including plays, bets, and bankroll history. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-emerald-700/40 text-emerald-400 hover:bg-emerald-500/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}