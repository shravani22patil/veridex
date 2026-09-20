from typing import Any

from app.llm_security import analyze_with_llm
from app.security_detector import detect_prompt_injection
from app.sensitive_data_detector import detect_sensitive_data


def analyze_request(
    tool_name: str,
    action: str,
    input_data: dict[str, Any],
) -> dict:
    prompt_injection = detect_prompt_injection(input_data)
    sensitive_data = detect_sensitive_data(input_data)

    findings = []

    if prompt_injection["detected"]:
        findings.append(prompt_injection)

    if sensitive_data["detected"]:
        findings.append(sensitive_data)

    # Deterministic security checks take priority.
    if findings:
        severity_order = {
            "low": 1,
            "medium": 2,
            "high": 3,
            "critical": 4,
        }

        highest_severity = max(
            findings,
            key=lambda finding: severity_order[finding["severity"]],
        )["severity"]

        return {
            "is_suspicious": True,
            "severity": highest_severity,
            "findings": findings,
            "llm_analysis": None,
        }

    # Use the local LLM for semantic analysis.
    try:
        llm_result = analyze_with_llm(
            tool_name=tool_name,
            action=action,
            input_data=input_data,
        )

        if llm_result["is_suspicious"]:
            findings.append(
                {
                    "detected": True,
                    "type": "llm_security_analysis",
                    "severity": llm_result["severity"],
                    "reason": llm_result["reason"],
                }
            )

        return {
            "is_suspicious": llm_result["is_suspicious"],
            "severity": llm_result["severity"],
            "findings": findings,
            "llm_analysis": llm_result,
        }

    except Exception:
        return {
            "is_suspicious": False,
            "severity": "none",
            "findings": [],
            "llm_analysis": {
                "available": False,
                "reason": "LLM security analysis unavailable.",
            },
        }