/**
 * ARR by Health Chart Component
 * Displays revenue distribution by health bucket with filtering
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatting";
import type { PortfolioMetrics } from "@/models";

interface ARRByHealthProps {
  portfolio: PortfolioMetrics;
  healthFilter: string | null;
  onHealthFilterChange: (bucket: string | null) => void;
}

export const ARRByHealth = memo(function ARRByHealth({
  portfolio,
  healthFilter,
  onHealthFilterChange,
}: ARRByHealthProps) {
  const totalARR = portfolio.total_arr;

  const handleHealthClick = (bucket: string) => {
    onHealthFilterChange(healthFilter === bucket ? null : bucket);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ARR by Health</CardTitle>
        <CardDescription>
          Revenue distribution by account health • Click to filter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Green */}
          {portfolio.arr_by_bucket.Green !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="green"
                    className={`cursor-pointer transition-opacity hover:opacity-80 ${
                      healthFilter === "Green"
                        ? "ring-2 ring-green-500 ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                    onClick={() => handleHealthClick("Green")}
                  >
                    Green
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(portfolio.arr_by_bucket.Green)}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {((portfolio.arr_by_bucket.Green / totalARR) * 100).toFixed(
                    1
                  )}
                  %
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 dark:bg-green-600"
                  style={{
                    width: `${
                      (portfolio.arr_by_bucket.Green / totalARR) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Amber */}
          {portfolio.arr_by_bucket.Amber !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="amber"
                    className={`cursor-pointer transition-opacity hover:opacity-80 ${
                      healthFilter === "Amber"
                        ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                    onClick={() => handleHealthClick("Amber")}
                  >
                    Amber
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(portfolio.arr_by_bucket.Amber)}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {((portfolio.arr_by_bucket.Amber / totalARR) * 100).toFixed(
                    1
                  )}
                  %
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 dark:bg-amber-600"
                  style={{
                    width: `${
                      (portfolio.arr_by_bucket.Amber / totalARR) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Red */}
          {portfolio.arr_by_bucket.Red !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="red"
                    className={`cursor-pointer transition-opacity hover:opacity-80 ${
                      healthFilter === "Red"
                        ? "ring-2 ring-red-500 ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                    onClick={() => handleHealthClick("Red")}
                  >
                    Red
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(portfolio.arr_by_bucket.Red)}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {((portfolio.arr_by_bucket.Red / totalARR) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 dark:bg-red-600"
                  style={{
                    width: `${(portfolio.arr_by_bucket.Red / totalARR) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
