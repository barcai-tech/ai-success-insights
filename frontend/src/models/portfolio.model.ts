/**
 * Portfolio and insights model types
 */

export interface PortfolioMetrics {
  total_accounts: number;
  total_arr: number;
  avg_health_score: number;
  median_health_score: number;

  // ARR breakdown
  arr_by_bucket: Record<string, number>;
  arr_by_segment: Record<string, number>;

  // Risk distribution
  risk_breakdown: Record<string, number>;
  accounts_by_risk: Record<string, number>;

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

export interface PortfolioInsight {
  summary: string;
  key_findings: string[];
  top_risks: string[];
  opportunities: string[];
  generated_at: string;
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
