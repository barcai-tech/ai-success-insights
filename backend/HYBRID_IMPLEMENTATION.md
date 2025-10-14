# Hybrid Approach Implementation Summary

## ✅ Implementation Complete

We've successfully implemented the **hybrid approach** to health scoring, combining:

- ✅ **Industry-standard normalization ranges** (from proposed approach)
- ✅ **Full explainability with factor tracking** (from our current approach)
- ✅ **Historical audit trail** via HealthSnapshot table
- ✅ **Renewal risk penalty** logic

---

## 📊 Score Changes After Update

### Sample Account: TechStart Inc (At-Risk)

| Metric            | Before | After | Change   |
| ----------------- | ------ | ----- | -------- |
| **Health Score**  | 32.36  | 29.49 | -2.87 ⬇️ |
| **Health Bucket** | Red    | Red   | Same     |

**Why the change?**

- Tighter normalization ranges make scoring more precise
- Time to Value (90 days) now hits the upper bound (was 50% of 180, now 100% of 90)
- Ticket volume (15 tickets) is now mid-range (was 75% of 20, now 50% of 30)
- SLA breaches (2) now weighted higher (was 40% of 5, now 67% of 3)

### Top Negative Factors (With New Ranges):

```json
[
  { "factor": "Slow time to value", "impact": -10.0 },
  { "factor": "Detractor NPS", "impact": -9.4 },
  { "factor": "Low feature adoption", "impact": -7.5 },
  { "factor": "Overdue QBR", "impact": -5.0 },
  { "factor": "Renewal risk: low adoption", "impact": -5.0 },
  { "factor": "Multiple critical issues", "impact": -4.8 },
  { "factor": "Moderate user adoption", "impact": -4.7 },
  { "factor": "SLA breaches", "impact": -2.7 }
]
```

---

## 🔧 Code Changes Made

### 1. Added Normalization Constants

```python
# Normalization range constants (lines 16-23)
AVG_SESSION_MIN = 5
AVG_SESSION_MAX = 40
TIME_TO_VALUE_MIN = 7
TIME_TO_VALUE_MAX = 90
TICKETS_30D_MAX = 30
CRITICAL_TICKETS_MAX = 5
SLA_BREACHES_MAX = 3
QBR_DAYS_MAX = 120
```

### 2. Updated Engagement Scoring

**Avg Session (10 points):**

- **Before:** 0-100 range (placeholder)
- **After:** 5-40 minutes range

```python
avg_session_normalized = normalize(
    estimated_session_min,
    min_val=AVG_SESSION_MIN,  # 5 min
    max_val=AVG_SESSION_MAX,  # 40 min
    inverse=False
)
```

**Time to Value (10 points):**

- **Before:** 0-180 days
- **After:** 7-90 days

```python
ttv_normalized = normalize(
    account.time_to_value_days,
    min_val=TIME_TO_VALUE_MIN,  # 7 days
    max_val=TIME_TO_VALUE_MAX,  # 90 days
    inverse=True
)
```

### 3. Updated Support Scoring

**Tickets (8 points):**

- **Before:** 0-20 tickets
- **After:** 0-30 tickets
- Threshold: >15 tickets = "High volume" (was >10)

**Critical Tickets (8 points):**

- **Before:** 0-10 critical
- **After:** 0-5 critical
- Threshold: >2 critical = "Multiple issues" (was >3)

**SLA Breaches (4 points):**

- **Before:** 0-5 breaches
- **After:** 0-3 breaches
- Threshold: >1 breach = "SLA breaches" (was >2)

### 4. Updated CS Process

**QBR Recency (5 points):**

- **Before:** 0-180 days
- **After:** 0-120 days
- Threshold: >90 days = "Overdue" (was >120)

**Onboarding (5 points):**

- **Before:** Three-state (0/3/5 points based on days since created)
- **After:** Binary (0/5 points based on TTV only)

```python
# Simplified logic
if account.onboarding_phase and ttv > 30 days:
    score = 0  # Stuck
else:
    score = 5  # Normal
```

---

## 📈 Impact Analysis

### Stricter Accounts (Scores Decreased)

Accounts with these characteristics will score **lower** now:

- ✅ Long time to value (near 90 days)
- ✅ Moderate ticket volume (15-20 tickets)
- ✅ Any SLA breaches (>1)
- ✅ Overdue QBRs (>90 days)

**Example:** QuickServe Ltd

- Before: 51.57 (Amber)
- After: 49.14 (Red) ⬇️ -2.43 points

### More Lenient Accounts (Scores Increased or Unchanged)

Accounts with these characteristics benefit:

- ✅ Very short TTV (<30 days)
- ✅ Higher ticket volume (20-30 tickets) - now in acceptable range
- ✅ Strong fundamentals in adoption and NPS

**Example:** Acme Corp

- Before: 91.99 (Green)
- After: 94.88 (Green) ⬆️ +2.89 points

---

## 🎯 Benefits of Hybrid Approach

### ✅ What We Kept (From Our Implementation)

1. **Explainability** - Every score includes top factors with impacts

   - Example: "Slow time to value: -10.0"
   - CSMs know exactly what to fix

2. **Historical Audit Trail** - `HealthSnapshot` table stores every calculation

   - Track score changes over time
   - See which factors improved/degraded

3. **Renewal Risk Penalty** - Commercial signal not in proposed approach

   - -5 points for low adoption (<50%) within 60 days of renewal

4. **AI Integration** - Factors power AI insights

   - Portfolio insights reference specific risk factors
   - Account recommendations based on top negative factors

5. **Null Handling** - Graceful handling of missing data
   - Missing NPS → neutral 7.5 points
   - Missing TTV → neutral 5 points

### ✅ What We Adopted (From Proposed Approach)

1. **Industry-Standard Ranges** - More realistic expectations

   - TTV: 7-90 days (not 0-180)
   - QBR: 0-120 days (not 0-180)
   - Session: 5-40 min (not 0-100)

2. **Tighter Thresholds** - Better signal for problems

   - Critical tickets: 0-5 (not 0-10)
   - SLA breaches: 0-3 (not 0-5)

3. **Simpler Onboarding Logic** - Binary instead of 3-state
   - Easier to understand
   - Focused on actual TTV metric

---

## 🧪 Testing Results

All 10 accounts recomputed successfully:

```json
{
  "message": "Successfully recomputed health scores for 10 accounts",
  "accounts_updated": 10,
  "snapshots_created": 10,
  "computation_time_seconds": 0.02
}
```

### Score Distribution After Update

| Bucket            | Count | Accounts                                                      |
| ----------------- | ----- | ------------------------------------------------------------- |
| **Green (≥75)**   | 5     | Acme Corp, Global Solutions, DataFlow, InnovateTech, MegaCorp |
| **Amber (50-74)** | 1     | CloudVentures                                                 |
| **Red (<50)**     | 4     | TechStart, SmartBiz, QuickServe, StartupXYZ                   |

**Notable:** QuickServe moved from Amber → Red due to stricter ranges

---

## 🚀 Next Steps

1. **Monitor Score Changes** - Watch for accounts near bucket boundaries
2. **Update Documentation** - Reflect new ranges in customer-facing docs
3. **Adjust Thresholds** - If needed, can fine-tune based on real data
4. **Add Session Metrics** - Currently using placeholder, integrate real `avg_session_min` from daily metrics

---

## 📝 Files Modified

1. **`app/health_scoring.py`** (Lines 1-331)

   - Added normalization constants
   - Updated 6 scoring components
   - Simplified onboarding logic
   - Added detailed comments explaining ranges

2. **Test Scripts Created:**

   - `test_hybrid_scoring.sh` - Validates scoring changes
   - Tests before/after comparison
   - Shows factor breakdown

3. **Documentation:**
   - `SCORING_COMPARISON.md` - Full analysis of approaches
   - This summary document

---

## ✨ Result

We now have:

- ✅ Industry-standard ranges for accurate scoring
- ✅ Full explainability for CSM actionability
- ✅ Historical tracking for trend analysis
- ✅ Commercial signals for renewal management
- ✅ AI-powered insights backed by data

**Best of both worlds achieved! 🎉**
