# Veridex API

The backend is implemented with FastAPI.

## API Documentation

Swagger:

```text
http://127.0.0.1:8000/docs
```

OpenAPI:

```text
http://127.0.0.1:8000/openapi.json
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

## Authentication

```text
POST /auth/register
POST /auth/login
```

Protected requests use:

```text
Authorization: Bearer <JWT>
```

## Agents

```text
GET  /agents/
POST /agents/
```

## Tools

```text
GET /tools/
POST /tools/
```

## Permissions

```text
GET  /permissions/
POST /permissions/
```

## Policies

```text
GET  /policies/
POST /policies/
```

Supported policy decisions:

```text
ALLOW
ASK
BLOCK
```

## Firewall

```text
POST /firewall/check
```

Example:

```json
{
  "agent_id": 1,
  "tool_name": "web_search",
  "action": "search",
  "input": {
    "query": "Find hotels in Pune"
  }
}
```

## Approvals

```text
GET /approvals/
POST /approvals/{approval_id}/decision
```

Approval decisions use:

```json
{
  "status": "APPROVED"
}
```

or:

```json
{
  "status": "REJECTED"
}
```

## Audit Logs

```text
GET /audit-logs/
```
