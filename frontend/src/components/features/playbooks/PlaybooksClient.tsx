/**
 * Playbooks Client Component (Refactored)
 * Displays the library of customer success playbooks using composition
 */

"use client";

import { usePlaybooks } from "./hooks/usePlaybooks";
import { PlaybooksHeader } from "./components/PlaybooksHeader";
import { PlaybookGrid } from "./components/PlaybookGrid";

export default function PlaybooksClient() {
  const { playbooks, loading } = usePlaybooks();

  return (
    <div className="space-y-8">
      <PlaybooksHeader />
      <PlaybookGrid playbooks={playbooks} loading={loading} />
    </div>
  );
}
