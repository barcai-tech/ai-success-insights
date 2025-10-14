from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, date
from typing import List, Optional, Tuple
import statistics

from . import models, schemas


def calculate_health_score(metrics: models.AccountMetricsDaily) -> float:
    """Calculate health score based on various metrics"""
    score = 0.0
    
    # Daily Active Users contribution (0-25 points)
    if metrics.daily_active_users > 100:
        score += 25
    elif metrics.daily_active_users > 50:
        score += 20
    elif metrics.daily_active_users > 10:
        score += 15
    else:
        score += max(0, metrics.daily_active_users / 10 * 15)
    
    # Feature Adoption Rate (0-25 points)
    score += metrics.feature_adoption_rate * 25
    
    # Support Tickets (0-20 points, inverse)
    if metrics.support_tickets_open == 0:
        score += 20
    elif metrics.support_tickets_open <= 2:
        score += 15
    elif metrics.support_tickets_open <= 5:
        score += 10
    else:
        score += max(0, 20 - metrics.support_tickets_open)
    
    # NPS Score (0-15 points)
    if metrics.nps_score is not None:
        # NPS ranges from -100 to 100
        score += max(0, (metrics.nps_score + 100) / 200 * 15)
    else:
        score += 7.5  # neutral if not available
    
    # Login Frequency (0-15 points)
    score += min(15, metrics.login_frequency * 15)
    
    return min(100, max(0, score))


def determine_health_bucket(health_score: float) -> str:
    """Determine health bucket based on score"""
    if health_score >= 70:
        return "Healthy"
    elif health_score >= 40:
        return "At-Risk"
    else:
        return "Critical"


def recompute_all_health_scores(db: Session) -> int:
    """Recompute health scores for all accounts based on latest metrics"""
    accounts = db.query(models.Account).all()
    updated_count = 0
    
    for account in accounts:
        # Get latest metrics
        latest_metric = (
            db.query(models.AccountMetricsDaily)
            .filter(models.AccountMetricsDaily.account_id == account.id)
            .order_by(desc(models.AccountMetricsDaily.date))
            .first()
        )
        
        if latest_metric:
            # Recompute health score
            health_score = calculate_health_score(latest_metric)
            latest_metric.health_score = health_score
            
            # Update account
            account.health_score = health_score
            account.health_bucket = determine_health_bucket(health_score)
            account.updated_at = datetime.utcnow()
            updated_count += 1
    
    db.commit()
    return updated_count


def get_account_trend(db: Session, account_id: int, days: int) -> Optional[schemas.TrendData]:
    """Calculate trend data for an account over specified days"""
    cutoff_date = date.today() - timedelta(days=days)
    
    metrics = (
        db.query(models.AccountMetricsDaily)
        .filter(
            models.AccountMetricsDaily.account_id == account_id,
            models.AccountMetricsDaily.date >= cutoff_date
        )
        .order_by(models.AccountMetricsDaily.date)
        .all()
    )
    
    if len(metrics) < 2:
        return None
    
    # Calculate health score change
    first_score = metrics[0].health_score
    last_score = metrics[-1].health_score
    health_score_change = last_score - first_score
    
    # Calculate engagement trend
    mid_point = len(metrics) // 2
    first_half_avg = statistics.mean([m.daily_active_users for m in metrics[:mid_point]])
    second_half_avg = statistics.mean([m.daily_active_users for m in metrics[mid_point:]])
    
    if second_half_avg > first_half_avg * 1.1:
        engagement_trend = "improving"
    elif second_half_avg < first_half_avg * 0.9:
        engagement_trend = "declining"
    else:
        engagement_trend = "stable"
    
    return schemas.TrendData(
        days=days,
        health_score_change=round(health_score_change, 2),
        arr_change=0.0,  # ARR is at account level, not daily
        engagement_trend=engagement_trend
    )


def get_portfolio_metrics(db: Session) -> dict:
    """Calculate portfolio-level metrics"""
    accounts = db.query(models.Account).all()
    
    if not accounts:
        return {
            "total_accounts": 0,
            "total_arr": 0.0,
            "arr_by_bucket": {},
            "risk_breakdown": {},
            "avg_health_score": 0.0,
            "accounts_by_segment": {}
        }
    
    total_arr = sum(a.arr for a in accounts)
    arr_by_bucket = {}
    bucket_counts = {}
    segment_counts = {}
    
    for account in accounts:
        # ARR by bucket
        bucket = account.health_bucket or "Unknown"
        arr_by_bucket[bucket] = arr_by_bucket.get(bucket, 0.0) + account.arr
        bucket_counts[bucket] = bucket_counts.get(bucket, 0) + 1
        
        # Segment counts
        segment = account.segment or "Unknown"
        segment_counts[segment] = segment_counts.get(segment, 0) + 1
    
    # Calculate risk breakdown percentages
    total_accounts = len(accounts)
    risk_breakdown = {
        bucket: round(count / total_accounts * 100, 1)
        for bucket, count in bucket_counts.items()
    }
    
    avg_health_score = statistics.mean([a.health_score for a in accounts if a.health_score])
    
    return {
        "total_accounts": total_accounts,
        "total_arr": round(total_arr, 2),
        "arr_by_bucket": {k: round(v, 2) for k, v in arr_by_bucket.items()},
        "risk_breakdown": risk_breakdown,
        "avg_health_score": round(avg_health_score, 2),
        "accounts_by_segment": segment_counts
    }


def get_arr_trend(db: Session, days: int) -> float:
    """Calculate ARR trend over specified period - placeholder"""
    # This would require historical ARR tracking
    # For now, return 0 as placeholder
    return 0.0


def identify_risk_factors(account: models.Account, latest_metrics: Optional[models.AccountMetricsDaily]) -> List[str]:
    """Identify risk factors for an account"""
    risk_factors = []
    
    if account.health_score < 40:
        risk_factors.append("Critical health score")
    elif account.health_score < 70:
        risk_factors.append("Below target health score")
    
    if latest_metrics:
        if latest_metrics.support_tickets_open > 5:
            risk_factors.append("High support ticket volume")
        
        if latest_metrics.feature_adoption_rate < 0.3:
            risk_factors.append("Low feature adoption")
        
        if latest_metrics.daily_active_users < 10:
            risk_factors.append("Low user engagement")
        
        if latest_metrics.nps_score and latest_metrics.nps_score < 0:
            risk_factors.append("Negative NPS score")
        
        if latest_metrics.login_frequency < 0.3:
            risk_factors.append("Infrequent logins")
    
    return risk_factors
