from sqlalchemy.orm import Session

from app.agent_models import Agent
from app.permission_models import AgentToolPermission
from app.policy_models import AgentToolPolicy
from app.risk_engine import calculate_final_risk_score
from app.security_engine import analyze_request
from app.tool_models import Tool


def evaluate_request(
    agent_id: int,
    tool_name: str,
    action: str,
    input_data: dict,
    db: Session,
) -> dict:
    agent = (
        db.query(Agent)
        .filter(
            Agent.id == agent_id,
            Agent.is_active == True,
        )
        .first()
    )

    if agent is None:
        return {
            "decision": "BLOCK",
            "reason": "Agent not found or inactive.",
        }

    tool = (
        db.query(Tool)
        .filter(
            Tool.name == tool_name,
            Tool.is_active == True,
        )
        .first()
    )

    if tool is None:
        return {
            "decision": "BLOCK",
            "reason": "Tool not found or inactive.",
        }

    risk_level = tool.risk_level

    tool_risk_score = {
    "low": 10,
    "medium": 40,
    "high": 70,
    "critical": 90,
}.get(risk_level.lower(), 50)

    permission = (
        db.query(AgentToolPermission)
        .filter(
            AgentToolPermission.agent_id == agent_id,
            AgentToolPermission.tool_id == tool.id,
        )
        .first()
    )

    if permission is None or not permission.is_allowed:
        return {
            "decision": "BLOCK",
            "reason": "Agent does not have permission to use this tool.",
            "risk_level": risk_level,
            "risk_score": risk_score,
        }

    security_result = analyze_request(
    tool_name=tool_name,
    action=action,
    input_data=input_data,
)

    risk_score = calculate_final_risk_score(
    tool_risk_score,
    security_result["severity"],
)

    if security_result["is_suspicious"]:
        return {
            "decision": "BLOCK",
            "reason": "Security threat detected in request.",
            "risk_level": risk_level,
            "risk_score": risk_score,
            "security": security_result,
        }

    policy = (
        db.query(AgentToolPolicy)
        .filter(
            AgentToolPolicy.agent_id == agent_id,
            AgentToolPolicy.tool_id == tool.id,
            AgentToolPolicy.is_active == True,
        )
        .first()
    )

    if policy is not None:
        return {
            "decision": policy.decision,
            "reason": f"Policy decision: {policy.decision}.",
            "risk_level": risk_level,
            "risk_score": risk_score,
            "security": security_result,
        }

    return {
        "decision": "ALLOW",
        "reason": "Agent has permission to use this tool and no policy overrides it.",
        "risk_level": risk_level,
        "risk_score": risk_score,
        "security": security_result,
    }