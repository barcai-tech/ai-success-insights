/**
 * Account Detail Page (Server Component)
 * Renders the AccountDetailClient component for individual account view
 */

import AccountDetailClient from "@/components/features/account-detail/AccountDetailClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default function AccountDetailPage({ params }: PageProps) {
  return <AccountDetailClient accountId={params.id} />;
}
