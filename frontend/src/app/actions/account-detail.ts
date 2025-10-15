/**
 * Account Detail Server Actions
 * Secure server-side API calls for individual account data and insights
 *
 * These actions run on the Next.js server and proxy requests to FastAPI backend
 * - Backend URL is never exposed to the browser
 * - Uses Next.js caching for optimal performance
 * - Ready for authentication and rate limiting
 */

"use server";

import { revalidatePath } from "next/cache";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

if (!BACKEND_API_URL) {
  throw new Error("BACKEND_API_URL environment variable is not set");
}

export interface Account {
  id: number;
  name: string;
  segment: "Enterprise" | "Mid-Market" | "SMB";
  region: string;
  arr: number;
  health_score: number;
  health_bucket: "Green" | "Amber" | "Red";
  active_users: number;
  seats_purchased: number;
  feature_x_adoption: number;
  weekly_active_pct: number;
  nps?: number;
  tickets_last_30d: number;
  critical_tickets_90d: number;
  sla_breaches_90d: number;
  time_to_value_days?: number;
  qbr_last_date?: string;
  renewal_date?: string;
  expansion_oppty_dollar: number;
  onboarding_phase: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountMetricsDaily {
  id: number;
  account_id: number;
  date: string;
  logins: number;
  events: number;
  feature_x_events: number;
  avg_session_min: number;
  errors: number;
  ticket_backlog: number;
}

export interface HealthFactor {
  factor: string;
  impact: number;
}

export interface HealthSnapshot {
  id: number;
  account_id: number;
  calculated_at: string;
  score: number;
  risk_label: "Green" | "Amber" | "Red";
  top_factors: HealthFactor[];
}

export interface AccountAction {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  estimated_impact: string;
  playbook_id?: number;
}

export interface AccountInsight {
  account_id: number;
  account_name: string;
  summary: string;
  health_analysis: string[];
  risk_factors: string[];
  recommended_actions: AccountAction[];
  generated_at: string;
}

/**
 * Get single account details
 *
 * Cached for 30 seconds (account data updates frequently)
 *
 * @param accountId - The account ID
 * @returns Account object
 */
export async function getAccount(accountId: number): Promise<Account> {
  try {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session) {
    //   throw new Error("Unauthorized");
    // }

    const response = await fetch(`${BACKEND_API_URL}/accounts/${accountId}`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch account: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get account error:", error);
    throw error;
  }
}

/**
 * Get account metrics history
 *
 * Cached for 60 seconds (metrics updated periodically)
 *
 * @param accountId - The account ID
 * @param days - Number of days of history (default: 90)
 * @returns Array of daily metrics
 */
export async function getMetricsHistory(
  accountId: number,
  days: number = 90
): Promise<AccountMetricsDaily[]> {
  try {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session) {
    //   throw new Error("Unauthorized");
    // }

    const response = await fetch(
      `${BACKEND_API_URL}/accounts/${accountId}/metrics-history?days=${days}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch metrics history: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get metrics history error:", error);
    throw error;
  }
}

/**
 * Get account health history
 *
 * Cached for 60 seconds (health scores updated periodically)
 *
 * @param accountId - The account ID
 * @param limit - Number of health snapshots to retrieve (default: 30)
 * @returns Array of health snapshots
 */
export async function getHealthHistory(
  accountId: number,
  limit: number = 30
): Promise<HealthSnapshot[]> {
  try {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session) {
    //   throw new Error("Unauthorized");
    // }

    const response = await fetch(
      `${BACKEND_API_URL}/accounts/${accountId}/health-history?limit=${limit}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch health history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get health history error:", error);
    throw error;
  }
}

/**
 * Generate AI-powered insights for an account
 *
 * ⚠️ MUTATION - Triggers OpenAI API call (expensive!)
 * No caching, uses revalidatePath to update UI
 *
 * @param accountId - The account ID
 * @returns Success/error response with insight data
 */
export async function generateAccountInsight(accountId: number) {
  try {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session) {
    //   return { success: false, error: "Unauthorized" };
    // }

    // TODO: Add rate limiting (expensive OpenAI operation!)
    // const rateLimitResult = await rateLimit(session.user.id);
    // if (!rateLimitResult.success) {
    //   return { success: false, error: "Rate limit exceeded. Try again later." };
    // }

    const response = await fetch(
      `${BACKEND_API_URL}/insights/account/${accountId}`,
      {
        method: "POST",
        cache: "no-store", // Never cache mutations
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(errorData.detail || "Failed to generate insights");
    }

    const data = await response.json();

    // Revalidate the account detail page
    revalidatePath(`/accounts/${accountId}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Generate account insight error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate insights",
    };
  }
}
