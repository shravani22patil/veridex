SECURITY_SEVERITY_SCORES = {
    "none": 0,
    "low": 20,
    "medium": 40,
    "high": 70,
    "critical": 90,
}


RISK_SCORES = {
    "low": 10,
    "medium": 40,
    "high": 70,
    "critical": 90,
}


def calculate_risk_score(risk_level: str) -> int:
    return RISK_SCORES.get(risk_level.lower(), 50)


def calculate_final_risk_score(
    tool_risk_score: int,
    security_severity: str,
) -> int:
    security_score = SECURITY_SEVERITY_SCORES.get(
        security_severity.lower(),
        0,
    )

    return max(tool_risk_score, security_score)