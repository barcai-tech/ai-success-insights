/**
 * Helper utilities
 */

import type { HealthBucket } from "@/models/account.model";

/**
 * Get badge variant for health bucket
 */
export function getHealthBadgeVariant(
  bucket: HealthBucket
): "green" | "amber" | "red" | "default" {
  const variantMap: Record<HealthBucket, "green" | "amber" | "red"> = {
    Green: "green",
    Amber: "amber",
    Red: "red",
  };
  return variantMap[bucket] || "default";
}

/**
 * Calculate days until a date
 */
export function daysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
