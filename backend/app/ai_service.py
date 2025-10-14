import os
from typing import List, Optional
from datetime import datetime
import json

from . import models
from . import schemas
from . import playbooks

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
            # Convert portfolio data to clean JSON
            portfolio_json = json.dumps(portfolio_data, indent=2, default=str)
            
            prompt = f"""You are a Customer Success leader. Using the JSON portfolio snapshot, write:
1) A 120–160 word executive summary for the VP CS.
2) 3 priority actions for the next 30 days.
3) A one-line "what changed this week" note.

Keep it concise, factual, and free of hallucinations. If data is missing, say so.

JSON:
{portfolio_json}

Format your response as JSON with keys: summary, key_findings (array of 3 priority actions), top_risks (array with 1 item - the "what changed" note), opportunities (array, can be empty)."""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a Customer Success leader preparing executive insights. Be concise and factual."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=600
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
            # Build comprehensive account JSON
            account_data = {
                "name": account.name,
                "segment": account.segment.value if account.segment else "Unknown",
                "region": account.region,
                "arr": float(account.arr) if account.arr else 0.0,
                "health_score": float(account.health_score) if account.health_score else 0.0,
                "health_bucket": account.health_bucket.value if account.health_bucket else "Unknown",
                "risk_factors": risk_factors or [],
            }
            
            if latest_metrics:
                account_data["metrics"] = {
                    "logins": latest_metrics.logins,
                    "events": latest_metrics.events,
                    "feature_x_events": latest_metrics.feature_x_events,
                    "avg_session_min": latest_metrics.avg_session_min,
                    "errors": latest_metrics.errors,
                    "ticket_backlog": latest_metrics.ticket_backlog
                }
            
            # Get available playbooks
            available_playbooks = playbooks.PLAYBOOKS_LIBRARY
            playbooks_list = "\n".join([f"- {p['title']}: {p['description']}" for p in available_playbooks])
            
            account_json = json.dumps(account_data, indent=2, default=str)
            
            prompt = f"""You are a CSM preparing an account review. Given this account JSON with health score, top factors, tickets, NPS, and ARR, produce:
- 3 bullet insights (facts, not guesses).
- 3 recommended plays from the provided playbook list.
- A 1-sentence executive note.

Keep it concise and factual. If data is missing, say so.

Account JSON:
{account_json}

Available Playbooks:
{playbooks_list}

Format your response as JSON with keys: summary (executive note), health_analysis (array of 3 factual insights), recommended_actions (array of 3 objects with title=playbook name, description=why this playbook, priority=High/Medium/Low, estimated_impact=brief impact)."""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a CSM preparing an account review. Be concise and fact-based."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=800
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
