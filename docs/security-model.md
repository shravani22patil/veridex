# Veridex Security Model

Veridex uses multiple security layers before a tool request can execute.

## 1. Authentication

JWT authentication protects the API.

## 2. Authorization

The backend validates that the authenticated user is authorized to access the requested agent.

## 3. Tool Permission

The agent must have permission to use the requested tool.

## 4. Deterministic Detection

Known suspicious patterns can be detected before semantic analysis.

## 5. Sensitive Data Detection

Requests involving potentially sensitive information can be classified as security-sensitive.

## 6. LLM-Assisted Analysis

Ollama can provide semantic analysis for requests that require additional context.

## 7. Policy Enforcement

The configured policy produces:

```text
ALLOW
ASK
BLOCK
```

## 8. Human Approval

`ASK` requests enter a human approval workflow.

## 9. Audit Logging

Security decisions and execution information are recorded for traceability.

## Security Principle

The LLM is not treated as the final authority.

The system combines deterministic checks, semantic analysis, permissions, policies, human approval, and audit logging.

## Limitations

The current implementation is an MVP and cannot guarantee detection of every attack. Production use would require additional threat modeling, adversarial testing, infrastructure hardening, secret management, and monitoring.
