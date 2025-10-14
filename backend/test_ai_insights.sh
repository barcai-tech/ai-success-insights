#!/bin/bash

# Test AI Insights Functionality
# Make sure the server is running: uvicorn app.main:app --reload

echo "=========================================="
echo "🤖 Testing AI Insights"
echo "=========================================="
echo ""

# Check if server is running
echo "1️⃣  Checking server status..."
SERVER_CHECK=$(curl -s http://localhost:8000/health)
if [ $? -eq 0 ]; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start it with: uvicorn app.main:app --reload"
    exit 1
fi
echo ""

# Test Portfolio Insights
echo "2️⃣  Testing Portfolio Insights..."
echo "Generating AI insights for entire portfolio..."
PORTFOLIO_RESPONSE=$(curl -s -X POST "http://localhost:8000/insights/portfolio" -H "Content-Type: application/json")

if echo "$PORTFOLIO_RESPONSE" | jq -e . >/dev/null 2>&1; then
    echo "✅ Portfolio insights generated successfully"
    echo ""
    echo "Summary:"
    echo "$PORTFOLIO_RESPONSE" | jq -r '.summary'
    echo ""
    echo "Key Findings:"
    echo "$PORTFOLIO_RESPONSE" | jq -r '.key_findings[]' | sed 's/^/  - /'
    echo ""
else
    echo "❌ Failed to generate portfolio insights"
    echo "$PORTFOLIO_RESPONSE"
fi
echo ""

# Get first account
echo "3️⃣  Testing Account-Specific Insights..."
ACCOUNT_DATA=$(curl -s -X GET "http://localhost:8000/accounts?limit=1")
ACCOUNT_ID=$(echo "$ACCOUNT_DATA" | jq -r '.accounts[0].id')
ACCOUNT_NAME=$(echo "$ACCOUNT_DATA" | jq -r '.accounts[0].name')
HEALTH_SCORE=$(echo "$ACCOUNT_DATA" | jq -r '.accounts[0].health_score')

echo "Generating AI insights for: $ACCOUNT_NAME (Health: ${HEALTH_SCORE})"
ACCOUNT_RESPONSE=$(curl -s -X POST "http://localhost:8000/insights/account/${ACCOUNT_ID}" -H "Content-Type: application/json")

if echo "$ACCOUNT_RESPONSE" | jq -e . >/dev/null 2>&1; then
    echo "✅ Account insights generated successfully"
    echo ""
    echo "Summary:"
    echo "$ACCOUNT_RESPONSE" | jq -r '.summary'
    echo ""
    echo "Health Analysis:"
    echo "$ACCOUNT_RESPONSE" | jq -r '.health_analysis'
    echo ""
    echo "Recommended Actions:"
    echo "$ACCOUNT_RESPONSE" | jq -r '.recommended_actions[] | "  📋 \(.title) [\(.priority)]\n     \(.description)"'
    echo ""
else
    echo "❌ Failed to generate account insights"
    echo "$ACCOUNT_RESPONSE"
fi
echo ""

# Test an at-risk account if available
echo "4️⃣  Testing Insights for At-Risk Account..."
AT_RISK_DATA=$(curl -s -X GET "http://localhost:8000/accounts?health_bucket=red&limit=1")
AT_RISK_COUNT=$(echo "$AT_RISK_DATA" | jq -r '.accounts | length')

if [ "$AT_RISK_COUNT" -gt 0 ]; then
    AT_RISK_ID=$(echo "$AT_RISK_DATA" | jq -r '.accounts[0].id')
    AT_RISK_NAME=$(echo "$AT_RISK_DATA" | jq -r '.accounts[0].name')
    AT_RISK_SCORE=$(echo "$AT_RISK_DATA" | jq -r '.accounts[0].health_score')
    
    echo "Found at-risk account: $AT_RISK_NAME (Health: ${AT_RISK_SCORE})"
    AT_RISK_RESPONSE=$(curl -s -X POST "http://localhost:8000/insights/account/${AT_RISK_ID}" -H "Content-Type: application/json")
    
    if echo "$AT_RISK_RESPONSE" | jq -e . >/dev/null 2>&1; then
        echo "✅ At-risk account insights generated"
        echo ""
        echo "Risk Factors:"
        echo "$AT_RISK_RESPONSE" | jq -r '.risk_factors[]' | sed 's/^/  ⚠️  /'
        echo ""
        echo "Recommended Actions:"
        echo "$AT_RISK_RESPONSE" | jq -r '.recommended_actions[] | "  \(.priority): \(.title)"'
        echo ""
    else
        echo "❌ Failed to generate at-risk insights"
    fi
else
    echo "ℹ️  No at-risk accounts found in portfolio"
fi
echo ""

echo "=========================================="
echo "✅ AI Insights Testing Complete!"
echo "=========================================="
echo ""
echo "💡 Tips:"
echo "  - Portfolio insights are generated from all account data"
echo "  - Account insights include risk factors and recommended actions"
echo "  - Insights are powered by OpenAI (or mock data if API key not set)"
echo "  - Check the 'generated_at' timestamp to see when insights were created"
echo ""
