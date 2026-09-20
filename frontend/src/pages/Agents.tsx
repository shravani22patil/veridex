import { useState } from "react";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Code2,
  Plus,
  Search,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

import { createAgent } from "../api";

interface Agent {
  id: number;
  name: string;
  description?: string | null;
  owner_id: number;
  is_active: boolean;
  created_at?: string;
}

interface AgentsProps {
  token: string;
  agents: Agent[];
  onAgentsChanged: () => void;
}

export default function Agents({
  token,
  agents,
  onAgentsChanged,
}: AgentsProps) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const filteredAgents = agents.filter((agent) => {
    const query = search.toLowerCase();

    return (
      agent.name.toLowerCase().includes(query) ||
      (agent.description || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-content space-y-6">
      {/* Page Header */}
      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0c1019] p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
            <Bot className="h-4 w-4" />
            Agent Management
          </div>

          <h2 className="text-xl font-semibold">
            Protected Agents
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-5 text-gray-500">
            Register and manage the AI agents whose tool activity is
            inspected by the Veridex runtime firewall.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <MiniStat
          icon={Bot}
          label="Total Agents"
          value={agents.length}
        />

        <MiniStat
          icon={CheckCircle2}
          label="Active Agents"
          value={agents.filter((agent) => agent.is_active).length}
        />

        <MiniStat
          icon={ShieldCheck}
          label="Protected"
          value={agents.filter((agent) => agent.is_active).length}
        />
      </section>

      {/* Search */}
      <section className="rounded-2xl border border-white/10 bg-[#0c1019] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-600" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search agents..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none transition placeholder:text-gray-600 focus:border-blue-400/40"
          />
        </div>
      </section>

      {/* Agent List */}
      <section>
        {filteredAgents.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Modal */}
      {showCreate && (
        <CreateAgentModal
          token={token}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            onAgentsChanged();
          }}
        />
      )}

      {/* Details Modal */}
      {selectedAgent && (
        <AgentDetails
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* Agent Card                                         */
/* -------------------------------------------------- */

function AgentCard({
  agent,
  onClick,
}: {
  agent: Agent;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-white/10 bg-[#0c1019] p-5 text-left transition hover:border-blue-400/30 hover:bg-[#0e131e]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-400/10">
          <Bot className="h-6 w-6 text-blue-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate font-medium text-gray-100">
              {agent.name}
            </h3>

            <Status active={agent.is_active} />
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
            {agent.description || "No description provided."}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5" />
              Agent #{agent.id}
            </span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Firewall protected
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-xs text-gray-600">
          Click to inspect agent
        </span>

        <span className="text-xs text-blue-400 opacity-0 transition group-hover:opacity-100">
          View details →
        </span>
      </div>
    </button>
  );
}

/* -------------------------------------------------- */
/* Create Agent Modal                                 */
/* -------------------------------------------------- */

function CreateAgentModal({
  token,
  onClose,
  onCreated,
}: {
  token: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Agent name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createAgent(
        token,
        name.trim(),
        description.trim()
      );

      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create agent."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
            <Bot className="h-5 w-5 text-blue-400" />
          </div>

          <h3 className="text-xl font-semibold">
            Register AI Agent
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add an agent to the Veridex protection layer.
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Agent name
          </label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Research Agent"
            autoFocus
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-600 focus:border-blue-400/40"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="What does this agent do?"
            rows={4}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-600 focus:border-blue-400/40"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-gray-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Creating..." : "Create Agent"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------- */
/* Agent Details                                      */
/* -------------------------------------------------- */

function AgentDetails({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const createdAt = agent.created_at
    ? new Date(agent.created_at).toLocaleString()
    : "Not available";

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <Bot className="h-6 w-6 text-blue-400" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">
                {agent.name}
              </h3>

              <Status active={agent.is_active} />
            </div>

            <p className="mt-1 text-xs text-gray-600">
              Agent #{agent.id}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-7 space-y-4">
        <InfoRow
          icon={Code2}
          label="Description"
          value={
            agent.description ||
            "No description provided."
          }
        />

        <InfoRow
          icon={ShieldCheck}
          label="Protection"
          value={
            agent.is_active
              ? "Firewall protection active"
              : "Agent protection inactive"
          }
        />

        <InfoRow
          icon={CalendarDays}
          label="Created"
          value={createdAt}
        />

        <InfoRow
          icon={CircleDot}
          label="Owner ID"
          value={String(agent.owner_id)}
        />
      </div>

      <div className="mt-6 rounded-xl border border-blue-400/10 bg-blue-400/5 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />

          <div>
            <p className="text-sm font-medium text-blue-300">
              Runtime protection
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Tool requests from this agent can be evaluated by
              Veridex before execution.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------- */
/* Supporting Components                              */
/* -------------------------------------------------- */

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bot;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1019] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>

        <Zap className="h-4 w-4 text-gray-700" />
      </div>

      <p className="mt-5 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {label}
      </p>
    </div>
  );
}

function Status({ active }: { active: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${
        active
          ? "bg-emerald-400/10 text-emerald-400"
          : "bg-gray-400/10 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-gray-600"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Code2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />

        <div>
          <p className="text-xs text-gray-600">
            {label}
          </p>

          <p className="mt-1 text-sm text-gray-300">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c1019] p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
        <Bot className="h-7 w-7 text-blue-400" />
      </div>

      <h3 className="mt-5 font-semibold">
        No agents found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Register an AI agent to start protecting its tool
        execution with the Veridex runtime firewall.
      </p>

      <button
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
      >
        <Plus className="h-4 w-4" />
        Add Agent
      </button>
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0c1019] p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}