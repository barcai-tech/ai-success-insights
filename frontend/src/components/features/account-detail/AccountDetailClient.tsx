/**
 * Account Detail Client Component (Refactored)
 * Displays detailed account information, metrics, and AI insights using composition
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAccountDetail } from "./hooks/useAccountDetail";
import { AccountHeader } from "./components/AccountHeader";
import { HealthScoreCard } from "./components/HealthScoreCard";
import { AccountKPICards } from "./components/AccountKPICards";
import { AccountMetricsGrid } from "./components/AccountMetricsGrid";
import { AIInsightsCard } from "./components/AIInsightsCard";

interface AccountDetailClientProps {
  accountId: string;
}

export default function AccountDetailClient({
  accountId,
}: AccountDetailClientProps) {
  const {
    account,
    latestMetrics,
    insight,
    loading,
    generatingInsight,
    generateInsight,
  } = useAccountDetail(accountId);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Account not found
  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Account not found</p>
        <Link href="/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and AI insights trigger */}
      <AccountHeader
        account={account}
        generatingInsight={generatingInsight}
        onGenerateInsight={generateInsight}
      />

      {/* Health Score Card */}
      <HealthScoreCard account={account} />

      {/* KPI Cards */}
      <AccountKPICards account={account} />

      {/* Metrics Grid */}
      {latestMetrics && <AccountMetricsGrid account={account} />}

      {/* AI Insights Card */}
      <AIInsightsCard
        insight={insight}
        generatingInsight={generatingInsight}
        accountName={account.name}
      />
    </div>
  );
}
