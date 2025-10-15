/**
 * Portfolio Insights Component
 * Displays AI-generated portfolio insights with loading state
 */

"use client";

import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import type { PortfolioInsight } from "@/models";

interface PortfolioInsightsProps {
  insight: PortfolioInsight | null;
  isGenerating: boolean;
}

export const PortfolioInsights = memo(function PortfolioInsights({
  insight,
  isGenerating,
}: PortfolioInsightsProps) {
  // Loading state
  if (isGenerating) {
    return (
      <Card className="border-primary/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Analyzing portfolio data and generating insights...
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No insights yet
  if (!insight) {
    return null;
  }

  // Display insights
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-Generated Portfolio Insights
        </CardTitle>
        <CardDescription>
          Generated on {new Date(insight.generated_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Executive Summary */}
        <div>
          <h4 className="font-semibold mb-2">Executive Summary</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {insight.summary}
          </p>
        </div>

        {/* Key Findings */}
        {insight.key_findings.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Key Findings</h4>
            <ul className="space-y-1">
              {insight.key_findings.map((finding, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-blue-500 font-semibold">●</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top Risks */}
        {insight.top_risks.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Top Risks
            </h4>
            <ul className="space-y-1">
              {insight.top_risks.map((risk, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-red-500 font-semibold">⚠</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {insight.opportunities.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Growth Opportunities
            </h4>
            <ul className="space-y-1">
              {insight.opportunities.map((opportunity, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-green-500 font-semibold">→</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
