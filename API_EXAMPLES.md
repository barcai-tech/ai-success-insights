# API Request Examples

Complete examples for testing all API endpoints.

## Base URL

```
http://localhost:8000
```

---

## 1. Health Check

```bash
curl http://localhost:8000/
```

**Response:**

```json
{
  "status": "healthy",
  "service": "AI Success Insights API",
  "version": "1.0.0"
}
```

---

## 2. Upload CSV Data

```bash
curl -X POST "http://localhost:8000/ingest/csv" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_data.csv"
```

**Response:**

```json
{
  "message": "CSV processed successfully",
  "accounts_created": 5,
  "accounts_updated": 0,
  "metrics_created": 15,
  "errors": []
}
```

---

## 3. List All Accounts

### Basic listing

```bash
curl "http://localhost:8000/accounts?page=1&page_size=10"
```

### With filters

```bash
# Filter by segment
curl "http://localhost:8000/accounts?segment=Enterprise"

# Filter by health bucket
curl "http://localhost:8000/accounts?bucket=Critical"

# Filter by region
curl "http://localhost:8000/accounts?region=US"

# Combined filters
curl "http://localhost:8000/accounts?segment=Enterprise&bucket=Healthy&page=1&page_size=20"
```

**Response:**

```json
{
  "total": 5,
  "page": 1,
  "page_size": 10,
  "accounts": [
    {
      "id": 1,
      "account_name": "Acme Corp",
      "segment": "Enterprise",
      "region": "US",
      "arr": 500000.0,
      "health_bucket": "Healthy",
      "health_score": 78.5,
      "created_at": "2024-10-14T12:00:00",
      "updated_at": "2024-10-14T12:00:00",
      "latest_metrics": {
        "id": 3,
        "account_id": 1,
        "date": "2024-10-03",
        "daily_active_users": 160,
        "feature_adoption_rate": 0.78,
        "support_tickets_open": 2,
        "nps_score": 55.0,
        "login_frequency": 0.88,
        "health_score": 78.5
      }
    }
  ]
}
```

---

## 4. Get Account Detail

```bash
curl "http://localhost:8000/accounts/1"
```

**Response:**

```json
{
  "id": 1,
  "account_name": "Acme Corp",
  "segment": "Enterprise",
  "region": "US",
  "arr": 500000.0,
  "health_bucket": "Healthy",
  "health_score": 78.5,
  "created_at": "2024-10-14T12:00:00",
  "updated_at": "2024-10-14T12:00:00",
  "latest_metrics": {
    "date": "2024-10-03",
    "daily_active_users": 160,
    "feature_adoption_rate": 0.78,
    "support_tickets_open": 2,
    "nps_score": 55.0,
    "login_frequency": 0.88,
    "health_score": 78.5
  },
  "trend_30d": {
    "days": 30,
    "health_score_change": 3.2,
    "arr_change": 0.0,
    "engagement_trend": "improving"
  },
  "trend_60d": {
    "days": 60,
    "health_score_change": 1.5,
    "arr_change": 0.0,
    "engagement_trend": "stable"
  },
  "trend_90d": null
}
```

---

## 5. Recompute Health Scores

```bash
curl -X POST "http://localhost:8000/health/recompute"
```

**Response:**

```json
{
  "message": "Successfully recomputed health scores for 5 accounts",
  "accounts_updated": 5,
  "computation_time_seconds": 0.15
}
```

---

## 6. Get Portfolio Summary

```bash
curl "http://localhost:8000/portfolio/summary"
```

**Response:**

```json
{
  "total_accounts": 5,
  "total_arr": 1535000.0,
  "arr_by_bucket": {
    "Healthy": 1250000.0,
    "At-Risk": 200000.0,
    "Critical": 85000.0
  },
  "risk_breakdown": {
    "Healthy": 40.0,
    "At-Risk": 20.0,
    "Critical": 40.0
  },
  "arr_trend_30d": 0.0,
  "arr_trend_90d": 0.0,
  "avg_health_score": 54.2,
  "accounts_by_segment": {
    "Enterprise": 2,
    "Mid-Market": 1,
    "SMB": 2
  }
}
```

---

## 7. Generate Portfolio Insights (AI)

```bash
curl -X POST "http://localhost:8000/insights/portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "include_recommendations": true,
    "focus_areas": ["churn_risk", "expansion"]
  }'
```

**Response:**

```json
{
  "summary": "Portfolio of 5 accounts with total ARR of $1,535,000. Health distribution: 40% Healthy, 20% At-Risk, 40% Critical.",
  "key_findings": [
    "Total ARR: $1,535,000.00",
    "Average health score: 54.2",
    "40% of accounts in critical state"
  ],
  "top_risks": [
    "Critical accounts need immediate attention",
    "Monitor at-risk accounts for potential churn",
    "Support ticket volume increasing"
  ],
  "opportunities": [
    "Expand successful features to at-risk accounts",
    "Implement proactive outreach program",
    "Increase feature adoption through training"
  ],
  "generated_at": "2024-10-14T12:00:00"
}
```

---

## 8. Generate Account Insights (AI)

```bash
curl -X POST "http://localhost:8000/insights/account/1" \
  -H "Content-Type: application/json" \
  -d '{
    "include_recommendations": true
  }'
```

**Response:**

```json
{
  "account_id": 1,
  "account_name": "Acme Corp",
  "summary": "Acme Corp (Enterprise) is in Healthy state with a health score of 78.5. ARR: $500,000.00.",
  "health_analysis": "Current health score of 78.5 indicates healthy status. Strong user engagement and feature adoption.",
  "risk_factors": [],
  "recommended_actions": [
    {
      "title": "Quarterly Business Review",
      "description": "Schedule QBR to discuss expansion opportunities and additional use cases",
      "priority": "Medium",
      "estimated_impact": "Could drive 20-30% ARR expansion",
      "playbook_id": 5
    },
    {
      "title": "Champion Program Enrollment",
      "description": "Identify and empower power users as internal champions",
      "priority": "Medium",
      "estimated_impact": "Strengthens relationship and advocacy",
      "playbook_id": 6
    },
    {
      "title": "Advanced Feature Training",
      "description": "Introduce premium features to drive additional value",
      "priority": "Low",
      "estimated_impact": "Increases stickiness and potential upsell",
      "playbook_id": 2
    }
  ],
  "generated_at": "2024-10-14T12:00:00"
}
```

---

## 9. Get All Playbooks

```bash
curl "http://localhost:8000/playbooks"
```

**Response:**

```json
[
  {
    "id": 1,
    "title": "Executive Business Review (EBR)",
    "description": "Conduct strategic review with executive stakeholders",
    "category": "Engagement",
    "priority": "High",
    "estimated_effort": "4-6 hours preparation + 1-2 hour meeting",
    "risk_factors": [
      "Low user engagement",
      "Critical health score",
      "Below target health score"
    ],
    "steps": [
      "Review account history and key metrics",
      "Identify business outcomes and KPIs",
      "Prepare presentation with ROI analysis",
      "Schedule meeting with key stakeholders",
      "Conduct review and document action items",
      "Follow up within 48 hours"
    ],
    "created_at": null
  }
]
```

---

## 10. Get Playbook Recommendations

### For specific account

```bash
curl -X POST "http://localhost:8000/actions/recommend?account_id=4"
```

### With manual risk factors

```bash
curl -X POST "http://localhost:8000/actions/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "risk_factors": [
      "Low user engagement",
      "High support ticket volume",
      "Negative NPS score"
    ]
  }'
```

**Response:**

```json
{
  "account_id": 4,
  "recommendations": [
    {
      "playbook": {
        "id": 9,
        "title": "Renewal Risk Mitigation",
        "description": "Intensive program for at-risk renewals",
        "category": "Engagement",
        "priority": "High",
        "estimated_effort": "4-6 weeks",
        "risk_factors": [
          "Critical health score",
          "Negative NPS score",
          "Low user engagement"
        ],
        "steps": [
          "Conduct stakeholder interviews",
          "Document all concerns",
          "Create value realization report",
          "Develop recovery roadmap",
          "Weekly executive updates",
          "Implement quick wins",
          "Present renewal business case"
        ]
      },
      "relevance_score": 0.95,
      "matching_risk_factors": [
        "Critical health score",
        "Negative NPS score",
        "Low user engagement"
      ]
    },
    {
      "playbook": {
        "id": 3,
        "title": "Technical Health Check",
        "description": "Comprehensive technical review",
        "category": "Support",
        "priority": "High",
        "estimated_effort": "1-2 weeks",
        "risk_factors": ["High support ticket volume", "Critical health score"],
        "steps": [
          "Review all open support tickets",
          "Schedule technical review call",
          "Audit account configuration",
          "Identify technical debt and issues",
          "Create remediation plan",
          "Implement fixes and optimizations",
          "Provide technical documentation"
        ]
      },
      "relevance_score": 0.87,
      "matching_risk_factors": [
        "High support ticket volume",
        "Critical health score"
      ]
    }
  ]
}
```

---

## Python Examples

### Using requests library

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Upload CSV
def upload_csv(file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/ingest/csv", files=files)
        return response.json()

# Get accounts with filters
def get_accounts(segment=None, bucket=None):
    params = {}
    if segment:
        params['segment'] = segment
    if bucket:
        params['bucket'] = bucket

    response = requests.get(f"{BASE_URL}/accounts", params=params)
    return response.json()

# Get account detail
def get_account_detail(account_id):
    response = requests.get(f"{BASE_URL}/accounts/{account_id}")
    return response.json()

# Generate insights
def get_account_insights(account_id):
    response = requests.post(f"{BASE_URL}/insights/account/{account_id}")
    return response.json()

# Get recommendations
def get_recommendations(account_id):
    response = requests.post(
        f"{BASE_URL}/actions/recommend",
        params={'account_id': account_id}
    )
    return response.json()

# Example usage
if __name__ == "__main__":
    # Upload data
    result = upload_csv("sample_data.csv")
    print(f"Uploaded: {result['accounts_created']} accounts created")

    # Get critical accounts
    critical = get_accounts(bucket="Critical")
    print(f"Critical accounts: {critical['total']}")

    # Analyze first account
    if critical['accounts']:
        account_id = critical['accounts'][0]['id']
        insights = get_account_insights(account_id)
        print(f"\nInsights for {insights['account_name']}:")
        for action in insights['recommended_actions']:
            print(f"- {action['title']} [{action['priority']}]")
```

---

## JavaScript/TypeScript Examples

```typescript
const BASE_URL = "http://localhost:8000";

// Upload CSV
async function uploadCsv(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/ingest/csv`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

// Get accounts
async function getAccounts(filters: {
  page?: number;
  page_size?: number;
  segment?: string;
  bucket?: string;
}) {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`${BASE_URL}/accounts?${params}`);
  return response.json();
}

// Get account detail
async function getAccountDetail(accountId: number) {
  const response = await fetch(`${BASE_URL}/accounts/${accountId}`);
  return response.json();
}

// Generate insights
async function getAccountInsights(accountId: number) {
  const response = await fetch(`${BASE_URL}/insights/account/${accountId}`, {
    method: "POST",
  });
  return response.json();
}

// Get portfolio summary
async function getPortfolioSummary() {
  const response = await fetch(`${BASE_URL}/portfolio/summary`);
  return response.json();
}

// Example usage
async function main() {
  // Get portfolio overview
  const portfolio = await getPortfolioSummary();
  console.log(`Total ARR: $${portfolio.total_arr.toLocaleString()}`);

  // Get critical accounts
  const critical = await getAccounts({ bucket: "Critical" });
  console.log(`Critical accounts: ${critical.total}`);

  // Analyze each critical account
  for (const account of critical.accounts) {
    const insights = await getAccountInsights(account.id);
    console.log(`\n${insights.account_name}:`);
    insights.recommended_actions.forEach((action: any) => {
      console.log(`  - ${action.title} [${action.priority}]`);
    });
  }
}
```

---

## Testing All Endpoints

```bash
# Quick test script
#!/bin/bash

BASE_URL="http://localhost:8000"

echo "1. Health Check"
curl -s $BASE_URL/ | jq

echo -e "\n2. Upload CSV"
curl -s -X POST "$BASE_URL/ingest/csv" \
  -F "file=@sample_data.csv" | jq

echo -e "\n3. List Accounts"
curl -s "$BASE_URL/accounts?page_size=5" | jq

echo -e "\n4. Account Detail"
curl -s "$BASE_URL/accounts/1" | jq

echo -e "\n5. Portfolio Summary"
curl -s "$BASE_URL/portfolio/summary" | jq

echo -e "\n6. Portfolio Insights"
curl -s -X POST "$BASE_URL/insights/portfolio" | jq

echo -e "\n7. Account Insights"
curl -s -X POST "$BASE_URL/insights/account/1" | jq

echo -e "\n8. Playbooks"
curl -s "$BASE_URL/playbooks" | jq '. | length'

echo -e "\n9. Recommendations"
curl -s -X POST "$BASE_URL/actions/recommend?account_id=1" | jq

echo -e "\n✅ All tests complete!"
```

Save as `test.sh`, make executable (`chmod +x test.sh`), and run!
