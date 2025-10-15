/**
 * Upload Server Actions
 * Secure server-side API calls for CSV upload and mock data generation
 *
 * These actions run on the Next.js server and proxy requests to FastAPI backend
 * - Backend URL is never exposed to the browser
 * - Ready for authentication and rate limiting
 */

"use server";

import { revalidatePath } from "next/cache";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

if (!BACKEND_API_URL) {
  throw new Error("BACKEND_API_URL environment variable is not set");
}

/**
 * Upload CSV file to ingest customer success data
 *
 * @param formData - FormData containing the CSV file
 * @returns Success/error response with ingestion statistics
 */
export async function uploadCSV(formData: FormData) {
  try {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session) {
    //   return { success: false, error: "Unauthorized" };
    // }

    // TODO: Add file validation
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!file.name.endsWith(".csv")) {
      return { success: false, error: "Only CSV files are allowed" };
    }

    // Forward to FastAPI backend
    const response = await fetch(`${BACKEND_API_URL}/ingest/csv`, {
      method: "POST",
      body: formData, // Send FormData as-is
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(errorData.detail || "Upload failed");
    }

    const result = await response.json();

    // Revalidate pages that display account data
    revalidatePath("/dashboard");
    revalidatePath("/accounts");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Upload CSV error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Generate mock customer success data
 *
 * @param count - Number of mock accounts to generate (default: 20)
 * @returns Success/error response with generation statistics
 */
export async function generateMockData(count: number = 20) {
  try {
    // TODO: Add authentication check
    // const session = await auth();
    // if (!session) {
    //   return { success: false, error: "Unauthorized" };
    // }

    // TODO: Add rate limiting (expensive operation)
    // const rateLimitResult = await rateLimit(session.user.id);
    // if (!rateLimitResult.success) {
    //   return { success: false, error: "Rate limit exceeded" };
    // }

    const response = await fetch(
      `${BACKEND_API_URL}/ingest/generate-mock?count=${count}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(errorData.detail || "Mock data generation failed");
    }

    const result = await response.json();

    // Revalidate pages that display account data
    revalidatePath("/dashboard");
    revalidatePath("/accounts");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Generate mock data error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Mock data generation failed",
    };
  }
}
