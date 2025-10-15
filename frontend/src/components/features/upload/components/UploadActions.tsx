/**
 * Upload Actions Component
 * Quick action buttons for downloading template and generating mock data
 */

import React from "react";
import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadActionsProps {
  onDownloadTemplate: () => void;
  onGenerateMockData: () => void;
  generating: boolean;
}

export const UploadActions = React.memo(
  ({
    onDownloadTemplate,
    onGenerateMockData,
    generating,
  }: UploadActionsProps) => {
    return (
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={onDownloadTemplate}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download CSV Template
        </Button>
        <Button
          variant="outline"
          onClick={onGenerateMockData}
          disabled={generating}
          className="gap-2"
          title="Generate 20 sample accounts (clears existing data)"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Mock Data"}
        </Button>
      </div>
    );
  }
);

UploadActions.displayName = "UploadActions";
