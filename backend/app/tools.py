from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.tool_models import Tool


router = APIRouter()


class ToolCreate(BaseModel):
    name: str
    description: str | None = None
    risk_level: str = "medium"


class ToolResponse(BaseModel):
    id: int
    name: str
    description: str | None
    risk_level: str
    is_active: bool

    model_config = {"from_attributes": True}


@router.post("/", response_model=ToolResponse)
def create_tool(
    tool_in: ToolCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tool = Tool(
        name=tool_in.name,
        description=tool_in.description,
        risk_level=tool_in.risk_level,
    )

    db.add(tool)
    db.commit()
    db.refresh(tool)

    return tool


@router.get("/", response_model=list[ToolResponse])
def list_tools(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Tool).filter(Tool.is_active == True).all()