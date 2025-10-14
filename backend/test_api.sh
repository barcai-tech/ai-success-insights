#!/bin/bash

echo "🧪 Testing AI Success Insights API v2.0"
echo "======================================="
echo ""

# Base URL
BASE_URL="http://localhost:8000"

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$BASE_URL/" | jq '.'
echo ""
echo ""

# Test 2: Upload Sample Data
echo "2️⃣  Uploading Sample Data (sample_data_v2.csv)..."
curl -s -X POST "$BASE_URL/ingest/csv" \
  -F "file=@sample_data_v2.csv" | jq '.'
echo ""
echo ""

# Test 3: Get All Accounts
echo "3️⃣  Getting All Accounts..."
curl -s "$BASE_URL/accounts" | jq '.accounts[] | {id, name, health_score, health_bucket}'
echo ""
echo ""

# Test 4: Get Account Detail with Health Factors
echo "4️⃣  Getting Account #1 Detail with Health Factors..."
curl -s "$BASE_URL/accounts/1" | jq '{id, name, health_score, health_bucket, latest_health_factors}'
echo ""
echo ""

# Test 5: Get Health History
echo "5️⃣  Getting Health History for Account #1..."
curl -s "$BASE_URL/accounts/1/health-history?limit=3" | jq '.'
echo ""
echo ""

# Test 6: Portfolio Summary
echo "6️⃣  Getting Portfolio Summary..."
curl -s "$BASE_URL/portfolio/summary" | jq '{total_accounts, total_arr, arr_by_bucket, avg_health_score}'
echo ""
echo ""

# Test 7: AI Account Insights
echo "7️⃣  Generating AI Insights for Account #1..."
curl -s -X POST "$BASE_URL/insights/account/1" | jq '{account_name, summary, risk_factors, recommended_actions}'
echo ""
echo ""

# Test 8: Get Playbooks
echo "8️⃣  Getting Available Playbooks..."
curl -s "$BASE_URL/playbooks" | jq '.[0:2] | .[] | {id, title, category, priority}'
echo ""
echo ""

# Test 9: Playbook Recommendations
echo "9️⃣  Getting Playbook Recommendations for Account #5..."
curl -s -X POST "$BASE_URL/actions/recommend?account_id=5" | jq '{account_id, recommendations: .recommendations[0:2]}'
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "📚 API Documentation: http://localhost:8000/docs"
