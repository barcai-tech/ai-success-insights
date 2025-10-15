/**
 * Playbook Grid Component
 * Grid layout for playbook cards with loading and empty states
 */

import React from "react";
import { type Playbook } from "@/app/actions/playbooks";
import { PlaybookCard } from "./PlaybookCard";

interface PlaybookGridProps {
  playbooks: Playbook[];
  loading: boolean;
}

export const PlaybookGrid = React.memo(
  ({ playbooks, loading }: PlaybookGridProps) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (playbooks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No playbooks available yet.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((playbook) => (
          <PlaybookCard key={playbook.id} playbook={playbook} />
        ))}
      </div>
    );
  }
);

PlaybookGrid.displayName = "PlaybookGrid";
