/**
 * useDashboard Hook
 * Manages dashboard state and data fetching using Zustand stores
 * Provides memoized callbacks and derived state for Dashboard orchestrator
 */

import { useEffect, useCallback } from "react";
import { usePortfolioStore } from "@/store/portfolio.store";
import { useAccountsStore, usePaginatedAccounts } from "@/store/accounts.store";
import { toast } from "sonner";

type SortField = "name" | "segment" | "health_bucket" | "arr";

export function useDashboard() {
  // Portfolio store
  const {
    portfolio,
    portfolioInsight,
    loading: portfolioLoading,
    generatingInsight,
    loadPortfolio,
    generateInsight,
  } = usePortfolioStore();

  // Accounts store
  const {
    loading: accountsLoading,
    healthFilter,
    segmentFilter,
    sortField,
    sortOrder,
    currentPage,
    pageSize,
    setHealthFilter,
    setSegmentFilter,
    clearFilters,
    setSortField,
    setPage,
    setPageSize,
    loadAccounts,
  } = useAccountsStore();

  const {
    accounts: paginatedAccounts,
    totalAccounts,
    totalPages,
  } = usePaginatedAccounts();

  // Load data on mount
  useEffect(() => {
    loadPortfolio();
    loadAccounts();
  }, [loadPortfolio, loadAccounts]);

  // Handle insight generation with toast notifications
  const handleGenerateInsights = useCallback(async () => {
    try {
      await generateInsight();
      toast.success("✨ Portfolio insights generated");
    } catch {
      toast.error("Failed to generate insights");
    }
  }, [generateInsight]);

  // Handle health filter change
  const handleHealthFilter = useCallback(
    (bucket: string | null) => {
      setHealthFilter(bucket);
    },
    [setHealthFilter]
  );

  // Handle segment filter change
  const handleSegmentFilter = useCallback(
    (segment: string | null) => {
      setSegmentFilter(segment);
    },
    [setSegmentFilter]
  );

  // Handle sort field change
  const handleSort = useCallback(
    (field: SortField) => {
      setSortField(field);
    },
    [setSortField]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
    },
    [setPage]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
    },
    [setPageSize]
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const loading = portfolioLoading || accountsLoading;

  return {
    // Portfolio data
    portfolio,
    portfolioInsight,
    generatingInsight,

    // Accounts data
    paginatedAccounts,
    totalAccounts,
    totalPages,

    // Filters and pagination
    healthFilter,
    segmentFilter,
    sortField,
    sortOrder,
    currentPage,
    pageSize,

    // Loading states
    loading,

    // Actions
    handleGenerateInsights,
    handleHealthFilter,
    handleSegmentFilter,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleClearFilters,
  };
}
