#!/bin/bash

# Test Health Scoring After Hybrid Approach Update
# Tests the updated normalization ranges

echo "=========================================="
echo "🏥 Testing Updated Health Scoring"
echo "=========================================="
echo ""

# Get current health scores before recompute
echo "1️⃣  Getting current health scores..."
curl -s -X GET "http://localhost:8000/accounts?limit=5" | jq '.accounts[] | {name: .name, health_score: .health_score, bucket: .health_bucket}' > /tmp/before_scores.json
cat /tmp/before_scores.json
echo ""

# Recompute all health scores with new ranges
echo "2️⃣  Recomputing health scores with updated ranges..."
RECOMPUTE_RESPONSE=$(curl -s -X POST "http://localhost:8000/health/recompute")
echo "$RECOMPUTE_RESPONSE" | jq .
echo ""

# Get updated health scores
echo "3️⃣  Getting updated health scores..."
curl -s -X GET "http://localhost:8000/accounts?limit=5" | jq '.accounts[] | {name: .name, health_score: .health_score, bucket: .health_bucket}' > /tmp/after_scores.json
cat /tmp/after_scores.json
echo ""

# Compare specific account details
echo "4️⃣  Comparing detailed factors for sample account..."
ACCOUNT_ID=2  # TechStart Inc (at-risk account)
curl -s -X GET "http://localhost:8000/accounts/${ACCOUNT_ID}" | jq '{
    name: .name,
    health_score: .health_score,
    health_bucket: .health_bucket,
    metrics: {
        adoption: .active_users,
        seats: .seats_purchased,
        tickets_30d: .tickets_last_30d,
        critical_tickets: .critical_tickets_90d,
        sla_breaches: .sla_breaches_90d,
        ttv_days: .time_to_value_days,
        nps: .nps
    }
}'
echo ""

# Get health snapshot to see factors
echo "5️⃣  Checking health snapshot factors..."
curl -s -X GET "http://localhost:8000/health/snapshot/${ACCOUNT_ID}?limit=1" | jq '.[0] | {
    score: .score,
    risk_label: .risk_label,
    calculated_at: .calculated_at,
    top_factors: .top_factors
}'
echo ""

echo "=========================================="
echo "✅ Health Scoring Test Complete!"
echo "=========================================="
echo ""
echo "📊 What Changed with Hybrid Approach:"
echo "  - Avg Session Range: 5-40 min (was 0-100)"
echo "  - Time to Value: 7-90 days (was 0-180)"
echo "  - Tickets 30d: 0-30 (was 0-20)"
echo "  - Critical Tickets: 0-5 (was 0-10)"
echo "  - SLA Breaches: 0-3 (was 0-5)"
echo "  - QBR Days: 0-120 (was 0-180)"
echo "  - Onboarding: Binary logic (was 3-state)"
echo ""
echo "💡 Explainability Features Retained:"
echo "  ✅ Factor tracking with impacts"
echo "  ✅ Historical snapshots in database"
echo "  ✅ Renewal risk penalty logic"
echo "  ✅ AI insights integration"
echo ""
