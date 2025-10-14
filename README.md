# AI Success Insights Dashboard

A 1-day prototype demonstrating **AI-powered Customer Success insights** for rapid portfolio analysis and executive reporting. Upload customer data via CSV or generate mock data → get explainable health scores, risk segmentation, and actionable insights.

🔗 **[View on GitHub](https://github.com/barcai-tech/ai-success-insights)**

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

### **Implemented (v1.0):**

| Feature                    | Description                                               | Status      |
| -------------------------- | --------------------------------------------------------- | ----------- |
| 🏠 **Landing Page**        | Project overview, tech stack, GitHub links                | ✅ Complete |
| 📤 **CSV Upload**          | Drag-and-drop file upload with template download          | ✅ Complete |
| 🎲 **Mock Data Generator** | Generate realistic customer data with health distribution | ✅ Complete |
| 📊 **Portfolio Dashboard** | KPI cards, ARR by health bucket, ARR by segment charts    | ✅ Complete |
| 🔍 **Account Table**       | Sortable columns (name, segment, health, ARR)             | ✅ Complete |
| 🎯 **Multi-Filter System** | Filter by health bucket and/or segment simultaneously     | ✅ Complete |
| 📄 **Pagination**          | Configurable page sizes (10/25/50 items)                  | ✅ Complete |
| 🎨 **Design System**       | Custom brand colors, semantic health badges, dark mode    | ✅ Complete |
| 📱 **Responsive Design**   | Mobile-friendly navigation and layouts                    | ✅ Complete |

### **Planned (Future):**

- 📋 Account detail pages with health score breakdown
- 🎯 Playbooks page with contextual CS recommendations
- 🤖 AI insight generation per account
- 📈 90-day health trend visualizations
- 🔔 Risk alerts and notifications

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

- Docker + docker-compose (optional)
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
│   │   └── ai_insights.py   # OpenAI integration
│   ├── requirements.txt
│   └── Dockerfile
│
├── README.md
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

## 🙏 Acknowledgments

Built as a 1-day prototype to demonstrate:

- Modern full-stack development practices
- Customer Success domain expertise
- AI integration for business insights
- Production-ready UI/UX design patterns
