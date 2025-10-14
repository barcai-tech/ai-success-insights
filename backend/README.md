# AI Success Insights - Backend API

Customer Success Analytics and Insights Platform with AI-powered recommendations.

## Features

- **CSV Ingestion**: Upload customer data and metrics
- **Account Management**: Track accounts with health scores and trends
- **Portfolio Analytics**: Summary statistics and risk breakdown
- **AI Insights**: Automated portfolio and account analysis
- **Playbook Recommendations**: Matched actions based on risk factors

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `OPENAI_API_KEY`: Optional - for AI-powered insights

### 3. Run the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 4. View API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### CSV Ingestion

- `POST /ingest/csv` - Upload CSV with account metrics

### Accounts

- `GET /accounts` - List accounts (with pagination and filters)
- `GET /accounts/{id}` - Get account detail with trends

### Health

- `POST /health/recompute` - Recompute all health scores

### Portfolio

- `GET /portfolio/summary` - Portfolio summary statistics

### AI Insights

- `POST /insights/portfolio` - AI portfolio analysis
- `POST /insights/account/{id}` - AI account insights + 3 actions

### Playbooks

- `GET /playbooks` - Available playbooks library
- `POST /actions/recommend` - Get recommended playbooks

## CSV Format

Expected columns for CSV upload:

```csv
account_name,segment,region,arr,date,daily_active_users,feature_adoption_rate,support_tickets_open,nps_score,login_frequency
Acme Corp,Enterprise,US,500000,2024-01-01,150,0.75,2,50,0.85
Acme Corp,Enterprise,US,500000,2024-01-02,145,0.76,3,50,0.82
```

### Column Descriptions

- `account_name`: Customer account name (string)
- `segment`: Customer segment - Enterprise/Mid-Market/SMB (string)
- `region`: Geographic region (string)
- `arr`: Annual Recurring Revenue (float)
- `date`: Metric date in YYYY-MM-DD format (date)
- `daily_active_users`: Number of daily active users (integer)
- `feature_adoption_rate`: % of features adopted (0.0-1.0) (float)
- `support_tickets_open`: Number of open support tickets (integer)
- `nps_score`: Net Promoter Score (-100 to 100) (float, optional)
- `login_frequency`: Login frequency rate (0.0-1.0) (float)

## Health Score Calculation

Health scores (0-100) are calculated based on:

- **Daily Active Users** (25 points): More active users = higher score
- **Feature Adoption Rate** (25 points): Higher adoption = higher score
- **Support Tickets** (20 points): Fewer tickets = higher score
- **NPS Score** (15 points): Higher NPS = higher score
- **Login Frequency** (15 points): More frequent logins = higher score

### Health Buckets

- **Healthy**: Score ≥ 70
- **At-Risk**: Score 40-69
- **Critical**: Score < 40

## Playbooks Library

10 pre-configured playbooks for common customer success scenarios:

1. Executive Business Review (EBR)
2. Feature Adoption Campaign
3. Technical Health Check
4. User Training & Enablement
5. Quarterly Success Planning
6. Champion User Program
7. NPS Recovery Plan
8. Integration Optimization
9. Renewal Risk Mitigation
10. Data Quality Improvement

## Development

### Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app and routes
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database configuration
│   ├── services.py       # Business logic
│   ├── ai_service.py     # AI insights generation
│   └── playbooks.py      # Playbooks library
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
└── .env.example         # Environment template
```

### Running Tests

```bash
pytest
```

### Docker Deployment

```bash
docker build -t ai-success-insights-backend .
docker run -p 8000:8000 ai-success-insights-backend
```

## API Examples

### Upload CSV

```bash
curl -X POST "http://localhost:8000/ingest/csv" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data.csv"
```

### Get Account Detail

```bash
curl "http://localhost:8000/accounts/1"
```

### Generate Account Insights

```bash
curl -X POST "http://localhost:8000/insights/account/1"
```

### Get Playbook Recommendations

```bash
curl -X POST "http://localhost:8000/actions/recommend?account_id=1"
```

## License

MIT License
