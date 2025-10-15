/**
 * Dashboard Page - Server Component
 * This is now a server component that renders the client component
 */

import DashboardClient from "@/components/features/dashboard/DashboardClient";

export default function DashboardPage() {
  return <DashboardClient />;
}
