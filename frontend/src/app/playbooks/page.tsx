"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { api, type Playbook } from "@/lib/api";
import { toast } from "sonner";

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaybooks();
  }, []);

  async function loadPlaybooks() {
    try {
      const data = await api.getPlaybooks();
      setPlaybooks(data);
    } catch {
      toast.error("Failed to load playbooks");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playbooks Library</h1>
        <p className="text-muted-foreground mt-2">
          Proven strategies and tactics for customer success
        </p>
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((playbook) => (
          <Card
            key={playbook.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
          >
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
                  <span className="font-medium">
                    {playbook.estimated_effort}
                  </span>
                </div>

                {/* Key Steps Preview */}
                {playbook.steps.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Key Steps:</p>
                    <ul className="space-y-1">
                      {playbook.steps
                        .slice(0, 3)
                        .map((step: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary font-semibold">
                              •
                            </span>
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
        ))}
      </div>

      {playbooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No playbooks available yet.</p>
        </div>
      )}
    </div>
  );
}
