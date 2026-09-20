import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

import { decideApproval } from "../api";
import StatusBadge from "../components/StatusBadge";

interface Approval {
  id: number;
  audit_log_id: number;
  agent_id: number;
  tool_name: string;
  action: string;
  status: string;
  reason?: string | null;
  risk_level?: string | null;
  risk_score?: number | null;
  created_at?: string;
  resolved_at?: string | null;
  input_data?: Record<string, unknown>;
  execution?: {
    success?: boolean;
    tool?: string;
    action?: string;
    result?: string;
    error?: string;
  };
}

interface Agent {
  id: number;
  name: string;
}

interface ApprovalsProps {
  token: string;
  approvals: Approval[];
  agents: Agent[];
  onChanged: () => void;
}

export default function Approvals({
  token,
  approvals,
  agents,
  onChanged,
}: ApprovalsProps) {
  const [selectedApproval, setSelectedApproval] =
    useState<Approval | null>(null);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "RESOLVED"
  >("PENDING");

  const pending = approvals.filter(
    (approval) => approval.status === "PENDING"
  );

  const resolved = approvals.filter(
    (approval) => approval.status !== "PENDING"
  );

  const visibleApprovals =
    filter === "PENDING"
      ? pending
      : filter === "RESOLVED"
        ? resolved
        : approvals;

  async function handleDecision(
    approvalId: number,
    decision: "APPROVE" | "REJECT"
  ) {
    setProcessingId(approvalId);

    try {
      await decideApproval(
        token,
        approvalId,
        decision
      );

      setSelectedApproval(null);
      onChanged();
    } catch (error) {
      console.error(
        "Approval decision failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to process approval."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function getAgentName(agentId: number) {
    return (
      agents.find((agent) => agent.id === agentId)?.name ||
      `Agent #${agentId}`
    );
  }

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-amber-400/10 bg-gradient-to-br from-amber-400/5 via-[#101621] to-[#0c1019] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-amber-400">
              <UserCheck className="h-4 w-4" />
              Human-in-the-Loop Security
            </div>

            <h2 className="text-xl font-semibold">
              Approval Center
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-5 text-gray-500">
              Review tool requests that require human
              authorization before an AI agent can execute
              them.
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/5">
            <Clock3 className="h-7 w-7 text-amber-400" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <ApprovalStat
          icon={Clock3}
          label="Pending Review"
          value={pending.length}
          type="pending"
        />

        <ApprovalStat
          icon={CheckCircle2}
          label="Approved"
          value={
            approvals.filter(
              (approval) =>
                approval.status === "APPROVED"
            ).length
          }
          type="approved"
        />

        <ApprovalStat
          icon={XCircle}
          label="Rejected"
          value={
            approvals.filter(
              (approval) =>
                approval.status === "REJECTED"
            ).length
          }
          type="rejected"
        />
      </section>

      {/* Filter */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex rounded-xl border border-white/10 bg-[#0c1019] p-1">
          <FilterButton
            active={filter === "PENDING"}
            onClick={() => setFilter("PENDING")}
            label={`Pending (${pending.length})`}
          />

          <FilterButton
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            label={`All (${approvals.length})`}
          />

          <FilterButton
            active={filter === "RESOLVED"}
            onClick={() => setFilter("RESOLVED")}
            label={`Resolved (${resolved.length})`}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <ShieldCheck className="h-4 w-4" />
          Requests are evaluated before execution
        </div>
      </section>

      {/* Approval List */}
      <section>
        {visibleApprovals.length === 0 ? (
          <EmptyApprovals filter={filter} />
        ) : (
          <div className="space-y-3">
            {visibleApprovals.map((approval) => (
              <ApprovalRow
                key={approval.id}
                approval={approval}
                agentName={getAgentName(approval.agent_id)}
                processing={
                  processingId === approval.id
                }
                onView={() =>
                  setSelectedApproval(approval)
                }
                onDecision={handleDecision}
              />
            ))}
          </div>
        )}
      </section>

      {/* Details */}
      {selectedApproval && (
        <ApprovalDetails
          approval={selectedApproval}
          agentName={getAgentName(
            selectedApproval.agent_id
          )}
          processing={
            processingId === selectedApproval.id
          }
          onClose={() => setSelectedApproval(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* Approval Row                                       */
/* -------------------------------------------------- */

function ApprovalRow({
  approval,
  agentName,
  processing,
  onView,
  onDecision,
}: {
  approval: Approval;
  agentName: string;
  processing: boolean;
  onView: () => void;
  onDecision: (
    id: number,
    decision: "APPROVE" | "REJECT"
  ) => void;
}) {
  const isPending = approval.status === "PENDING";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1019] p-5 transition hover:border-white/20">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isPending
              ? "bg-amber-400/10"
              : approval.status === "APPROVED"
                ? "bg-emerald-400/10"
                : "bg-red-400/10"
          }`}
        >
          {isPending ? (
            <Clock3 className="h-5 w-5 text-amber-400" />
          ) : approval.status === "APPROVED" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400" />
          )}
        </div>

        {/* Request */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-medium">
              {approval.tool_name}
            </h3>

            <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-gray-500">
              {approval.action}
            </span>

            <StatusBadge status={approval.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5" />
              {agentName}
            </span>

            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Request #{approval.id}
            </span>

            {approval.created_at && (
              <span>
                {new Date(
                  approval.created_at
                ).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Risk */}
        <div className="flex items-center gap-3 xl:w-36">
          <RiskIndicator
            level={approval.risk_level || "none"}
            score={approval.risk_score ?? 0}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-gray-400 transition hover:bg-white/5 hover:text-gray-200"
          >
            <Eye className="h-4 w-4" />
            Inspect
          </button>

          {isPending && (
            <>
              <button
                disabled={processing}
                onClick={() =>
                  onDecision(
                    approval.id,
                    "REJECT"
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2.5 text-xs text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Reject
              </button>

              <button
                disabled={processing}
                onClick={() =>
                  onDecision(
                    approval.id,
                    "APPROVE"
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Details Modal                                      */
/* -------------------------------------------------- */

function ApprovalDetails({
  approval,
  agentName,
  processing,
  onClose,
  onDecision,
}: {
  approval: Approval;
  agentName: string;
  processing: boolean;
  onClose: () => void;
  onDecision: (
    id: number,
    decision: "APPROVE" | "REJECT"
  ) => void;
}) {
  const isPending = approval.status === "PENDING";

  const input = approval.input_data || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0c1019] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">
                  Tool Request
                </h3>

                <StatusBadge
                  status={approval.status}
                />
              </div>

              <p className="mt-1 text-xs text-gray-600">
                Approval #{approval.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Request Summary */}
        <div className="grid gap-3 p-6 md:grid-cols-2">
          <DetailItem
            icon={Bot}
            label="Agent"
            value={agentName}
          />

          <DetailItem
            icon={Terminal}
            label="Tool"
            value={approval.tool_name}
          />

          <DetailItem
            icon={ArrowRight}
            label="Action"
            value={approval.action}
          />

          <DetailItem
            icon={AlertTriangle}
            label="Risk"
            value={`${approval.risk_level || "none"} (${approval.risk_score ?? 0}/100)`}
          />
        </div>

        {/* Reason */}
        <div className="px-6">
          <div className="rounded-xl border border-amber-400/10 bg-amber-400/5 p-4">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

              <div>
                <p className="text-xs font-medium text-amber-400">
                  Why approval is required
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-400">
                  {approval.reason ||
                    "This request requires human review according to the active Veridex policy."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Original Input */}
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />

            <h4 className="text-sm font-medium">
              Original Tool Input
            </h4>
          </div>

          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-6 text-gray-400">
            {JSON.stringify(input, null, 2)}
          </pre>
        </div>

        {/* Execution */}
        {approval.execution && (
          <div className="px-6 pb-6">
            <div className="mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-gray-500" />

              <h4 className="text-sm font-medium">
                Execution Result
              </h4>
            </div>

            <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <p className="font-mono text-xs leading-6 text-gray-400">
                {approval.execution.result ||
                  approval.execution.error ||
                  "Execution completed."}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-white/10 p-6 sm:flex-row sm:justify-end">
          {isPending ? (
            <>
              <button
                disabled={processing}
                onClick={() =>
                  onDecision(
                    approval.id,
                    "REJECT"
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-2.5 text-sm text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject Request
              </button>

              <button
                disabled={processing}
                onClick={() =>
                  onDecision(
                    approval.id,
                    "APPROVE"
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve & Execute
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-400 hover:bg-white/5"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Components                                         */
/* -------------------------------------------------- */

function ApprovalStat({
  icon: Icon,
  label,
  value,
  type,
}: {
  icon: typeof Clock3;
  label: string;
  value: number;
  type: "pending" | "approved" | "rejected";
}) {
  const styles = {
    pending: "text-amber-400 bg-amber-400/10",
    approved: "text-emerald-400 bg-emerald-400/10",
    rejected: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1019] p-5">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles[type]}`}
      >
        <Icon className="h-4 w-4" />
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

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs transition ${
        active
          ? "bg-white/10 text-gray-200"
          : "text-gray-600 hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function RiskIndicator({
  level,
  score,
}: {
  level: string;
  score: number;
}) {
  const normalized = level.toLowerCase();

  const text =
    normalized === "critical" || normalized === "high"
      ? "text-red-400"
      : normalized === "medium"
        ? "text-amber-400"
        : normalized === "low"
          ? "text-emerald-400"
          : "text-gray-500";

  return (
    <div>
      <p className={`text-xs font-medium capitalize ${text}`}>
        {level}
      </p>

      <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${
            score >= 70
              ? "w-[90%] bg-red-400"
              : score >= 40
                ? "w-[55%] bg-amber-400"
                : score > 0
                  ? "w-[25%] bg-emerald-400"
                  : "w-0"
          }`}
        />
      </div>

      <p className="mt-1 text-[10px] text-gray-600">
        Risk score: {score}/100
      </p>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-600" />

        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-600">
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

function EmptyApprovals({
  filter,
}: {
  filter: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c1019] p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10">
        <ShieldCheck className="h-7 w-7 text-emerald-400" />
      </div>

      <h3 className="mt-5 font-semibold">
        {filter === "PENDING"
          ? "No requests waiting for approval"
          : "No approval requests found"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {filter === "PENDING"
          ? "The approval queue is clear. Requests requiring human review will appear here."
          : "Veridex has not recorded any approval requests for this view yet."}
      </p>
    </div>
  );
}