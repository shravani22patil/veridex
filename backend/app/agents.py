from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.agent_models import Agent
from app.models import User
from pydantic import BaseModel


router = APIRouter()


class AgentCreate(BaseModel):
    name: str
    description: str | None = None


class AgentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    owner_id: int
    is_active: bool

    model_config = {"from_attributes": True}


@router.post("/", response_model=AgentResponse)
def create_agent(
    agent_in: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent = Agent(
        name=agent_in.name,
        description=agent_in.description,
        owner_id=current_user.id,
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)

    return agent


@router.get("/", response_model=list[AgentResponse])
def list_agents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Agent)
        .filter(Agent.owner_id == current_user.id)
        .all()
    )