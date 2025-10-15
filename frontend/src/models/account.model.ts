/**
 * Account model types
 */

export type Segment = "Enterprise" | "Mid-Market" | "SMB";
export type HealthBucket = "Green" | "Amber" | "Red";
export type Priority = "High" | "Medium" | "Low";

export interface Account {
  id: number;
  name: string;
  segment: Segment;
  region: string;
  arr: number;
  health_score: number;
  health_bucket: HealthBucket;
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
  risk_label: HealthBucket;
  top_factors: HealthFactor[];
}

export interface AccountAction {
  title: string;
  description: string;
  priority: Priority;
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
