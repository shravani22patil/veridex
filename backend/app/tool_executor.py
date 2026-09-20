from typing import Any


def execute_tool(
    tool_name: str,
    action: str,
    input_data: dict[str, Any],
) -> dict:
    if tool_name == "web_search":
        query = input_data.get("query", "")

        return {
            "success": True,
            "tool": tool_name,
            "action": action,
            "result": f"Simulated search completed for: {query}",
        }

    return {
        "success": False,
        "tool": tool_name,
        "action": action,
        "error": "Tool execution is not implemented.",
    }