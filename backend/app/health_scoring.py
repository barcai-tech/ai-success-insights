"""
Health scoring engine with transparent, explainable factors.
Implements the weighted scoring algorithm per requirements.
"""
from typing import List, Dict, Tuple
from datetime import datetime, date
import json

from . import models


class HealthFactor:
    """Represents a single factor contributing to health score"""
    def __init__(self, factor: str, impact: float):
        self.factor = factor
        self.impact = round(impact, 1)
    
    def to_dict(self) -> dict:
        return {"factor": self.factor, "impact": self.impact}


def normalize(value: float, min_val: float, max_val: float, inverse: bool = False) -> float:
    """
    Normalize value to 0-1 range.
    If inverse=True, higher input values result in lower scores.
    """
    if max_val == min_val:
        return 0.5
    
    normalized = (value - min_val) / (max_val - min_val)
    normalized = max(0.0, min(1.0, normalized))
    
    if inverse:
        normalized = 1.0 - normalized
    
    return normalized


def calculate_health_score(account: models.Account) -> Tuple[float, List[HealthFactor], str]:
    """
    Calculate health score with explainable factors.
    
    Returns:
        (score, top_factors, risk_label)
    
    Scoring breakdown:
    - Adoption (35%): adoption_ratio (20%), feature_x (10%), weekly_active (5%)
    - Engagement (20%): avg_session (10%), time_to_value (10%)
    - Support (20%): tickets_30d (8%), critical_90d (8%), sla_breach (4%)
    - Advocacy (15%): NPS (15%)
    - CS Process (10%): qbr_recency (5%), onboarding (5%)
    - Commercial Bonus: ±10 points
    """
    factors: List[HealthFactor] = []
    base_score = 0.0
    
    # ========================================
    # ADOPTION (35 points total)
    # ========================================
    
    # 1. Adoption Ratio: active_users / seats_purchased (20 points)
    adoption_ratio = account.active_users / max(1, account.seats_purchased)
    adoption_ratio = min(1.2, adoption_ratio)  # Cap at 1.2
    adoption_ratio_normalized = min(1.0, adoption_ratio / 1.2)  # Normalize to 0-1
    adoption_ratio_score = adoption_ratio_normalized * 20
    base_score += adoption_ratio_score
    
    if adoption_ratio >= 0.9:
        factors.append(HealthFactor("Strong user adoption", adoption_ratio_score))
    elif adoption_ratio < 0.3:
        factors.append(HealthFactor("Low user adoption", adoption_ratio_score - 20))
    else:
        factors.append(HealthFactor("Moderate user adoption", adoption_ratio_score - 10))
    
    # 2. Feature X Adoption (10 points)
    feature_x_score = account.feature_x_adoption * 10
    base_score += feature_x_score
    
    if account.feature_x_adoption >= 0.7:
        factors.append(HealthFactor("High feature adoption", feature_x_score))
    elif account.feature_x_adoption < 0.3:
        factors.append(HealthFactor("Low feature adoption", feature_x_score - 10))
    
    # 3. Weekly Active % (5 points)
    weekly_active_score = account.weekly_active_pct * 5
    base_score += weekly_active_score
    
    if account.weekly_active_pct < 0.3:
        factors.append(HealthFactor("Low weekly engagement", weekly_active_score - 5))
    
    # ========================================
    # ENGAGEMENT & VALUE (20 points total)
    # ========================================
    
    # 4. Average Session Time (10 points)
    # Get latest daily metrics to calculate avg session
    # For now, use a placeholder - in real implementation would query latest metrics
    # Assuming 0-60 minutes is the range, with 30+ being good
    avg_session_normalized = normalize(
        account.active_users * 0.5,  # Placeholder: higher active users = more session time
        min_val=0, max_val=100, inverse=False
    )
    avg_session_score = avg_session_normalized * 10
    base_score += avg_session_score
    
    # 5. Time to Value (10 points - inverse)
    if account.time_to_value_days is not None:
        # Faster time to value is better (0-180 days range)
        ttv_normalized = normalize(
            account.time_to_value_days,
            min_val=0, max_val=180, inverse=True
        )
        ttv_score = ttv_normalized * 10
        base_score += ttv_score
        
        if account.time_to_value_days <= 30:
            factors.append(HealthFactor("Fast time to value", ttv_score))
        elif account.time_to_value_days > 90:
            factors.append(HealthFactor("Slow time to value", ttv_score - 10))
    else:
        # No data, assume neutral
        base_score += 5
    
    # ========================================
    # SUPPORT LOAD & RELIABILITY (20 points total)
    # ========================================
    
    # 6. Tickets Last 30d (8 points - inverse)
    tickets_normalized = normalize(
        account.tickets_last_30d,
        min_val=0, max_val=20, inverse=True
    )
    tickets_score = tickets_normalized * 8
    base_score += tickets_score
    
    if account.tickets_last_30d > 10:
        factors.append(HealthFactor("High ticket volume", tickets_score - 8))
    elif account.tickets_last_30d == 0:
        factors.append(HealthFactor("Zero support tickets", tickets_score))
    
    # 7. Critical Tickets 90d (8 points - inverse)
    critical_normalized = normalize(
        account.critical_tickets_90d,
        min_val=0, max_val=10, inverse=True
    )
    critical_score = critical_normalized * 8
    base_score += critical_score
    
    if account.critical_tickets_90d > 3:
        factors.append(HealthFactor("Multiple critical issues", critical_score - 8))
    
    # 8. SLA Breaches 90d (4 points - inverse)
    sla_normalized = normalize(
        account.sla_breaches_90d,
        min_val=0, max_val=5, inverse=True
    )
    sla_score = sla_normalized * 4
    base_score += sla_score
    
    if account.sla_breaches_90d > 2:
        factors.append(HealthFactor("SLA breaches", sla_score - 4))
    
    # ========================================
    # ADVOCACY (15 points total)
    # ========================================
    
    # 9. NPS Score (15 points)
    if account.nps is not None:
        # Map from [-100, 100] to [0, 1]
        nps_normalized = (account.nps + 100) / 200
        nps_score = nps_normalized * 15
        base_score += nps_score
        
        if account.nps >= 50:
            factors.append(HealthFactor("Promoter NPS", nps_score))
        elif account.nps < 0:
            factors.append(HealthFactor("Detractor NPS", nps_score - 15))
    else:
        # No NPS data, assume neutral
        base_score += 7.5
    
    # ========================================
    # CS PROCESS HYGIENE (10 points total)
    # ========================================
    
    # 10. Days Since QBR (5 points - inverse)
    if account.qbr_last_date:
        days_since_qbr = (date.today() - account.qbr_last_date).days
        qbr_normalized = normalize(
            days_since_qbr,
            min_val=0, max_val=180, inverse=True
        )
        qbr_score = qbr_normalized * 5
        base_score += qbr_score
        
        if days_since_qbr > 120:
            factors.append(HealthFactor("Overdue QBR", qbr_score - 5))
    else:
        # No QBR history - penalty
        qbr_score = 0
        base_score += qbr_score
        factors.append(HealthFactor("No QBR history", -5))
    
    # 11. Onboarding Phase (5 points)
    if account.onboarding_phase:
        days_since_created = (datetime.utcnow() - account.created_at).days
        if days_since_created > 30:
            # Been onboarding too long - penalty
            onboarding_score = 0
            base_score += onboarding_score
            factors.append(HealthFactor("Extended onboarding", -5))
        else:
            # Normal onboarding
            onboarding_score = 3
            base_score += onboarding_score
    else:
        # Not onboarding, full points
        onboarding_score = 5
        base_score += onboarding_score
    
    # ========================================
    # COMMERCIAL SIGNAL (Bonus ±10 points)
    # ========================================
    
    commercial_bonus = 0.0
    
    # Expansion opportunity bonus
    if account.expansion_oppty_dollar > 0 and account.arr > 0:
        expansion_ratio = account.expansion_oppty_dollar / account.arr
        # 0-50% expansion opportunity gives 0-10 bonus points
        expansion_bonus = min(10, expansion_ratio * 20)
        commercial_bonus += expansion_bonus
        
        if expansion_bonus >= 5:
            factors.append(HealthFactor("Strong expansion opportunity", expansion_bonus))
    
    # Renewal date proximity with weak adoption - penalty
    if account.renewal_date:
        days_to_renewal = (account.renewal_date - date.today()).days
        if 0 <= days_to_renewal <= 60:
            # Near renewal
            if adoption_ratio < 0.5:
                # Weak adoption near renewal - penalty
                renewal_penalty = -5
                commercial_bonus += renewal_penalty
                factors.append(HealthFactor("Renewal risk: low adoption", renewal_penalty))
    
    # ========================================
    # FINAL SCORE
    # ========================================
    
    final_score = base_score + commercial_bonus
    final_score = max(0, min(110, final_score))  # Clamp to 0-110
    
    # Determine risk label
    if final_score >= 75:
        risk_label = "Green"
    elif final_score >= 50:
        risk_label = "Amber"
    else:
        risk_label = "Red"
    
    # Sort factors by absolute impact (highest first)
    factors.sort(key=lambda f: abs(f.impact), reverse=True)
    
    # Keep top 10 factors
    top_factors = factors[:10]
    
    return final_score, top_factors, risk_label


def save_health_snapshot(session, account: models.Account) -> models.HealthSnapshot:
    """
    Calculate and save a health snapshot for an account.
    """
    score, factors, risk_label = calculate_health_score(account)
    
    # Update account
    account.health_score = score
    account.health_bucket = models.HealthBucketEnum[risk_label.upper()]
    
    # Create snapshot
    snapshot = models.HealthSnapshot(
        account_id=account.id,
        calculated_at=datetime.utcnow(),
        score=score,
        risk_label=models.HealthBucketEnum[risk_label.upper()],
        top_factors=json.dumps([f.to_dict() for f in factors])
    )
    
    session.add(snapshot)
    session.add(account)
    session.commit()
    session.refresh(snapshot)
    
    return snapshot


def recompute_all_health_scores(session) -> int:
    """
    Recompute health scores for all accounts.
    """
    from sqlmodel import select
    
    accounts = session.exec(select(models.Account)).all()
    count = 0
    
    for account in accounts:
        save_health_snapshot(session, account)
        count += 1
    
    return count
