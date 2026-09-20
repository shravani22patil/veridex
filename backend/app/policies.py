from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.agent_models import Agent
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.policy_models import AgentToolPolicy
from app.tool_models import Tool


router = APIRouter()


class PolicyCreate(BaseModel):
    agent_id: int
    tool_id: int
    decision: str = "ASK"


class PolicyResponse(BaseModel):
    id: int
    agent_id: int
    tool_id: int
    decision: str
    is_active: bool

    model_config = {"from_attributes": True}


@router.post("/", response_model=PolicyResponse)
def create_policy(
    policy_in: PolicyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if policy_in.decision not in {"ALLOW", "ASK", "BLOCK"}:
        raise HTTPException(
            status_code=400,
            detail="Decision must be ALLOW, ASK, or BLOCK.",
        )

    agent = (
        db.query(Agent)
        .filter(
            Agent.id == policy_in.agent_id,
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
            Tool.id == policy_in.tool_id,
            Tool.is_active == True,
        )
        .first()
    )

    if tool is None:
        raise HTTPException(
            status_code=404,
            detail="Tool not found.",
        )

    existing_policy = (
        db.query(AgentToolPolicy)
        .filter(
            AgentToolPolicy.agent_id == policy_in.agent_id,
            AgentToolPolicy.tool_id == policy_in.tool_id,
        )
        .first()
    )

    if existing_policy:
        existing_policy.decision = policy_in.decision
        existing_policy.is_active = True
        db.commit()
        db.refresh(existing_policy)
        return existing_policy

    policy = AgentToolPolicy(
        agent_id=policy_in.agent_id,
        tool_id=policy_in.tool_id,
        decision=policy_in.decision,
    )

    db.add(policy)
    db.commit()
    db.refresh(policy)

    return policy


@router.get("/", response_model=list[PolicyResponse])
def list_policies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(AgentToolPolicy)
        .join(Agent, Agent.id == AgentToolPolicy.agent_id)
        .filter(Agent.owner_id == current_user.id)
        .all()
    )