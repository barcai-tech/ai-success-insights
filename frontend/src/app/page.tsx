import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Brain,
  FileSpreadsheet,
  Target,
  TrendingUp,
  Sparkles,
  Github,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-50 via-background to-background dark:from-brand-950/50 dark:via-background dark:to-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              2-Day Production Build
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI Success Insights Dashboard
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A production-grade customer success platform built in 2 days,
              demonstrating transparent health scoring, AI-powered insights with
              GPT-5, and comprehensive OWASP LLM security compliance (A- grade).
              Upload CSVs of usage, NPS, and support data to see portfolio
              health, at-risk segments, and recommended plays. Deployed on AWS
              Lambda + Vercel with extensive security hardening and
              observability.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/upload">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload Data
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/dashboard">
                  <BarChart3 className="h-5 w-5" />
                  View Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link
                  href="https://github.com/barcai-tech/ai-success-insights"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                  View Source
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-brand-200 dark:border-brand-800">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <CardTitle>Transparent Health Scoring</CardTitle>
                <CardDescription>
                  Multi-factor health model combining usage, adoption, support,
                  and engagement metrics with explainable risk factors
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-brand-200 dark:border-brand-800">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  GPT-generated executive summaries and actionable
                  recommendations based on customer health trends and risk
                  signals
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-brand-200 dark:border-brand-800">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <CardTitle>Portfolio Analytics</CardTitle>
                <CardDescription>
                  Real-time portfolio health tracking, ARR-by-segment analysis,
                  and at-risk account identification for faster QBR prep
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Production Section */}
      <section className="py-16 bg-muted/20 border-t border-border/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Production-Grade Security & Infrastructure
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with comprehensive OWASP LLM Top 10 compliance and
              enterprise-grade deployment practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔒 AI Security (A- Grade)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ Input validation & prompt injection prevention</li>
                  <li>✅ Output sanitization & XSS protection</li>
                  <li>✅ Rate limiting via AWS API Gateway (10K req/sec)</li>
                  <li>✅ OpenAI budget controls & usage monitoring</li>
                  <li>✅ Secure model access & API key management</li>
                  <li>✅ Comprehensive security documentation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ☁️ Cloud Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ AWS Lambda + API Gateway (serverless)</li>
                  <li>✅ Neon PostgreSQL (serverless, auto-scaling)</li>
                  <li>✅ Vercel frontend deployment</li>
                  <li>✅ CORS configuration & SSL/TLS encryption</li>
                  <li>✅ Environment-based configuration</li>
                  <li>✅ Production monitoring & logging</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 GPT-5 Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ Advanced reasoning & higher accuracy</li>
                  <li>✅ 45% fewer hallucinations vs GPT-4o</li>
                  <li>✅ 50-80% token efficiency (cost savings)</li>
                  <li>✅ Context-aware customer insights</li>
                  <li>✅ Structured output validation</li>
                  <li>✅ Graceful error handling & fallbacks</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Development Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ Type-safe APIs (TypeScript + Pydantic)</li>
                  <li>✅ Database migrations & schema management</li>
                  <li>✅ Comprehensive API documentation</li>
                  <li>✅ Git workflow & deployment automation</li>
                  <li>✅ Security scanning & vulnerability checks</li>
                  <li>✅ Performance optimization & caching</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link
                href="https://github.com/barcai-tech/ai-success-insights/blob/main/SECURITY_COMPLIANCE.md"
                target="_blank"
              >
                View Security Documentation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Case Study</h2>
            <p className="text-muted-foreground">
              How this solves real CS challenges
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-red-600 dark:text-red-400">
                  Problem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  CS teams juggle usage data, tickets, and NPS without a shared
                  &ldquo;source of truth.&rdquo; Health scores are opaque, QBR
                  prep is manual, and it&apos;s hard to explain why an account
                  is at risk or which actions to prioritize.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-blue-600 dark:text-blue-400">
                  Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  A transparent scoring model that weights adoption, support
                  load, engagement, and NPS. AI summaries explain the
                  &ldquo;why&rdquo; behind each score, and playbook
                  recommendations surface the next-best actions. All data lives
                  in one dashboard with drill-down views.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-green-600 dark:text-green-400">
                  Outcome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Faster QBR prep with pre-generated insights, clearer renewal
                  priorities based on data-driven health scores, and explainable
                  health trends that build trust with stakeholders. CSMs spend
                  less time on spreadsheets and more time with customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tech Stack</h2>
            <p className="text-muted-foreground">
              Built with modern, production-ready tools
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-bold mb-2">Frontend</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Next.js 15 (React)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS + Shadcn UI</li>
                <li>• Recharts for visualizations</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-bold mb-2">Backend</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• FastAPI + AWS Lambda</li>
                <li>• Neon PostgreSQL (Serverless)</li>
                <li>• OpenAI GPT-5 (Advanced Reasoning)</li>
                <li>• Pandas + SQLModel ORM</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Button asChild variant="outline" className="gap-2">
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BarChart3 className="h-4 w-4" />
                View API Documentation
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-brand-200/50 dark:border-brand-800/50 bg-gradient-to-br from-brand-50/30 to-background dark:from-brand-950/20 dark:to-background">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to explore?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start by uploading your customer data or generate mock data to see
            the dashboard in action
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/upload">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
