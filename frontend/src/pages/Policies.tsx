import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileKey2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Unlock,
  Wrench,

} from "lucide-react";

import {
  setPermission,
  setPolicy,
} from "../api";

interface Agent {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
}

interface Tool {
  id: number;
  name: string;
  description?: string | null;
  risk_level: string;
  is_active: boolean;
}

interface Permission {
  id: number;
  agent_id: number;
  tool_id: number;
  is_allowed: boolean;
}

interface Policy {
  id: number;
  agent_id: number;
  tool_id: number;
  decision: "ALLOW" | "ASK" | "BLOCK";
  is_active: boolean;
}

interface PoliciesProps {
  token: string;
  agents: Agent[];
  tools: Tool[];
  permissions: Permission[];
  policies: Policy[];
  onChanged: () => void;
}

type Decision = "ALLOW" | "ASK" | "BLOCK";

export default function Policies({
  token,
  agents,
  tools,
  permissions,
  policies,
  onChanged,
}: PoliciesProps) {
  const [selectedAgentId, setSelectedAgentId] = useState(
    agents[0]?.id ?? 0
  );

  const [savingKey, setSavingKey] = useState<string | null>(
    null
  );

  const [message, setMessage] = useState("");

  const selectedAgent = agents.find(
    (agent) => agent.id === selectedAgentId
  );

  const agentTools = useMemo(() => {
    return tools.filter((tool) => tool.is_active);
  }, [tools]);

  async function handlePermission(
    toolId: number,
    allowed: boolean
  ) {
    const key = `permission-${toolId}`;

    setSavingKey(key);
    setMessage("");

    try {
      await setPermission(
        token,
        selectedAgentId,
        toolId,
        allowed
      );

      setMessage("Permission updated.");
      onChanged();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update permission."
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function handlePolicy(
    toolId: number,
    decision: Decision
  ) {
    const key = `policy-${toolId}`;

    setSavingKey(key);
    setMessage("");

    try {
      await setPolicy(
        token,
        selectedAgentId,
        toolId,
        decision
      );

      setMessage("Policy updated.");
      onChanged();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update policy."
      );
    } finally {
      setSavingKey(null);
    }
  }

  function getPermission(toolId: number) {
    return permissions.find(
      (permission) =>
        permission.agent_id === selectedAgentId &&
        permission.tool_id === toolId
    );
  }

  function getPolicy(toolId: number) {
    return policies.find(
      (policy) =>
        policy.agent_id === selectedAgentId &&
        policy.tool_id === toolId &&
        policy.is_active
    );
  }

  if (agents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c1019] p-12 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-gray-600" />

        <h3 className="mt-5 text-lg font-semibold">
          No agents available
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Create an agent before configuring its security
          policies.
        </p>
      </div>
    );
  }

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-white/10 bg-[#0c1019] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
              <SlidersHorizontal className="h-4 w-4" />
              Runtime Policy Engine
            </div>

            <h2 className="text-xl font-semibold">
              Policies & Permissions
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-5 text-gray-500">
              Control which tools an agent can access and
              determine what Veridex should do when each tool
              is requested.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Policy engine active
            </div>
          </div>
        </div>
      </section>

      {/* Agent Selector */}
      <section className="rounded-2xl border border-white/10 bg-[#0c1019] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-600">
              Configure agent
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Select an agent to manage its tool access.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <select
              value={selectedAgentId}
              onChange={(event) =>
                setSelectedAgentId(
                  Number(event.target.value)
                )
              }
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 pr-10 text-sm text-gray-200 outline-none focus:border-blue-400/40"
            >
              {agents.map((agent) => (
                <option
                  key={agent.id}
                  value={agent.id}
                  className="bg-[#0c1019]"
                >
                  {agent.name}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-600" />
          </div>
        </div>

        {selectedAgent && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>

            <div>
              <p className="text-sm font-medium">
                {selectedAgent.name}
              </p>

              <p className="text-xs text-gray-600">
                {selectedAgent.description ||
                  "No description provided."}
              </p>
            </div>

            <span
              className={`ml-auto rounded-full px-2.5 py-1 text-[11px] ${
                selectedAgent.is_active
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "bg-gray-400/10 text-gray-500"
              }`}
            >
              {selectedAgent.is_active
                ? "Active"
                : "Inactive"}
            </span>
          </div>
        )}
      </section>

      {/* Status Message */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-400/10 bg-blue-400/5 px-4 py-3 text-sm text-blue-300">
          <Check className="h-4 w-4" />
          {message}
        </div>
      )}

      {/* Tools */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1019]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Tool Access Control
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Permissions determine whether the agent may
                request a tool.
              </p>
            </div>

            <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-400">
              {agentTools.length} tools
            </span>
          </div>
        </div>

        {agentTools.length === 0 ? (
          <div className="p-10 text-center">
            <Wrench className="mx-auto h-8 w-8 text-gray-600" />

            <p className="mt-4 text-sm text-gray-400">
              No active tools registered.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {agentTools.map((tool) => {
              const permission = getPermission(tool.id);
              const policy = getPolicy(tool.id);

              const allowed =
                permission?.is_allowed ?? false;

              const decision =
                policy?.decision ?? "ASK";

              return (
                <ToolPolicyRow
                  key={tool.id}
                  tool={tool}
                  allowed={allowed}
                  decision={decision}
                  savingPermission={
                    savingKey === `permission-${tool.id}`
                  }
                  savingPolicy={
                    savingKey === `policy-${tool.id}`
                  }
                  onPermissionChange={(value) =>
                    handlePermission(tool.id, value)
                  }
                  onPolicyChange={(value) =>
                    handlePolicy(tool.id, value)
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Explanation */}
      <section className="grid gap-4 md:grid-cols-3">
        <Explanation
          icon={Unlock}
          title="ALLOW"
          text="The request can proceed when security checks pass."
          type="allow"
        />

        <Explanation
          icon={AlertTriangle}
          title="ASK"
          text="The request pauses and requires human approval."
          type="ask"
        />

        <Explanation
          icon={Lock}
          title="BLOCK"
          text="The request is denied before the tool executes."
          type="block"
        />
      </section>
    </div>
  );
}

/* -------------------------------------------------- */
/* Tool Policy Row                                    */
/* -------------------------------------------------- */

function ToolPolicyRow({
  tool,
  allowed,
  decision,
  savingPermission,
  savingPolicy,
  onPermissionChange,
  onPolicyChange,
}: {
  tool: Tool;
  allowed: boolean;
  decision: Decision;
  savingPermission: boolean;
  savingPolicy: boolean;
  onPermissionChange: (value: boolean) => void;
  onPolicyChange: (value: Decision) => void;
}) {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* Tool info */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
            <Wrench className="h-5 w-5 text-gray-400" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="font-medium">
                {tool.name}
              </h4>

              <RiskBadge level={tool.risk_level} />
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {tool.description ||
                "No tool description provided."}
            </p>
          </div>
        </div>

        {/* Permission */}
        <div className="flex items-center justify-between gap-5 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 xl:w-64">
          <div>
            <p className="text-xs text-gray-600">
              Tool permission
            </p>

            <p
              className={`mt-1 text-sm ${
                allowed
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {allowed ? "Access enabled" : "Access revoked"}
            </p>
          </div>

          <button
            disabled={savingPermission}
            onClick={() =>
              onPermissionChange(!allowed)
            }
            className={`relative h-6 w-11 rounded-full transition ${
              allowed
                ? "bg-emerald-400/70"
                : "bg-gray-700"
            } ${
              savingPermission
                ? "cursor-wait opacity-50"
                : ""
            }`}
            aria-label="Toggle tool permission"
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                allowed
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Policy */}
        <div className="flex items-center gap-3 xl:w-72">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <FileKey2 className="h-4 w-4 text-blue-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-600">
              Firewall decision
            </p>

            <select
              value={decision}
              disabled={savingPolicy}
              onChange={(event) =>
                onPolicyChange(
                  event.target.value as Decision
                )
              }
              className={`mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none ${
                decision === "ALLOW"
                  ? "text-emerald-400"
                  : decision === "ASK"
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              <option
                value="ALLOW"
                className="bg-[#0c1019] text-emerald-400"
              >
                ALLOW
              </option>

              <option
                value="ASK"
                className="bg-[#0c1019] text-amber-400"
              >
                ASK
              </option>

              <option
                value="BLOCK"
                className="bg-[#0c1019] text-red-400"
              >
                BLOCK
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Risk Badge                                         */
/* -------------------------------------------------- */

function RiskBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase();

  const styles: Record<string, string> = {
    low: "bg-emerald-400/10 text-emerald-400",
    medium: "bg-amber-400/10 text-amber-400",
    high: "bg-red-400/10 text-red-400",
    critical: "bg-red-500/15 text-red-300",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${
        styles[normalized] ||
        "bg-gray-400/10 text-gray-400"
      }`}
    >
      {level}
    </span>
  );
}

/* -------------------------------------------------- */
/* Explanation Card                                   */
/* -------------------------------------------------- */

function Explanation({
  icon: Icon,
  title,
  text,
  type,
}: {
  icon: typeof Unlock;
  title: string;
  text: string;
  type: "allow" | "ask" | "block";
}) {
  const styles = {
    allow: {
      box: "border-emerald-400/10 bg-emerald-400/5",
      icon: "bg-emerald-400/10 text-emerald-400",
      title: "text-emerald-400",
    },
    ask: {
      box: "border-amber-400/10 bg-amber-400/5",
      icon: "bg-amber-400/10 text-amber-400",
      title: "text-amber-400",
    },
    block: {
      box: "border-red-400/10 bg-red-400/5",
      icon: "bg-red-400/10 text-red-400",
      title: "text-red-400",
    },
  }[type];

  return (
    <div
      className={`rounded-2xl border p-5 ${styles.box}`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles.icon}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p
        className={`mt-4 text-sm font-semibold ${styles.title}`}
      >
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {text}
      </p>
    </div>
  );
}
