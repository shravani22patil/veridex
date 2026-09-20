# Veridex Deployment Guide

## Deployment Architecture

The current Docker deployment uses:

- React + Vite frontend served by Nginx
- FastAPI backend
- PostgreSQL 16
- Ollama running on the Windows host

```text
Browser
   |
   v
Frontend Container (Nginx)
   |
   v
Backend Container (FastAPI)
   |
   +----> PostgreSQL Container
   |
   +----> Ollama on Windows Host
```

## Prerequisites

Install and verify:

```powershell
docker --version
docker compose version
ollama --version
```

The required model is:

```text
llama3.2:3b
```

Verify:

```powershell
ollama list
```

## Environment File

Copy `.env.example` to `.env`.

Do not commit `.env`.

The Docker backend uses:

```text
postgres:5432
```

because `postgres` is the Docker Compose service name.

The browser uses:

```text
http://localhost:8000
```

to reach the backend published on the host.

The backend container reaches Ollama through:

```text
http://host.docker.internal:11434
```

## Build

From the Veridex root:

```powershell
docker compose build
```

## Start

```powershell
docker compose up -d
```

## Check Containers

```powershell
docker compose ps
```

Expected services:

```text
veridex-postgres
veridex-backend
veridex-frontend
```

## Logs

All logs:

```powershell
docker compose logs
```

Backend:

```powershell
docker compose logs -f backend
```

Frontend:

```powershell
docker compose logs -f frontend
```

PostgreSQL:

```powershell
docker compose logs -f postgres
```

## URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

## Stop

```powershell
docker compose down
```

## Stop and Remove Database Volume

Only use this if you intentionally want to delete the Docker database data:

```powershell
docker compose down -v
```

## Troubleshooting

### Backend cannot connect to PostgreSQL

Inside Docker, do not use:

```text
localhost:5433
```

Use:

```text
postgres:5432
```

### Backend cannot connect to Ollama

Verify Ollama is running on Windows:

```powershell
ollama list
```

The Docker backend should use:

```text
http://host.docker.internal:11434
```

### Frontend cannot reach backend

The Vite build variable must point to the browser-accessible backend:

```text
VITE_API_URL=http://localhost:8000
```

Rebuild after changing it:

```powershell
docker compose build frontend
docker compose up -d frontend
```

### Rebuild everything

```powershell
docker compose down
docker compose build --no-cache
docker compose up -d
```
