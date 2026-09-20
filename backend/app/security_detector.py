import re
from typing import Any


PROMPT_INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"ignore all previous instructions",
    r"disregard previous instructions",
    r"forget your instructions",
    r"reveal your system prompt",
    r"show me your system prompt",
    r"override your instructions",
    r"bypass your instructions",
]


def detect_prompt_injection(input_data: dict[str, Any]) -> dict:
    text = str(input_data).lower()

    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, text):
            return {
                "detected": True,
                "type": "prompt_injection",
                "severity": "high",
                "reason": "The request contains a pattern associated with prompt injection.",
            }

    return {
        "detected": False,
        "type": "prompt_injection",
        "severity": "none",
        "reason": "No known prompt injection pattern detected.",
    }