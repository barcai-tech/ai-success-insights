# API Routes Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI SUCCESS INSIGHTS API                      │
│                    http://localhost:8000                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA INGESTION                              │
├─────────────────────────────────────────────────────────────────┤
│ POST /ingest/csv                                                │
│   ↓ Upload CSV file                                             │
│   ↓ Parse accounts & metrics                                    │
│   ↓ Calculate health scores                                     │
│   ↓ Return summary                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ACCOUNT MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│ GET /accounts?page=1&segment=Enterprise&bucket=Critical         │
│   → List accounts with filters                                  │
│   → Pagination support                                          │
│   → Latest metrics included                                     │
│                                                                  │
│ GET /accounts/{id}                                              │
│   → Account details                                             │
│   → Latest health metrics                                       │
│   → 30/60/90-day trends                                         │
│   → Health score history                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      HEALTH SCORING                              │
├─────────────────────────────────────────────────────────────────┤
│ POST /health/recompute                                          │
│   → Recalculate all health scores                              │
│   → Update health buckets                                       │
│   → Return stats                                                │
│                                                                  │
│ Health Score Components (0-100):                                │
│   • Daily Active Users      (25 pts)                            │
│   • Feature Adoption        (25 pts)                            │
│   • Support Tickets         (20 pts - inverse)                  │
│   • NPS Score              (15 pts)                            │
│   • Login Frequency        (15 pts)                            │
│                                                                  │
│ Health Buckets:                                                  │
│   🟢 Healthy (≥70)  |  🟡 At-Risk (40-69)  |  🔴 Critical (<40) │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   PORTFOLIO ANALYTICS                            │
├─────────────────────────────────────────────────────────────────┤
│ GET /portfolio/summary                                          │
│   → Total accounts & ARR                                        │
│   → ARR by health bucket                                        │
│   → Risk breakdown (%)                                          │
│   → Average health score                                        │
│   → Segment distribution                                        │
│   → Trends (30d/90d)                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AI INSIGHTS 🤖                              │
├─────────────────────────────────────────────────────────────────┤
│ POST /insights/portfolio                                        │
│   → AI-powered portfolio analysis                               │
│   → Executive summary                                           │
│   → Key findings (3-4 bullets)                                  │
│   → Top risks to monitor                                        │
│   → Opportunities                                               │
│   → Uses OpenAI GPT-4 (or smart mocks)                         │
│                                                                  │
│ POST /insights/account/{id}                                     │
│   → AI account analysis                                         │
│   → Health score explanation                                    │
│   → Risk factor identification                                  │
│   → 3 RECOMMENDED ACTIONS:                                      │
│       • Title & description                                     │
│       • Priority level                                          │
│       • Estimated impact                                        │
│   → Uses OpenAI GPT-4 (or smart mocks)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   PLAYBOOKS & ACTIONS 📚                         │
├─────────────────────────────────────────────────────────────────┤
│ GET /playbooks                                                  │
│   → 10 pre-configured playbooks                                │
│   → Categories: Engagement, Adoption, Support                   │
│   → Detailed action steps                                       │
│   → Effort estimates                                            │
│                                                                  │
│ POST /actions/recommend?account_id=1                            │
│   → Match playbooks to risk factors                             │
│   → Relevance scoring                                           │
│   → Top 5 recommendations                                       │
│   → Matching risks highlighted                                  │
│                                                                  │
│ 10 Available Playbooks:                                         │
│   1. Executive Business Review                                  │
│   2. Feature Adoption Campaign                                  │
│   3. Technical Health Check                                     │
│   4. User Training & Enablement                                 │
│   5. Quarterly Success Planning                                 │
│   6. Champion User Program                                      │
│   7. NPS Recovery Plan                                          │
│   8. Integration Optimization                                   │
│   9. Renewal Risk Mitigation                                    │
│   10. Data Quality Improvement                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

1. CSV Upload Flow:
   CSV File → /ingest/csv → Parse → Create/Update Accounts
   → Create Metrics → Calculate Health → Return Summary

2. Analytics Flow:
   Database → Calculate Aggregates → Return Portfolio Summary
   Database → Get Account + Metrics → Calculate Trends → Return Detail

3. AI Insights Flow:
   Account Data → Identify Risks → OpenAI API → Parse Response
   → Format Actions → Return Insights

4. Playbook Matching Flow:
   Risk Factors → Match Playbooks → Score Relevance → Sort by Score
   → Return Top 5

┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│      Account        │
├─────────────────────┤
│ id                  │
│ account_name        │
│ segment             │
│ region              │
│ arr                 │
│ health_score        │
│ health_bucket       │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         │
         ↓
┌─────────────────────────┐
│ AccountMetricsDaily     │
├─────────────────────────┤
│ id                      │
│ account_id (FK)         │
│ date                    │
│ daily_active_users      │
│ feature_adoption_rate   │
│ support_tickets_open    │
│ nps_score               │
│ login_frequency         │
│ health_score            │
└─────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                              │
├─────────────────────────────────────────────────────────────────┤
│ • FastAPI              - Web framework                           │
│ • SQLAlchemy          - ORM                                      │
│ • Pydantic            - Data validation                          │
│ • Pandas              - CSV processing                           │
│ • OpenAI              - AI insights                              │
│ • SQLite              - Database (default)                       │
│ • Uvicorn             - ASGI server                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    QUICK START                                   │
├─────────────────────────────────────────────────────────────────┤
│ 1. cd backend                                                    │
│ 2. pip install -r requirements.txt                               │
│ 3. uvicorn app.main:app --reload                                 │
│ 4. Open http://localhost:8000/docs                               │
│ 5. python test_api.py                                            │
└─────────────────────────────────────────────────────────────────┘
```
