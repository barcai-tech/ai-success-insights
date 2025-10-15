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
- 🤖 **AI-Powered Insights** - GPT-4 generated summaries and recommendations
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
| 🤖 **AI Insights**           | GPT-4 powered analysis and recommendations per account         | ✅ Complete |
| �🔍 **Account Table**        | Sortable columns (name, segment, health, ARR)                  | ✅ Complete |
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
- [SQLite](https://www.sqlite.org) - Embedded database
- [OpenAI GPT-4](https://platform.openai.com/) - AI-powered insights
- [Pandas](https://pandas.pydata.org) - CSV processing
- [Uvicorn](https://www.uvicorn.org) - ASGI server

**Development:**

- Docker Desktop with Docker Compose V2 (optional)
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

### **1️⃣ Clone the repository**

```bash
git clone https://github.com/barcai-tech/ai-success-insights.git
cd ai-success-insights
```

### **2️⃣ Start the Backend**

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable (optional)
export OPENAI_API_KEY="your-key-here"

# Start the server
uvicorn app.main:app --reload
```

Backend will run at `http://localhost:8000`  
API docs available at `http://localhost:8000/docs`

### **3️⃣ Start the Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:3000`

### **4️⃣ Generate Mock Data**

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

Create a `.env` file in the project root:

```bash
# OpenAI API Key (optional, for AI insights)
OPENAI_API_KEY=your-key-here

# Database
DATABASE_URL=sqlite:///./data/ai_success_insights.db

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
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

## 🎯 Usage

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

### **Technical Skills**

- ✅ **Full-Stack Development** - Next.js 15, FastAPI, TypeScript, Python
- ✅ **Security Architecture** - Server Actions, OWASP compliance, vulnerability management
- ✅ **AI Integration** - OpenAI GPT-4 API, prompt engineering, context management
- ✅ **Modern UI/UX** - Responsive design, dark mode, accessibility, Shadcn UI
- ✅ **API Design** - RESTful APIs, validation, error handling, documentation
- ✅ **Database Design** - SQLModel ORM, data modeling, query optimization
- ✅ **DevOps** - Docker, environment configuration, dependency management

### **Business & Domain Skills**

- ✅ **Customer Success Expertise** - Health scoring, risk segmentation, playbook systems
- ✅ **Data Analysis** - Metrics aggregation, trend analysis, portfolio insights
- ✅ **Product Thinking** - User workflows, feature prioritization, MVP scoping

### **Security & Compliance**

- ✅ **OWASP Top 10 Analysis** - Comprehensive security assessment
- ✅ **Vulnerability Management** - Snyk scanning, CVE remediation
- ✅ **LLM Security** - Prompt injection awareness, content filtering
- ✅ **Professional Documentation** - Threat modeling, compliance evidence

See [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) for detailed security analysis and production hardening roadmap.
