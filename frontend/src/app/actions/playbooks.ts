/**
 * Playbooks Server Actions
 * Secure server-side API calls for playbook data
 *
 * These actions run on the Next.js server and proxy requests to FastAPI backend
 * - Backend URL is never exposed to the browser
 * - Uses Next.js caching for optimal performance
 */

"use server";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

if (!BACKEND_API_URL) {
  throw new Error("BACKEND_API_URL environment variable is not set");
}

export interface Playbook {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  estimated_effort: string;
  risk_factors: string[];
  steps: string[];
}

/**
 * Get all available playbooks
 *
 * Cached for 5 minutes (playbooks don't change frequently)
 *
 * @returns Array of playbook objects
 */
export async function getPlaybooks(): Promise<Playbook[]> {
  try {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session) {
    //   throw new Error("Unauthorized");
    // }

    const response = await fetch(`${BACKEND_API_URL}/playbooks`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch playbooks: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get playbooks error:", error);
    throw error;
  }
}

/**
 * Get recommended playbooks for a specific account
 *
 * Uses shorter cache (60s) since recommendations may change based on account health
 *
 * @param accountId - The account ID to get recommendations for
 * @returns Array of recommended playbook objects
 */
export async function getRecommendedPlaybooks(
  accountId: number
): Promise<Playbook[]> {
  try {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session) {
    //   throw new Error("Unauthorized");
    // }

    const response = await fetch(
      `${BACKEND_API_URL}/playbooks/recommend/${accountId}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch recommended playbooks: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get recommended playbooks error:", error);
    throw error;
  }
}
