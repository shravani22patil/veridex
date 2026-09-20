from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth import router
from app.agents import router as agents_router
from app.tools import router as tools_router
from app.permissions import router as permissions_router
from app.firewall import router as firewall_router
from app.policies import router as policies_router
from app.audit import router as audit_router
from app.approvals import router as approvals_router

app = FastAPI(title="Veridex")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/auth", tags=["Authentication"])
app.include_router(agents_router,prefix="/agents",tags=["Agents"],)
app.include_router(tools_router,prefix="/tools",tags=["Tools"],)
app.include_router(permissions_router,prefix="/permissions",tags=["Permissions"],)
app.include_router(firewall_router,prefix="/firewall",tags=["Firewall"],)
app.include_router(policies_router,prefix="/policies",tags=["Policies"],)
app.include_router(audit_router,prefix="/audit-logs",tags=["Audit Logs"],)
app.include_router(approvals_router,prefix="/approvals",tags=["Approvals"],)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "veridex",
    }