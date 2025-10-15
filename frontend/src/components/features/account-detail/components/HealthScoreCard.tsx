/**
 * Health Score Card Component
 * Displays account health score with progress bar and badge
 */

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Account } from "@/app/actions/account-detail";
import { getHealthBadgeVariant } from "@/lib/api";

interface HealthScoreCardProps {
  account: Account;
}

export const HealthScoreCard = React.memo(
  ({ account }: HealthScoreCardProps) => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Health Score</CardTitle>
              <CardDescription>
                Overall account health assessment
              </CardDescription>
            </div>
            <Badge variant={getHealthBadgeVariant(account.health_bucket)}>
              {account.health_bucket}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-4xl font-bold mb-2">
                {account.health_score.toFixed(1)}
              </div>
              <Progress value={account.health_score} className="h-2" />
            </div>
            <div className="text-right">
              {account.health_score >= 70 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

HealthScoreCard.displayName = "HealthScoreCard";
