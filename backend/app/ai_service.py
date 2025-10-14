import os
from typing import List, Optional
from datetime import datetime
import json

from . import models
from . import schemas

# Check if OpenAI is available
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None


class AIInsightsService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        if OPENAI_AVAILABLE and self.api_key:
            self.client = OpenAI(api_key=self.api_key)
    
    def _generate_mock_portfolio_insight(self, portfolio_data: dict) -> schemas.PortfolioInsight:
        """Generate mock portfolio insight when AI is not available"""
        total_arr = portfolio_data.get("total_arr", 0)
        risk_breakdown = portfolio_data.get("risk_breakdown", {})
        
        return schemas.PortfolioInsight(
            summary=f"Portfolio of {portfolio_data.get('total_accounts', 0)} accounts with total ARR of ${total_arr:,.2f}. "
                   f"Health distribution: {risk_breakdown.get('Healthy', 0)}% Healthy, "
                   f"{risk_breakdown.get('At-Risk', 0)}% At-Risk, {risk_breakdown.get('Critical', 0)}% Critical.",
            key_findings=[
                f"Total ARR: ${total_arr:,.2f}",
                f"Average health score: {portfolio_data.get('avg_health_score', 0):.1f}",
                f"{risk_breakdown.get('Critical', 0)}% of accounts in critical state"
            ],
            top_risks=[
                "Critical accounts need immediate attention",
                "Monitor at-risk accounts for potential churn",
                "Support ticket volume increasing"
            ],
            opportunities=[
                "Expand successful features to at-risk accounts",
                "Implement proactive outreach program",
                "Increase feature adoption through training"
            ],
            generated_at=datetime.utcnow()
        )
    
    def _generate_mock_account_insight(
        self,
        account: models.Account,
        risk_factors: List[str],
        latest_metrics: Optional[models.AccountMetricsDaily]
    ) -> schemas.AccountInsight:
        """Generate mock account insight when AI is not available"""
        actions = []
        
        if "Low user engagement" in risk_factors:
            actions.append(schemas.AccountAction(
                title="Schedule Executive Business Review",
                description="Conduct a strategic review to understand usage barriers and align on value realization",
                priority="High",
                estimated_impact="Could increase engagement by 40-50%"
            ))
        
        if "High support ticket volume" in risk_factors:
            actions.append(schemas.AccountAction(
                title="Provide Technical Training",
                description="Organize training sessions to reduce support dependency",
                priority="High",
                estimated_impact="Could reduce tickets by 60%"
            ))
        
        if "Low feature adoption" in risk_factors:
            actions.append(schemas.AccountAction(
                title="Feature Adoption Workshop",
                description="Guide users through underutilized features that match their use case",
                priority="Medium",
                estimated_impact="Could increase adoption by 30%"
            ))
        
        # Ensure we always have 3 actions
        while len(actions) < 3:
            actions.append(schemas.AccountAction(
                title="Regular Check-in Call",
                description="Schedule monthly success check-ins to monitor progress",
                priority="Medium",
                estimated_impact="Improves relationship and early warning signals"
            ))
        
        bucket_str = account.health_bucket.value if account.health_bucket else "Unknown"
        health_score = account.health_score or 0.0
        
        return schemas.AccountInsight(
            account_id=account.id or 0,
            account_name=account.name,
            summary=f"{account.name} ({account.segment.value if account.segment else 'Unknown'}) is in {bucket_str} state with "
                   f"a health score of {health_score:.1f}. ARR: ${account.arr:,.2f}.",
            health_analysis=f"Current health score of {health_score:.1f} indicates {bucket_str} "
                          f"status. Key concerns: {', '.join(risk_factors) if risk_factors else 'None identified'}.",
            risk_factors=risk_factors,
            recommended_actions=actions[:3],
            generated_at=datetime.utcnow()
        )
    
    async def generate_portfolio_insight(self, portfolio_data: dict) -> schemas.PortfolioInsight:
        """Generate AI-powered portfolio insights"""
        if not self.client:
            return self._generate_mock_portfolio_insight(portfolio_data)
        
        try:
            prompt = f"""Analyze this customer success portfolio and provide strategic insights:

Portfolio Metrics:
- Total Accounts: {portfolio_data.get('total_accounts', 0)}
- Total ARR: ${portfolio_data.get('total_arr', 0):,.2f}
- Average Health Score: {portfolio_data.get('avg_health_score', 0):.1f}/100
- Health Distribution: {portfolio_data.get('risk_breakdown', {})}
- ARR by Health Bucket: {portfolio_data.get('arr_by_bucket', {})}
- Accounts by Segment: {portfolio_data.get('accounts_by_segment', {})}

Provide:
1. A brief executive summary (2-3 sentences)
2. 3-4 key findings
3. 3-4 top risks to watch
4. 3-4 opportunities for improvement

Format as JSON with keys: summary, key_findings, top_risks, opportunities"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert Customer Success analyst."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            content = response.choices[0].message.content
            # Try to parse JSON from response
            try:
                data = json.loads(content)
            except json.JSONDecodeError:
                # If not valid JSON, return mock response
                return self._generate_mock_portfolio_insight(portfolio_data)
            
            return schemas.PortfolioInsight(
                summary=data.get("summary", ""),
                key_findings=data.get("key_findings", []),
                top_risks=data.get("top_risks", []),
                opportunities=data.get("opportunities", []),
                generated_at=datetime.utcnow()
            )
        
        except Exception as e:
            print(f"AI generation error: {e}")
            return self._generate_mock_portfolio_insight(portfolio_data)
    
    async def generate_account_insight(
        self,
        account: models.Account,
        risk_factors: List[str],
        latest_metrics: Optional[models.AccountMetricsDaily],
        trend_data: Optional[dict] = None
    ) -> schemas.AccountInsight:
        """Generate AI-powered account insights and recommendations"""
        if not self.client:
            return self._generate_mock_account_insight(account, risk_factors, latest_metrics)
        
        try:
            metrics_str = ""
            if latest_metrics:
                metrics_str = f"""
- Daily Logins: {latest_metrics.logins}
- Events: {latest_metrics.events}
- Feature X Events: {latest_metrics.feature_x_events}
- Avg Session (min): {latest_metrics.avg_session_min}
- Errors: {latest_metrics.errors}
- Ticket Backlog: {latest_metrics.ticket_backlog}"""
            
            health_score = account.health_score or 0.0
            bucket_str = account.health_bucket.value if account.health_bucket else "Unknown"
            segment_str = account.segment.value if account.segment else "Unknown"
            
            prompt = f"""Analyze this customer account and provide actionable recommendations:

Account Details:
- Name: {account.name}
- Segment: {segment_str}
- Region: {account.region}
- ARR: ${account.arr:,.2f}
- Health Score: {health_score:.1f}/110
- Health Bucket: {bucket_str}

Latest Metrics:{metrics_str}

Risk Factors:
{chr(10).join(f'- {rf}' for rf in risk_factors) if risk_factors else '- None identified'}

Provide:
1. A brief summary of the account's current state
2. Health analysis explaining the score and trends
3. Exactly 3 specific, actionable recommendations with:
   - Title
   - Description
   - Priority (High/Medium/Low)
   - Estimated Impact

Format as JSON with keys: summary, health_analysis, recommended_actions (array of objects with title, description, priority, estimated_impact)"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert Customer Success Manager with deep experience in SaaS account management."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            try:
                data = json.loads(content)
            except json.JSONDecodeError:
                return self._generate_mock_account_insight(account, risk_factors, latest_metrics)
            
            actions = [
                schemas.AccountAction(
                    title=action.get("title", ""),
                    description=action.get("description", ""),
                    priority=action.get("priority", "Medium"),
                    estimated_impact=action.get("estimated_impact", "")
                )
                for action in data.get("recommended_actions", [])[:3]
            ]
            
            return schemas.AccountInsight(
                account_id=account.id or 0,
                account_name=account.name,
                summary=data.get("summary", ""),
                health_analysis=data.get("health_analysis", ""),
                risk_factors=risk_factors,
                recommended_actions=actions,
                generated_at=datetime.utcnow()
            )
        
        except Exception as e:
            print(f"AI generation error: {e}")
            return self._generate_mock_account_insight(account, risk_factors, latest_metrics)


# Singleton instance
ai_service = AIInsightsService()
