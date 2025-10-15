/**
 * File Drop Zone Component
 * Drag-and-drop zone for CSV file upload with progress indicator
 */

import React from "react";
import { Upload, FileUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileDropZoneProps {
  isDragging: boolean;
  file: File | null;
  uploading: boolean;
  progress: number;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onRemove: () => void;
}

export const FileDropZone = React.memo(
  ({
    isDragging,
    file,
    uploading,
    progress,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onFileSelect,
    onUpload,
    onRemove,
  }: FileDropZoneProps) => {
    return (
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
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
          <FileSelectedView
            file={file}
            uploading={uploading}
            progress={progress}
            onUpload={onUpload}
            onRemove={onRemove}
          />
        ) : (
          <EmptyDropZone onFileSelect={onFileSelect} uploading={uploading} />
        )}
      </div>
    );
  }
);

FileDropZone.displayName = "FileDropZone";

// Sub-component: File selected state
const FileSelectedView = React.memo(
  ({
    file,
    uploading,
    progress,
    onUpload,
    onRemove,
  }: {
    file: File;
    uploading: boolean;
    progress: number;
    onUpload: () => void;
    onRemove: () => void;
  }) => {
    return (
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
            <Button onClick={onUpload} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button variant="outline" onClick={onRemove} disabled={uploading}>
              Remove
            </Button>
          </div>
        )}
      </div>
    );
  }
);

FileSelectedView.displayName = "FileSelectedView";

// Sub-component: Empty drop zone state
const EmptyDropZone = React.memo(
  ({
    onFileSelect,
    uploading,
  }: {
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploading: boolean;
  }) => {
    return (
      <div className="space-y-4">
        <FileUp className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">
            Drag and drop your CSV file here
          </p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>
        <div>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onFileSelect}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild disabled={uploading}>
              <span className="cursor-pointer">Select File</span>
            </Button>
          </label>
        </div>
      </div>
    );
  }
);

EmptyDropZone.displayName = "EmptyDropZone";
