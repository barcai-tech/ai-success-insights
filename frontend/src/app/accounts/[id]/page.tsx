"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  api,
  type Account,
  type AccountMetricsDaily,
  type AccountInsight,
  formatCurrency,
  getHealthBadgeVariant,
} from "@/lib/api";
import { toast } from "sonner";

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params?.id as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [metrics, setMetrics] = useState<AccountMetricsDaily[]>([]);
  const [insight, setInsight] = useState<AccountInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  useEffect(() => {
    async function loadAccountData() {
      try {
        const [accountData, metricsData] = await Promise.all([
          api.getAccount(parseInt(accountId)),
          api.getMetricsHistory(parseInt(accountId)),
        ]);
        setAccount(accountData);
        setMetrics(metricsData);
      } catch {
        toast.error("Failed to load account data");
      } finally {
        setLoading(false);
      }
    }

    if (accountId) {
      loadAccountData();
    }
  }, [accountId]);

  async function handleGenerateInsight() {
    if (!account) return;
    setGeneratingInsight(true);
    try {
      const data = await api.generateAccountInsight(parseInt(accountId));
      setInsight(data);
      toast.success("✨ AI insights generated");
    } catch {
      toast.error("Failed to generate insights");
    } finally {
      setGeneratingInsight(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Account not found</p>
        <Link href="/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const latestMetrics = metrics[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
          <p className="text-muted-foreground mt-1">
            {account.segment} • {account.region}
          </p>
        </div>
        <Button onClick={handleGenerateInsight} disabled={generatingInsight}>
          {generatingInsight ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {generatingInsight ? "Generating..." : "Generate AI Insights"}
        </Button>
      </div>

      {/* Health Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Health Score</CardTitle>
              <CardDescription>
                Overall account health assessment
              </CardDescription>
            </div>
            <Badge variant={getHealthBadgeVariant(account.health_bucket)}>
              {account.health_bucket}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-4xl font-bold mb-2">
                {account.health_score.toFixed(1)}
              </div>
              <Progress value={account.health_score} className="h-2" />
            </div>
            <div className="text-right">
              {account.health_score >= 70 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ARR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(account.arr)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Weekly Active %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.weekly_active_pct.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              NPS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{account.nps ?? "N/A"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contract Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Grid */}
      {latestMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Account Metrics</CardTitle>
            <CardDescription>Latest performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Feature X Adoption
                </p>
                <div className="flex items-center gap-2">
                  <Progress
                    value={account.feature_x_adoption}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">
                    {account.feature_x_adoption.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Users
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {account.active_users} / {account.seats_purchased}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Tickets (30d)
                </p>
                <div className="text-lg font-semibold">
                  {account.tickets_last_30d}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Critical Tickets (90d)
                </p>
                <div className="text-lg font-semibold">
                  {account.critical_tickets_90d}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Loading State */}
      {generatingInsight && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              Generating AI Insights...
            </CardTitle>
            <CardDescription>
              Analyzing account data for {account.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {insight && !generatingInsight && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Insights</CardTitle>
            <CardDescription>
              Recommendations for {account.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {insight.summary}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Health Analysis</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {insight.health_analysis}
                </p>
              </div>

              {insight.risk_factors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Risk Factors</h4>
                  <ul className="space-y-1">
                    {insight.risk_factors.map((factor, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-red-500 font-semibold">⚠</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.recommended_actions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommended Actions</h4>
                  <ul className="space-y-2">
                    {insight.recommended_actions.map((action, idx) => (
                      <li key={idx} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-medium">{action.title}</span>
                          <Badge
                            variant={
                              action.priority === "High"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Impact: {action.estimated_impact}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
