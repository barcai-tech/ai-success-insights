# AI Success Insights Dashboard

> **A demonstration project showcasing modern full-stack development, AI integration, and security best practices for Customer Success operations.**

Upload customer data via CSV or generate mock data → get explainable health scores, risk segmentation, and AI-powered insights.

🔗 **[View on GitHub](https://github.com/barcai-tech/ai-success-insights)** | 📋 **[Security Documentation](./SECURITY_COMPLIANCE.md)**

---

## ⚠️ Demo Project Notice

**This is a portfolio demonstration project:**

- 🎯 **Purpose**: Showcase technical skills, not a production SaaS application
- 🔓 **No Authentication**: Intentionally omitted for demo simplicity (all users share the same dataset)
- 🌐 **Shared Environment**: All uploads and modifications are visible to everyone
- ⚠️ **Not Production-Ready**: Requires authentication, rate limiting, and monitoring for production use

**Security Architecture**: This demo uses **Next.js Server Actions** to securely proxy all API calls. The backend URL is never exposed to the browser, demonstrating production-grade security patterns. See [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) for complete security analysis, OWASP compliance, and production hardening roadmap.

---

## 🚀 Overview

**Purpose:**  
Customer Success Managers need fast, explainable portfolio health views—not endless spreadsheets. This dashboard computes transparent health scores with multi-factor analysis, provides visual insights, and demonstrates modern CS operations tooling.

**Key Highlights:**

- ✅ **Transparent Health Scoring** - Multi-factor model with explainable risk factors
- 📊 **Interactive Dashboard** - Portfolio overview with ARR segmentation, health buckets, and trend analysis
- 🎯 **Advanced Filtering** - Filter accounts by health status, segment, with sortable columns and pagination
- 🤖 **GPT-5 generated summaries and recommendations** – AI-powered insights with advanced reasoning and 45% fewer hallucinations
- 📊 **Hybrid scoring algorithm** – Combines metrics and qualitative data
- 💾 **Persistent storage** – All data saved to database
- 🎨 **Modern UI/UX** - Dark mode, responsive design, Shadcn UI components
- � **Realistic Mock Data** - Generate 20 sample accounts with 30 days of daily metrics

---

## ✨ Current Features

### **Implemented Features:**

| Feature                      | Description                                                    | Status      |
| ---------------------------- | -------------------------------------------------------------- | ----------- |
| 🏠 **Landing Page**          | Project overview, tech stack, GitHub links                     | ✅ Complete |
| 📤 **CSV Upload**            | Drag-and-drop file upload with template download               | ✅ Complete |
| 🎲 **Mock Data Generator**   | Generate realistic customer data with health distribution      | ✅ Complete |
| 📊 **Portfolio Dashboard**   | KPI cards, ARR by health bucket, ARR by segment charts         | ✅ Complete |
| � **Account Detail Pages**   | Individual account health breakdown with metrics history       | ✅ Complete |
| 🎯 **Playbooks System**      | Contextual CS recommendations based on account health          | ✅ Complete |
| 🤖 **AI Insights**           | GPT-5 powered analysis with advanced reasoning and accuracy    | ✅ Complete |
| � **Account Table**          | Sortable columns (name, segment, health, ARR)                  | ✅ Complete |
| 🎯 **Multi-Filter System**   | Filter by health bucket and/or segment simultaneously          | ✅ Complete |
| 📄 **Pagination**            | Configurable page sizes (10/25/50 items)                       | ✅ Complete |
| 🎨 **Design System**         | Custom brand colors, semantic health badges, dark mode         | ✅ Complete |
| 📱 **Responsive Design**     | Mobile-friendly navigation and layouts                         | ✅ Complete |
| 🔒 **Security Architecture** | Server Actions, CORS, input validation, vulnerability scanning | ✅ Complete |

### **Production Roadmap:**

For production deployment, the following enhancements are required (see [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) for details):

- 🔐 Authentication & Authorization (NextAuth.js, user isolation)
- 🛡️ Rate Limiting (API throttling, DoS protection)
- 📊 Monitoring & Logging (Sentry, structured logging, audit trails)
- 🤖 LLM Security (prompt injection sanitization, PII filtering)
- � Security Headers (CSP, HSTS, X-Frame-Options)

---

## 🧱 Tech Stack

**Frontend:**

- [Next.js 15.5.4](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Utility-first styling
- [Shadcn UI](https://ui.shadcn.com) - Modern component library
- [Recharts](https://recharts.org) - Data visualizations
- [Lucide Icons](https://lucide.dev) - Icon system
- [next-themes](https://github.com/pacocoursey/next-themes) - Dark mode support

**Backend:**

- [FastAPI](https://fastapi.tiangolo.com) - Modern Python API framework
- [SQLModel](https://sqlmodel.tiangolo.com) - SQL + Pydantic ORM
- [Neon PostgreSQL](https://neon.tech) - Serverless PostgreSQL database
- [OpenAI GPT-5](https://platform.openai.com/) - AI-powered insights (advanced reasoning, 45% fewer hallucinations, 50-80% fewer tokens)
- [Pandas](https://pandas.pydata.org) - CSV processing
- [Mangum](https://mangum.io) - ASGI adapter for AWS Lambda

**Deployment & Infrastructure:**

- [AWS Lambda](https://aws.amazon.com/lambda/) - Serverless compute for backend API
- [API Gateway](https://aws.amazon.com/api-gateway/) - HTTP API routing
- [Vercel](https://vercel.com) - Frontend hosting and deployment
- [Serverless Framework](https://serverless.com) - Infrastructure as Code

**Development:**

- Docker Desktop with Docker Compose V2 (for local development)
- ESLint + Prettier
- Python 3.12+

---

## 🗂 Project Structure

```
ai-success-insights/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── page.tsx     # Landing page
│   │   │   ├── dashboard/   # Portfolio dashboard
│   │   │   └── upload/      # CSV upload page
│   │   ├── components/      # React components
│   │   │   ├── Header.tsx
│   │   │   ├── NavMenu.tsx
│   │   │   └── ui/          # Shadcn components
│   │   └── lib/
│   │       └── api.ts       # Backend API client
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py          # API endpoints
│   │   ├── models.py        # SQLModel schemas
│   │   ├── health_scoring.py
│   │   ├── ai_service.py    # OpenAI integration
│   │   └── schemas.py       # Pydantic schemas
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml        # Production Docker setup
├── docker-compose.dev.yml    # Development Docker setup
├── .env.example             # Environment variables template
├── README.md                # Complete documentation
└── LICENSE
```

---

## ⚙️ Local Development

### **Prerequisites:**

- Node.js 18+ and npm/yarn
- Python 3.12+
- OpenAI API key (optional, for AI insights)
- PostgreSQL database (Neon or local)

### **1️⃣ Clone the repository**

```bash
git clone https://github.com/barcai-tech/ai-success-insights.git
cd ai-success-insights
```

### **2️⃣ Configure Environment Variables**

Create `.env` files in both backend and frontend directories:

**Backend (.env):**

```bash
cd backend
cp .env.example .env

# Edit .env with your credentials
DATABASE_URL=postgresql://user:password@host/database
OPENAI_API_KEY=your-openai-api-key  # Optional
```

**Frontend (.env.local):**

```bash
cd frontend
cat > .env.local << EOF
BACKEND_API_URL=http://localhost:8000
EOF
```

### **3️⃣ Start the Backend**

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

Backend will run at `http://localhost:8000`  
API docs available at `http://localhost:8000/docs`

### **4️⃣ Start the Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:3000`

### **5️⃣ Generate Mock Data**

1. Navigate to `http://localhost:3000/upload`
2. Click "Generate Mock Data" to create 20 sample accounts
3. Go to `http://localhost:3000/dashboard` to explore the data

---

## 🐳 Docker Deployment

### **Prerequisites**

- [Docker Desktop](https://docs.docker.com/get-docker/) 20.10+ (includes Docker Compose V2)

> **Note:** Commands use `docker compose` (V2). For older versions, use `docker-compose`.

### **Quick Start with Docker**

#### **1️⃣ Create Environment File**

Create a `.env` file in the backend directory:

```bash
# OpenAI API Key (optional, for AI insights)
OPENAI_API_KEY=your-key-here

# Database (use PostgreSQL for Docker deployment)
DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_success_insights

# Or use Neon PostgreSQL
# DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname
```

Create a `.env.local` file in the frontend directory:

```bash
# Backend API URL
BACKEND_API_URL=http://localhost:8000
```

#### **2️⃣ Start Services**

**Production Mode** (optimized builds):

```bash
docker compose up -d
```

**Development Mode** (with hot-reload):

```bash
docker compose -f docker-compose.dev.yml up -d
```

#### **3️⃣ Access Application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

#### **4️⃣ View Logs**

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

#### **5️⃣ Stop Services**

```bash
docker compose down

# Remove volumes (resets database)
docker compose down -v
```

### **Common Docker Commands**

```bash
# Build/rebuild images
docker compose build --no-cache

# Check service status
docker compose ps

# Restart services
docker compose restart

# Execute commands in container
docker compose exec backend bash
docker compose exec frontend sh
```

### **Troubleshooting Docker**

**Port already in use:**

```bash
lsof -i :3000  # or :8000
kill -9 <PID>
```

**Reset everything:**

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

**Check backend health:**

```bash
docker compose exec backend curl http://localhost:8000/
```

---

## � Live Demo

**Production Deployment:**

- **Frontend (Vercel):** https://ai-success-insights-git-development-christians-projects-2a640171.vercel.app
- **Backend (AWS Lambda):** https://nokxlnr7gb.execute-api.ap-southeast-1.amazonaws.com
- **Database:** Neon PostgreSQL (Singapore region)

**Architecture:**

- Frontend deployed on Vercel with continuous deployment from `development` branch
- Backend deployed on AWS Lambda (Singapore) with API Gateway
- PostgreSQL database hosted on Neon with connection pooling
- All communication over HTTPS with CORS protection

> **Note:** This is a shared demo environment. All users can view and modify data. For production use, authentication and user isolation would be required.

---

## �🎯 Usage

### **Upload CSV Data**

1. Download the template from the Upload page
2. Fill in customer data (account name, ARR, segment, health metrics)
3. Drag and drop or click to upload
4. View ingested accounts on the Dashboard

### **Explore Dashboard**

- **KPI Cards**: Portfolio health average, total ARR, account counts
- **ARR by Health Bucket**: Click badges to filter by Healthy/Moderate/At-Risk
- **ARR by Segment**: Click segments to filter by SMB/Mid-Market/Enterprise
- **Account Table**: Sort by any column, adjust page size, use dual filters
- **Filter Controls**: Individual × buttons on badges, "Clear All Filters" button

### **Mock Data Distribution**

- 40% Healthy accounts (75-100% engagement, high NPS)
- 40% Moderate accounts (45-75% engagement, medium NPS)
- 20% At-Risk accounts (15-45% engagement, low/negative NPS)

---

## 🔧 API Endpoints

| Endpoint                | Method | Description                |
| ----------------------- | ------ | -------------------------- |
| `/ingest/upload`        | POST   | Upload CSV file            |
| `/ingest/generate-mock` | POST   | Generate mock data         |
| `/accounts`             | GET    | List all accounts          |
| `/accounts/{id}`        | GET    | Get account details        |
| `/portfolio/metrics`    | GET    | Portfolio overview metrics |
| `/health/recompute`     | POST   | Recompute health scores    |

Full API documentation: `http://localhost:8000/docs`

---

## 🚀 Production Deployment

This project is deployed using a modern serverless architecture:

### **Deployment Architecture**

```
Frontend (Vercel) → API Gateway (AWS) → Lambda (FastAPI) → Neon PostgreSQL
```

### **Backend Deployment (AWS Lambda)**

The backend is deployed to AWS Lambda using the Serverless Framework with Mangum adapter:

**Key Configuration:**

- **Runtime:** Python 3.10
- **Region:** ap-southeast-1 (Singapore)
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Package Size:** ~41 MB (includes all dependencies)
- **Framework:** Serverless Framework with Docker for dependency compilation

**Prerequisites:**

- AWS account with programmatic access
- Serverless Framework installed: `npm install -g serverless`
- Docker Desktop running (for Linux-compatible dependency compilation)

**Deployment Steps:**

```bash
cd backend

# Install Serverless Framework dependencies
npm install

# Configure environment variables in .env.production
cat > .env.production << EOF
DATABASE_URL=postgresql://user:password@host/database
OPENAI_API_KEY=your-openai-api-key
EOF

# Deploy to AWS Lambda
npx serverless deploy --stage prod --aws-profile your-profile

# The deployment will output your API Gateway URL
```

**Important:** The `.serverless/` directory contains deployment artifacts and should never be committed to git (already in `.gitignore`).

### **Frontend Deployment (Vercel)**

The frontend is deployed to Vercel with continuous deployment:

**Prerequisites:**

- Vercel account connected to GitHub repository

**Deployment Steps:**

1. **Connect Repository to Vercel:**

   - Import project from GitHub
   - Select the repository
   - Configure project settings

2. **Set Environment Variables in Vercel Dashboard:**

   ```
   BACKEND_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com
   ```

3. **Configure Build Settings:**

   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy:**
   - Vercel automatically deploys on push to configured branch
   - Preview deployments for pull requests
   - Production deployments for main branch

### **Database Setup (Neon PostgreSQL)**

**Why Neon?**

- Serverless PostgreSQL with automatic scaling
- Generous free tier (512 MB storage, 0.5 GB compute)
- AWS region co-location for low latency
- Connection pooling built-in

**Setup Steps:**

1. Create account at [neon.tech](https://neon.tech)
2. Create new project (choose same region as Lambda)
3. Copy connection string from Neon dashboard
4. Set `DATABASE_URL` in both Lambda environment and Vercel environment variables

### **Environment Variables Reference**

**Backend (AWS Lambda):**

- `DATABASE_URL` - Neon PostgreSQL connection string (required)
- `OPENAI_API_KEY` - OpenAI API key for AI insights (optional)

**Frontend (Vercel):**

- `BACKEND_API_URL` - AWS API Gateway URL (required)

**Security Notes:**

- All environment variables are encrypted at rest
- Never commit `.env` files to git
- Use AWS Secrets Manager for production secrets (optional enhancement)

---

## 🎨 Design System

- **Brand Colors**: Custom blue palette (brand-50 to brand-900)
- **Health Colors**: Semantic green/amber/red badges
- **Typography**: Inter font family (Geist as fallback)
- **Radius**: 0.55rem for rounded corners
- **Shadows**: Multi-layer shadow system
- **Dark Mode**: Full theme support with next-themes

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👤 Author

**Christian @ Barcai Tech**  
🔗 [GitHub](https://github.com/barcai-tech)

---

## 🎯 Skills Demonstrated

This project showcases:

## 🎯 Skills Demonstrated

This project showcases:

- 🏗️ **Full-Stack Architecture**: Next.js 15 + FastAPI + PostgreSQL
- ☁️ **Cloud Infrastructure**: AWS Lambda, API Gateway, Serverless Framework
- 🗄️ **Database Design**: SQLModel ORM, migrations, data modeling
- 🤖 **AI Integration**: OpenAI GPT-5 API, advanced reasoning and prompt engineering
- 🔒 **Security**: OWASP LLM Top 10 compliance, CORS, input validation
- 🎨 **Modern UI/UX**: React Server Components, Tailwind, responsive design
- 📊 **Data Processing**: CSV parsing, validation, hybrid scoring algorithms
- 🚀 **Production Deployment**: Vercel + AWS Lambda, environment management
- 🧪 **Testing**: Comprehensive API testing, validation strategies
- 📈 **Performance**: Caching, database optimization, serverless scaling

See [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) for detailed security analysis and production hardening roadmap.
