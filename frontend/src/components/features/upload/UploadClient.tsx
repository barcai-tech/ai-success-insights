/**
 * Upload Client Component (Refactored)
 * Orchestrates file upload functionality using composition
 */

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFileUpload } from "./hooks/useFileUpload";
import { UploadActions } from "./components/UploadActions";
import { MockDataDialog } from "./components/MockDataDialog";
import { FileDropZone } from "./components/FileDropZone";
import { FileFormatInfo } from "./components/FileFormatInfo";
import { UploadStepsGuide } from "./components/UploadStepsGuide";

export default function UploadClient() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    isDragging,
    file,
    uploading,
    generating,
    progress,
    handleDrag,
    handleDrop,
    handleFileSelect,
    removeFile,
    uploadFile,
    generateMockData,
    downloadTemplate,
  } = useFileUpload();

  const handleConfirmGenerate = async () => {
    setShowConfirmDialog(false);
    await generateMockData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Demo Warning Banner */}
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Shared Demo Environment
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Data uploaded here is shared across all demo users. Your uploads
              and mock data will be visible to everyone. This is a demonstration
              environment only.
            </p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground mt-2">
          Import account and metrics data from a CSV file
        </p>
      </div>

      {/* Quick Actions */}
      <UploadActions
        onDownloadTemplate={downloadTemplate}
        onGenerateMockData={() => setShowConfirmDialog(true)}
        generating={generating}
      />

      {/* Confirmation Dialog */}
      <MockDataDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmGenerate}
        generating={generating}
      />

      {/* File Upload Card */}
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
          <FileDropZone
            isDragging={isDragging}
            file={file}
            uploading={uploading}
            progress={progress}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            onUpload={uploadFile}
            onRemove={removeFile}
          />

          {/* File Format Info */}
          <FileFormatInfo />
        </CardContent>
      </Card>

      {/* Upload Steps Guide */}
      <UploadStepsGuide />
    </div>
  );
}
