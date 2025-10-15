/**
 * Dashboard Feature - Centralized Exports
 * Main entry point for Dashboard components and hooks
 */

// Main orchestrator
export { default as DashboardClient } from "./DashboardClient";

// Custom hooks
export { useDashboard } from "./hooks/useDashboard";

// Sub-components
export {
  DashboardHeader,
  PortfolioInsights,
  KPICards,
  ARRByHealth,
  ARRBySegment,
  AccountsTable,
} from "./components";
