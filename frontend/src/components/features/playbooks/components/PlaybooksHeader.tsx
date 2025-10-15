/**
 * Playbooks Header Component
 * Page title and description
 */

import React from "react";

export const PlaybooksHeader = React.memo(() => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Playbooks Library</h1>
      <p className="text-muted-foreground mt-2">
        Proven strategies and tactics for customer success
      </p>
    </div>
  );
});

PlaybooksHeader.displayName = "PlaybooksHeader";
