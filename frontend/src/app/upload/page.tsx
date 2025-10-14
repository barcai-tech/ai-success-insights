"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
    } else {
      toast.error("Please upload a CSV file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
    } else {
      toast.error("Please select a CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await api.uploadCSV(file);
      clearInterval(progressInterval);
      setProgress(100);

      toast.success(
        `✅ Ingested ${result.accounts_created} accounts / ${result.metrics_created} metrics`,
        {
          duration: 5000,
        }
      );

      // Reset after success
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setUploading(false);
      }, 1500);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      setUploading(false);
      toast.error(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleGenerateMockData = async () => {
    setGenerating(true);
    setShowConfirmDialog(false);

    try {
      const result = await api.generateMockData(20);

      toast.success(
        `🎉 Generated ${result.accounts_created} mock accounts with ${result.metrics_created} metrics`,
        {
          duration: 5000,
        }
      );

      setGenerating(false);
    } catch (error) {
      setGenerating(false);
      toast.error(
        `Mock data generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDownloadTemplate = () => {
    api.downloadCSVTemplate();
    toast.success("📥 Template downloaded!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground mt-2">
          Import account and metrics data from a CSV file
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download CSV Template
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowConfirmDialog(true)}
          disabled={generating}
          className="gap-2"
          title="Generate 20 sample accounts (clears existing data)"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Mock Data"}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
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
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateMockData} disabled={generating}>
              {generating ? "Generating..." : "Generate Mock Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>CSV File Upload</CardTitle>
          <CardDescription>
            Upload a CSV file containing account information and daily metrics.
            The file should include columns for account details, health metrics,
            and engagement data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }
              ${file ? "bg-accent/50" : ""}
            `}
          >
            {file ? (
              <div className="space-y-4">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {uploading ? (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Uploading... {progress}%
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleUpload} disabled={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setFile(null)}
                      disabled={uploading}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <FileUp className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </div>
                <div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild disabled={uploading}>
                      <span className="cursor-pointer">Select File</span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* File Format Info */}
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
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle>What happens after upload?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                1
              </div>
            </div>
            <div>
              <p className="font-medium">Data Validation</p>
              <p className="text-sm text-muted-foreground">
                The system validates your CSV structure and data types
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                2
              </div>
            </div>
            <div>
              <p className="font-medium">Account Creation</p>
              <p className="text-sm text-muted-foreground">
                Accounts are created or updated with the latest information
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                3
              </div>
            </div>
            <div>
              <p className="font-medium">Health Score Calculation</p>
              <p className="text-sm text-muted-foreground">
                Health scores are automatically calculated using our weighted
                algorithm
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                4
              </div>
            </div>
            <div>
              <p className="font-medium">Dashboard Update</p>
              <p className="text-sm text-muted-foreground">
                All metrics and insights are immediately available in the
                dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
