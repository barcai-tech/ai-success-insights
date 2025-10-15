# AWS Lambda + Vercel Deployment Guide

This guide walks you through deploying the AI Success Insights application to production using AWS Lambda (backend) and Vercel (frontend).

## Prerequisites

- ✅ Neon PostgreSQL database configured
- ✅ AWS account with programmatic access
- ✅ Node.js and npm installed
- ✅ Serverless Framework installed in backend (`npm install` already run)

## Step 1: Configure AWS Credentials

You need AWS credentials to deploy to Lambda. Choose one of these methods:

### Option A: AWS CLI (Recommended)

```bash
# Install AWS CLI if not already installed
# macOS: brew install awscli
# Or download from: https://aws.amazon.com/cli/

# Configure credentials
aws configure
# Enter:
#   AWS Access Key ID: [your-key-id]
#   AWS Secret Access Key: [your-secret-key]
#   Default region: ap-southeast-1
#   Default output format: json
```

### Option B: Environment Variables

```bash
export AWS_ACCESS_KEY_ID=your_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=ap-southeast-1
```

### Getting AWS Credentials

1. Log in to AWS Console
2. Go to IAM → Users → Your User
3. Security credentials → Create access key
4. Choose "CLI" use case
5. Download credentials (save securely!)

## Step 2: Deploy Backend to AWS Lambda

```bash
cd backend

# Test the serverless configuration
npx serverless info

# Deploy to production
npx serverless deploy --stage prod --verbose
```

This will:

- Package your Python application
- Create Lambda function in AWS
- Create API Gateway (HTTP API)
- Set up CloudWatch logs
- Deploy to ap-southeast-1 (Singapore)

**Expected output:**

```
Service Information
service: ai-success-insights-api
stage: prod
region: ap-southeast-1
stack: ai-success-insights-api-prod
endpoints:
  ANY - https://abc123xyz.execute-api.ap-southeast-1.amazonaws.com/{proxy+}
  ANY - https://abc123xyz.execute-api.ap-southeast-1.amazonaws.com/
functions:
  api: ai-success-insights-api-prod-api
```

**IMPORTANT:** Copy the API Gateway URL from the output!

## Step 3: Test Backend Deployment

```bash
# Test health endpoint (replace with your API Gateway URL)
curl https://abc123xyz.execute-api.ap-southeast-1.amazonaws.com/

# Expected response:
# {"status":"healthy","service":"AI Success Insights API","version":"2.0.0",...}

# Test accounts endpoint
curl https://abc123xyz.execute-api.ap-southeast-1.amazonaws.com/accounts

# Expected response (empty database):
# {"total":0,"page":1,"page_size":50,"accounts":[]}
```

## Step 4: Update Frontend Environment Variables

Edit `frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://abc123xyz.execute-api.ap-southeast-1.amazonaws.com
```

(Replace with your actual API Gateway URL from Step 2)

## Step 5: Deploy Frontend to Vercel

### Option A: Vercel CLI (Recommended for first deployment)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (choose your account)
# - Link to existing project? No
# - Project name? ai-success-insights (or your preferred name)
# - Directory? ./
# - Override settings? No
```

Vercel will:

- Build your Next.js app
- Deploy to production
- Provide a production URL (e.g., `https://ai-success-insights.vercel.app`)

### Option B: GitHub Integration (Recommended for continuous deployment)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Environment Variables: Add `NEXT_PUBLIC_API_URL`
6. Click "Deploy"

## Step 6: Update CORS in Backend

After Vercel deployment, you'll have your production URL (e.g., `https://ai-success-insights.vercel.app`).

Edit `backend/app/main.py` and update CORS:

```python
allow_origins=[
    "http://localhost:3000",  # Next.js dev server
    "http://localhost:3001",  # Alternative port
    "https://*.vercel.app",   # Vercel preview deployments
    "https://ai-success-insights.vercel.app",  # Your production URL
],
```

Redeploy backend:

```bash
cd backend
npx serverless deploy --stage prod
```

## Step 7: Load Sample Data (Optional)

Upload sample data via the frontend:

1. Visit your Vercel URL
2. Go to Dashboard
3. Click "Upload CSV"
4. Upload `sample_data.csv` (if available)

Or use the API directly:

```bash
curl -X POST https://your-api-gateway-url.execute-api.ap-southeast-1.amazonaws.com/accounts/upload \
  -F "file=@sample_data.csv"
```

## Step 8: Verify End-to-End

Test all features:

- ✅ Dashboard loads accounts
- ✅ Account details page works
- ✅ Playbooks can be viewed
- ✅ AI Insights can be generated
- ✅ CSV upload works
- ✅ Data persists in Neon database

## Monitoring & Logs

### Backend Logs (AWS Lambda)

```bash
# Tail logs in real-time
cd backend
npx serverless logs -f api -t --stage prod

# Or view in AWS Console:
# CloudWatch → Log groups → /aws/lambda/ai-success-insights-api-prod-api
```

### Frontend Logs (Vercel)

- Vercel Dashboard → Your Project → Deployments → View Function Logs

### Database Monitoring (Neon)

- Neon Console → Your Project → Monitoring
- View queries, connections, and performance metrics

## Useful Commands

```bash
# Backend
cd backend
npx serverless info --stage prod              # Show deployment info
npx serverless logs -f api -t --stage prod    # Tail logs
npx serverless deploy --stage prod            # Redeploy
npx serverless remove --stage prod            # Remove deployment

# Frontend
cd frontend
vercel --prod                                 # Deploy to production
vercel logs                                   # View logs
vercel env ls                                 # List environment variables
```

## Cost Estimation

### AWS Lambda + API Gateway

- **Lambda Free Tier**: 1M requests/month, 400,000 GB-seconds compute
- **After Free Tier**: ~$0.20 per 1M requests + $0.0000166667 per GB-second
- **API Gateway**: $1.00 per million requests
- **Estimated monthly cost**: $0-5 for demo/portfolio usage

### Neon PostgreSQL

- **Free Tier**: 0.5 GB storage, 1 compute unit
- **Pro Plan**: $19/month for 10 GB storage, autoscaling
- **Estimated monthly cost**: $0 (free tier) - $19 (pro)

### Vercel

- **Free Tier**: 100 GB bandwidth, unlimited deployments
- **Pro Plan**: $20/month for 1TB bandwidth, analytics
- **Estimated monthly cost**: $0 (free tier sufficient for demo)

**Total estimated cost: $0-24/month**

## Troubleshooting

### Backend returns 502 Bad Gateway

- Check Lambda logs: `npx serverless logs -f api -t --stage prod`
- Verify DATABASE_URL is set correctly in Lambda environment
- Check Lambda timeout (increase if needed in serverless.yml)

### Frontend can't connect to backend

- Verify NEXT_PUBLIC_API_URL in frontend/.env.production
- Check CORS settings in backend/app/main.py
- Test API Gateway URL directly with curl

### Database connection timeout

- Verify Neon database is active (may sleep after inactivity on free tier)
- Check connection string in backend/.env.production
- Increase Lambda timeout in serverless.yml

### Package size too large (>50MB)

- Enable `slim: true` in serverless.yml (already configured)
- Remove unnecessary dependencies
- Consider using Lambda Layers for large dependencies

## Security Best Practices

1. **Rotate API Keys**: Store OpenAI API key in AWS Secrets Manager
2. **Enable Rate Limiting**: Use API Gateway throttling
3. **Add Authentication**: Implement before production use
4. **Monitor Costs**: Set up AWS billing alerts
5. **Enable HTTPS Only**: Already configured via API Gateway
6. **Review IAM Permissions**: Use least-privilege access

## Next Steps

After successful deployment:

1. **Custom Domain** (Optional):

   - Register domain in Route 53
   - Create ACM certificate
   - Configure API Gateway custom domain
   - Update frontend environment variables

2. **CI/CD Pipeline**:

   - Set up GitHub Actions
   - Automate deployments on push to main branch
   - Add automated testing

3. **Production Hardening**:

   - Implement authentication (Auth0, Clerk, etc.)
   - Add rate limiting
   - Enable monitoring/alerting
   - Set up backup strategy

4. **Performance Optimization**:
   - Enable Lambda provisioned concurrency (reduce cold starts)
   - Optimize database queries
   - Add caching layer (Redis)

---

**Congratulations!** 🎉 Your application is now deployed to production using AWS Lambda and Vercel!
