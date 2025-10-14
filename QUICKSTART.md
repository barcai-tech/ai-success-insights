# Quick Start Guide

## 1. Start the Backend Server

```bash
cd backend
./run.sh
```

Or manually:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at: **http://localhost:8000**

## 2. View API Documentation

Open your browser to:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 3. Upload Sample Data

```bash
# Using the test script
cd backend
python test_api.py
```

Or manually via curl:

```bash
curl -X POST "http://localhost:8000/ingest/csv" \
  -F "file=@sample_data.csv"
```

Note: Run this from the `backend` directory, or use the full path `file=@backend/sample_data.csv` from the project root.

## 4. Test the API

### Get All Accounts

```bash
curl "http://localhost:8000/accounts"
```

### Get Account Detail with Trends

```bash
curl "http://localhost:8000/accounts/1"
```

### Get Portfolio Summary

```bash
curl "http://localhost:8000/portfolio/summary"
```

### Generate AI Insights for Account

```bash
curl -X POST "http://localhost:8000/insights/account/1"
```

### Get Playbook Recommendations

```bash
curl -X POST "http://localhost:8000/actions/recommend?account_id=1"
```

### Get All Playbooks

```bash
curl "http://localhost:8000/playbooks"
```

## 5. Configure OpenAI (Optional)

For AI-powered insights, add your OpenAI API key to `.env`:

```bash
cd backend
cp .env.example .env
# Edit .env and add:
# OPENAI_API_KEY=sk-your-key-here
```

Without an API key, the system will use mock insights.

## API Routes Summary

| Method | Endpoint                 | Description                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/ingest/csv`            | Upload CSV with account metrics |
| GET    | `/accounts`              | List accounts with filters      |
| GET    | `/accounts/{id}`         | Get account detail + trends     |
| POST   | `/health/recompute`      | Recompute health scores         |
| GET    | `/portfolio/summary`     | Portfolio statistics            |
| POST   | `/insights/portfolio`    | AI portfolio analysis           |
| POST   | `/insights/account/{id}` | AI account insights + actions   |
| GET    | `/playbooks`             | Available playbooks             |
| POST   | `/actions/recommend`     | Recommended playbooks           |

## Example CSV Format

```csv
account_name,segment,region,arr,date,daily_active_users,feature_adoption_rate,support_tickets_open,nps_score,login_frequency
Acme Corp,Enterprise,US,500000,2024-10-01,150,0.75,2,50,0.85
```

## Health Score Buckets

- **Healthy**: Score ≥ 70 (Green)
- **At-Risk**: Score 40-69 (Yellow)
- **Critical**: Score < 40 (Red)

## Next Steps

1. Upload your customer data via `/ingest/csv`
2. View portfolio summary at `/portfolio/summary`
3. Get AI insights for specific accounts
4. Review recommended playbooks for at-risk accounts
5. Integrate with your frontend application

## Support

- API Documentation: http://localhost:8000/docs
- Backend README: backend/README.md
- Sample Data: backend/sample_data.csv
- Test Suite: backend/test_api.py
