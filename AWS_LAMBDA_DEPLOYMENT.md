# AWS Lambda Deployment Guide (Mangum + FastAPI)

## Overview

This guide shows how to deploy the existing FastAPI backend to AWS Lambda with **minimal code changes** using the Mangum adapter.

**Timeline:** 2-3 days  
**Code Changes:** ~50 lines  
**AWS Services:** Lambda, API Gateway, Neon PostgreSQL

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Vercel (Next.js Frontend)                        │
│                  https://your-app.vercel.app                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              AWS API Gateway (HTTP API)                             │
│           https://api.yourdomain.com or                             │
│    https://abc123.execute-api.us-east-1.amazonaws.com               │
└────────────────────────────┬────────────────────────────────────────┘
                             │ Lambda Proxy Integration
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS Lambda Function                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Mangum Adapter                             │  │
│  │         (Converts Lambda events to ASGI)                    │  │
│  └────────────────────┬────────────────────────────────────────┘  │
│                       │                                             │
│  ┌────────────────────▼────────────────────────────────────────┐  │
│  │              FastAPI Application                            │  │
│  │        (Your existing app with NO changes!)                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │ PostgreSQL Connection
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Neon PostgreSQL                                │
│              (Serverless PostgreSQL Database)                       │
│         postgresql://...us-east-2.aws.neon.tech/...                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Update Dependencies

### **Add Mangum to requirements.txt**

**`backend/requirements.txt`** - Add this line:

```txt
mangum==0.19.0
```

Install locally to test:

```bash
cd backend
pip install mangum==0.19.0
```

### **Update Database Driver**

Since we're moving to PostgreSQL (Neon), add:

```txt
psycopg2-binary==2.9.10
```

**Final additions to `requirements.txt`:**

```txt
# Existing dependencies...
fastapi==0.119.0
starlette==0.48.0
python-multipart==0.0.18
sqlmodel==0.0.22
pydantic==2.9.2
uvicorn[standard]==0.34.0
pandas==2.2.3
openai==1.57.4
python-dotenv==1.0.1

# NEW: AWS Lambda deployment
mangum==0.19.0
psycopg2-binary==2.9.10
```

---

## Step 2: Update Database Configuration

### **Modify `backend/app/database.py`**

```python
from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.pool import NullPool  # Changed for Lambda
import os

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Lambda-optimized connection (no connection pooling)
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Important: Lambda creates new connections per invocation
    echo=False,
    connect_args={
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    } if DATABASE_URL.startswith("postgresql") else {}
)


def init_db():
    """Initialize database tables"""
    SQLModel.metadata.create_all(engine)


def get_db():
    """Dependency for getting database session"""
    with Session(engine) as session:
        yield session
```

**Key Changes:**

- ✅ Changed from `StaticPool` to `NullPool` (Lambda-friendly)
- ✅ Added PostgreSQL keepalive settings
- ✅ Removed SQLite-specific `check_same_thread`

---

## Step 3: Add Lambda Handler

### **Create `backend/lambda_handler.py`**

```python
"""
Lambda handler for FastAPI application using Mangum
"""
from mangum import Mangum
from app.main import app

# Create Lambda handler
handler = Mangum(app, lifespan="off")

# That's it! Mangum handles the rest.
```

**That's the entire file!** Mangum automatically:

- Converts API Gateway events to ASGI format
- Routes requests to FastAPI
- Converts FastAPI responses back to Lambda format

---

## Step 4: Update FastAPI CORS for Vercel

### **Modify `backend/app/main.py`**

Update the CORS middleware to include your Vercel domain:

```python
# CORS middleware - Update for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",          # Local dev
        "http://localhost:3001",
        "https://your-app.vercel.app",    # Production Vercel domain
        "https://*.vercel.app",           # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Important:** Replace `your-app.vercel.app` with your actual Vercel domain.

---

## Step 5: Create Serverless Configuration

### **Create `backend/serverless.yml`**

```yaml
service: ai-success-insights-backend

provider:
  name: aws
  runtime: python3.12
  region: us-east-1
  stage: ${opt:stage, 'prod'}
  timeout: 30 # 30 seconds (API Gateway max is 29s)
  memorySize: 512 # MB

  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}

  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - logs:CreateLogGroup
            - logs:CreateLogStream
            - logs:PutLogEvents
          Resource: "*"

functions:
  api:
    handler: lambda_handler.handler
    events:
      - httpApi:
          path: /{proxy+}
          method: ANY
      - httpApi:
          path: /
          method: ANY
    description: FastAPI application via Mangum adapter

plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: true # Build dependencies in Docker (matches Lambda environment)
    zip: true
    slim: true # Remove unnecessary files to reduce package size
    layer: true # Package dependencies as Lambda layer (faster deployments)
```

### **Create `backend/package.json`** (for Serverless Framework)

```json
{
  "name": "ai-success-insights-backend",
  "version": "1.0.0",
  "description": "AI Success Insights Backend - AWS Lambda",
  "scripts": {
    "deploy": "serverless deploy --verbose",
    "deploy:prod": "serverless deploy --stage prod --verbose",
    "deploy:dev": "serverless deploy --stage dev --verbose",
    "remove": "serverless remove",
    "logs": "serverless logs -f api -t",
    "info": "serverless info"
  },
  "devDependencies": {
    "serverless": "^3.38.0",
    "serverless-python-requirements": "^6.1.0"
  }
}
```

---

## Step 6: Set Up Neon PostgreSQL

### **1. Create Neon Database**

1. Go to [neon.tech](https://neon.tech)
2. Sign up / Log in
3. Create new project:
   - Name: `ai-success-insights`
   - Region: `US East (Ohio)` or closest to your Lambda region
   - PostgreSQL version: 16

### **2. Get Connection String**

Neon provides a connection string like:

```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### **3. Initialize Database Schema**

Run this **once** to create tables:

```bash
# Set Neon connection string
export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Run initialization script
cd backend
python -c "from app.database import init_db; init_db()"
```

This creates all tables defined in your SQLModel models.

---

## Step 7: Deploy to AWS Lambda

### **Prerequisites**

1. **Install Serverless Framework:**

   ```bash
   npm install -g serverless
   ```

2. **Configure AWS Credentials:**

   ```bash
   aws configure
   # Enter:
   # - AWS Access Key ID
   # - AWS Secret Access Key
   # - Default region: us-east-1
   # - Default output format: json
   ```

3. **Install Serverless Plugins:**
   ```bash
   cd backend
   npm install
   ```

### **Deployment Steps**

1. **Create `.env` file for deployment:**

   **`backend/.env.production`:**

   ```bash
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   OPENAI_API_KEY=sk-proj-xxx
   ```

2. **Deploy to AWS:**

   ```bash
   cd backend

   # Load environment variables
   export $(cat .env.production | xargs)

   # Deploy
   serverless deploy --stage prod --verbose
   ```

3. **Deployment output:**

   ```
   ✔ Service deployed to stack ai-success-insights-backend-prod

   endpoints:
     ANY - https://abc123xyz.execute-api.us-east-1.amazonaws.com/{proxy+}

   functions:
     api: ai-success-insights-backend-prod-api
   ```

4. **Save the endpoint URL** - You'll need this for the frontend.

---

## Step 8: Test Lambda Deployment

### **Test API Gateway Endpoint**

```bash
# Get portfolio metrics
curl https://abc123xyz.execute-api.us-east-1.amazonaws.com/portfolio/metrics

# List accounts
curl https://abc123xyz.execute-api.us-east-1.amazonaws.com/accounts

# Health check
curl https://abc123xyz.execute-api.us-east-1.amazonaws.com/
```

### **Check Lambda Logs**

```bash
serverless logs -f api -t
```

---

## Step 9: Update Frontend for Production

### **1. Update Environment Variables**

**`frontend/.env.production`:**

```bash
NEXT_PUBLIC_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

### **2. Deploy to Vercel**

```bash
cd frontend

# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
vercel --prod
```

### **3. Update CORS in Backend**

After getting your Vercel domain, update `backend/app/main.py`:

```python
allow_origins=[
    "http://localhost:3000",
    "https://your-actual-app.vercel.app",  # Replace with actual domain
    "https://*.vercel.app",
],
```

Redeploy backend:

```bash
cd backend
serverless deploy --stage prod
```

---

## Step 10: Custom Domain (Optional)

### **Set up custom domain for API:**

1. **Register domain in Route 53** (or use existing)

2. **Create ACM Certificate** (us-east-1 region):

   - Request certificate for `api.yourdomain.com`
   - Validate via DNS

3. **Add to `serverless.yml`:**

   ```yaml
   provider:
     # ... existing config
     apiGateway:
       customDomain:
         domainName: api.yourdomain.com
         certificateArn: arn:aws:acm:us-east-1:xxx:certificate/xxx
         createRoute53Record: true
   ```

4. **Deploy:**
   ```bash
   serverless create_domain
   serverless deploy --stage prod
   ```

---

## Monitoring & Debugging

### **View CloudWatch Logs**

```bash
# Tail logs in real-time
serverless logs -f api -t

# View specific time range
serverless logs -f api --startTime 5m
```

### **AWS Console**

1. **Lambda Function:**

   - Go to AWS Lambda console
   - Find `ai-success-insights-backend-prod-api`
   - View metrics, logs, configuration

2. **API Gateway:**
   - Go to API Gateway console
   - View request logs, throttling, errors

### **Performance Monitoring**

Add to `backend/app/main.py`:

```python
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"Request processed in {process_time:.4f}s")
    return response
```

---

## Cost Estimation

### **AWS Lambda Pricing (us-east-1)**

**Free Tier (12 months):**

- 1M requests/month FREE
- 400,000 GB-seconds compute FREE

**After Free Tier:**

- Requests: $0.20 per 1M requests
- Compute: $0.0000166667 per GB-second

**Example (1,000 users, 10 requests/day):**

- Monthly requests: 300,000
- Average duration: 500ms @ 512MB
- **Cost: ~$1-2/month** 💰

### **Neon PostgreSQL Pricing**

**Free Tier:**

- 0.5 GB storage
- 191.9 compute hours/month
- Sufficient for demo/portfolio

**Pro Plan ($19/month):**

- 10 GB storage
- Unlimited compute hours
- Better for production

### **API Gateway Pricing**

**Free Tier (12 months):**

- 1M API calls/month FREE

**After Free Tier:**

- $1.00 per 1M requests

### **Total Monthly Cost (After Free Tier)**

| Traffic Level   | Lambda | API Gateway | Neon DB | Total     |
| --------------- | ------ | ----------- | ------- | --------- |
| Demo (1K req)   | Free   | Free        | Free    | **$0**    |
| Low (100K req)  | $0.20  | $0.10       | Free    | **$0.30** |
| Medium (1M req) | $2.00  | $1.00       | Free    | **$3.00** |
| High (10M req)  | $20    | $10         | $19     | **$49**   |

---

## Troubleshooting

### **Issue: Cold Start Latency**

**Symptom:** First request takes 3-5 seconds  
**Solution:**

1. Enable provisioned concurrency (costs more):

   ```yaml
   functions:
     api:
       provisionedConcurrency: 1 # Keep 1 instance warm
   ```

2. Or use CloudWatch Events to ping every 5 minutes:
   ```yaml
   functions:
     api:
       events:
         - schedule: rate(5 minutes)
   ```

### **Issue: Package Size Too Large**

**Symptom:** Deployment fails - package > 250MB  
**Solution:**

1. Use Lambda layers:

   ```yaml
   custom:
     pythonRequirements:
       layer: true
   ```

2. Remove unnecessary dependencies

3. Use slim pandas:
   ```bash
   pip install pandas --no-binary :all:
   ```

### **Issue: Database Connection Timeout**

**Symptom:** `psycopg2.OperationalError: timeout`  
**Solution:**

1. Increase Lambda timeout:

   ```yaml
   provider:
     timeout: 30
   ```

2. Check Neon DB connection limits (free tier: 100 connections)

3. Use connection pooling with PgBouncer (if needed)

---

## Next Steps

### **Immediate:**

- ✅ Deploy backend to Lambda
- ✅ Deploy frontend to Vercel
- ✅ Test end-to-end flow
- ✅ Update README with deployment URLs

### **Nice to Have:**

- 📊 Set up AWS X-Ray for tracing
- 🔔 Add SNS alerts for errors
- 📈 Create CloudWatch dashboard
- 🔐 Add API key authentication (API Gateway)

### **Future (Option 2):**

- Split into microservices
- Add SQS for async AI processing
- Implement S3 for CSV uploads
- Use EventBridge for scheduled tasks

---

## Summary

### **What You've Deployed:**

✅ FastAPI backend on AWS Lambda  
✅ Serverless PostgreSQL with Neon  
✅ API Gateway for HTTP routing  
✅ Next.js frontend on Vercel  
✅ Production-ready architecture

### **Code Changes Made:**

- Added 1 file (`lambda_handler.py` - 3 lines)
- Modified 1 file (`database.py` - connection pooling)
- Updated 1 file (`main.py` - CORS origins)
- Added 2 config files (`serverless.yml`, `package.json`)

**Total: ~50 lines of code changed** 🎉

### **Resume-Worthy Skills:**

- AWS Lambda (serverless compute)
- API Gateway (REST APIs)
- Serverless Framework (IaC)
- Neon PostgreSQL (serverless DB)
- Vercel deployment
- Cloud architecture

---

**Ready to deploy?** Follow the steps above and you'll have a production serverless deployment in 2-3 days!

For questions or issues, check the Troubleshooting section or reach out.
