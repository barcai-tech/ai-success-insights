# Health Scoring Implementation Comparison

## Overview

Comparing our current implementation (`app/health_scoring.py`) with the proposed simplified approach.

---

## 🏗️ Architecture Comparison

| Aspect             | Current Implementation                   | Proposed Approach                  |
| ------------------ | ---------------------------------------- | ---------------------------------- |
| **File Structure** | `health_scoring.py` (313 lines)          | `scoring.py` (proposed, ~45 lines) |
| **Normalization**  | `normalize()` function with inverse flag | `scale()` min-max + `clamp01()`    |
| **Return Type**    | `(score, factors[], risk_label)`         | `(score, bucket)`                  |
| **Explainability** | ✅ Full factor tracking with impacts     | ❌ No factor tracking              |
| **Factor Storage** | ✅ Saved to `HealthSnapshot` table       | ❌ Not persisted                   |

---

## 📊 Scoring Algorithm Comparison

### Weight Distribution

| Category             | Current Implementation       | Proposed Approach            | Match?     |
| -------------------- | ---------------------------- | ---------------------------- | ---------- |
| **Adoption**         | 35% (20% + 10% + 5%)         | 35% (20% + 10% + 5%)         | ✅         |
| **Engagement**       | 20% (10% + 10%)              | 20% (10% + 10%)              | ✅         |
| **Support**          | 20% (8% + 8% + 4%)           | 20% (8% + 8% + 4%)           | ✅         |
| **Advocacy (NPS)**   | 15%                          | 15%                          | ✅         |
| **CS Process**       | 10% (5% QBR + 5% onboarding) | 10% (5% QBR + 5% onboarding) | ✅         |
| **Commercial Bonus** | ±10 points                   | +10 points (expansion only)  | ⚠️ Partial |

### Detailed Component Breakdown

#### 1️⃣ Adoption (35 points)

**Our Implementation:**

```python
# Adoption ratio: 20 points
adoption_ratio = account.active_users / max(1, account.seats_purchased)
adoption_ratio = min(1.2, adoption_ratio)  # Cap at 1.2
adoption_ratio_normalized = min(1.0, adoption_ratio / 1.2)
adoption_ratio_score = adoption_ratio_normalized * 20

# Feature X: 10 points
feature_x_score = account.feature_x_adoption * 10

# Weekly active: 5 points
weekly_active_score = account.weekly_active_pct * 5

Total: 35 points
```

**Proposed:**

```python
adoption_ratio = clamp01((a.active_users / max(1, a.seats_purchased)) / 1.0)
s_adopt = adoption_ratio*0.20 + a.feature_x_adoption*0.10 + a.weekly_active_pct*0.05

Total: 35 points (0.35 * 100)
```

**Difference:**

- ✅ Same weights and logic
- ⚠️ Our version caps adoption at 1.2x (120%), proposed doesn't
- ✅ Our version generates explanatory factors (e.g., "Strong user adoption +18")

---

#### 2️⃣ Engagement (20 points)

**Our Implementation:**

```python
# Avg session: 10 points (placeholder using active_users proxy)
avg_session_normalized = normalize(account.active_users * 0.5, 0, 100, False)
avg_session_score = avg_session_normalized * 10

# Time to value: 10 points (inverse - lower is better)
ttv_normalized = normalize(account.time_to_value_days, 0, 180, inverse=True)
ttv_score = ttv_normalized * 10

Total: 20 points
```

**Proposed:**

```python
s_session = scale(getattr(a, "avg_session_min", 15), 5, 40) * 0.10
s_ttv = (1 - scale(a.time_to_value_days, 7, 90)) * 0.10

Total: 20 points (0.20 * 100)
```

**Differences:**

- ⚠️ **Session time range differs:**
  - Proposed: 5-40 minutes
  - Ours: 0-100 (placeholder - needs daily metrics integration)
- ⚠️ **TTV range differs:**
  - Proposed: 7-90 days
  - Ours: 0-180 days
- ✅ Same inverse logic for TTV (lower is better)

---

#### 3️⃣ Support (20 points)

**Our Implementation:**

```python
# Tickets last 30d: 8 points (inverse)
tickets_normalized = normalize(account.tickets_last_30d, 0, 20, inverse=True)
tickets_score = tickets_normalized * 8

# Critical tickets 90d: 8 points (inverse)
critical_normalized = normalize(account.critical_tickets_90d, 0, 10, inverse=True)
critical_score = critical_normalized * 8

# SLA breaches: 4 points (inverse)
sla_normalized = normalize(account.sla_breaches_90d, 0, 5, inverse=True)
sla_score = sla_normalized * 4

Total: 20 points
```

**Proposed:**

```python
s_tickets = (1 - scale(a.tickets_last_30d, 0, 30)) * 0.08
s_critical = (1 - scale(a.critical_tickets_90d, 0, 5)) * 0.08
s_sla = (1 - scale(a.sla_breaches_90d, 0, 3)) * 0.04

Total: 20 points (0.20 * 100)
```

**Differences:**

- ⚠️ **Ticket volume range:**
  - Proposed: 0-30 tickets
  - Ours: 0-20 tickets
- ⚠️ **Critical tickets range:**
  - Proposed: 0-5 critical
  - Ours: 0-10 critical
- ⚠️ **SLA breaches range:**
  - Proposed: 0-3 breaches
  - Ours: 0-5 breaches

---

#### 4️⃣ Advocacy (15 points)

**Our Implementation:**

```python
# NPS: 15 points, mapped from [-100, 100] to [0, 1]
nps_normalized = (account.nps + 100) / 200
nps_score = nps_normalized * 15
# Handles None with 7.5 neutral score
```

**Proposed:**

```python
s_nps = (a.nps + 100) / 200 * 0.15
```

**Difference:**

- ✅ Identical logic
- ✅ Our version handles missing NPS with neutral score

---

#### 5️⃣ CS Process Hygiene (10 points)

**Our Implementation:**

```python
# QBR recency: 5 points (inverse - recent is better)
days_since_qbr = (date.today() - account.qbr_last_date).days
qbr_normalized = normalize(days_since_qbr, 0, 180, inverse=True)
qbr_score = qbr_normalized * 5

# Onboarding: 5 points
if account.onboarding_phase:
    days_since_created = (datetime.utcnow() - account.created_at).days
    if days_since_created > 30:
        onboarding_score = 0  # Extended onboarding penalty
    else:
        onboarding_score = 3  # Normal onboarding
else:
    onboarding_score = 5  # Not onboarding

Total: 10 points
```

**Proposed:**

```python
days_since_qbr = (today - a.qbr_last_date).days if a.qbr_last_date else 999
s_qbr = (1 - scale(days_since_qbr, 0, 120)) * 0.05

s_onb = (0.00 if (a.onboarding_phase and a.time_to_value_days > 30) else 0.05)

Total: 10 points (0.10 * 100)
```

**Differences:**

- ⚠️ **QBR range:**
  - Proposed: 0-120 days
  - Ours: 0-180 days
- ⚠️ **Onboarding logic:**
  - Proposed: Binary (0 or 5 points)
  - Ours: Three states (0, 3, or 5 points)
- ✅ Both handle missing QBR date

---

#### 6️⃣ Commercial Bonus (±10 points)

**Our Implementation:**

```python
# Expansion opportunity: +10 bonus
if account.expansion_oppty_dollar > 0 and account.arr > 0:
    expansion_ratio = account.expansion_oppty_dollar / account.arr
    expansion_bonus = min(10, expansion_ratio * 20)
    commercial_bonus += expansion_bonus

# Renewal risk: -5 penalty
if account.renewal_date:
    days_to_renewal = (account.renewal_date - date.today()).days
    if 0 <= days_to_renewal <= 60:
        if adoption_ratio < 0.5:
            commercial_bonus -= 5

Total: -5 to +10 points
```

**Proposed:**

```python
bonus = 0.0
if a.arr and a.expansion_oppty_$:
    ratio = a.expansion_oppty_$ / a.arr
    bonus = clamp01(ratio) * 0.10

Total: 0 to +10 points (0.10 * 100)
```

**Differences:**

- ⚠️ **Renewal risk penalty:**
  - Ours: ✅ Includes -5 penalty for low adoption near renewal
  - Proposed: ❌ No penalty, only positive bonus
- ✅ Expansion logic is equivalent

---

## 🎯 Risk Bucket Thresholds

| Bucket    | Current | Proposed | Match? |
| --------- | ------- | -------- | ------ |
| **Green** | ≥75     | ≥75      | ✅     |
| **Amber** | 50-74   | 50-74    | ✅     |
| **Red**   | <50     | <50      | ✅     |

---

## 🔍 Key Differences Summary

### ✅ What Matches

1. **Core weights** - All 5 categories match (35/20/20/15/10)
2. **NPS calculation** - Identical mapping from [-100,100]
3. **Risk buckets** - Same thresholds (75/50)
4. **Overall structure** - Same scoring philosophy

### ⚠️ Notable Differences

#### 1. Explainability

- **Current:** Full factor tracking with specific impacts
  - Example: "Strong user adoption +18", "High ticket volume -6"
  - Stored in `HealthSnapshot` table with timestamps
  - Used by AI service to explain recommendations
- **Proposed:** No factor tracking
  - Only returns final score and bucket
  - No audit trail of what drove the score

#### 2. Normalization Ranges

| Component        | Current Range       | Proposed Range |
| ---------------- | ------------------- | -------------- |
| Avg Session      | 0-100 (placeholder) | 5-40 minutes   |
| Time to Value    | 0-180 days          | 7-90 days      |
| Tickets 30d      | 0-20                | 0-30           |
| Critical Tickets | 0-10                | 0-5            |
| SLA Breaches     | 0-5                 | 0-3            |
| Days Since QBR   | 0-180               | 0-120          |

**Impact:** Different ranges will produce different intermediate scores for the same raw data.

#### 3. Onboarding Logic

- **Current:** Three-state (0/3/5 points)
- **Proposed:** Binary (0/5 points)

#### 4. Commercial Bonus

- **Current:** Can be negative (-5 for renewal risk)
- **Proposed:** Only positive (expansion opportunity)

#### 5. Missing Data Handling

- **Current:** Explicit null checks with neutral scores (e.g., 7.5 for missing NPS)
- **Proposed:** Uses `getattr()` with defaults, less explicit

---

## 💡 Recommendations

### Option A: Keep Current Implementation ✅

**Pros:**

- ✅ Full explainability (critical for AI insights)
- ✅ Historical audit trail via `HealthSnapshot`
- ✅ More sophisticated onboarding logic
- ✅ Renewal risk penalty (commercial signal)
- ✅ Better null handling

**Cons:**

- ⚠️ More complex (313 lines vs ~45 lines)
- ⚠️ Avg session currently uses placeholder

### Option B: Adopt Proposed Approach

**Pros:**

- ✅ Simpler, more concise code
- ✅ Specific ranges for each metric (clearer expectations)

**Cons:**

- ❌ No explainability (breaks AI insights feature)
- ❌ No historical tracking
- ❌ No renewal risk penalty
- ❌ Would require removing `HealthSnapshot` table

### Option C: Hybrid Approach 🎯 (RECOMMENDED)

**Keep our current implementation BUT update normalization ranges to match proposed:**

```python
# Update these ranges to match proposed
AVG_SESSION_MIN = 5
AVG_SESSION_MAX = 40
TIME_TO_VALUE_MIN = 7
TIME_TO_VALUE_MAX = 90
TICKETS_30D_MAX = 30
CRITICAL_TICKETS_MAX = 5
SLA_BREACHES_MAX = 3
QBR_DAYS_MAX = 120
```

**This gives us:**

- ✅ Keep explainability and factor tracking
- ✅ Keep historical snapshots
- ✅ Keep renewal risk logic
- ✅ Align normalization ranges with proposed standards
- ✅ Simpler to reason about ranges

---

## 🧪 Testing Recommendations

If we adopt the hybrid approach:

1. Update normalization ranges
2. Recompute all health scores: `POST /health/recompute`
3. Compare before/after for sample accounts
4. Validate that AI insights still reference factors correctly
5. Check that extreme values (e.g., 50+ tickets) are handled gracefully

---

## 📝 Action Items

- [ ] Decide on approach (A/B/C)
- [ ] If Option C: Update ranges in `health_scoring.py`
- [ ] Update tests to cover new ranges
- [ ] Document final algorithm in README
- [ ] Consider adding avg_session_min to `AccountMetricsDaily` model

---

**Current Status:** We have a more feature-rich implementation with explainability built in. The proposed approach is simpler but loses critical functionality (factor tracking, historical snapshots) that powers our AI insights feature.
