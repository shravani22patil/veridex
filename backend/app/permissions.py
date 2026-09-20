from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.agent_models import Agent
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.permission_models import AgentToolPermission
from app.tool_models import Tool


router = APIRouter()


class PermissionCreate(BaseModel):
    agent_id: int
    tool_id: int
    is_allowed: bool = True


class PermissionResponse(BaseModel):
    id: int
    agent_id: int
    tool_id: int
    is_allowed: bool

    model_config = {"from_attributes": True}


@router.post("/", response_model=PermissionResponse)
def create_permission(
    permission_in: PermissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent = (
        db.query(Agent)
        .filter(
            Agent.id == permission_in.agent_id,
            Agent.owner_id == current_user.id,
        )
        .first()
    )

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found.",
        )

    tool = (
        db.query(Tool)
        .filter(
            Tool.id == permission_in.tool_id,
            Tool.is_active == True,
        )
        .first()
    )

    if tool is None:
        raise HTTPException(
            status_code=404,
            detail="Tool not found.",
        )

    existing_permission = (
        db.query(AgentToolPermission)
        .filter(
            AgentToolPermission.agent_id == permission_in.agent_id,
            AgentToolPermission.tool_id == permission_in.tool_id,
        )
        .first()
    )

    if existing_permission:
        existing_permission.is_allowed = permission_in.is_allowed
        db.commit()
        db.refresh(existing_permission)
        return existing_permission

    permission = AgentToolPermission(
        agent_id=permission_in.agent_id,
        tool_id=permission_in.tool_id,
        is_allowed=permission_in.is_allowed,
    )

    db.add(permission)
    db.commit()
    db.refresh(permission)

    return permission


@router.get("/", response_model=list[PermissionResponse])
def list_permissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(AgentToolPermission)
        .join(Agent, Agent.id == AgentToolPermission.agent_id)
        .filter(Agent.owner_id == current_user.id)
        .all()
    )