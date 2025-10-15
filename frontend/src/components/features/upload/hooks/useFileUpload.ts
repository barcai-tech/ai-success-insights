/**
 * Custom Hook: useFileUpload
 * Handles file upload logic, drag-and-drop, and mock data generation
 * ✅ Now uses secure server actions instead of direct API calls
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { uploadCSV, generateMockData } from "@/app/actions/upload";

export function useFileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
      } else {
        toast.error("Please select a CSV file");
      }
    },
    []
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setProgress(0);
  }, []);

  const uploadFile = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadCSV(formData);
      clearInterval(progressInterval);

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setProgress(100);

      toast.success(
        `✅ Ingested ${result.data.accounts_created} accounts / ${result.data.metrics_created} metrics`,
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
  }, [file]);

  const generateMock = useCallback(async () => {
    setGenerating(true);

    try {
      const result = await generateMockData(20);

      if (!result.success) {
        throw new Error(result.error || "Mock data generation failed");
      }

      toast.success(
        `🎉 Generated ${result.data.accounts_created} mock accounts with ${result.data.metrics_created} metrics`,
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
  }, []);

  const downloadTemplate = useCallback(() => {
    // Generate CSV template client-side (no backend call needed)
    const template = [
      [
        "name",
        "arr",
        "segment",
        "industry",
        "region",
        "renewal_date",
        "cs_owner",
        "active_users",
        "seats_purchased",
        "feature_x_adoption",
        "weekly_active_pct",
        "time_to_value_days",
        "tickets_last_30d",
        "critical_tickets_90d",
        "sla_breaches_90d",
        "nps",
        "qbr_last_date",
        "onboarding_phase",
        "expansion_oppty_dollar",
        "renewal_risk",
      ],
      [
        "Acme Corp",
        "250000",
        "Mid-Market",
        "SaaS",
        "North America",
        "2025-12-31",
        "Sarah Johnson",
        "120",
        "150",
        "0.75",
        "0.85",
        "30",
        "5",
        "2",
        "1",
        "65",
        "2025-09-15",
        "FALSE",
        "50000",
        "Low",
      ],
    ];

    const csv = template.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer_success_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("📥 Template downloaded!");
  }, []);

  return {
    // State
    isDragging,
    file,
    uploading,
    generating,
    progress,
    // Actions
    handleDrag,
    handleDrop,
    handleFileSelect,
    removeFile,
    uploadFile,
    generateMockData: generateMock,
    downloadTemplate,
  };
}
