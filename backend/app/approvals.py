from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.agent_models import Agent
from app.approval_models import ApprovalRequest
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.tool_executor import execute_tool

router = APIRouter()


class ApprovalDecision(BaseModel):
    status: str


@router.get("/")
def list_approvals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(ApprovalRequest)
        .join(Agent, Agent.id == ApprovalRequest.agent_id)
        .filter(Agent.owner_id == current_user.id)
        .order_by(ApprovalRequest.created_at.desc())
        .all()
    )


@router.post("/{approval_id}/decision")
def decide_approval(
    approval_id: int,
    decision: ApprovalDecision,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if decision.status not in {"APPROVED", "REJECTED"}:
        raise HTTPException(
            status_code=400,
            detail="Status must be APPROVED or REJECTED.",
        )

    approval = (
        db.query(ApprovalRequest)
        .join(Agent, Agent.id == ApprovalRequest.agent_id)
        .filter(
            ApprovalRequest.id == approval_id,
            Agent.owner_id == current_user.id,
        )
        .first()
    )

    if approval is None:
        raise HTTPException(
            status_code=404,
            detail="Approval request not found.",
        )

    if approval.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Approval request has already been resolved.",
        )

    approval.status = decision.status
    approval.resolved_at = datetime.now(timezone.utc)

    execution_result = None

    if decision.status == "APPROVED":
     execution_result = execute_tool(
        tool_name=approval.tool_name,
        action=approval.action,
        input_data=approval.input_data,
    )

    db.commit()
    db.refresh(approval)

    return {
      "id": approval.id,
      "audit_log_id": approval.audit_log_id,
      "agent_id": approval.agent_id,
      "tool_name": approval.tool_name,
      "action": approval.action,
      "status": approval.status,
      "reason": approval.reason,
      "risk_level": approval.risk_level,
      "risk_score": approval.risk_score,
      "created_at": approval.created_at,
      "resolved_at": approval.resolved_at,
      "execution": execution_result,
    }