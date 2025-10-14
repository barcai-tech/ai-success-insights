from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
import io
from datetime import datetime, date
import time

from .database import get_db, init_db
from . import models, schemas, services, playbooks
from .ai_service import ai_service

app = FastAPI(
    title="AI Success Insights API",
    description="Customer Success Analytics and Insights Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
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
        "version": "1.0.0"
    }


# ==================== CSV INGESTION ====================

@app.post("/ingest/csv", response_model=schemas.CSVUploadResponse)
async def ingest_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and parse CSV file to create/update Accounts and AccountMetricsDaily.
    
    Expected CSV format:
    account_name, segment, region, arr, date, daily_active_users, feature_adoption_rate, 
    support_tickets_open, nps_score, login_frequency
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
        
        # Group by account
        for account_name in df['account_name'].unique():
            account_df = df[df['account_name'] == account_name]
            
            try:
                # Get or create account
                account = db.query(models.Account).filter(
                    models.Account.account_name == account_name
                ).first()
                
                if not account:
                    # Create new account
                    first_row = account_df.iloc[0]
                    account = models.Account(
                        account_name=account_name,
                        segment=first_row.get('segment'),
                        region=first_row.get('region'),
                        arr=float(first_row.get('arr', 0))
                    )
                    db.add(account)
                    db.flush()  # Get the ID
                    accounts_created += 1
                else:
                    # Update existing account
                    first_row = account_df.iloc[0]
                    account.segment = first_row.get('segment', account.segment)
                    account.region = first_row.get('region', account.region)
                    account.arr = float(first_row.get('arr', account.arr))
                    account.updated_at = datetime.utcnow()
                    accounts_updated += 1
                
                # Process metrics for each date
                for _, row in account_df.iterrows():
                    metric_date = pd.to_datetime(row['date']).date()
                    
                    # Check if metric exists
                    existing_metric = db.query(models.AccountMetricsDaily).filter(
                        models.AccountMetricsDaily.account_id == account.id,
                        models.AccountMetricsDaily.date == metric_date
                    ).first()
                    
                    if existing_metric:
                        # Update existing metric
                        existing_metric.daily_active_users = int(row.get('daily_active_users', 0))
                        existing_metric.feature_adoption_rate = float(row.get('feature_adoption_rate', 0))
                        existing_metric.support_tickets_open = int(row.get('support_tickets_open', 0))
                        existing_metric.nps_score = float(row['nps_score']) if pd.notna(row.get('nps_score')) else None
                        existing_metric.login_frequency = float(row.get('login_frequency', 0))
                        
                        # Recalculate health score
                        existing_metric.health_score = services.calculate_health_score(existing_metric)
                    else:
                        # Create new metric
                        metric = models.AccountMetricsDaily(
                            account_id=account.id,
                            date=metric_date,
                            daily_active_users=int(row.get('daily_active_users', 0)),
                            feature_adoption_rate=float(row.get('feature_adoption_rate', 0)),
                            support_tickets_open=int(row.get('support_tickets_open', 0)),
                            nps_score=float(row['nps_score']) if pd.notna(row.get('nps_score')) else None,
                            login_frequency=float(row.get('login_frequency', 0))
                        )
                        metric.health_score = services.calculate_health_score(metric)
                        db.add(metric)
                        metrics_created += 1
                
            except Exception as e:
                errors.append(f"Error processing account {account_name}: {str(e)}")
        
        # Commit all changes
        db.commit()
        
        # Recompute health scores
        services.recompute_all_health_scores(db)
        
        return schemas.CSVUploadResponse(
            message="CSV processed successfully",
            accounts_created=accounts_created,
            accounts_updated=accounts_updated,
            metrics_created=metrics_created,
            errors=errors
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")


# ==================== ACCOUNTS ====================

@app.get("/accounts", response_model=schemas.AccountList)
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
    - segment: Filter by customer segment (Enterprise, Mid-Market, SMB)
    - bucket: Filter by health bucket (Healthy, At-Risk, Critical)
    - region: Filter by region
    """
    query = db.query(models.Account)
    
    # Apply filters
    if segment:
        query = query.filter(models.Account.segment == segment)
    if bucket:
        query = query.filter(models.Account.health_bucket == bucket)
    if region:
        query = query.filter(models.Account.region == region)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    accounts = query.offset(offset).limit(page_size).all()
    
    # Enrich with latest metrics
    enriched_accounts = []
    for account in accounts:
        latest_metric = (
            db.query(models.AccountMetricsDaily)
            .filter(models.AccountMetricsDaily.account_id == account.id)
            .order_by(models.AccountMetricsDaily.date.desc())
            .first()
        )
        
        account_dict = schemas.Account.model_validate(account)
        if latest_metric:
            account_dict.latest_metrics = schemas.AccountMetricsDaily.model_validate(latest_metric)
        
        enriched_accounts.append(account_dict)
    
    return schemas.AccountList(
        total=total,
        page=page,
        page_size=page_size,
        accounts=enriched_accounts
    )


@app.get("/accounts/{account_id}", response_model=schemas.Account)
async def get_account(
    account_id: int,
    db: Session = Depends(get_db)
):
    """
    Get account detail with latest health metrics and 30/60/90 day trends.
    """
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get latest metrics
    latest_metric = (
        db.query(models.AccountMetricsDaily)
        .filter(models.AccountMetricsDaily.account_id == account_id)
        .order_by(models.AccountMetricsDaily.date.desc())
        .first()
    )
    
    # Get trends
    trend_30d = services.get_account_trend(db, account_id, 30)
    trend_60d = services.get_account_trend(db, account_id, 60)
    trend_90d = services.get_account_trend(db, account_id, 90)
    
    # Build response
    account_dict = schemas.Account.model_validate(account)
    if latest_metric:
        account_dict.latest_metrics = schemas.AccountMetricsDaily.model_validate(latest_metric)
    account_dict.trend_30d = trend_30d
    account_dict.trend_60d = trend_60d
    account_dict.trend_90d = trend_90d
    
    return account_dict


# ==================== HEALTH ====================

@app.post("/health/recompute", response_model=schemas.HealthRecomputeResponse)
async def recompute_health(db: Session = Depends(get_db)):
    """
    Recompute health scores for all accounts based on latest metrics.
    """
    start_time = time.time()
    
    accounts_updated = services.recompute_all_health_scores(db)
    
    computation_time = time.time() - start_time
    
    return schemas.HealthRecomputeResponse(
        message=f"Successfully recomputed health scores for {accounts_updated} accounts",
        accounts_updated=accounts_updated,
        computation_time_seconds=round(computation_time, 2)
    )


# ==================== PORTFOLIO ====================

@app.get("/portfolio/summary", response_model=schemas.PortfolioSummary)
async def get_portfolio_summary(db: Session = Depends(get_db)):
    """
    Get portfolio summary with ARR by bucket, risk breakdown, and trends.
    """
    metrics = services.get_portfolio_metrics(db)
    
    return schemas.PortfolioSummary(
        total_accounts=metrics["total_accounts"],
        total_arr=metrics["total_arr"],
        arr_by_bucket=metrics["arr_by_bucket"],
        risk_breakdown=metrics["risk_breakdown"],
        arr_trend_30d=services.get_arr_trend(db, 30),
        arr_trend_90d=services.get_arr_trend(db, 90),
        avg_health_score=metrics["avg_health_score"],
        accounts_by_segment=metrics["accounts_by_segment"]
    )


# ==================== AI INSIGHTS ====================

@app.post("/insights/portfolio", response_model=schemas.PortfolioInsight)
async def generate_portfolio_insights(
    request: Optional[schemas.InsightRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered portfolio insights and recommendations.
    """
    portfolio_data = services.get_portfolio_metrics(db)
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
    """
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get latest metrics
    latest_metric = (
        db.query(models.AccountMetricsDaily)
        .filter(models.AccountMetricsDaily.account_id == account_id)
        .order_by(models.AccountMetricsDaily.date.desc())
        .first()
    )
    
    # Identify risk factors
    risk_factors = services.identify_risk_factors(account, latest_metric)
    
    # Get trends
    trend_data = {
        "trend_30d": services.get_account_trend(db, account_id, 30),
        "trend_60d": services.get_account_trend(db, account_id, 60),
        "trend_90d": services.get_account_trend(db, account_id, 90)
    }
    
    # Generate insights
    insight = await ai_service.generate_account_insight(
        account,
        risk_factors,
        latest_metric,
        trend_data
    )
    
    return insight


# ==================== PLAYBOOKS ====================

@app.get("/playbooks", response_model=List[schemas.Playbook])
async def get_playbooks():
    """
    Get all available playbooks from the library.
    """
    return playbooks.get_all_playbooks()


@app.post("/actions/recommend", response_model=schemas.PlaybookRecommendations)
async def recommend_actions(
    account_id: Optional[int] = None,
    risk_factors: Optional[List[str]] = None,
    db: Session = Depends(get_db)
):
    """
    Get playbook recommendations matched to risk factors.
    
    If account_id is provided, risk factors will be automatically identified.
    Otherwise, provide risk_factors directly.
    """
    if account_id:
        # Get account and identify risk factors
        account = db.query(models.Account).filter(models.Account.id == account_id).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        latest_metric = (
            db.query(models.AccountMetricsDaily)
            .filter(models.AccountMetricsDaily.account_id == account_id)
            .order_by(models.AccountMetricsDaily.date.desc())
            .first()
        )
        
        risk_factors = services.identify_risk_factors(account, latest_metric)
    
    if not risk_factors:
        risk_factors = []
    
    recommendations = playbooks.recommend_playbooks(risk_factors)
    
    return schemas.PlaybookRecommendations(
        account_id=account_id,
        recommendations=recommendations
    )

