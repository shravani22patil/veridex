import {
  Activity,
  AlertTriangle,
  Ban,
  Bot,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

interface DashboardProps {
  agents: any[];
  approvals: any[];
  auditLogs: any[];
}

export default function Dashboard({
  agents,
  approvals,
  auditLogs,
}: DashboardProps) {
  const allowed = auditLogs.filter(
    (log) => log.decision === "ALLOW"
  ).length;

  const blocked = auditLogs.filter(
    (log) => log.decision === "BLOCK"
  ).length;

  const pending = approvals.filter(
    (approval) => approval.status === "PENDING"
  ).length;

  return (
    <div className="page-content space-y-6">
      <section className="rounded-2xl border border-blue-400/10 bg-gradient-to-br from-blue-500/10 via-[#101621] to-[#0c1019] p-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-blue-400">
              <ShieldCheck className="h-4 w-4" />
              Runtime Protection
            </div>

            <h2 className="text-2xl font-semibold">
              Your AI agents are under protection.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Veridex inspects tool requests, applies security policies,
              analyzes suspicious behavior, and records every decision.
            </p>
          </div>

          <div className="hidden h-24 w-24 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5 md:flex">
            <ShieldCheck className="h-11 w-11 text-emerald-400" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Requests Inspected"
          value={auditLogs.length}
          icon={Activity}
        />

        <StatCard
          label="Allowed"
          value={allowed}
          icon={CheckCircle2}
        />

        <StatCard
          label="Awaiting Approval"
          value={pending}
          icon={Clock3}
        />

        <StatCard
          label="Blocked"
          value={blocked}
          icon={Ban}
        />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c1019] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Protected Agents</h3>
            <p className="mt-1 text-xs text-gray-500">
              Agents currently connected to Veridex
            </p>
          </div>

          <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-400">
            {agents.length} active
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Bot className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {agent.description || "No description"}
                </p>
              </div>

              <span className="ml-auto text-xs text-emerald-400">
                {agent.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1019]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-semibold">Recent Firewall Activity</h3>
            <p className="mt-1 text-xs text-gray-500">
              Latest real firewall decisions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Tool</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Risk</th>
                  <th className="px-6 py-4 font-medium">Decision</th>
                </tr>
              </thead>

              <tbody>
                {auditLogs.slice(0, 6).map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium">
                      {log.tool_name}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {log.action}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs capitalize text-gray-400">
                        {log.risk_level || "none"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={log.decision} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1019]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-semibold">Threat Detection</h3>
            <p className="mt-1 text-xs text-gray-500">
              Security engine status
            </p>
          </div>

          <div className="space-y-5 p-6">
            <Threat
              icon={AlertTriangle}
              title="Prompt Injection"
              description="Pattern-based detection active"
            />

            <Threat
              icon={ShieldAlert}
              title="Sensitive Data"
              description="Credential detection active"
            />

            <Threat
              icon={Activity}
              title="LLM Analysis"
              description="Semantic security analysis active"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Threat({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-400/10">
        <Icon className="h-4 w-4 text-red-400" />
      </div>

      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}