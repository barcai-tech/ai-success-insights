/**
 * Account Header Component
 * Page header with back button, title, and AI insights button
 */

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Account } from "@/app/actions/account-detail";

interface AccountHeaderProps {
  account: Account;
  generatingInsight: boolean;
  onGenerateInsight: () => void;
}

export const AccountHeader = React.memo(
  ({ account, generatingInsight, onGenerateInsight }: AccountHeaderProps) => {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
          <p className="text-muted-foreground mt-1">
            {account.segment} • {account.region}
          </p>
        </div>
        <Button onClick={onGenerateInsight} disabled={generatingInsight}>
          {generatingInsight ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {generatingInsight ? "Generating..." : "Generate AI Insights"}
        </Button>
      </div>
    );
  }
);

AccountHeader.displayName = "AccountHeader";
