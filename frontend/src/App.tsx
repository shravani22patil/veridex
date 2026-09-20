import { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Policies from "./pages/Policies";
import Approvals from "./pages/Approvals";
import SecurityLab from "./pages/SecurityLab";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

import {
  getAgents,
  getTools,
  getPermissions,
  getPolicies,
  getApprovals,
  getAuditLogs,
} from "./api";

type Page =
  | "dashboard"
  | "agents"
  | "policies"
  | "approvals"
  | "security"
  | "audit"
  | "analytics"
  | "settings";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("veridex_token")
  );

  const [activePage, setActivePage] =
    useState<Page>("dashboard");

  const [agents, setAgents] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  async function loadData(currentToken: string) {
    try {
      setLoading(true);

      const [
        agentsData,
        toolsData,
        permissionsData,
        policiesData,
        approvalsData,
        auditData,
      ] = await Promise.all([
        getAgents(currentToken),
        getTools(currentToken),
        getPermissions(currentToken),
        getPolicies(currentToken),
        getApprovals(currentToken),
        getAuditLogs(currentToken),
      ]);

      setAgents(agentsData || []);
      setTools(toolsData || []);
      setPermissions(permissionsData || []);
      setPolicies(policiesData || []);
      setApprovals(approvalsData || []);
      setAuditLogs(auditData || []);
    } catch (error) {
      console.error("Failed to load Veridex data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadData(token);
    }
  }, [token]);

  function handleLogin(newToken: string) {
    localStorage.setItem("veridex_token", newToken);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem("veridex_token");
    setToken(null);
    setActivePage("dashboard");
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "PENDING"
  ).length;

  return (
    <div className="min-h-screen bg-[#080b12] text-gray-100">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        approvalCount={pendingApprovals}
      />

      <main className="ml-64 min-h-screen">
        {/* Top Header */}
        <header className="flex h-[88px] items-center justify-between border-b border-white/10 bg-[#080b12] px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-100">
              Security Overview
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor and control your AI agents in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Firewall Status */}
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3.5 py-2 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Firewall Active
            </div>

            {/* User Profile */}
            <button
              onClick={() => setActivePage("settings")}
              title="Open settings"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm font-medium text-gray-300 transition hover:border-blue-400/30 hover:bg-white/[0.06] hover:text-white"
            >
              <span className="hidden">
                <UserCircle2 className="h-5 w-5" />
              </span>
              SP
            </button>
          </div>
        </header>

        {/* Loading indicator */}
        {loading && (
          <div className="fixed right-6 top-24 z-50 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-300 shadow-lg">
            Refreshing...
          </div>
        )}

        {/* Dashboard */}
        {activePage === "dashboard" && (
          <Dashboard
            agents={agents}
            approvals={approvals}
            auditLogs={auditLogs}
          />
        )}

        {/* Agents */}
        {activePage === "agents" && (
          <Agents
            token={token}
            agents={agents}
            onAgentsChanged={() => loadData(token)}
          />
        )}

        {/* Policies */}
        {activePage === "policies" && (
          <Policies
            token={token}
            agents={agents}
            tools={tools}
            permissions={permissions}
            policies={policies}
            onChanged={() => loadData(token)}
          />
        )}

        {/* Approvals */}
        {activePage === "approvals" && (
          <Approvals
            token={token}
            agents={agents}
            approvals={approvals}
            onChanged={() => loadData(token)}
          />
        )}

        {/* Security Lab */}
        {activePage === "security" && (
          <SecurityLab
            token={token}
            agents={agents}
            tools={tools}
            onRequestComplete={() => loadData(token)}
          />
        )}

        {/* Audit Log */}
        {activePage === "audit" && (
          <div className="page-content">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold">
                  Audit Log
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Firewall activity and security decisions.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1019]">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No audit records yet.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="grid grid-cols-6 gap-4 p-4 text-sm"
                      >
                        <div className="text-gray-500">
                          #{log.id}
                        </div>

                        <div>{log.tool_name}</div>

                        <div className="text-gray-400">
                          {log.action}
                        </div>

                        <div>{log.decision}</div>

                        <div className="text-gray-400">
                          {log.risk_level || "none"}
                        </div>

                        <div className="text-gray-400">
                          {log.risk_score ?? 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activePage === "analytics" && (
          <Analytics auditLogs={auditLogs} />
        )}

        {/* Settings */}
        {activePage === "settings" && (
          <Settings onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}

export default App;
