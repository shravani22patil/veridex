import re
from typing import Any


SENSITIVE_PATTERNS = [
    (r"(?i)api[_-]?key['\"]?\s*[:=]\s*['\"]?\S+", "API key"),
    (r"(?i)password['\"]?\s*[:=]\s*['\"]?\S+", "password"),
    (r"(?i)access[_-]?token['\"]?\s*[:=]\s*['\"]?\S+", "access token"),
    (r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", "private key"),
]


def detect_sensitive_data(input_data: dict[str, Any]) -> dict:
    text = str(input_data)

    for pattern, data_type in SENSITIVE_PATTERNS:
        if re.search(pattern, text):
            return {
                "detected": True,
                "type": "sensitive_data",
                "severity": "high",
                "data_type": data_type,
                "reason": f"The request appears to contain a {data_type}.",
            }

    return {
        "detected": False,
        "type": "sensitive_data",
        "severity": "none",
        "data_type": None,
        "reason": "No known sensitive data pattern detected.",
    }