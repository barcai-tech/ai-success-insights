/**
 * Dashboard Client Component
 * Orchestrates dashboard sub-components using custom hook
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./hooks/useDashboard";
import {
  DashboardHeader,
  PortfolioInsights,
  KPICards,
  ARRByHealth,
  ARRBySegment,
  AccountsTable,
} from "./components";

export default function DashboardClient() {
  const {
    portfolio,
    portfolioInsight,
    generatingInsight,
    paginatedAccounts,
    totalAccounts,
    totalPages,
    healthFilter,
    segmentFilter,
    sortField,
    sortOrder,
    currentPage,
    pageSize,
    loading,
    handleGenerateInsights,
    handleHealthFilter,
    handleSegmentFilter,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
  } = useDashboard();

  // Loading state
  if (loading && !portfolio) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // No data state
  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No portfolio data available. Try uploading a CSV first.
        </p>
        <Link href="/upload">
          <Button className="mt-4">Go to Upload</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Demo Mode - Shared Data
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              This is a demonstration environment with shared data. All users
              see and modify the same dataset. Any changes (uploads, AI
              insights, data modifications) are visible to everyone using the
              demo.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <DashboardHeader
        onGenerateInsights={handleGenerateInsights}
        isGenerating={generatingInsight}
      />

      {/* AI Insights */}
      <PortfolioInsights
        insight={portfolioInsight}
        isGenerating={generatingInsight}
      />

      {/* KPI Cards */}
      <KPICards portfolio={portfolio} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ARRByHealth
          portfolio={portfolio}
          healthFilter={healthFilter}
          onHealthFilterChange={handleHealthFilter}
        />
        <ARRBySegment
          portfolio={portfolio}
          segmentFilter={segmentFilter}
          onSegmentFilterChange={handleSegmentFilter}
        />
      </div>

      {/* Accounts Table */}
      <AccountsTable
        accounts={paginatedAccounts}
        totalAccounts={totalAccounts}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        sortField={sortField}
        sortOrder={sortOrder}
        healthFilter={healthFilter}
        segmentFilter={segmentFilter}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
