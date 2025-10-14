from typing import List
import json
from . import models
from . import schemas

# Predefined playbooks library
PLAYBOOKS_LIBRARY = [
    {
        "id": 1,
        "title": "Executive Business Review (EBR)",
        "description": "Conduct strategic review with executive stakeholders to align on goals and value realization",
        "category": "Engagement",
        "priority": "High",
        "estimated_effort": "4-6 hours preparation + 1-2 hour meeting",
        "risk_factors": ["Low user engagement", "Critical health score", "Below target health score"],
        "steps": [
            "Review account history and key metrics",
            "Identify business outcomes and KPIs",
            "Prepare presentation with ROI analysis",
            "Schedule meeting with key stakeholders",
            "Conduct review and document action items",
            "Follow up within 48 hours"
        ]
    },
    {
        "id": 2,
        "title": "Feature Adoption Campaign",
        "description": "Targeted campaign to increase adoption of underutilized features",
        "category": "Adoption",
        "priority": "High",
        "estimated_effort": "2-3 weeks",
        "risk_factors": ["Low feature adoption", "Low user engagement"],
        "steps": [
            "Identify low-adoption features with high value",
            "Create feature adoption matrix",
            "Develop training materials and guides",
            "Send personalized email campaign",
            "Host feature spotlight webinar",
            "Track adoption metrics weekly",
            "Follow up with non-adopters"
        ]
    },
    {
        "id": 3,
        "title": "Technical Health Check",
        "description": "Comprehensive technical review to resolve issues and optimize configuration",
        "category": "Support",
        "priority": "High",
        "estimated_effort": "1-2 weeks",
        "risk_factors": ["High support ticket volume", "Critical health score"],
        "steps": [
            "Review all open support tickets",
            "Schedule technical review call",
            "Audit account configuration",
            "Identify technical debt and issues",
            "Create remediation plan",
            "Implement fixes and optimizations",
            "Provide technical documentation"
        ]
    },
    {
        "id": 4,
        "title": "User Training & Enablement",
        "description": "Comprehensive training program to improve user proficiency",
        "category": "Adoption",
        "priority": "Medium",
        "estimated_effort": "3-4 weeks",
        "risk_factors": ["Low feature adoption", "High support ticket volume", "Infrequent logins"],
        "steps": [
            "Assess current user skill levels",
            "Create customized training curriculum",
            "Schedule training sessions",
            "Conduct hands-on workshops",
            "Provide learning resources",
            "Measure knowledge retention",
            "Offer ongoing support channel"
        ]
    },
    {
        "id": 5,
        "title": "Quarterly Success Planning",
        "description": "Collaborative planning session to set goals and define success metrics",
        "category": "Engagement",
        "priority": "Medium",
        "estimated_effort": "2-3 hours",
        "risk_factors": ["Below target health score", "Low user engagement"],
        "steps": [
            "Review previous quarter results",
            "Gather customer objectives",
            "Define success criteria and KPIs",
            "Create joint success plan",
            "Set quarterly milestones",
            "Schedule check-in cadence",
            "Document and share plan"
        ]
    },
    {
        "id": 6,
        "title": "Champion User Program",
        "description": "Identify and empower internal champions to drive adoption",
        "category": "Engagement",
        "priority": "Medium",
        "estimated_effort": "Ongoing",
        "risk_factors": ["Low user engagement", "Infrequent logins"],
        "steps": [
            "Identify potential champions",
            "Conduct champion interviews",
            "Provide advanced training",
            "Create champion toolkit",
            "Establish champion network",
            "Regular champion check-ins",
            "Recognize and reward champions"
        ]
    },
    {
        "id": 7,
        "title": "NPS Recovery Plan",
        "description": "Systematic approach to address negative feedback and improve satisfaction",
        "category": "Support",
        "priority": "High",
        "estimated_effort": "2-4 weeks",
        "risk_factors": ["Negative NPS score", "Critical health score"],
        "steps": [
            "Review NPS feedback in detail",
            "Reach out to detractors personally",
            "Identify root causes",
            "Create action plan for each issue",
            "Implement improvements",
            "Follow up with customers",
            "Re-survey after improvements"
        ]
    },
    {
        "id": 8,
        "title": "Integration Optimization",
        "description": "Review and optimize integrations to improve workflow efficiency",
        "category": "Adoption",
        "priority": "Medium",
        "estimated_effort": "1-2 weeks",
        "risk_factors": ["Low feature adoption", "Below target health score"],
        "steps": [
            "Audit current integrations",
            "Identify integration gaps",
            "Recommend beneficial integrations",
            "Configure new integrations",
            "Test integration workflows",
            "Train users on integrations",
            "Monitor integration usage"
        ]
    },
    {
        "id": 9,
        "title": "Renewal Risk Mitigation",
        "description": "Intensive program for at-risk renewals to address concerns and demonstrate value",
        "category": "Engagement",
        "priority": "High",
        "estimated_effort": "4-6 weeks",
        "risk_factors": ["Critical health score", "Negative NPS score", "Low user engagement"],
        "steps": [
            "Conduct stakeholder interviews",
            "Document all concerns",
            "Create value realization report",
            "Develop recovery roadmap",
            "Weekly executive updates",
            "Implement quick wins",
            "Present renewal business case"
        ]
    },
    {
        "id": 10,
        "title": "Data Quality Improvement",
        "description": "Improve data quality and hygiene to increase platform value",
        "category": "Adoption",
        "priority": "Low",
        "estimated_effort": "2-3 weeks",
        "risk_factors": ["Low feature adoption", "Below target health score"],
        "steps": [
            "Audit data quality issues",
            "Create data cleanup plan",
            "Provide data import templates",
            "Conduct data hygiene training",
            "Implement data validation rules",
            "Monitor data quality metrics",
            "Establish ongoing data governance"
        ]
    }
]


def get_all_playbooks() -> List[schemas.Playbook]:
    """Get all available playbooks"""
    return [
        schemas.Playbook(
            id=p["id"],
            title=p["title"],
            description=p["description"],
            category=p["category"],
            priority=p["priority"],
            estimated_effort=p["estimated_effort"],
            risk_factors=p["risk_factors"],
            steps=p["steps"],
            created_at=None  # type: ignore
        )
        for p in PLAYBOOKS_LIBRARY
    ]


def recommend_playbooks(risk_factors: List[str], top_n: int = 5) -> List[schemas.PlaybookRecommendation]:
    """Recommend playbooks based on risk factors"""
    recommendations = []
    
    for playbook_data in PLAYBOOKS_LIBRARY:
        # Calculate relevance score
        matching_factors = [
            rf for rf in risk_factors
            if any(prf.lower() in rf.lower() for prf in playbook_data["risk_factors"])
        ]
        
        if matching_factors:
            relevance_score = len(matching_factors) / len(risk_factors) if risk_factors else 0
            
            # Boost score based on priority
            priority_boost = {"High": 0.2, "Medium": 0.1, "Low": 0.0}
            relevance_score += priority_boost.get(playbook_data["priority"], 0)
            
            playbook = schemas.Playbook(
                id=playbook_data["id"],
                title=playbook_data["title"],
                description=playbook_data["description"],
                category=playbook_data["category"],
                priority=playbook_data["priority"],
                estimated_effort=playbook_data["estimated_effort"],
                risk_factors=playbook_data["risk_factors"],
                steps=playbook_data["steps"],
                created_at=None  # type: ignore
            )
            
            recommendations.append(
                schemas.PlaybookRecommendation(
                    playbook=playbook,
                    relevance_score=round(min(1.0, relevance_score), 2),
                    matching_risk_factors=matching_factors
                )
            )
    
    # Sort by relevance score
    recommendations.sort(key=lambda x: x.relevance_score, reverse=True)
    
    return recommendations[:top_n]
