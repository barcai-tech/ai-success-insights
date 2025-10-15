/**
 * KPI Cards Component
 * Displays key portfolio metrics in a grid
 */

"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatting";
import type { PortfolioMetrics } from "@/models";

interface KPICardsProps {
  portfolio: PortfolioMetrics;
}

export const KPICards = memo(function KPICards({ portfolio }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total ARR */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total ARR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(portfolio.total_arr)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {portfolio.total_accounts} accounts
          </p>
        </CardContent>
      </Card>

      {/* Avg Health Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {portfolio.avg_health_score.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Median: {portfolio.median_health_score.toFixed(1)}
          </p>
        </CardContent>
      </Card>

      {/* At-Risk ARR */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            At-Risk ARR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {formatCurrency(portfolio.at_risk_arr)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {portfolio.renewals_next_60d} renewals in 60d
          </p>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {portfolio.total_tickets_30d}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {portfolio.total_critical_90d} critical (90d)
          </p>
        </CardContent>
      </Card>
    </div>
  );
});
