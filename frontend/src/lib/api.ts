// TypeScript types matching backend schemas
export interface Account {
  id: number;
  name: string;
  segment: "Enterprise" | "Mid-Market" | "SMB";
  region: string;
  arr: number;
  health_score: number;
  health_bucket: "Green" | "Amber" | "Red";
  active_users: number;
  seats_purchased: number;
  feature_x_adoption: number;
  weekly_active_pct: number;
  nps?: number;
  tickets_last_30d: number;
  critical_tickets_90d: number;
  sla_breaches_90d: number;
  time_to_value_days?: number;
  qbr_last_date?: string;
  renewal_date?: string;
  expansion_oppty_dollar: number;
  onboarding_phase: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountMetricsDaily {
  id: number;
  account_id: number;
  date: string;
  logins: number;
  events: number;
  feature_x_events: number;
  avg_session_min: number;
  errors: number;
  ticket_backlog: number;
}

export interface HealthFactor {
  factor: string;
  impact: number;
}

export interface HealthSnapshot {
  id: number;
  account_id: number;
  calculated_at: string;
  score: number;
  risk_label: "Green" | "Amber" | "Red";
  top_factors: HealthFactor[];
}

export interface AccountAction {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  estimated_impact: string;
  playbook_id?: number;
}

export interface AccountInsight {
  account_id: number;
  account_name: string;
  summary: string;
  health_analysis: string[]; // Array of 3 factual insights
  risk_factors: string[];
  recommended_actions: AccountAction[];
  generated_at: string;
}

export interface PortfolioInsight {
  summary: string;
  key_findings: string[];
  top_risks: string[];
  opportunities: string[];
  generated_at: string;
}

export interface PortfolioMetrics {
  total_accounts: number;
  total_arr: number;
  avg_health_score: number;
  median_health_score: number;

  // ARR breakdown
  arr_by_bucket: Record<string, number>; // {Green: $X, Amber: $Y, Red: $Z}
  arr_by_segment: Record<string, number>; // {Enterprise: $X, Mid-Market: $Y, SMB: $Z}

  // Risk distribution
  risk_breakdown: Record<string, number>; // {Green: N%, Amber: N%, Red: N%}
  accounts_by_risk: Record<string, number>; // {Green: N, Amber: N, Red: N}

  // Adoption metrics
  avg_adoption_ratio: number;
  avg_feature_adoption: number;

  // Support metrics
  total_tickets_30d: number;
  total_critical_90d: number;

  // Renewal risk
  renewals_next_60d: number;
  at_risk_arr: number;
}

export interface Playbook {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  estimated_effort: string;
  risk_factors: string[];
  steps: string[];
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// API Functions
export const api = {
  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    return apiCall("/health");
  },

  // Upload CSV
  async uploadCSV(file: File): Promise<{
    message: string;
    accounts_created: number;
    metrics_created: number;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/ingest/csv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  },

  // Generate mock data
  async generateMockData(count: number = 20): Promise<{
    message: string;
    accounts_created: number;
    metrics_created: number;
  }> {
    return apiCall(`/ingest/generate-mock?count=${count}`, {
      method: "POST",
    });
  },

  // Download CSV template
  downloadCSVTemplate(): void {
    const template = [
      [
        "name",
        "arr",
        "segment",
        "industry",
        "region",
        "renewal_date",
        "cs_owner",
        "active_users",
        "seats_purchased",
        "feature_x_adoption",
        "weekly_active_pct",
        "time_to_value_days",
        "tickets_last_30d",
        "critical_tickets_90d",
        "sla_breaches_90d",
        "nps",
        "qbr_last_date",
        "onboarding_phase",
        "expansion_oppty_dollar",
        "renewal_risk",
      ],
      [
        "Acme Corp",
        "250000",
        "Mid-Market",
        "SaaS",
        "North America",
        "2025-12-31",
        "Sarah Johnson",
        "120",
        "150",
        "0.75",
        "0.85",
        "30",
        "5",
        "2",
        "1",
        "65",
        "2025-09-15",
        "FALSE",
        "50000",
        "Low",
      ],
      [
        "TechStart Inc",
        "50000",
        "SMB",
        "Technology",
        "Europe",
        "2026-03-15",
        "Michael Chen",
        "25",
        "30",
        "0.60",
        "0.70",
        "45",
        "8",
        "1",
        "0",
        "55",
        "2025-08-20",
        "TRUE",
        "0",
        "Medium",
      ],
    ];

    const csv = template.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer_success_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Get all accounts
  async getAccounts(params?: {
    skip?: number;
    limit?: number;
    segment?: string;
    health_bucket?: string;
  }): Promise<{ accounts: Account[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    if (params?.segment) queryParams.append("segment", params.segment);
    if (params?.health_bucket)
      queryParams.append("health_bucket", params.health_bucket);

    return apiCall(`/accounts?${queryParams.toString()}`);
  },

  // Get single account
  async getAccount(id: number): Promise<Account> {
    return apiCall(`/accounts/${id}`);
  },

  // Get account health history
  async getHealthHistory(
    accountId: number,
    limit: number = 30
  ): Promise<HealthSnapshot[]> {
    return apiCall(`/accounts/${accountId}/health-history?limit=${limit}`);
  },

  // Get account metrics history
  async getMetricsHistory(
    accountId: number,
    days: number = 90
  ): Promise<AccountMetricsDaily[]> {
    return apiCall(`/accounts/${accountId}/metrics-history?days=${days}`);
  },

  // Get portfolio metrics
  async getPortfolioMetrics(): Promise<PortfolioMetrics> {
    return apiCall("/portfolio/summary");
  },

  // Recompute all health scores
  async recomputeHealth(): Promise<{
    message: string;
    accounts_updated: number;
  }> {
    return apiCall("/health/recompute", { method: "POST" });
  },

  // Generate portfolio insights
  async generatePortfolioInsight(): Promise<PortfolioInsight> {
    return apiCall("/insights/portfolio", { method: "POST" });
  },

  // Generate account insights
  async generateAccountInsight(accountId: number): Promise<AccountInsight> {
    return apiCall(`/insights/account/${accountId}`, { method: "POST" });
  },

  // Get playbooks
  async getPlaybooks(): Promise<Playbook[]> {
    return apiCall("/playbooks");
  },

  // Get recommended playbooks for an account
  async getRecommendedPlaybooks(accountId: number): Promise<Playbook[]> {
    return apiCall(`/playbooks/recommend/${accountId}`);
  },
};

// Utility functions
export function getHealthColor(bucket: string): string {
  switch (bucket.toLowerCase()) {
    case "green":
      return "text-green-500 dark:text-green-400";
    case "amber":
      return "text-amber-500 dark:text-amber-400";
    case "red":
      return "text-red-500 dark:text-red-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
}

export function getHealthBadgeVariant(
  bucket: string
): "default" | "secondary" | "destructive" | "green" | "amber" | "red" {
  switch (bucket.toLowerCase()) {
    case "green":
      return "green";
    case "amber":
      return "amber";
    case "red":
      return "red";
    default:
      return "secondary";
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInDays = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}
