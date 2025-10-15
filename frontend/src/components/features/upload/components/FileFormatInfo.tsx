/**
 * File Format Info Component
 * Displays expected CSV format and column requirements
 */

import React from "react";
import { AlertCircle } from "lucide-react";

export const FileFormatInfo = React.memo(() => {
  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <h3 className="font-medium flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4" />
        Expected CSV Format
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Your CSV should contain the following columns:
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground font-mono">
        <div>• account_name</div>
        <div>• segment (Enterprise/Mid-Market/SMB)</div>
        <div>• region</div>
        <div>• arr</div>
        <div>• active_users</div>
        <div>• seats_purchased</div>
        <div>• feature_x_adoption</div>
        <div>• weekly_active_pct</div>
        <div>• nps</div>
        <div>• tickets_last_30d</div>
        <div>• critical_tickets_90d</div>
        <div>• sla_breaches_90d</div>
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Optional columns: time_to_value_days, qbr_last_date, renewal_date,
        expansion_oppty_dollar, onboarding_phase
      </p>
    </div>
  );
});

FileFormatInfo.displayName = "FileFormatInfo";
