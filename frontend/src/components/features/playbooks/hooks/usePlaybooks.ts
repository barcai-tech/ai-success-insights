/**
 * Custom Hook: usePlaybooks
 * Handles playbook data fetching and management
 * ✅ Now uses secure server actions instead of direct API calls
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPlaybooks, type Playbook } from "@/app/actions/playbooks";

export function usePlaybooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaybooks();
  }, []);

  async function loadPlaybooks() {
    try {
      const data = await getPlaybooks();
      setPlaybooks(data);
    } catch {
      toast.error("Failed to load playbooks");
    } finally {
      setLoading(false);
    }
  }

  return {
    playbooks,
    loading,
    refetch: loadPlaybooks,
  };
}
