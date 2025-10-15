/**
 * ARR by Segment Chart Component
 * Displays revenue distribution by customer segment with filtering
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

interface ARRBySegmentProps {
  portfolio: PortfolioMetrics;
  segmentFilter: string | null;
  onSegmentFilterChange: (segment: string | null) => void;
}

export const ARRBySegment = memo(function ARRBySegment({
  portfolio,
  segmentFilter,
  onSegmentFilterChange,
}: ARRBySegmentProps) {
  const totalARR = portfolio.total_arr;

  const handleSegmentClick = (segment: string) => {
    onSegmentFilterChange(segmentFilter === segment ? null : segment);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ARR by Segment</CardTitle>
        <CardDescription>
          Revenue distribution by customer size • Click to filter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(portfolio.arr_by_segment).map(([segment, arr]) => (
            <div key={segment}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`cursor-pointer transition-all hover:opacity-80 ${
                      segmentFilter === segment
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/10"
                        : ""
                    }`}
                    onClick={() => handleSegmentClick(segment)}
                  >
                    {segment}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(arr)}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {((arr / totalARR) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${(arr / totalARR) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
