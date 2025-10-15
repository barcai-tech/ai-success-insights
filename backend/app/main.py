"""
AI Success Insights API - Complete implementation matching specification.
FastAPI + SQLModel + explainable health scoring
"""
import io
import json
import time
from datetime import datetime
from typing import List, Optional

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, delete

from .database import get_db, init_db
from . import models, schemas, health_scoring
from .ai_service import ai_service

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="AI Success Insights API",
    description="Customer Success Analytics with Explainable Health Scoring",
    version="2.0.0"
)

# CORS middleware - Restrict to frontend only for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",  # Alternative port
        # TODO: Add production domain when deployed
        # "https://yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Success Insights API",
        "version": "2.0.0",
        "health_scoring": "explainable",
        "buckets": "Green (≥75), Amber (50-74), Red (<50)"
    }


# ==================== CSV INGESTION ====================

@app.post("/ingest/csv", response_model=schemas.CSVUploadResponse)
async def ingest_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and parse CSV file to create/update Accounts and Metrics.
    
    Expected CSV columns:
    - Account fields: name, arr, segment, industry, region, renewal_date, cs_owner
    - Adoption: active_users, seats_purchased, feature_x_adoption, weekly_active_pct, time_to_value_days
    - Support: tickets_last_30d, critical_tickets_90d, sla_breaches_90d, nps, qbr_last_date, onboarding_phase
    - Commercial: expansion_oppty_dollar, renewal_risk
    - Daily metrics (optional): date, logins, events, feature_x_events, avg_session_min, errors, ticket_backlog
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        accounts_created = 0
        accounts_updated = 0
        metrics_created = 0
        errors = []
        
        # Required account columns
        required_cols = ['name', 'arr', 'segment']
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain columns: {', '.join(required_cols)}"
            )
        
        # Process each unique account
        for account_name in df['name'].unique():
            account_df = df[df['name'] == account_name]
            
            try:
                # Get or create account
                statement = select(models.Account).where(models.Account.name == account_name)
                account = db.exec(statement).first()
                
                first_row = account_df.iloc[0]
                
                if not account:
                    # Create new account
                    account = models.Account(
                        name=account_name,
                        arr=float(first_row['arr']),
                        segment=models.SegmentEnum(first_row['segment']),
                        industry=first_row.get('industry'),
                        region=first_row.get('region'),
                        renewal_date=pd.to_datetime(first_row['renewal_date']).date() if pd.notna(first_row.get('renewal_date')) else None,
                        cs_owner=first_row.get('cs_owner'),
                        
                        # Adoption
                        active_users=int(first_row.get('active_users', 0)),
                        seats_purchased=int(first_row.get('seats_purchased', 1)),
                        feature_x_adoption=float(first_row.get('feature_x_adoption', 0)),
                        weekly_active_pct=float(first_row.get('weekly_active_pct', 0)),
                        time_to_value_days=int(first_row['time_to_value_days']) if pd.notna(first_row.get('time_to_value_days')) else None,
                        
                        # Support
                        tickets_last_30d=int(first_row.get('tickets_last_30d', 0)),
                        critical_tickets_90d=int(first_row.get('critical_tickets_90d', 0)),
                        sla_breaches_90d=int(first_row.get('sla_breaches_90d', 0)),
                        nps=float(first_row['nps']) if pd.notna(first_row.get('nps')) else None,
                        qbr_last_date=pd.to_datetime(first_row['qbr_last_date']).date() if pd.notna(first_row.get('qbr_last_date')) else None,
                        onboarding_phase=bool(first_row.get('onboarding_phase', False)),
                        
                        # Commercial
                        expansion_oppty_dollar=float(first_row.get('expansion_oppty_dollar', 0)),
                        renewal_risk=models.RenewalRiskEnum(first_row['renewal_risk']) if pd.notna(first_row.get('renewal_risk')) else None,
                    )
                    db.add(account)
                    db.commit()
                    db.refresh(account)
                    accounts_created += 1
                else:
                    # Update existing account
                    account.arr = float(first_row['arr'])
                    account.segment = models.SegmentEnum(first_row['segment'])
                    if 'industry' in first_row:
                        account.industry = first_row.get('industry')
                    if 'region' in first_row:
                        account.region = first_row.get('region')
                    if pd.notna(first_row.get('renewal_date')):
                        account.renewal_date = pd.to_datetime(first_row['renewal_date']).date()
                    if 'cs_owner' in first_row:
                        account.cs_owner = first_row.get('cs_owner')
                    
                    # Update metrics if present
                    if 'active_users' in first_row:
                        account.active_users = int(first_row.get('active_users', 0))
                    if 'seats_purchased' in first_row:
                        account.seats_purchased = int(first_row.get('seats_purchased', 1))
                    if 'feature_x_adoption' in first_row:
                        account.feature_x_adoption = float(first_row.get('feature_x_adoption', 0))
                    if 'weekly_active_pct' in first_row:
                        account.weekly_active_pct = float(first_row.get('weekly_active_pct', 0))
                    if pd.notna(first_row.get('time_to_value_days')):
                        account.time_to_value_days = int(first_row['time_to_value_days'])
                    
                    if 'tickets_last_30d' in first_row:
                        account.tickets_last_30d = int(first_row.get('tickets_last_30d', 0))
                    if 'critical_tickets_90d' in first_row:
                        account.critical_tickets_90d = int(first_row.get('critical_tickets_90d', 0))
                    if 'sla_breaches_90d' in first_row:
                        account.sla_breaches_90d = int(first_row.get('sla_breaches_90d', 0))
                    if pd.notna(first_row.get('nps')):
                        account.nps = float(first_row['nps'])
                    if pd.notna(first_row.get('qbr_last_date')):
                        account.qbr_last_date = pd.to_datetime(first_row['qbr_last_date']).date()
                    if 'onboarding_phase' in first_row:
                        account.onboarding_phase = bool(first_row.get('onboarding_phase', False))
                    
                    if 'expansion_oppty_dollar' in first_row:
                        account.expansion_oppty_dollar = float(first_row.get('expansion_oppty_dollar', 0))
                    if pd.notna(first_row.get('renewal_risk')):
                        account.renewal_risk = models.RenewalRiskEnum(first_row['renewal_risk'])
                    
                    account.updated_at = datetime.utcnow()
                    db.add(account)
                    db.commit()
                    db.refresh(account)
                    accounts_updated += 1
                
                # Process daily metrics if present
                if 'date' in df.columns:
                    for _, row in account_df.iterrows():
                        if pd.notna(row.get('date')):
                            metric_date = pd.to_datetime(row['date']).date()
                            
                            # Check if exists
                            stmt = select(models.AccountMetricsDaily).where(
                                models.AccountMetricsDaily.account_id == account.id,
                                models.AccountMetricsDaily.date == metric_date
                            )
                            existing = db.exec(stmt).first()
                            
                            if not existing:
                                metric = models.AccountMetricsDaily(
                                    account_id=account.id,
                                    date=metric_date,
                                    logins=int(row.get('logins', 0)),
                                    events=int(row.get('events', 0)),
                                    feature_x_events=int(row.get('feature_x_events', 0)),
                                    avg_session_min=float(row.get('avg_session_min', 0)),
                                    errors=int(row.get('errors', 0)),
                                    ticket_backlog=int(row.get('ticket_backlog', 0)),
                                )
                                db.add(metric)
                                metrics_created += 1
                
                # Calculate health score and create snapshot
                health_scoring.save_health_snapshot(db, account)
                
            except Exception as e:
                errors.append(f"Error processing account {account_name}: {str(e)}")
        
        db.commit()
        
        return schemas.CSVUploadResponse(
            message="CSV processed successfully",
            accounts_created=accounts_created,
            accounts_updated=accounts_updated,
            metrics_created=metrics_created,
            errors=errors
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")


@app.post("/ingest/generate-mock", response_model=schemas.CSVUploadResponse)
async def generate_mock_data(
    count: int = Query(20, ge=1, le=100, description="Number of accounts to generate"),
    db: Session = Depends(get_db)
):
    """
    Generate random mock account data for testing and demos.
    Clears all existing data and creates fresh sample accounts with health metrics and daily data.
    """
    import random
    from datetime import date, timedelta
    
    companies = [
        "Acme Corp", "TechStart Inc", "Global Solutions", "Innovation Labs", 
        "DataFlow Systems", "CloudPeak Technologies", "NextGen Software",
        "Apex Industries", "Velocity Dynamics", "Quantum Enterprises",
        "Fusion Partners", "Catalyst Group", "Horizon Ventures", "Pinnacle Corp",
        "Zenith Systems", "Nexus Technologies", "Vortex Solutions", "Sigma Inc",
        "Omega Digital", "Alpha Innovations", "Beta Technologies", "Gamma Corp",
        "Delta Systems", "Epsilon Group", "Zeta Ventures", "Theta Partners",
        "Iota Solutions", "Kappa Industries", "Lambda Tech", "Mu Enterprises"
    ]
    
    segments = ["SMB", "Mid-Market", "Enterprise"]
    regions = ["North America", "Europe", "APAC", "LATAM"]
    industries = ["SaaS", "Healthcare", "Finance", "Retail", "Manufacturing", "Education"]
    cs_owners = ["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", "Jessica Taylor"]
    
    accounts_created = 0
    metrics_created = 0
    errors = []
    
    try:
        # Clear all existing data
        db.exec(delete(models.AccountMetricsDaily))
        db.exec(delete(models.HealthSnapshot))
        db.exec(delete(models.Account))
        db.commit()
        
        # Select random companies
        selected_companies = random.sample(companies, min(count, len(companies)))
        
        for idx, company_name in enumerate(selected_companies):
            try:
                # Generate random account data
                segment = random.choice(segments)
                
                # ARR based on segment
                if segment == "SMB":
                    arr = random.randint(10_000, 100_000)
                elif segment == "Mid-Market":
                    arr = random.randint(100_000, 1_000_000)
                else:  # Enterprise
                    arr = random.randint(1_000_000, 10_000_000)
                
                # Create health profile distribution: 40% healthy, 40% moderate, 20% at-risk
                health_profile = idx % 5  # 0,1 = healthy, 2,3 = moderate, 4 = at-risk
                
                seats = random.randint(20, 500)
                
                if health_profile < 2:  # Healthy accounts (40%)
                    active_users = int(seats * random.uniform(0.75, 1.0))
                    feature_adoption = random.uniform(0.6, 0.95)
                    weekly_active = random.uniform(0.65, 0.9)
                    tickets_30d = random.randint(0, 5)
                    critical_tickets = random.randint(0, 1)
                    sla_breaches = 0
                    nps = random.uniform(40, 90)
                    expansion_oppty = random.choice([0, random.randint(50_000, 500_000)])
                    qbr_days_ago = random.randint(0, 60)
                elif health_profile < 4:  # Moderate accounts (40%)
                    active_users = int(seats * random.uniform(0.45, 0.75))
                    feature_adoption = random.uniform(0.35, 0.65)
                    weekly_active = random.uniform(0.4, 0.65)
                    tickets_30d = random.randint(3, 12)
                    critical_tickets = random.randint(1, 3)
                    sla_breaches = random.randint(0, 1)
                    nps = random.uniform(0, 50)
                    expansion_oppty = 0 if random.random() > 0.3 else random.randint(10_000, 100_000)
                    qbr_days_ago = random.randint(45, 120)
                else:  # At-risk accounts (20%)
                    active_users = int(seats * random.uniform(0.15, 0.45))
                    feature_adoption = random.uniform(0.1, 0.4)
                    weekly_active = random.uniform(0.15, 0.45)
                    tickets_30d = random.randint(10, 25)
                    critical_tickets = random.randint(2, 5)
                    sla_breaches = random.randint(1, 3)
                    nps = random.uniform(-50, 20)
                    expansion_oppty = 0
                    qbr_days_ago = random.randint(90, 180)
                
                account = models.Account(
                    name=company_name,
                    arr=float(arr),
                    segment=models.SegmentEnum(segment),
                    industry=random.choice(industries),
                    region=random.choice(regions),
                    renewal_date=(date.today() + timedelta(days=random.randint(30, 365))),
                    cs_owner=random.choice(cs_owners),
                    
                    # Adoption metrics
                    active_users=active_users,
                    seats_purchased=seats,
                    feature_x_adoption=feature_adoption,
                    weekly_active_pct=weekly_active,
                    time_to_value_days=random.randint(7, 90) if random.random() > 0.3 else None,
                    
                    # Support metrics
                    tickets_last_30d=tickets_30d,
                    critical_tickets_90d=critical_tickets,
                    sla_breaches_90d=sla_breaches,
                    nps=nps,
                    qbr_last_date=(date.today() - timedelta(days=qbr_days_ago)),
                    onboarding_phase=health_profile == 4 and random.random() > 0.5,  # Some at-risk are in onboarding
                    
                    # Commercial
                    expansion_oppty_dollar=float(expansion_oppty),
                    renewal_risk=(
                        None if health_profile < 2 else
                        models.RenewalRiskEnum.LOW if health_profile < 3 else
                        models.RenewalRiskEnum.MED if health_profile < 4 else
                        models.RenewalRiskEnum.HIGH
                    ) if random.random() > 0.3 else None,
                )
                
                db.add(account)
                db.commit()
                db.refresh(account)
                accounts_created += 1
                
                # Generate 30 days of daily metrics aligned with health profile
                for days_ago in range(30):
                    metric_date = date.today() - timedelta(days=days_ago)
                    
                    # Align daily metrics with health profile
                    if health_profile < 2:  # Healthy
                        base_logins = active_users * random.uniform(0.65, 0.9)
                        base_events = active_users * random.uniform(30, 60)
                        session_time = random.uniform(20, 45)
                        error_count = random.randint(0, 3)
                        ticket_backlog = random.randint(0, 5)
                    elif health_profile < 4:  # Moderate
                        base_logins = active_users * random.uniform(0.4, 0.7)
                        base_events = active_users * random.uniform(15, 35)
                        session_time = random.uniform(10, 25)
                        error_count = random.randint(2, 8)
                        ticket_backlog = random.randint(3, 12)
                    else:  # At-risk
                        base_logins = active_users * random.uniform(0.2, 0.5)
                        base_events = active_users * random.uniform(5, 20)
                        session_time = random.uniform(5, 15)
                        error_count = random.randint(5, 15)
                        ticket_backlog = random.randint(8, 20)
                    
                    metric = models.AccountMetricsDaily(
                        account_id=account.id,
                        date=metric_date,
                        logins=int(base_logins),
                        events=int(base_events),
                        feature_x_events=int(base_events * feature_adoption),
                        avg_session_min=session_time,
                        errors=error_count,
                        ticket_backlog=ticket_backlog,
                    )
                    db.add(metric)
                    metrics_created += 1
                
                # Calculate health score and create snapshot
                health_scoring.save_health_snapshot(db, account)
                
            except Exception as e:
                errors.append(f"Error creating account {company_name}: {str(e)}")
        
        db.commit()
        
        return schemas.CSVUploadResponse(
            message=f"Successfully generated {accounts_created} mock accounts",
            accounts_created=accounts_created,
            accounts_updated=0,
            metrics_created=metrics_created,
            errors=errors
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating mock data: {str(e)}")


# ==================== ACCOUNTS ====================

@app.get("/accounts", response_model=schemas.AccountListResponse)
async def list_accounts(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    segment: Optional[str] = None,
    bucket: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List accounts with pagination and filters.
    
    Filters:
    - segment: SMB, Mid-Market, Enterprise
    - bucket: Green, Amber, Red
    - region: Any region value
    """
    statement = select(models.Account)
    
    # Apply filters
    if segment:
        statement = statement.where(models.Account.segment == segment)
    if bucket:
        bucket_enum = models.HealthBucketEnum[bucket.upper()]
        statement = statement.where(models.Account.health_bucket == bucket_enum)
    if region:
        statement = statement.where(models.Account.region == region)
    
    # Get total count
    total_statement = statement
    total = len(db.exec(total_statement).all())
    
    # Apply pagination
    offset = (page - 1) * page_size
    statement = statement.offset(offset).limit(page_size)
    
    accounts = db.exec(statement).all()
    
    # Convert to response models
    account_responses = []
    for account in accounts:
        # Get latest health snapshot
        snapshot_stmt = select(models.HealthSnapshot).where(
            models.HealthSnapshot.account_id == account.id
        ).order_by(models.HealthSnapshot.calculated_at.desc()).limit(1)
        latest_snapshot = db.exec(snapshot_stmt).first()
        
        account_dict = schemas.AccountResponse.model_validate(account)
        if latest_snapshot:
            factors = json.loads(latest_snapshot.top_factors)
            account_dict.latest_health_factors = [
                schemas.HealthFactor(**f) for f in factors[:5]
            ]
        
        account_responses.append(account_dict)
    
    return schemas.AccountListResponse(
        total=total,
        page=page,
        page_size=page_size,
        accounts=account_responses
    )


@app.get("/accounts/{account_id}", response_model=schemas.AccountResponse)
async def get_account(
    account_id: int,
    db: Session = Depends(get_db)
):
    """
    Get account detail with latest health factors.
    """
    account = db.get(models.Account, account_id)
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get latest health snapshot
    snapshot_stmt = select(models.HealthSnapshot).where(
        models.HealthSnapshot.account_id == account_id
    ).order_by(models.HealthSnapshot.calculated_at.desc()).limit(1)
    latest_snapshot = db.exec(snapshot_stmt).first()
    
    account_response = schemas.AccountResponse.model_validate(account)
    if latest_snapshot:
        factors = json.loads(latest_snapshot.top_factors)
        account_response.latest_health_factors = [
            schemas.HealthFactor(**f) for f in factors
        ]
    
    return account_response


# ==================== HEALTH ====================

@app.post("/health/recompute", response_model=schemas.HealthRecomputeResponse)
async def recompute_health(db: Session = Depends(get_db)):
    """
    Recompute health scores for all accounts with explainable factors.
    Creates new health snapshots.
    """
    start_time = time.time()
    
    accounts_updated = health_scoring.recompute_all_health_scores(db)
    
    computation_time = time.time() - start_time
    
    return schemas.HealthRecomputeResponse(
        message=f"Successfully recomputed health scores for {accounts_updated} accounts",
        accounts_updated=accounts_updated,
        snapshots_created=accounts_updated,
        computation_time_seconds=round(computation_time, 2)
    )


@app.get("/accounts/{account_id}/health-history", response_model=List[schemas.HealthSnapshotResponse])
async def get_health_history(
    account_id: int,
    limit: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get historical health snapshots for an account.
    """
    account = db.get(models.Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    statement = select(models.HealthSnapshot).where(
        models.HealthSnapshot.account_id == account_id
    ).order_by(models.HealthSnapshot.calculated_at.desc()).limit(limit)
    
    snapshots = db.exec(statement).all()
    
    result = []
    for snapshot in snapshots:
        factors_json = json.loads(snapshot.top_factors)
        snapshot_dict = schemas.HealthSnapshotResponse(
            id=snapshot.id,
            account_id=snapshot.account_id,
            calculated_at=snapshot.calculated_at,
            score=snapshot.score,
            risk_label=snapshot.risk_label.value,
            top_factors=[schemas.HealthFactor(**f) for f in factors_json]
        )
        result.append(snapshot_dict)
    
    return result


@app.get("/accounts/{account_id}/metrics-history", response_model=List[schemas.AccountMetricsResponse])
async def get_metrics_history(
    account_id: int,
    days: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get historical daily metrics for an account.
    """
    account = db.get(models.Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    statement = select(models.AccountMetricsDaily).where(
        models.AccountMetricsDaily.account_id == account_id
    ).order_by(models.AccountMetricsDaily.date.desc()).limit(days)
    
    metrics = db.exec(statement).all()
    
    return metrics


# ==================== PORTFOLIO ====================

@app.get("/portfolio/summary", response_model=schemas.PortfolioSummary)
async def get_portfolio_summary(db: Session = Depends(get_db)):
    """
    Get comprehensive portfolio summary with health breakdown.
    """
    from datetime import timedelta
    import statistics
    
    accounts = db.exec(select(models.Account)).all()
    
    if not accounts:
        return schemas.PortfolioSummary(
            total_accounts=0,
            total_arr=0.0,
            arr_by_bucket={},
            arr_by_segment={},
            risk_breakdown={},
            accounts_by_risk={},
            avg_health_score=0.0,
            median_health_score=0.0,
            avg_adoption_ratio=0.0,
            avg_feature_adoption=0.0,
            total_tickets_30d=0,
            total_critical_90d=0,
            renewals_next_60d=0,
            at_risk_arr=0.0
        )
    
    total_arr = sum(a.arr for a in accounts)
    
    # ARR breakdowns
    arr_by_bucket = {}
    arr_by_segment = {}
    accounts_by_risk = {}
    
    for account in accounts:
        # By bucket
        bucket = account.health_bucket.value if account.health_bucket else "Unknown"
        arr_by_bucket[bucket] = arr_by_bucket.get(bucket, 0.0) + account.arr
        accounts_by_risk[bucket] = accounts_by_risk.get(bucket, 0) + 1
        
        # By segment
        segment = account.segment.value
        arr_by_segment[segment] = arr_by_segment.get(segment, 0.0) + account.arr
    
    # Risk breakdown percentages
    total_accounts = len(accounts)
    risk_breakdown = {
        bucket: round(count / total_accounts * 100, 1)
        for bucket, count in accounts_by_risk.items()
    }
    
    # Health scores
    health_scores = [a.health_score for a in accounts if a.health_score]
    avg_health_score = statistics.mean(health_scores) if health_scores else 0.0
    median_health_score = statistics.median(health_scores) if health_scores else 0.0
    
    # Adoption metrics
    adoption_ratios = [
        a.active_users / max(1, a.seats_purchased)
        for a in accounts
    ]
    avg_adoption_ratio = statistics.mean(adoption_ratios) if adoption_ratios else 0.0
    
    feature_adoptions = [a.feature_x_adoption for a in accounts]
    avg_feature_adoption = statistics.mean(feature_adoptions) if feature_adoptions else 0.0
    
    # Support metrics
    total_tickets_30d = sum(a.tickets_last_30d for a in accounts)
    total_critical_90d = sum(a.critical_tickets_90d for a in accounts)
    
    # Renewal risk
    today = datetime.now().date()
    renewals_next_60d = sum(
        1 for a in accounts
        if a.renewal_date and 0 <= (a.renewal_date - today).days <= 60
    )
    
    at_risk_arr = sum(
        a.arr for a in accounts
        if a.health_bucket and a.health_bucket in [models.HealthBucketEnum.AMBER, models.HealthBucketEnum.RED]
    )
    
    return schemas.PortfolioSummary(
        total_accounts=total_accounts,
        total_arr=round(total_arr, 2),
        arr_by_bucket={k: round(v, 2) for k, v in arr_by_bucket.items()},
        arr_by_segment={k: round(v, 2) for k, v in arr_by_segment.items()},
        risk_breakdown=risk_breakdown,
        accounts_by_risk=accounts_by_risk,
        avg_health_score=round(avg_health_score, 2),
        median_health_score=round(median_health_score, 2),
        avg_adoption_ratio=round(avg_adoption_ratio, 2),
        avg_feature_adoption=round(avg_feature_adoption, 2),
        total_tickets_30d=total_tickets_30d,
        total_critical_90d=total_critical_90d,
        renewals_next_60d=renewals_next_60d,
        at_risk_arr=round(at_risk_arr, 2)
    )


# ==================== AI INSIGHTS ====================

@app.post("/insights/portfolio", response_model=schemas.PortfolioInsight)
async def generate_portfolio_insights(
    request: Optional[schemas.InsightRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered portfolio insights.
    """
    # Get portfolio summary data
    summary_response = await get_portfolio_summary(db)
    portfolio_data = summary_response.model_dump()
    
    insight = await ai_service.generate_portfolio_insight(portfolio_data)
    return insight


@app.post("/insights/account/{account_id}", response_model=schemas.AccountInsight)
async def generate_account_insights(
    account_id: int,
    request: Optional[schemas.InsightRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered account insights with 3 recommended actions.
    Uses latest health snapshot for explainable risk factors.
    """
    account = db.get(models.Account, account_id)
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get latest health snapshot with factors
    snapshot_stmt = select(models.HealthSnapshot).where(
        models.HealthSnapshot.account_id == account_id
    ).order_by(models.HealthSnapshot.calculated_at.desc()).limit(1)
    latest_snapshot = db.exec(snapshot_stmt).first()
    
    risk_factors = []
    if latest_snapshot:
        factors_json = json.loads(latest_snapshot.top_factors)
        # Get negative impact factors as risks
        risk_factors = [
            f['factor'] for f in factors_json if f['impact'] < 0
        ]
    
    # Generate AI insights
    insight = await ai_service.generate_account_insight(
        account,
        risk_factors,
        None,  # metrics
        None   # trend data
    )
    
    return insight


# ==================== PLAYBOOKS ====================

@app.get("/playbooks", response_model=List[schemas.Playbook])
async def get_playbooks():
    """
    Get all available playbooks from the library.
    """
    from . import playbooks
    return playbooks.get_all_playbooks()


@app.post("/actions/recommend", response_model=schemas.PlaybookRecommendations)
async def recommend_actions(
    account_id: Optional[int] = None,
    risk_factors: Optional[List[str]] = None,
    db: Session = Depends(get_db)
):
    """
    Get playbook recommendations matched to risk factors.
    
    If account_id is provided, risk factors will be automatically identified from health snapshot.
    Otherwise, provide risk_factors directly.
    """
    from . import playbooks
    
    if account_id:
        # Get account and latest health snapshot
        account = db.get(models.Account, account_id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        snapshot_stmt = select(models.HealthSnapshot).where(
            models.HealthSnapshot.account_id == account_id
        ).order_by(models.HealthSnapshot.calculated_at.desc()).limit(1)
        latest_snapshot = db.exec(snapshot_stmt).first()
        
        if latest_snapshot:
            factors_json = json.loads(latest_snapshot.top_factors)
            # Get negative impact factors
            risk_factors = [
                f['factor'] for f in factors_json if f['impact'] < 0
            ]
        else:
            risk_factors = []
    
    if not risk_factors:
        risk_factors = []
    
    recommendations = playbooks.recommend_playbooks(risk_factors)
    
    return schemas.PlaybookRecommendations(
        account_id=account_id,
        recommendations=recommendations
    )
