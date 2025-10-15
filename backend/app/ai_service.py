
import os
from typing import List, Optional
from datetime import datetime
import json
import logging

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
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # Default to gpt-4o-mini
        self.client = None
        
        # Setup logging first
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("AIInsightsService")
        
        # Try to initialize OpenAI client with error handling
        if OPENAI_AVAILABLE and self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)  # type: ignore
                self.logger.info(f"OpenAI client initialized with model: {self.model}")
            except Exception as e:
                self.logger.warning(f"Failed to initialize OpenAI client: {e}. Using mock insights.")
                self.client = None
        else:
            if not OPENAI_AVAILABLE:
                self.logger.info("OpenAI library not available. Using mock insights.")
            elif not self.api_key:
                self.logger.info("OPENAI_API_KEY not set. Using mock insights.")
    
    def _extract_json_from_response(self, content: str) -> dict:
        """Extract JSON from OpenAI response, handling markdown code blocks"""
        if not content:
            raise ValueError("Empty content")
        
        # Try parsing as-is first
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass
        
        # Try extracting from markdown code block
        # Common patterns: ```json\n{...}\n``` or ```{...}```
        import re
        
        # Pattern 1: ```json ... ```
        json_block_pattern = r'```(?:json)?\s*\n?(.*?)\n?```'
        match = re.search(json_block_pattern, content, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
            self.logger.debug(f"Extracted JSON from markdown block: {json_str[:100]}...")
            return json.loads(json_str)
        
        # Pattern 2: Just grab content between first { and last }
        first_brace = content.find('{')
        last_brace = content.rfind('}')
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            json_str = content[first_brace:last_brace + 1]
            self.logger.debug(f"Extracted JSON by finding braces: {json_str[:100]}...")
            return json.loads(json_str)
        
        raise ValueError("Could not extract valid JSON from response")
    
    def _generate_mock_portfolio_insight(self, portfolio_data: dict) -> schemas.PortfolioInsight:
        """Generate mock portfolio insight when AI is not available"""
        total_arr = portfolio_data.get("total_arr", 0)
        risk_breakdown = portfolio_data.get("risk_breakdown", {})
        
        # Map health bucket names correctly (Green/Amber/Red)
        green_pct = risk_breakdown.get('Green', 0)
        amber_pct = risk_breakdown.get('Amber', 0)
        red_pct = risk_breakdown.get('Red', 0)
        
        return schemas.PortfolioInsight(
            summary=f"Portfolio of {portfolio_data.get('total_accounts', 0)} accounts with total ARR of ${total_arr:,.2f}. "
                   f"Health distribution: {green_pct}% Green (Healthy), "
                   f"{amber_pct}% Amber (At-Risk), {red_pct}% Red (Critical).",
            key_findings=[
                f"Total ARR: ${total_arr:,.2f}",
                f"Average health score: {portfolio_data.get('avg_health_score', 0):.1f}",
                f"{red_pct}% of accounts in critical (Red) state"
            ],
            top_risks=[
                "Red accounts need immediate attention",
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
        arr = account.arr or 0.0
        
        # Create structured health analysis as array
        health_insights = [
            f"Health score of {health_score:.1f} indicates {bucket_str} status",
            f"ARR: ${arr:,.2f} ({account.segment.value if account.segment else 'Unknown'} segment)",
            f"Key concerns: {', '.join(risk_factors) if risk_factors else 'None identified'}"
        ]
        
        return schemas.AccountInsight(
            account_id=account.id or 0,
            account_name=account.name,
            summary=f"{account.name} ({account.segment.value if account.segment else 'Unknown'}) is in {bucket_str} state with "
                   f"a health score of {health_score:.1f}. ARR: ${arr:,.2f}.",
            health_analysis=health_insights,
            risk_factors=risk_factors,
            recommended_actions=actions[:3],
            generated_at=datetime.utcnow()
        )
    
    async def generate_portfolio_insight(self, portfolio_data: dict) -> schemas.PortfolioInsight:
        """Generate AI-powered portfolio insights"""
        if not self.client:
            self.logger.info("Using mock portfolio insight (no OpenAI client available)")
            return self._generate_mock_portfolio_insight(portfolio_data)
        try:
            # Convert portfolio data to clean JSON
            portfolio_json = json.dumps(portfolio_data, indent=2, default=str)
            prompt = f"""You are a Customer Success leader. Using the JSON portfolio snapshot, write:
1) A 120–160 word executive summary for the VP CS.
2) 3 priority actions for the next 30 days.
3) A one-line \"what changed this week\" note.

Keep it concise, factual, and free of hallucinations. If data is missing, say so.

JSON:
{portfolio_json}

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or explanatory text. Use this exact structure:
{{"summary": "string", "key_findings": ["action1", "action2", "action3"], "top_risks": ["what changed note"], "opportunities": []}}"""
            self.logger.info(f"Making OpenAI API request for portfolio insight using model: {self.model}...")
            self.logger.debug(f"Prompt: {prompt}")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a Customer Success leader preparing executive insights. Be concise and factual. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.5,
                max_tokens=600
            )
            content = response.choices[0].message.content
            self.logger.info("Received response from OpenAI API for portfolio insight.")
            self.logger.debug(f"Response content: {content}")
            # Try to parse JSON from response
            if not content:
                self.logger.warning("OpenAI response content was None. Falling back to mock insight.")
                return self._generate_mock_portfolio_insight(portfolio_data)
            try:
                data = self._extract_json_from_response(content)
                self.logger.info("Successfully parsed JSON from OpenAI response.")
            except (json.JSONDecodeError, ValueError) as e:
                self.logger.warning(f"OpenAI response was not valid JSON: {e}. Falling back to mock insight.")
                self.logger.debug(f"Failed content was: {content}")
                return self._generate_mock_portfolio_insight(portfolio_data)
            return schemas.PortfolioInsight(
                summary=data.get("summary", ""),
                key_findings=data.get("key_findings", []),
                top_risks=data.get("top_risks", []),
                opportunities=data.get("opportunities", []),
                generated_at=datetime.utcnow()
            )
        except Exception as e:
            self.logger.error(f"AI generation error: {e}")
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
            self.logger.info("Using mock account insight (no OpenAI client available)")
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

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or explanatory text. Use this exact structure:
{{"summary": "executive note", "health_analysis": ["insight1", "insight2", "insight3"], "recommended_actions": [{{"title": "playbook name", "description": "why", "priority": "High/Medium/Low", "estimated_impact": "impact"}}]}}"""
            self.logger.info(f"Making OpenAI API request for account insight using model: {self.model}...")
            self.logger.debug(f"Prompt: {prompt}")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a CSM preparing an account review. Be concise and fact-based. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.5,
                max_tokens=800
            )
            content = response.choices[0].message.content
            self.logger.info("Received response from OpenAI API for account insight.")
            self.logger.debug(f"Response content: {content}")
            if not content:
                self.logger.warning("OpenAI response content was None. Falling back to mock insight.")
                return self._generate_mock_account_insight(account, risk_factors, latest_metrics)
            try:
                data = self._extract_json_from_response(content)
                self.logger.info("Successfully parsed JSON from OpenAI response.")
            except (json.JSONDecodeError, ValueError) as e:
                self.logger.warning(f"OpenAI response was not valid JSON: {e}. Falling back to mock insight.")
                self.logger.debug(f"Failed content was: {content}")
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
            self.logger.error(f"AI generation error: {e}")
            return self._generate_mock_account_insight(account, risk_factors, latest_metrics)


# Singleton instance
ai_service = AIInsightsService()
