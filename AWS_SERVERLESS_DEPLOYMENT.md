# AWS Serverless Deployment Architecture

## Target Architecture

**Frontend:** Vercel (Next.js)  
**Database:** Neon DB (PostgreSQL)  
**Backend:** AWS Serverless Stack

- API Gateway (REST/HTTP API)
- Lambda Functions (Python)
- SQS (for async processing)
- S3 (for CSV uploads)
- EventBridge (optional, for scheduled tasks)

---

## Code Changes Required

### 1. Database Layer Changes

#### **Current State** (SQLite)

```python
# backend/app/database.py
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_success_insights.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )
```

#### **Required Changes** (Neon PostgreSQL)

**Update `database.py`:**

```python
# backend/app/database.py
import os
from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.pool import NullPool  # Important for Lambda

DATABASE_URL = os.getenv("DATABASE_URL")  # Neon connection string

# Lambda-optimized connection pool
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # No connection pooling for Lambda
    echo=False,
    connect_args={
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
)

def init_db():
    """Initialize database tables - run once during deployment"""
    SQLModel.metadata.create_all(engine)

def get_db():
    """Lambda-friendly database session"""
    with Session(engine) as session:
        yield session
```

**Neon Connection String Format:**

```bash
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

**Key Changes:**

- ✅ Remove SQLite-specific `check_same_thread`
- ✅ Use `NullPool` (Lambda creates new connections per invocation)
- ✅ Add PostgreSQL connection timeouts and keepalives
- ✅ Enable SSL mode for Neon

---

### 2. Application Structure Refactoring

#### **Current:** Monolithic FastAPI App

```
backend/app/main.py (819 lines)
  ├── All endpoints in one file
  ├── Startup event handlers
  ├── CORS middleware
  └── Synchronous request handling
```

#### **Required:** Lambda Function Handlers

**New Structure:**

```
backend/
├── functions/                    # Lambda handlers
│   ├── accounts/
│   │   ├── list_accounts.py     # GET /accounts
│   │   ├── get_account.py       # GET /accounts/{id}
│   │   └── update_account.py    # PUT /accounts/{id}
│   ├── portfolio/
│   │   └── get_metrics.py       # GET /portfolio/metrics
│   ├── ingest/
│   │   ├── upload_handler.py    # S3 trigger for CSV processing
│   │   └── generate_mock.py     # POST /ingest/generate-mock
│   ├── insights/
│   │   ├── generate_insight.py  # POST /insights/generate
│   │   └── sqs_processor.py     # SQS consumer for async AI
│   └── playbooks/
│       └── get_playbooks.py     # GET /playbooks
├── layers/                       # Lambda layers
│   └── python/
│       ├── app/                  # Shared models, database, utils
│       │   ├── models.py
│       │   ├── database.py
│       │   ├── health_scoring.py
│       │   └── ai_service.py
│       └── requirements.txt      # Dependencies
├── infrastructure/
│   ├── serverless.yml           # Serverless Framework config
│   └── sam-template.yaml        # AWS SAM template (alternative)
└── tests/
```

---

### 3. Lambda Handler Implementation

#### **Example: List Accounts Lambda**

**`backend/functions/accounts/list_accounts.py`:**

```python
"""
Lambda handler for GET /accounts
"""
import json
import os
from typing import Optional
from sqlmodel import Session, select

# Import from Lambda layer
from app.database import engine
from app.models import Account
from app.schemas import AccountListResponse

def handler(event, context):
    """
    API Gateway Lambda Proxy Integration

    Event structure:
    {
        "queryStringParameters": {"segment": "Enterprise", "health_bucket": "At-Risk"},
        "headers": {...},
        "requestContext": {...}
    }
    """
    try:
        # Parse query parameters
        params = event.get("queryStringParameters") or {}
        segment = params.get("segment")
        health_bucket = params.get("health_bucket")

        # Database query
        with Session(engine) as session:
            query = select(Account)

            if segment:
                query = query.where(Account.segment == segment)
            if health_bucket:
                query = query.where(Account.health_bucket == health_bucket)

            accounts = session.exec(query).all()

        # Response
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "https://your-vercel-domain.vercel.app",
                "Access-Control-Allow-Credentials": "true"
            },
            "body": json.dumps({
                "accounts": [account.model_dump() for account in accounts]
            }, default=str)
        }

    except Exception as e:
        print(f"Error: {str(e)}")  # CloudWatch logs
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "https://your-vercel-domain.vercel.app"
            },
            "body": json.dumps({"error": "Internal server error"})
        }
```

---

### 4. CSV Upload Flow (S3 + Lambda)

#### **Current Flow:**

```
Client → FastAPI /ingest/upload → Process CSV → Insert to DB
```

#### **New Flow (Serverless):**

```
1. Client (Vercel) → Pre-signed S3 URL (from Lambda)
2. Client uploads CSV directly to S3
3. S3 Event triggers Lambda
4. Lambda processes CSV → Neon DB
5. Lambda sends completion message to SQS
6. (Optional) Another Lambda consumes SQS for notifications
```

#### **Implementation:**

**Step 1: Generate Pre-signed URL**

**`backend/functions/ingest/get_upload_url.py`:**

```python
import json
import boto3
import uuid
from datetime import datetime

s3_client = boto3.client('s3')
BUCKET_NAME = os.getenv('UPLOAD_BUCKET_NAME')

def handler(event, context):
    """Generate pre-signed S3 URL for CSV upload"""
    try:
        # Generate unique file key
        upload_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')
        file_key = f"uploads/{timestamp}-{upload_id}.csv"

        # Generate pre-signed POST URL (allows direct browser upload)
        presigned_post = s3_client.generate_presigned_post(
            Bucket=BUCKET_NAME,
            Key=file_key,
            Fields={
                "Content-Type": "text/csv",
                "x-amz-meta-upload-id": upload_id
            },
            Conditions=[
                ["content-length-range", 1, 10485760],  # 1 byte to 10MB
                {"Content-Type": "text/csv"}
            ],
            ExpiresIn=300  # 5 minutes
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "https://your-vercel-domain.vercel.app"
            },
            "body": json.dumps({
                "uploadUrl": presigned_post['url'],
                "fields": presigned_post['fields'],
                "fileKey": file_key,
                "uploadId": upload_id
            })
        }

    except Exception as e:
        print(f"Error generating upload URL: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to generate upload URL"})
        }
```

**Step 2: Process CSV on S3 Event**

**`backend/functions/ingest/upload_handler.py`:**

```python
import json
import boto3
import pandas as pd
from io import StringIO
from sqlmodel import Session

from app.database import engine
from app.models import Account, DailyMetric
from app.health_scoring import compute_health_score

s3_client = boto3.client('s3')
sqs_client = boto3.client('sqs')

def handler(event, context):
    """
    Triggered by S3 PUT event

    Event structure:
    {
        "Records": [{
            "s3": {
                "bucket": {"name": "..."},
                "object": {"key": "uploads/...csv"}
            }
        }]
    }
    """
    try:
        # Parse S3 event
        record = event['Records'][0]
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']

        print(f"Processing CSV: s3://{bucket}/{key}")

        # Download CSV from S3
        response = s3_client.get_object(Bucket=bucket, Key=key)
        csv_content = response['Body'].read().decode('utf-8')

        # Parse CSV
        df = pd.read_csv(StringIO(csv_content))

        # Validate required columns
        required_columns = ['account_name', 'arr', 'segment', 'health_score']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"CSV missing required columns: {required_columns}")

        # Insert accounts into Neon DB
        accounts_created = []
        with Session(engine) as session:
            for _, row in df.iterrows():
                # Create account
                account = Account(
                    name=row['account_name'],
                    arr=float(row['arr']),
                    segment=row['segment'],
                    health_score=float(row['health_score']),
                    # ... other fields
                )

                # Compute health bucket
                account.health_bucket = compute_health_bucket(account.health_score)

                session.add(account)
                accounts_created.append(account.name)

            session.commit()

        print(f"Successfully ingested {len(accounts_created)} accounts")

        # Send completion message to SQS (optional, for notifications)
        queue_url = os.getenv('INGESTION_QUEUE_URL')
        if queue_url:
            sqs_client.send_message(
                QueueUrl=queue_url,
                MessageBody=json.dumps({
                    "event": "csv_ingested",
                    "file_key": key,
                    "accounts_count": len(accounts_created),
                    "accounts": accounts_created
                })
            )

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": f"Ingested {len(accounts_created)} accounts",
                "file": key
            })
        }

    except Exception as e:
        print(f"Error processing CSV: {str(e)}")
        # Send error to DLQ or SNS for alerting
        raise
```

---

### 5. Async AI Insights (SQS + Lambda)

#### **Current:** Synchronous AI generation

```python
# FastAPI endpoint blocks until AI response
@app.post("/insights/generate/{account_id}")
async def generate_insight(account_id: int):
    insight = ai_service.generate_insight(account)  # Blocks 5-10s
    return insight
```

#### **New:** Async processing with SQS

**Step 1: API endpoint queues request**

**`backend/functions/insights/queue_insight_generation.py`:**

```python
import json
import boto3

sqs_client = boto3.client('sqs')
QUEUE_URL = os.getenv('AI_INSIGHTS_QUEUE_URL')

def handler(event, context):
    """POST /insights/generate/{account_id} - Queue AI generation"""
    try:
        # Parse account_id from path
        account_id = event['pathParameters']['account_id']

        # Send message to SQS
        response = sqs_client.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=json.dumps({
                "account_id": int(account_id),
                "requested_at": datetime.utcnow().isoformat()
            })
        )

        return {
            "statusCode": 202,  # Accepted
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "https://your-vercel-domain.vercel.app"
            },
            "body": json.dumps({
                "message": "Insight generation queued",
                "request_id": response['MessageId']
            })
        }

    except Exception as e:
        print(f"Error queuing insight generation: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to queue insight generation"})
        }
```

**Step 2: SQS consumer processes AI requests**

**`backend/functions/insights/sqs_processor.py`:**

```python
import json
from sqlmodel import Session, select

from app.database import engine
from app.models import Account, AIInsight
from app.ai_service import ai_service

def handler(event, context):
    """
    SQS consumer for AI insight generation
    Processes messages in batches
    """
    for record in event['Records']:
        try:
            # Parse message
            message = json.loads(record['body'])
            account_id = message['account_id']

            print(f"Generating AI insight for account {account_id}")

            # Fetch account from Neon DB
            with Session(engine) as session:
                account = session.get(Account, account_id)
                if not account:
                    print(f"Account {account_id} not found")
                    continue

                # Generate AI insight (can take 5-10 seconds)
                insight_data = ai_service.generate_insight(account)

                # Save insight to database
                insight = AIInsight(
                    account_id=account_id,
                    summary=insight_data['summary'],
                    recommendations=insight_data['recommendations'],
                    generated_at=datetime.utcnow()
                )
                session.add(insight)
                session.commit()

            print(f"Successfully generated insight for account {account_id}")

        except Exception as e:
            print(f"Error processing message: {str(e)}")
            # Message will return to queue for retry
            raise
```

---

### 6. Frontend Changes (Next.js on Vercel)

#### **Update API Base URL**

**`frontend/.env.production`:**

```bash
# API Gateway endpoint (after deployment)
NEXT_PUBLIC_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod

# Or custom domain
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### **Update CSV Upload Flow**

**Current:**

```typescript
// frontend/src/app/actions/upload.ts
export async function uploadCSV(formData: FormData) {
  const response = await fetch(`${API_URL}/ingest/upload`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}
```

**New (Direct S3 Upload):**

```typescript
// frontend/src/app/actions/upload.ts
export async function uploadCSV(file: File) {
  // Step 1: Get pre-signed URL from API Gateway
  const urlResponse = await fetch(`${API_URL}/ingest/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const { uploadUrl, fields, uploadId } = await urlResponse.json();

  // Step 2: Upload directly to S3
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value as string);
  });
  formData.append("file", file);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload failed");
  }

  // Step 3: Poll for completion (optional)
  return { uploadId, status: "processing" };
}
```

#### **Update AI Insights to Async**

**New polling approach:**

```typescript
// frontend/src/app/actions/insights.ts
export async function requestInsight(accountId: number) {
  // Queue generation
  const response = await fetch(`${API_URL}/insights/generate/${accountId}`, {
    method: "POST",
  });
  const { request_id } = await response.json();

  // Poll for completion
  return pollInsightStatus(accountId, request_id);
}

async function pollInsightStatus(accountId: number, requestId: string) {
  const maxAttempts = 30; // 30 seconds max

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${API_URL}/insights/${accountId}`);
    const insight = await response.json();

    if (insight && insight.request_id === requestId) {
      return insight;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Insight generation timeout");
}
```

---

### 7. Infrastructure as Code

#### **Option 1: Serverless Framework**

**`backend/serverless.yml`:**

```yaml
service: ai-success-insights-backend

provider:
  name: aws
  runtime: python3.12
  region: us-east-1
  stage: ${opt:stage, 'prod'}
  environment:
    DATABASE_URL: ${env:DATABASE_URL} # Neon connection string
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
    UPLOAD_BUCKET_NAME: ${self:custom.uploadBucket}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - s3:GetObject
            - s3:PutObject
          Resource: "arn:aws:s3:::${self:custom.uploadBucket}/*"
        - Effect: Allow
          Action:
            - sqs:SendMessage
            - sqs:ReceiveMessage
            - sqs:DeleteMessage
          Resource: !GetAtt AIInsightsQueue.Arn

custom:
  uploadBucket: ai-insights-uploads-${self:provider.stage}

functions:
  # Accounts
  listAccounts:
    handler: functions/accounts/list_accounts.handler
    events:
      - httpApi:
          path: /accounts
          method: get

  getAccount:
    handler: functions/accounts/get_account.handler
    events:
      - httpApi:
          path: /accounts/{id}
          method: get

  # Portfolio
  getPortfolioMetrics:
    handler: functions/portfolio/get_metrics.handler
    events:
      - httpApi:
          path: /portfolio/metrics
          method: get

  # CSV Upload
  getUploadUrl:
    handler: functions/ingest/get_upload_url.handler
    events:
      - httpApi:
          path: /ingest/upload-url
          method: post

  processUpload:
    handler: functions/ingest/upload_handler.handler
    timeout: 300 # 5 minutes for large CSVs
    events:
      - s3:
          bucket: ${self:custom.uploadBucket}
          event: s3:ObjectCreated:*
          rules:
            - prefix: uploads/
            - suffix: .csv

  # AI Insights
  queueInsight:
    handler: functions/insights/queue_insight_generation.handler
    events:
      - httpApi:
          path: /insights/generate/{account_id}
          method: post

  processInsights:
    handler: functions/insights/sqs_processor.handler
    timeout: 30
    reservedConcurrency: 5 # Limit concurrent AI requests
    events:
      - sqs:
          arn: !GetAtt AIInsightsQueue.Arn
          batchSize: 1

resources:
  Resources:
    UploadBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:custom.uploadBucket}
        CorsConfiguration:
          CorsRules:
            - AllowedOrigins:
                - https://your-vercel-domain.vercel.app
              AllowedMethods:
                - POST
              AllowedHeaders:
                - "*"

    AIInsightsQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ai-insights-queue-${self:provider.stage}
        VisibilityTimeout: 60
        MessageRetentionPeriod: 3600

layers:
  dependencies:
    path: layers/python
    compatibleRuntimes:
      - python3.12
```

**Deploy:**

```bash
cd backend
serverless deploy --stage prod
```

---

### 8. Dependencies & Lambda Layers

#### **Lambda Layer Structure:**

```
backend/layers/python/
├── requirements.txt
└── python/          # Will be created by pip install -t
    ├── sqlmodel/
    ├── pydantic/
    ├── pandas/
    ├── openai/
    └── ...
```

#### **`backend/layers/python/requirements.txt`:**

```txt
# Core
sqlmodel==0.0.22
pydantic==2.9.2
psycopg2-binary==2.9.10  # PostgreSQL driver for Neon

# Data processing
pandas==2.2.3

# AI
openai==1.57.4

# AWS SDK
boto3==1.35.86
```

#### **Build Lambda Layer:**

```bash
cd backend/layers/python
pip install -r requirements.txt -t python/
zip -r layer.zip python/
```

---

## Summary of Code Changes

### ✅ Minimal Changes (Easy)

1. **Database Connection** - Change from SQLite to PostgreSQL (Neon)

   - Update `database.py` with `NullPool` and connection parameters
   - Test with Neon connection string

2. **Environment Variables** - Update `.env` files
   ```bash
   DATABASE_URL=postgresql://...neon.tech/...
   AWS_REGION=us-east-1
   UPLOAD_BUCKET_NAME=ai-insights-uploads
   ```

### ⚠️ Moderate Changes (Refactoring Required)

3. **Split Monolithic App** - Convert FastAPI routes to Lambda handlers

   - Extract each endpoint into separate function
   - Use Lambda proxy integration format (event/context)
   - Add CORS headers manually in responses

4. **Remove FastAPI Middleware** - No more startup events or global middleware

   - Remove `@app.on_event("startup")`
   - Remove `CORSMiddleware` (handle in Lambda responses)

5. **CSV Upload Flow** - Change from direct upload to S3 pre-signed URLs
   - Add `get_upload_url` Lambda
   - Add S3 trigger handler
   - Update frontend to upload directly to S3

### 🔴 Significant Changes (Architectural Shift)

6. **Async AI Processing** - Change from synchronous to SQS-based

   - Add SQS queue for AI requests
   - Add SQS consumer Lambda
   - Update frontend to poll for results

7. **State Management** - Lambdas are stateless

   - No in-memory caching
   - All state must be in Neon DB or ElastiCache (if needed)

8. **Cold Starts** - Optimize for Lambda
   - Move imports inside handler (if needed)
   - Use Lambda layers for dependencies
   - Consider provisioned concurrency for critical endpoints

---

## Estimated Effort

| Task                                | Complexity      | Time Estimate |
| ----------------------------------- | --------------- | ------------- |
| Database migration (SQLite → Neon)  | Low             | 2-4 hours     |
| Split app into Lambda handlers      | Medium          | 1-2 days      |
| S3 upload flow                      | Medium          | 4-6 hours     |
| SQS async processing                | Medium-High     | 1 day         |
| Infrastructure as Code (Serverless) | Medium          | 4-6 hours     |
| Frontend updates (API URL, async)   | Low             | 2-3 hours     |
| Testing & debugging                 | High            | 2-3 days      |
| **Total**                           | **Medium-High** | **5-7 days**  |

---

## Pros & Cons of Serverless Architecture

### ✅ Advantages

- **Cost**: Pay only for execution time (cheaper for low traffic)
- **Scalability**: Auto-scales to millions of requests
- **Maintenance**: No server management
- **Resilience**: Built-in retry and DLQ for failures

### ❌ Disadvantages

- **Cold Starts**: 1-3 second delay on first request
- **Complexity**: More moving parts (API Gateway, SQS, S3)
- **Debugging**: Harder to debug distributed system
- **Vendor Lock-in**: AWS-specific architecture

---

## Alternative: Keep FastAPI, Deploy to AWS

If you want to minimize code changes, consider:

**Option A: FastAPI on Lambda (using Mangum)**

```python
# backend/app/main.py
from mangum import Mangum

app = FastAPI(...)

# Lambda handler
handler = Mangum(app, lifespan="off")
```

- Deploy entire FastAPI app to Lambda
- Use API Gateway proxy integration
- Simpler migration, but larger Lambda (cold start issues)

**Option B: FastAPI on ECS Fargate**

- Containerize FastAPI app
- Deploy to ECS Fargate (serverless containers)
- No code changes needed
- More expensive than Lambda

---

## Recommendation

For your portfolio project:

1. **Start with Option A (Mangum)** for faster deployment

   - Minimal code changes (just add Mangum wrapper)
   - Keep monolithic FastAPI structure
   - Deploy to Lambda via API Gateway

2. **Later refactor to full serverless** if needed
   - Split into microservices
   - Add SQS for async processing
   - Optimize costs and performance

This gives you:

- ✅ Quick deployment to show AWS skills
- ✅ Serverless experience on resume
- ✅ Foundation for future optimization

Would you like me to create a step-by-step migration guide for Option A (Mangum + Lambda)?
