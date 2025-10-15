/**
 * Dashboard Server Actions
 * Secure server-side API calls that never expose backend URL to browser
 *
 * These actions run on the Next.js server and proxy requests to FastAPI backend
 */

"use server";

import { revalidatePath } from "next/cache";
import type { PortfolioMetrics, PortfolioInsight } from "@/models";

// ✅ Server-side only - never exposed to browser!
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

/**
 * Get Portfolio Metrics
 * Fetches portfolio summary with caching
 */
export async function getPortfolioMetrics(): Promise<PortfolioMetrics> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/portfolio/summary`, {
      headers: {
        "Content-Type": "application/json",
      },
      // Cache for 60 seconds to improve performance
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || "Failed to fetch portfolio metrics");
    }

    return await response.json();
  } catch (error) {
    console.error("Portfolio metrics fetch error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch portfolio metrics"
    );
  }
}

/**
 * Generate Portfolio Insight
 * Calls OpenAI to generate AI insights - expensive operation
 * TODO: Add rate limiting to prevent abuse
 */
export async function generatePortfolioInsight() {
  try {
    // TODO: Add authentication check
    // const session = await getServerSession()
    // if (!session) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    // TODO: Add rate limiting
    // await checkRateLimit(session.userId, 'portfolio-insight', { max: 10, window: '1d' })

    const response = await fetch(`${BACKEND_API_URL}/insights/portfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || "Failed to generate insights");
    }

    const data: PortfolioInsight = await response.json();

    // Revalidate dashboard cache to show new insights
    revalidatePath("/dashboard");

    return { success: true, data };
  } catch (error) {
    console.error("Portfolio insight generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate insights",
    };
  }
}

/**
 * Get Accounts with Filters
 * Fetches paginated accounts list with optional filters
 */
export async function getAccounts(params?: {
  skip?: number;
  limit?: number;
  segment?: string;
  health_bucket?: string;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    if (params?.segment) queryParams.append("segment", params.segment);
    if (params?.health_bucket)
      queryParams.append("health_bucket", params.health_bucket);

    const url = `${BACKEND_API_URL}/accounts${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      // Cache for 30 seconds (accounts change frequently)
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || "Failed to fetch accounts");
    }

    return await response.json();
  } catch (error) {
    console.error("Accounts fetch error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch accounts"
    );
  }
}
