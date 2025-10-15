/**
 * Mock Data Confirmation Dialog Component
 * Confirms mock data generation with warning
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MockDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  generating: boolean;
}

export const MockDataDialog = React.memo(
  ({ open, onOpenChange, onConfirm, generating }: MockDataDialogProps) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Mock Data</DialogTitle>
            <DialogDescription>
              This will clear all existing data and generate 20 sample customer
              accounts with realistic health metrics and 30 days of historical
              data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-destructive">Warning:</strong> All current
              accounts, metrics, and health snapshots will be permanently
              deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={generating}>
              {generating ? "Generating..." : "Generate Mock Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

MockDataDialog.displayName = "MockDataDialog";
