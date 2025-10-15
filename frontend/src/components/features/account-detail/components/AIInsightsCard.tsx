/**
 * AI Insights Card Component
 * Displays AI-generated insights with loading state
 */

import React from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type AccountInsight } from "@/app/actions/account-detail";

interface AIInsightsCardProps {
  insight: AccountInsight | null;
  generatingInsight: boolean;
  accountName: string;
}

export const AIInsightsCard = React.memo(
  ({ insight, generatingInsight, accountName }: AIInsightsCardProps) => {
    // Loading state
    if (generatingInsight) {
      return (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              Generating AI Insights...
            </CardTitle>
            <CardDescription>
              Analyzing account data for {accountName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
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
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
          <CardDescription>Recommendations for {accountName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {insight.summary}
              </p>
            </div>

            {/* Health Analysis */}
            <div>
              <h4 className="font-semibold mb-2">Health Analysis</h4>
              <ul className="space-y-2">
                {Array.isArray(insight.health_analysis) ? (
                  insight.health_analysis.map((analysis, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary mt-1">•</span>
                      <span>{analysis}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">
                    {insight.health_analysis}
                  </li>
                )}
              </ul>
            </div>

            {/* Risk Factors */}
            {insight.risk_factors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Risk Factors</h4>
                <ul className="space-y-1">
                  {insight.risk_factors.map((factor, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-red-500 font-semibold">⚠</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Actions */}
            {insight.recommended_actions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recommended Actions</h4>
                <ul className="space-y-2">
                  {insight.recommended_actions.map((action, idx) => (
                    <li key={idx} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-medium">{action.title}</span>
                        <Badge
                          variant={
                            action.priority === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Impact: {action.estimated_impact}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

AIInsightsCard.displayName = "AIInsightsCard";
