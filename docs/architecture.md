# Veridex Architecture

Veridex places a runtime security and policy enforcement layer between an AI agent and the tools it requests.

```text
AI Agent
   |
   v
Tool Request
   |
   v
Veridex Firewall
   |
   +--> Deterministic Security Checks
   |
   +--> Sensitive Data Detection
   |
   +--> Prompt Injection Detection
   |
   +--> LLM Semantic Analysis
   |
   v
Permission / Policy Evaluation
   |
   +----> ALLOW ----> Execute
   |
   +----> ASK ------> Human Approval ----> Execute / Reject
   |
   +----> BLOCK ----> Reject
   |
   v
Audit Log
   |
   v
PostgreSQL
```

## Frontend

React and TypeScript provide:

- Dashboard
- Agents
- Policies
- Approvals
- Security Lab
- Analytics
- Settings

## Backend

FastAPI coordinates:

- Authentication
- Agent management
- Tool management
- Permissions
- Policies
- Firewall evaluation
- Approvals
- Tool execution
- Audit logging

## LLM Layer

Ollama provides local LLM-assisted semantic security analysis.

The current model is:

```text
llama3.2:3b
```

The LLM is an additional security signal and is not intended to be the sole security authority.
