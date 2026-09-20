const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

async function apiRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail =
      typeof error.detail === "string"
        ? error.detail
        : "Request failed";
    throw new Error(detail);
  }

  return response.json();
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  console.log("Veridex login request:", {
    url: `${API_URL}/auth/login`,
    email,
  });

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    console.log("Veridex login response:", response.status);

    const data = await response.json();

    console.log("Veridex login response body:", data);

    if (!response.ok) {
      const detail =
        typeof data.detail === "string"
          ? data.detail
          : `Login failed with status ${response.status}`;

      throw new Error(detail);
    }

    return data;
  } catch (error) {
    console.error("Veridex login error:", error);
    throw error;
  }
}

/* ---------------- Agents ---------------- */

export async function getAgents(token: string) {
  return apiRequest("/agents/", token);
}

export async function createAgent(
  token: string,
  name: string,
  description: string
) {
  return apiRequest("/agents/", token, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
    }),
  });
}

/* ---------------- Tools ---------------- */

export async function getTools(token: string) {
  return apiRequest("/tools/", token);
}

export async function createTool(
  token: string,
  name: string,
  description: string,
  riskLevel: string
) {
  return apiRequest("/tools/", token, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      risk_level: riskLevel,
    }),
  });
}

/* ---------------- Permissions ---------------- */

export async function getPermissions(token: string) {
  return apiRequest("/permissions/", token);
}

export async function setPermission(
  token: string,
  agentId: number,
  toolId: number,
  isAllowed: boolean
) {
  return apiRequest("/permissions/", token, {
    method: "POST",
    body: JSON.stringify({
      agent_id: agentId,
      tool_id: toolId,
      is_allowed: isAllowed,
    }),
  });
}

/* ---------------- Policies ---------------- */

export async function getPolicies(token: string) {
  return apiRequest("/policies/", token);
}

export async function setPolicy(
  token: string,
  agentId: number,
  toolId: number,
  decision: "ALLOW" | "ASK" | "BLOCK"
) {
  return apiRequest("/policies/", token, {
    method: "POST",
    body: JSON.stringify({
      agent_id: agentId,
      tool_id: toolId,
      decision,
    }),
  });
}

/* ---------------- Approvals ---------------- */

export async function getApprovals(token: string) {
  return apiRequest("/approvals/", token);
}

/* ---------------- Audit ---------------- */

export async function getAuditLogs(token: string) {
  return apiRequest("/audit-logs/", token);
}

/* ---------------- Approval Actions ---------------- */

export async function decideApproval(
  token: string,
  approvalId: number,
  decision: "APPROVE" | "REJECT"
) {
  return apiRequest(`/approvals/${approvalId}/decision`, token, {
    method: "POST",
    body: JSON.stringify({
      status:
        decision === "APPROVE"
          ? "APPROVED"
          : "REJECTED",
    }),
  });
}

/* ---------------- Security Lab ---------------- */

export async function inspectFirewallRequest(
  token: string,
  request: {
    agent_id: number;
    tool_name: string;
    action: string;
    input: Record<string, unknown>;
  }
) {
  return apiRequest("/firewall/check", token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
