# AI Success Insights Dashboard

A small SaaS-style prototype demonstrating **AI-powered Customer Success insights**, designed for rapid portfolio analysis and executive reporting.  
Upload mock customer usage and NPS data → get explainable health scores, risk segmentation, and GPT-generated insights.

---

## 🚀 Overview

**Use case:**  
Customer Success Managers and TAMs need fast, explainable portfolio health views — not endless spreadsheets.  
This dashboard computes transparent health scores and provides AI summaries, built in just 1–2 days to showcase:

- ✅ Customer Success Strategy & Lifecycle Scoring
- 🤖 AI-powered Health Insights & Playbook Recommendations
- ☁️ Cloud-native Architecture (FastAPI + Next.js + Docker)
- 🔐 Secure, transparent data handling (no PII)

---

## 🧠 Features

| Feature              | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| CSV Upload           | Ingest mock customer data (ARR, NPS, usage, tickets)          |
| Health Scoring       | Weighted scoring model (Adoption, Support, Advocacy, Hygiene) |
| Portfolio Dashboard  | Charts, filters, and ARR-risk segmentation                    |
| AI Insights          | GPT summaries for portfolios or individual accounts           |
| Playbook Suggestions | Contextual CS actions (renewal prep, adoption push, etc.)     |

---

## 🧱 Tech Stack

**Frontend:**

- [Next.js 15+](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org) or Chart.js
- React Query / Axios for API calls

**Backend:**

- [FastAPI](https://fastapi.tiangolo.com)
- [SQLModel](https://sqlmodel.tiangolo.com)
- [Uvicorn](https://www.uvicorn.org)
- [OpenAI API](https://platform.openai.com/) for insight generation

**Infra:**

- Docker + docker-compose
- Vercel (frontend)
- Render/Fly.io/EC2 (backend)

---

## 🗂 Repository Structure

ai-success-insights/
frontend/ # Next.js + Tailwind app
backend/ # FastAPI microservice
docker-compose.yml
README.md

---

## ⚙️ Local Development

### 1️⃣ Clone and setup

```bash
git clone https://github.com/<yourusername>/ai-success-insights.git
cd ai-success-insights
```
