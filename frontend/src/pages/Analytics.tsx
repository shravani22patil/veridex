import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingUp,
} from "lucide-react";

type AnalyticsProps = {
  auditLogs: any[];
};

export default function Analytics({ auditLogs }: AnalyticsProps) {
  const total = auditLogs.length;

  const allowed = auditLogs.filter(
    (log) => log.decision === "ALLOW"
  ).length;

  const approval = auditLogs.filter(
    (log) => log.decision === "ASK"
  ).length;

  const blocked = auditLogs.filter(
    (log) => log.decision === "BLOCK"
  ).length;

  const averageRisk =
    total > 0
      ? Math.round(
          auditLogs.reduce(
            (sum, log) => sum + Number(log.risk_score || 0),
            0
          ) / total
        )
      : 0;

  const highRisk = auditLogs.filter(
    (log) =>
      log.risk_level === "high" ||
      log.risk_level === "critical"
  ).length;

  const maxBar = Math.max(allowed, approval, blocked, 1);

  const stats = [
    {
      label: "Total Requests",
      value: total,
      icon: Activity,
      description: "Firewall requests evaluated",
    },
    {
      label: "Allowed",
      value: allowed,
      icon: ShieldCheck,
      description: "Requests permitted",
    },
    {
      label: "Approval Required",
      value: approval,
      icon: ShieldAlert,
      description: "Requests awaiting approval",
    },
    {
      label: "Blocked",
      value: blocked,
      icon: ShieldX,
      description: "Requests denied",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="mt-2 text-gray-400">
          Security activity and firewall decision analytics.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-gray-800 p-2">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>

                <span className="text-2xl font-bold">
                  {stat.value}
                </span>
              </div>

              <p className="font-medium">{stat.label}</p>

              <p className="mt-1 text-sm text-gray-500">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Risk Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-400" />

            <div>
              <h2 className="font-semibold">Risk Overview</h2>
              <p className="text-sm text-gray-500">
                Current firewall risk metrics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-950 p-5">
              <p className="text-sm text-gray-500">
                Average Risk Score
              </p>

              <p className="mt-2 text-3xl font-bold">
                {averageRisk}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Out of 100
              </p>
            </div>

            <div className="rounded-xl bg-gray-950 p-5">
              <p className="text-sm text-gray-500">
                High / Critical
              </p>

              <p className="mt-2 text-3xl font-bold">
                {highRisk}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Elevated-risk requests
              </p>
            </div>
          </div>
        </div>

        {/* Decision Distribution */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="font-semibold">Decision Distribution</h2>

          <p className="mb-6 mt-1 text-sm text-gray-500">
            How Veridex handled incoming requests
          </p>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-300">ALLOW</span>
                <span className="text-gray-500">{allowed}</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${(allowed / maxBar) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-300">ASK</span>
                <span className="text-gray-500">{approval}</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{
                    width: `${(approval / maxBar) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-300">BLOCK</span>
                <span className="text-gray-500">{blocked}</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{
                    width: `${(blocked / maxBar) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-6">
          <h2 className="font-semibold">Recent Security Activity</h2>
          <p className="mt-1 text-sm text-gray-500">
            Latest requests evaluated by the firewall.
          </p>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No security activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {auditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-2 gap-4 p-5 md:grid-cols-5"
              >
                <div>
                  <p className="text-xs text-gray-500">Tool</p>
                  <p className="mt-1 text-sm font-medium">
                    {log.tool_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Action</p>
                  <p className="mt-1 text-sm">{log.action}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Decision</p>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      log.decision === "BLOCK"
                        ? "text-red-400"
                        : log.decision === "ASK"
                          ? "text-amber-400"
                          : "text-green-400"
                    }`}
                  >
                    {log.decision}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Risk
                  </p>
                  <p className="mt-1 text-sm">
                    {log.risk_level} ({log.risk_score})
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Reason</p>
                  <p className="mt-1 truncate text-sm text-gray-400">
                    {typeof log.reason === "string"
                      ? log.reason
                      : JSON.stringify(log.reason)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}