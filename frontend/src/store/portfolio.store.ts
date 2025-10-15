/**
 * Portfolio store - manages portfolio metrics and insights
 * ✅ Now uses secure server actions instead of direct API calls
 */

import { create } from "zustand";
import type {
  PortfolioMetrics,
  PortfolioInsight,
} from "@/models/portfolio.model";
import {
  getPortfolioMetrics,
  generatePortfolioInsight,
} from "@/app/actions/dashboard";

interface PortfolioStore {
  // State
  portfolio: PortfolioMetrics | null;
  portfolioInsight: PortfolioInsight | null;
  loading: boolean;
  generatingInsight: boolean; // Separate loading state for AI insights
  error: string | null;

  // Actions
  loadPortfolio: () => Promise<void>;
  generateInsight: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  // Initial state
  portfolio: null,
  portfolioInsight: null,
  loading: false,
  generatingInsight: false,
  error: null,

  // Load portfolio metrics
  loadPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const portfolio = await getPortfolioMetrics();
      set({ portfolio, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load portfolio",
        loading: false,
      });
    }
  },

  // Generate portfolio insights
  generateInsight: async () => {
    set({ generatingInsight: true, error: null });
    try {
      const result = await generatePortfolioInsight();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate insights");
      }

      set({ portfolioInsight: result.data, generatingInsight: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate insights",
        generatingInsight: false,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      portfolio: null,
      portfolioInsight: null,
      loading: false,
      generatingInsight: false,
      error: null,
    }),
}));
