/**
 * Account Metrics Grid Component
 * Displays latest performance indicators
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Account } from "@/app/actions/account-detail";

interface AccountMetricsGridProps {
  account: Account;
}

export const AccountMetricsGrid = React.memo(
  ({ account }: AccountMetricsGridProps) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Metrics</CardTitle>
          <CardDescription>Latest performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Feature X Adoption
              </p>
              <div className="flex items-center gap-2">
                <Progress
                  value={account.feature_x_adoption}
                  className="flex-1"
                />
                <span className="text-sm font-medium">
                  {account.feature_x_adoption.toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Users</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {account.active_users} / {account.seats_purchased}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Tickets (30d)
              </p>
              <div className="text-lg font-semibold">
                {account.tickets_last_30d}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Critical Tickets (90d)
              </p>
              <div className="text-lg font-semibold">
                {account.critical_tickets_90d}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AccountMetricsGrid.displayName = "AccountMetricsGrid";
