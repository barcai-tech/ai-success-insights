/**
 * Accounts store - manages account list, filtering, sorting, and pagination
 * ✅ Now uses secure server actions instead of direct API calls
 */

import { create } from "zustand";
import type { Account } from "@/models/account.model";
import { getAccounts } from "@/app/actions/dashboard";

type SortField = "name" | "segment" | "health_bucket" | "arr";
type SortOrder = "asc" | "desc";

interface AccountsStore {
  // State
  accounts: Account[];
  loading: boolean;
  error: string | null;

  // Filters
  healthFilter: string | null;
  segmentFilter: string | null;

  // Sorting
  sortField: SortField;
  sortOrder: SortOrder;

  // Pagination
  currentPage: number;
  pageSize: number;

  // Actions
  loadAccounts: () => Promise<void>;
  setHealthFilter: (filter: string | null) => void;
  setSegmentFilter: (filter: string | null) => void;
  clearFilters: () => void;
  setSortField: (field: SortField) => void;
  toggleSortOrder: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  clearError: () => void;
  reset: () => void;
}

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  // Initial state
  accounts: [],
  loading: false,
  error: null,

  // Filters
  healthFilter: null,
  segmentFilter: null,

  // Sorting
  sortField: "name",
  sortOrder: "asc",

  // Pagination
  currentPage: 1,
  pageSize: 10,

  // Load all accounts
  loadAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getAccounts({ limit: 1000 });
      set({ accounts: response.accounts, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load accounts",
        loading: false,
      });
    }
  },

  // Set health filter
  setHealthFilter: (filter) => {
    set({ healthFilter: filter, currentPage: 1 });
  },

  // Set segment filter
  setSegmentFilter: (filter) => {
    set({ segmentFilter: filter, currentPage: 1 });
  },

  // Clear all filters
  clearFilters: () => {
    set({ healthFilter: null, segmentFilter: null, currentPage: 1 });
  },

  // Set sort field
  setSortField: (field) => {
    const { sortField: currentField, sortOrder } = get();
    if (currentField === field) {
      set({ sortOrder: sortOrder === "asc" ? "desc" : "asc", currentPage: 1 });
    } else {
      set({ sortField: field, sortOrder: "asc", currentPage: 1 });
    }
  },

  // Toggle sort order
  toggleSortOrder: () => {
    const { sortOrder } = get();
    set({ sortOrder: sortOrder === "asc" ? "desc" : "asc", currentPage: 1 });
  },

  // Set page
  setPage: (page) => set({ currentPage: page }),

  // Set page size
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      accounts: [],
      loading: false,
      error: null,
      healthFilter: null,
      segmentFilter: null,
      sortField: "name",
      sortOrder: "asc",
      currentPage: 1,
      pageSize: 10,
    }),
}));

/**
 * Selector to get filtered and sorted accounts
 */
export function useFilteredAccounts() {
  const { accounts, healthFilter, segmentFilter, sortField, sortOrder } =
    useAccountsStore();

  // Filter
  let filtered = accounts;
  if (healthFilter) {
    filtered = filtered.filter((acc) => acc.health_bucket === healthFilter);
  }
  if (segmentFilter) {
    filtered = filtered.filter((acc) => acc.segment === segmentFilter);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number = a[sortField];
    let bVal: string | number = b[sortField];

    // Handle health bucket sorting (Green > Amber > Red)
    if (sortField === "health_bucket") {
      const healthOrder = { Green: 1, Amber: 2, Red: 3 };
      aVal = healthOrder[a.health_bucket as keyof typeof healthOrder] || 4;
      bVal = healthOrder[b.health_bucket as keyof typeof healthOrder] || 4;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortOrder === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  return sorted;
}

/**
 * Selector to get paginated accounts
 */
export function usePaginatedAccounts() {
  const { currentPage, pageSize } = useAccountsStore();
  const filtered = useFilteredAccounts();

  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    accounts: paginated,
    totalAccounts: filtered.length,
    totalPages,
    currentPage,
    pageSize,
  };
}
