from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from datetime import date as date_type
from enum import Enum


# Enums
class SegmentEnum(str, Enum):
    SMB = "SMB"
    MM = "Mid-Market"
    ENT = "Enterprise"


class RenewalRiskEnum(str, Enum):
    LOW = "Low"
    MED = "Medium"
    HIGH = "High"


class HealthBucketEnum(str, Enum):
    GREEN = "Green"
    AMBER = "Amber"
    RED = "Red"


# Models
class Account(SQLModel, table=True):
    """
    Main account/customer record with all CS-relevant fields
    """
    __tablename__ = "accounts"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=255)
    arr: float = Field(default=0.0, ge=0)
    segment: SegmentEnum = Field(index=True)
    industry: Optional[str] = Field(default=None, max_length=100)
    region: Optional[str] = Field(default=None, max_length=50, index=True)
    renewal_date: Optional[date_type] = Field(default=None, index=True)
    cs_owner: Optional[str] = Field(default=None, max_length=100)
    
    # Adoption & engagement
    active_users: int = Field(default=0, ge=0)
    seats_purchased: int = Field(default=1, ge=1)
    feature_x_adoption: float = Field(default=0.0, ge=0.0, le=1.0)  # 0-1 normalized
    weekly_active_pct: float = Field(default=0.0, ge=0.0, le=1.0)  # 0-1 normalized
    time_to_value_days: Optional[int] = Field(default=None, ge=0)
    
    # Support & risk
    tickets_last_30d: int = Field(default=0, ge=0)
    critical_tickets_90d: int = Field(default=0, ge=0)
    sla_breaches_90d: int = Field(default=0, ge=0)
    nps: Optional[float] = Field(default=None, ge=-100, le=100)  # -100 to 100
    qbr_last_date: Optional[date_type] = Field(default=None)
    onboarding_phase: bool = Field(default=False)
    
    # Outcome signals
    expansion_oppty_dollar: float = Field(default=0.0, ge=0)
    renewal_risk: Optional[RenewalRiskEnum] = Field(default=None, index=True)
    
    # Computed health
    health_score: float = Field(default=0.0, ge=0, le=100)
    health_bucket: Optional[HealthBucketEnum] = Field(default=None, index=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    daily_metrics: List["AccountMetricsDaily"] = Relationship(back_populates="account")
    health_snapshots: List["HealthSnapshot"] = Relationship(back_populates="account")


class AccountMetricsDaily(SQLModel, table=True):
    """
    Daily activity metrics per account
    """
    __tablename__ = "account_metrics_daily"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="accounts.id", index=True)
    date: date_type = Field(index=True)
    
    # Activity metrics
    logins: int = Field(default=0, ge=0)
    events: int = Field(default=0, ge=0)
    feature_x_events: int = Field(default=0, ge=0)
    avg_session_min: float = Field(default=0.0, ge=0)
    errors: int = Field(default=0, ge=0)
    ticket_backlog: int = Field(default=0, ge=0)
    
    # Relationship
    account: Optional[Account] = Relationship(back_populates="daily_metrics")
    
    class Config:
        # Unique constraint on account_id + date
        table_args = {"sqlite_autoincrement": True}


class HealthSnapshot(SQLModel, table=True):
    """
    Historical health score snapshots with explainable factors
    """
    __tablename__ = "health_snapshots"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="accounts.id", index=True)
    calculated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    score: float = Field(ge=0, le=110)  # 0-100 + up to 10 bonus
    risk_label: HealthBucketEnum
    top_factors: str = Field(default="[]")  # JSON array of {factor, impact}
    
    # Relationship
    account: Optional[Account] = Relationship(back_populates="health_snapshots")
