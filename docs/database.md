# Veridex Database

Veridex uses PostgreSQL with SQLAlchemy.

## Local Docker Configuration

```text
Database: veridex
User: veridex_user
Host Port: 5433
Container Port: 5432
```

## Main Entities

```text
Users
Agents
Tools
Permissions
Policies
Approval Requests
Audit Logs
```

## User

Stores application users and authentication information.

Passwords are stored as password hashes.

## Agent

Represents an AI agent protected by Veridex.

Example:

```text
Travel Agent
```

## Tool

Represents an available tool.

Example:

```text
web_search
```

## Permission

Controls whether an agent is allowed to use a tool.

## Policy

Controls runtime behavior for an agent/tool relationship:

```text
ALLOW
ASK
BLOCK
```

## Approval Request

Stores requests requiring human review, including the original input, reason, risk information, status, and timestamps.

## Audit Log

Stores runtime security activity including agent, tool, action, decision, reason, risk information, and timestamp.
