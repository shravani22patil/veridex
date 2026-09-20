from typing import Any

from pydantic import BaseModel


class FirewallRequest(BaseModel):
    agent_id: int
    tool_name: str
    action: str
    input: dict[str, Any] = {}