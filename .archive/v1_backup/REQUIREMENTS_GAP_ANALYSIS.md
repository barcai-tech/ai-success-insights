# Comparison: Current vs Required Implementation

## ✅ What Matches

1. **Framework**: FastAPI ✓
2. **Database**: SQLite ✓
3. **AI Integration**: OpenAI for summaries ✓
4. **CSV Upload**: Implemented ✓
5. **Portfolio Analytics**: Implemented ✓
6. **Account-level insights**: Implemented ✓
7. **Docker support**: Implemented ✓
8. **API Routes**: All core routes present ✓

## ❌ What's Missing/Different

### 1. **Data Model Gaps**

#### Current Account Model:

- account_name, segment, region, arr
- health_score, health_bucket
- Basic fields only

#### Required Account Model:

- **Missing**: industry, renewal_date, cs_owner
- **Missing**: seats_purchased, active_users
- **Missing**: feature_x_adoption, weekly_active_pct, time_to_value_days
- **Missing**: tickets_last_30d, critical_tickets_90d, sla_breaches_90d
- **Missing**: qbr_last_date, onboarding_phase
- **Missing**: expansion*oppty*$, renewal_risk enum

#### Current Metrics:

- daily_active_users, feature_adoption_rate, support_tickets_open, nps_score, login_frequency

#### Required Metrics (AccountMetricsDaily):

- **Missing**: logins, events, feature_x_events
- **Missing**: avg_session_min, errors, ticket_backlog

#### Missing Table:

- **HealthSnapshot** - For historical health tracking with top_factors JSON

### 2. **Health Scoring Algorithm**

#### Current Algorithm (Simple):

```
- Daily Active Users: 25 points
- Feature Adoption: 25 points
- Support Tickets: 20 points (inverse)
- NPS Score: 15 points
- Login Frequency: 15 points
Total: 100 points
```

#### Required Algorithm (Complex & Explainable):

```
Adoption (35%):
  - adoption_ratio (active/seats): 20%
  - feature_x_adoption: 10%
  - weekly_active_pct: 5%

Engagement & Value (20%):
  - avg_session_min: 10%
  - time_to_value_days (inverse): 10%

Support Load (20%):
  - tickets_last_30d (inverse): 8%
  - critical_tickets_90d (inverse): 8%
  - sla_breaches_90d (inverse): 4%

Advocacy (15%):
  - nps: 15%

CS Process (10%):
  - days_since_qbr (inverse): 5%
  - onboarding_phase penalty: 5%

Commercial Bonus (±10 pts):
  - expansion_oppty_$ / ARR
  - renewal_date proximity penalty
```

**Key Missing Feature**: Must return `top_factors` array:

```json
[
  { "factor": "High tickets", "impact": -12 },
  { "factor": "Strong adoption", "impact": +18 }
]
```

### 3. **Health Buckets**

Current: Healthy (≥70), At-Risk (40-69), Critical (<40)
Required: Green (≥75), Amber (50-74), Red (<50)

### 4. **Stack Differences**

Current: SQLAlchemy + plain SQLite
Required: **SQLModel** (combines SQLAlchemy + Pydantic)

### 5. **Missing Infrastructure**

- ❌ No docker-compose.yml
- ❌ No Nginx configuration
- ❌ No deployment configs for Render/Fly.io/Vercel

### 6. **CSV Format Mismatch**

Current CSV expects:

- account_name, segment, region, arr, date, daily_active_users, etc.

Required CSV should include:

- All Account fields (industry, renewal_date, seats_purchased, etc.)
- All detailed metrics

## 📊 Recommendations

### High Priority (Core Requirements):

1. ✅ **Migrate to SQLModel** - Replace SQLAlchemy models
2. ✅ **Expand Account model** - Add all required fields
3. ✅ **Rewrite health scoring** - Implement weighted, explainable algorithm
4. ✅ **Add HealthSnapshot table** - Track historical scores
5. ✅ **Add top_factors** - Return explainable impact factors
6. ✅ **Update health buckets** - Green/Amber/Red with new thresholds

### Medium Priority (Enhanced Features):

7. ✅ **Expand metrics model** - Add session time, events, errors
8. ✅ **Update CSV parser** - Handle new fields
9. ✅ **Add docker-compose** - Multi-container setup
10. ⚠️ **Sample data** - Update with realistic data

### Nice to Have:

11. ⚠️ Add Nginx config
12. ⚠️ Add deployment scripts
13. ⚠️ Add renewal risk logic

## 🎯 Action Plan

### Option 1: Quick Fixes (Keep Current, Add Missing)

- Keep SQLAlchemy
- Add missing fields to existing models
- Rewrite scoring algorithm
- Add top_factors to response
- Update thresholds

### Option 2: Full Rewrite (Match Spec Exactly)

- Migrate to SQLModel
- Rebuild all models from scratch
- Implement exact scoring algorithm
- Add HealthSnapshot tracking
- Complete infrastructure setup

**Recommendation**: Start with Option 2 for a clean, requirements-compliant implementation.

## Summary

Current implementation covers ~60% of requirements:

- ✅ Basic framework and API structure
- ✅ Core CRUD operations
- ✅ AI integration foundation
- ❌ Simplified data model
- ❌ Basic health scoring (not explainable)
- ❌ Missing key fields and tables
- ❌ Incomplete infrastructure

**To fully match requirements**: Need significant updates to data models, health scoring logic, and infrastructure setup.
