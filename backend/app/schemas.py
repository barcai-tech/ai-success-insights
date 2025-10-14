"""
Pydantic schemas for API request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# ==================== Health Factor ====================

class HealthFactor(BaseModel):
    """Individual factor contributing to health score"""
    factor: str
    impact: float
    
    class Config:
        from_attributes = True


# ==================== Account Schemas ====================

class AccountBase(BaseModel):
    """Base account fields"""
    name: str = Field(..., max_length=255)
    arr: float = Field(..., ge=0)
    segment: str  # SMB, Mid-Market, Enterprise
    industry: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=50)
    renewal_date: Optional[date] = None
    cs_owner: Optional[str] = Field(None, max_length=100)
    
    # Adoption & engagement
    active_users: int = Field(0, ge=0)
    seats_purchased: int = Field(1, ge=1)
    feature_x_adoption: float = Field(0.0, ge=0.0, le=1.0)
    weekly_active_pct: float = Field(0.0, ge=0.0, le=1.0)
    time_to_value_days: Optional[int] = Field(None, ge=0)
    
    # Support & risk
    tickets_last_30d: int = Field(0, ge=0)
    critical_tickets_90d: int = Field(0, ge=0)
    sla_breaches_90d: int = Field(0, ge=0)
    nps: Optional[float] = Field(None, ge=-100, le=100)
    qbr_last_date: Optional[date] = None
    onboarding_phase: bool = False
    
    # Outcome signals
    expansion_oppty_dollar: float = Field(0.0, ge=0)
    renewal_risk: Optional[str] = None  # Low, Medium, High


class AccountCreate(AccountBase):
    """Schema for creating new account"""
    pass


class AccountResponse(AccountBase):
    """Full account response with computed fields"""
    id: int
    health_score: float
    health_bucket: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Optional enriched data
    latest_health_factors: Optional[List[HealthFactor]] = None
    
    class Config:
        from_attributes = True


class AccountListResponse(BaseModel):
    """Paginated account list response"""
    total: int
    page: int
    page_size: int
    accounts: List[AccountResponse]


# ==================== Metrics Schemas ====================

class AccountMetricsBase(BaseModel):
    """Daily metrics for an account"""
    date: date
    logins: int = Field(0, ge=0)
    events: int = Field(0, ge=0)
    feature_x_events: int = Field(0, ge=0)
    avg_session_min: float = Field(0.0, ge=0)
    errors: int = Field(0, ge=0)
    ticket_backlog: int = Field(0, ge=0)


class AccountMetricsCreate(AccountMetricsBase):
    """Create metrics for an account"""
    account_id: int


class AccountMetricsResponse(AccountMetricsBase):
    """Metrics response"""
    id: int
    account_id: int
    
    class Config:
        from_attributes = True


# ==================== Health Snapshot Schemas ====================

class HealthSnapshotResponse(BaseModel):
    """Health snapshot with explainable factors"""
    id: int
    account_id: int
    calculated_at: datetime
    score: float
    risk_label: str
    top_factors: List[HealthFactor]
    
    class Config:
        from_attributes = True


# ==================== Portfolio Schemas ====================

class PortfolioSummary(BaseModel):
    """Portfolio-level summary statistics"""
    total_accounts: int
    total_arr: float
    
    # ARR breakdown
    arr_by_bucket: dict  # {Green: $X, Amber: $Y, Red: $Z}
    arr_by_segment: dict  # {Enterprise: $X, Mid-Market: $Y, SMB: $Z}
    
    # Risk distribution
    risk_breakdown: dict  # {Green: N%, Amber: N%, Red: N%}
    accounts_by_risk: dict  # {Green: N, Amber: N, Red: N}
    
    # Health metrics
    avg_health_score: float
    median_health_score: float
    
    # Adoption metrics
    avg_adoption_ratio: float
    avg_feature_adoption: float
    
    # Support metrics
    total_tickets_30d: int
    total_critical_90d: int
    
    # Renewal risk
    renewals_next_60d: int
    at_risk_arr: float


# ==================== AI Insights Schemas ====================

class InsightRequest(BaseModel):
    """Request for AI insights"""
    include_recommendations: bool = True
    focus_areas: Optional[List[str]] = None


class PortfolioInsight(BaseModel):
    """AI-generated portfolio insights"""
    summary: str
    key_findings: List[str]
    top_risks: List[str]
    opportunities: List[str]
    generated_at: datetime


class AccountAction(BaseModel):
    """Recommended action for an account"""
    title: str
    description: str
    priority: str  # High, Medium, Low
    estimated_impact: str
    playbook_id: Optional[int] = None


class AccountInsight(BaseModel):
    """AI-generated account insights"""
    account_id: int
    account_name: str
    summary: str
    health_analysis: str
    risk_factors: List[str]
    recommended_actions: List[AccountAction]
    generated_at: datetime


# ==================== Playbook Schemas ====================

class PlaybookBase(BaseModel):
    """Base playbook fields"""
    title: str
    description: str
    category: str
    priority: str
    estimated_effort: str


class Playbook(PlaybookBase):
    """Full playbook with steps"""
    id: int
    risk_factors: List[str]
    steps: List[str]
    created_at: Optional[datetime] = None


class PlaybookRecommendation(BaseModel):
    """Playbook recommendation with relevance"""
    playbook: Playbook
    relevance_score: float
    matching_risk_factors: List[str]


class PlaybookRecommendations(BaseModel):
    """List of playbook recommendations"""
    account_id: Optional[int] = None
    recommendations: List[PlaybookRecommendation]


# ==================== CSV Upload Schemas ====================

class CSVUploadResponse(BaseModel):
    """Response from CSV upload"""
    message: str
    accounts_created: int
    accounts_updated: int
    metrics_created: int
    errors: List[str] = []


# ==================== Health Recompute Schemas ====================

class HealthRecomputeResponse(BaseModel):
    """Response from health recompute"""
    message: str
    accounts_updated: int
    snapshots_created: int
    computation_time_seconds: float
