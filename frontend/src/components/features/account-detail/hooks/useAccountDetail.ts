/**
 * Custom Hook: useAccountDetail
 * Handles account detail data fetching and AI insights generation
 * ✅ Now uses secure server actions instead of direct API calls
 */

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getAccount,
  getMetricsHistory,
  generateAccountInsight,
  type Account,
  type AccountMetricsDaily,
  type AccountInsight,
} from "@/app/actions/account-detail";

export function useAccountDetail(accountId: string) {
  const [account, setAccount] = useState<Account | null>(null);
  const [metrics, setMetrics] = useState<AccountMetricsDaily[]>([]);
  const [insight, setInsight] = useState<AccountInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  useEffect(() => {
    loadAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  async function loadAccountData() {
    try {
      const [accountData, metricsData] = await Promise.all([
        getAccount(parseInt(accountId)),
        getMetricsHistory(parseInt(accountId)),
      ]);
      setAccount(accountData);
      setMetrics(metricsData);
    } catch {
      toast.error("Failed to load account data");
    } finally {
      setLoading(false);
    }
  }

  const generateInsight = useCallback(async () => {
    if (!account) return;

    setGeneratingInsight(true);
    try {
      const result = await generateAccountInsight(parseInt(accountId));

      if (!result.success) {
        throw new Error(result.error || "Failed to generate insights");
      }

      setInsight(result.data);
      toast.success("✨ AI insights generated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate insights"
      );
    } finally {
      setGeneratingInsight(false);
    }
  }, [account, accountId]);

  const latestMetrics = metrics[0];

  return {
    account,
    metrics,
    latestMetrics,
    insight,
    loading,
    generatingInsight,
    generateInsight,
  };
}
