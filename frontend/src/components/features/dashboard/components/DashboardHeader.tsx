/**
 * Dashboard Header Component
 * Displays page title and AI insights generation button
 */

"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface DashboardHeaderProps {
  onGenerateInsights: () => void;
  isGenerating: boolean;
}

export const DashboardHeader = memo(function DashboardHeader({
  onGenerateInsights,
  isGenerating,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Portfolio Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time view of your customer success metrics
        </p>
      </div>
      <Button
        onClick={onGenerateInsights}
        disabled={isGenerating}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate AI Insights
          </>
        )}
      </Button>
    </div>
  );
});
