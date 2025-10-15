/**
 * Playbook Card Component
 * Individual playbook card with details
 */

import React from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Playbook } from "@/app/actions/playbooks";

interface PlaybookCardProps {
  playbook: Playbook;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    onboarding: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    adoption: "bg-green-500/10 text-green-500 border-green-500/20",
    renewal: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    expansion: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    retention: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    colors[category.toLowerCase()] ||
    "bg-gray-500/10 text-gray-500 border-gray-500/20"
  );
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    high: "destructive",
    medium: "secondary",
    low: "outline",
  };
  return colors[priority.toLowerCase()] || "outline";
};

export const PlaybookCard = React.memo(({ playbook }: PlaybookCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <div className="flex gap-2">
            <Badge
              variant={
                getPriorityColor(playbook.priority) as
                  | "destructive"
                  | "secondary"
                  | "outline"
              }
              className="text-xs"
            >
              {playbook.priority}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {playbook.title}
        </CardTitle>
        <CardDescription>{playbook.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Category Badge */}
          <Badge
            className={getCategoryColor(playbook.category)}
            variant="outline"
          >
            {playbook.category}
          </Badge>

          {/* Effort Estimate */}
          <div className="text-sm">
            <span className="text-muted-foreground">Effort:</span>{" "}
            <span className="font-medium">{playbook.estimated_effort}</span>
          </div>

          {/* Key Steps Preview */}
          {playbook.steps.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Key Steps:</p>
              <ul className="space-y-1">
                {playbook.steps.slice(0, 3).map((step: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary font-semibold">•</span>
                    <span className="line-clamp-1">{step}</span>
                  </li>
                ))}
                {playbook.steps.length > 3 && (
                  <li className="text-sm text-muted-foreground">
                    +{playbook.steps.length - 3} more steps
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* View Details Button */}
          <Button
            variant="ghost"
            className="w-full mt-4 group-hover:bg-primary/10"
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

PlaybookCard.displayName = "PlaybookCard";
