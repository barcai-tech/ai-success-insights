from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from .models import SegmentEnum, RenewalRiskEnum, HealthBucketEnum


# Account Schemas
class AccountBase(BaseModel):
    account_name: str
    segment: Optional[str] = None
    region: Optional[str] = None
    arr: float = 0.0


class AccountCreate(AccountBase):
    pass


class AccountUpdate(AccountBase):
    account_name: Optional[str] = None
    arr: Optional[float] = None


class AccountMetricsDailyBase(BaseModel):
    date: date
    daily_active_users: int = 0
    feature_adoption_rate: float = 0.0
    support_tickets_open: int = 0
    nps_score: Optional[float] = None
    login_frequency: float = 0.0


class AccountMetricsDailyCreate(AccountMetricsDailyBase):
    account_id: int


class AccountMetricsDaily(AccountMetricsDailyBase):
    id: int
    account_id: int
    health_score: float

    class Config:
        from_attributes = True


class TrendData(BaseModel):
    days: int
    health_score_change: float
    arr_change: float
    engagement_trend: str  # "improving", "stable", "declining"


class Account(AccountBase):
    id: int
    health_bucket: Optional[str] = None
    health_score: float = 0.0
    created_at: datetime
    updated_at: datetime
    latest_metrics: Optional[AccountMetricsDaily] = None
    trend_30d: Optional[TrendData] = None
    trend_60d: Optional[TrendData] = None
    trend_90d: Optional[TrendData] = None

    class Config:
        from_attributes = True


class AccountList(BaseModel):
    total: int
    page: int
    page_size: int
    accounts: List[Account]


# Portfolio Schemas
class PortfolioSummary(BaseModel):
    total_accounts: int
    total_arr: float
    arr_by_bucket: dict  # {"Healthy": 1000000, "At-Risk": 500000, "Critical": 200000}
    risk_breakdown: dict  # {"Healthy": 50, "At-Risk": 30, "Critical": 20}
    arr_trend_30d: float
    arr_trend_90d: float
    avg_health_score: float
    accounts_by_segment: dict


# Insights Schemas
class InsightRequest(BaseModel):
    include_recommendations: bool = True
    focus_areas: Optional[List[str]] = None


class PortfolioInsight(BaseModel):
    summary: str
    key_findings: List[str]
    top_risks: List[str]
    opportunities: List[str]
    generated_at: datetime


class AccountAction(BaseModel):
    title: str
    description: str
    priority: str  # "High", "Medium", "Low"
    estimated_impact: str
    playbook_id: Optional[int] = None


class AccountInsight(BaseModel):
    account_id: int
    account_name: str
    summary: str
    health_analysis: str
    risk_factors: List[str]
    recommended_actions: List[AccountAction]
    generated_at: datetime


# Playbook Schemas
class PlaybookBase(BaseModel):
    title: str
    description: str
    category: str
    priority: str
    estimated_effort: str


class PlaybookCreate(PlaybookBase):
    risk_factors: List[str]
    steps: List[str]


class Playbook(PlaybookBase):
    id: int
    risk_factors: List[str]
    steps: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PlaybookRecommendation(BaseModel):
    playbook: Playbook
    relevance_score: float
    matching_risk_factors: List[str]


class PlaybookRecommendations(BaseModel):
    account_id: Optional[int] = None
    recommendations: List[PlaybookRecommendation]


# CSV Upload Schema
class CSVUploadResponse(BaseModel):
    message: str
    accounts_created: int
    accounts_updated: int
    metrics_created: int
    errors: List[str] = []


# Health Recompute Schema
class HealthRecomputeResponse(BaseModel):
    message: str
    accounts_updated: int
    computation_time_seconds: float
