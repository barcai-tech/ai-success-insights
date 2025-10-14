"use client";

import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  api,
  type PortfolioMetrics,
  type PortfolioInsight,
  type Account,
  formatCurrency,
  getHealthBadgeVariant,
} from "@/lib/api";
import { toast } from "sonner";

type SortField = "name" | "segment" | "health_bucket" | "arr";
type SortOrder = "asc" | "desc";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioMetrics | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [portfolioInsight, setPortfolioInsight] =
    useState<PortfolioInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filter state
  const [healthFilter, setHealthFilter] = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      const [portfolioData, accountsData] = await Promise.all([
        api.getPortfolioMetrics(),
        api.getAccounts({ limit: 1000 }), // Fetch all accounts for client-side pagination
      ]);
      setPortfolio(portfolioData);
      setAllAccounts(accountsData.accounts);
    } catch {
      toast.error("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateInsights() {
    setGeneratingInsight(true);
    try {
      const insight = await api.generatePortfolioInsight();
      setPortfolioInsight(insight);
      toast.success("✨ Portfolio insights generated");
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

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No portfolio data available. Try uploading a CSV first.
        </p>
        <Link href="/upload">
          <Button className="mt-4">Go to Upload</Button>
        </Link>
      </div>
    );
  }

  const totalARR = portfolio.total_arr;

  // Filter functions
  const handleHealthFilter = (bucket: string | null) => {
    setHealthFilter(bucket);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSegmentFilter = (segment: string | null) => {
    setSegmentFilter(segment);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setHealthFilter(null);
    setSegmentFilter(null);
    setCurrentPage(1);
  };

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort accounts
  let filteredAccounts = allAccounts;

  if (healthFilter) {
    filteredAccounts = filteredAccounts.filter(
      (account) => account.health_bucket === healthFilter
    );
  }

  if (segmentFilter) {
    filteredAccounts = filteredAccounts.filter(
      (account) => account.segment === segmentFilter
    );
  }

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    let aVal: string | number = a[sortField];
    let bVal: string | number = b[sortField];

    // Handle health bucket sorting (Green > Amber > Red)
    if (sortField === "health_bucket") {
      const healthOrder = { Green: 1, Amber: 2, Red: 3 };
      aVal = healthOrder[a.health_bucket as keyof typeof healthOrder] || 4;
      bVal = healthOrder[b.health_bucket as keyof typeof healthOrder] || 4;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortOrder === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  // Pagination
  const totalPages = Math.ceil(sortedAccounts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAccounts = sortedAccounts.slice(startIndex, endIndex);

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };
  const avgHealth = portfolio.avg_health_score;
  const atRiskCount = portfolio.accounts_by_risk?.Red || 0;
  const healthyCount = portfolio.accounts_by_risk?.Green || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of {portfolio.total_accounts} customer accounts
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleGenerateInsights}
          disabled={generatingInsight}
        >
          {generatingInsight ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {generatingInsight ? "Generating..." : "Generate Insights"}
        </Button>
      </div>

      {/* AI Insights Loading State */}
      {generatingInsight && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              Generating AI Insights...
            </CardTitle>
            <CardDescription>
              Please wait while we analyze your portfolio data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Section */}
      {portfolioInsight && !generatingInsight && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Generated Portfolio Insights
            </CardTitle>
            <CardDescription>
              Generated on{" "}
              {new Date(portfolioInsight.generated_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2">Executive Summary</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {portfolioInsight.summary}
              </p>
            </div>

            {/* Key Findings */}
            {portfolioInsight.key_findings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Key Findings</h4>
                <ul className="space-y-1">
                  {portfolioInsight.key_findings.map((finding, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-blue-500 font-semibold">●</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top Risks */}
            {portfolioInsight.top_risks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Top Risks
                </h4>
                <ul className="space-y-1">
                  {portfolioInsight.top_risks.map((risk, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-red-500 font-semibold">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {portfolioInsight.opportunities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Growth Opportunities
                </h4>
                <ul className="space-y-1">
                  {portfolioInsight.opportunities.map((opportunity, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-green-500 font-semibold">→</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total ARR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalARR)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {portfolio.total_accounts} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHealth.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Portfolio health
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At-Risk Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRiskCount}</div>
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-xs text-muted-foreground">
                Need attention
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Healthy Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyCount}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Strong performance
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ARR by Health Bucket */}
        <Card>
          <CardHeader>
            <CardTitle>ARR by Health Bucket</CardTitle>
            <CardDescription>
              Revenue distribution across risk levels • Click to filter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.arr_by_bucket.Green !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="green"
                        className={`cursor-pointer transition-opacity hover:opacity-80 ${
                          healthFilter === "Green"
                            ? "ring-2 ring-green-500 ring-offset-2 ring-offset-background"
                            : ""
                        }`}
                        onClick={() =>
                          handleHealthFilter(
                            healthFilter === "Green" ? null : "Green"
                          )
                        }
                      >
                        Green
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(portfolio.arr_by_bucket.Green)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {(
                        (portfolio.arr_by_bucket.Green / totalARR) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 dark:bg-green-600"
                      style={{
                        width: `${
                          (portfolio.arr_by_bucket.Green / totalARR) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {portfolio.arr_by_bucket.Amber !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="amber"
                        className={`cursor-pointer transition-opacity hover:opacity-80 ${
                          healthFilter === "Amber"
                            ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background"
                            : ""
                        }`}
                        onClick={() =>
                          handleHealthFilter(
                            healthFilter === "Amber" ? null : "Amber"
                          )
                        }
                      >
                        Amber
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(portfolio.arr_by_bucket.Amber)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {(
                        (portfolio.arr_by_bucket.Amber / totalARR) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 dark:bg-amber-600"
                      style={{
                        width: `${
                          (portfolio.arr_by_bucket.Amber / totalARR) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {portfolio.arr_by_bucket.Red !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="red"
                        className={`cursor-pointer transition-opacity hover:opacity-80 ${
                          healthFilter === "Red"
                            ? "ring-2 ring-red-500 ring-offset-2 ring-offset-background"
                            : ""
                        }`}
                        onClick={() =>
                          handleHealthFilter(
                            healthFilter === "Red" ? null : "Red"
                          )
                        }
                      >
                        Red
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(portfolio.arr_by_bucket.Red)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {((portfolio.arr_by_bucket.Red / totalARR) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 dark:bg-red-600"
                      style={{
                        width: `${
                          (portfolio.arr_by_bucket.Red / totalARR) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ARR by Segment */}
        <Card>
          <CardHeader>
            <CardTitle>ARR by Segment</CardTitle>
            <CardDescription>
              Revenue distribution by customer size • Click to filter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(portfolio.arr_by_segment).map(
                ([segment, arr]) => (
                  <div key={segment}>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() =>
                          handleSegmentFilter(
                            segmentFilter === segment ? null : segment
                          )
                        }
                        className={`text-sm font-medium cursor-pointer transition-all hover:text-primary ${
                          segmentFilter === segment
                            ? "text-primary underline decoration-2 underline-offset-4"
                            : ""
                        }`}
                      >
                        {segment}
                      </button>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(arr)}
                      </span>
                    </div>
                    <div
                      className={`h-2 bg-secondary rounded-full overflow-hidden cursor-pointer transition-all ${
                        segmentFilter === segment
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : ""
                      }`}
                      onClick={() =>
                        handleSegmentFilter(
                          segmentFilter === segment ? null : segment
                        )
                      }
                    >
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(arr / totalARR) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Accounts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>All Accounts</CardTitle>
                {(healthFilter || segmentFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    {healthFilter && segmentFilter
                      ? "Clear All Filters"
                      : "Clear Filter"}
                  </Button>
                )}
              </div>
              <CardDescription>
                {healthFilter || segmentFilter ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {healthFilter && (
                      <Badge
                        variant={getHealthBadgeVariant(healthFilter)}
                        className="cursor-pointer"
                        onClick={() => handleHealthFilter(null)}
                      >
                        {healthFilter} ×
                      </Badge>
                    )}
                    {segmentFilter && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleSegmentFilter(null)}
                      >
                        {segmentFilter} ×
                      </Badge>
                    )}
                    <span>
                      {sortedAccounts.length} accounts • Showing{" "}
                      {startIndex + 1}-
                      {Math.min(endIndex, sortedAccounts.length)}
                    </span>
                  </div>
                ) : (
                  <>
                    {sortedAccounts.length} accounts • Showing {startIndex + 1}-
                    {Math.min(endIndex, sortedAccounts.length)}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allAccounts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Account
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("segment")}
                    >
                      <div className="flex items-center">
                        Segment
                        {getSortIcon("segment")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("health_bucket")}
                    >
                      <div className="flex items-center">
                        Health
                        {getSortIcon("health_bucket")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => handleSort("arr")}
                    >
                      <div className="flex items-center justify-end">
                        ARR
                        {getSortIcon("arr")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.name}
                      </TableCell>
                      <TableCell>{account.segment}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getHealthBadgeVariant(account.health_bucket)}
                        >
                          {account.health_bucket}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(account.arr)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/accounts/${account.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No accounts found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
