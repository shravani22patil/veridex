from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.agent_models import Agent
from app.audit_models import AuditLog
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User


router = APIRouter()


@router.get("/")
def list_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(AuditLog)
        .join(Agent, Agent.id == AuditLog.agent_id)
        .filter(Agent.owner_id == current_user.id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    return logs