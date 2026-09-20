from fastapi import APIRouter, Depends , HTTPException
from sqlalchemy.orm import Session
from app.agent_models import Agent

from app.approval_models import ApprovalRequest
from app.audit_models import AuditLog
from app.database import get_db
from app.dependencies import get_current_user
from app.firewall_engine import evaluate_request
from app.firewall_schemas import FirewallRequest
from app.models import User
from app.tool_executor import execute_tool

router = APIRouter()


@router.post("/check")
def check_request(
    request: FirewallRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    
    agent = (
        db.query(Agent)
        .filter(
            Agent.id == request.agent_id,
            Agent.owner_id == current_user.id,
            Agent.is_active == True,
        )
        .first()
    )

    execution_result = None

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found or not owned by current user.",
        )

    result = evaluate_request(
        agent_id=request.agent_id,
        tool_name=request.tool_name,
        action=request.action,
        input_data=request.input,
        db=db,
    )

    audit_log = AuditLog(
        agent_id=request.agent_id,
        tool_name=request.tool_name,
        action=request.action,
        decision=result["decision"],
        reason=result["reason"],
        risk_level=result.get("risk_level"),
        risk_score=result.get("risk_score"),
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    approval_id = None

    if result["decision"] == "ASK":
        approval = ApprovalRequest(
            audit_log_id=audit_log.id,
            agent_id=request.agent_id,
            tool_name=request.tool_name,
            action=request.action,
            input_data=request.input,
            status="PENDING",
            reason=result["reason"],
            risk_level=result.get("risk_level"),
            risk_score=result.get("risk_score"),
        )

        db.add(approval)
        db.commit()
        db.refresh(approval)

        approval_id = approval.id

        execution_result = None

    if result["decision"] == "ALLOW":
     execution_result = execute_tool(
        tool_name=request.tool_name,
        action=request.action,
        input_data=request.input,
    )

    return {
        "agent_id": request.agent_id,
        "tool_name": request.tool_name,
        "action": request.action,
        "decision": result["decision"],
        "reason": result["reason"],
        "risk_level": result.get("risk_level"),
        "risk_score": result.get("risk_score"),
        "security": result.get("security"),
        "audit_log_id": audit_log.id,
        "approval_id": approval_id,
        "execution": execution_result,
    }