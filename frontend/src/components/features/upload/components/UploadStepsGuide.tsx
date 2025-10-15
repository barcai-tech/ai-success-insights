/**
 * Upload Steps Guide Component
 * Shows what happens after file upload
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    number: 1,
    title: "Data Validation",
    description: "The system validates your CSV structure and data types",
  },
  {
    number: 2,
    title: "Account Creation",
    description: "Accounts are created or updated with the latest information",
  },
  {
    number: 3,
    title: "Health Score Calculation",
    description:
      "Health scores are automatically calculated using our weighted algorithm",
  },
  {
    number: 4,
    title: "Dashboard Update",
    description:
      "All metrics and insights are immediately available in the dashboard",
  },
];

export const UploadStepsGuide = React.memo(() => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What happens after upload?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                {step.number}
              </div>
            </div>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

UploadStepsGuide.displayName = "UploadStepsGuide";
