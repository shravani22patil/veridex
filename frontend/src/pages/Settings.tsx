import {
  Settings as SettingsIcon,
  Server,
  Database,
  Brain,
  ShieldCheck,
  User,
  LogOut,
} from "lucide-react";

type SettingsProps = {
  onLogout: () => void;
};

export default function Settings({ onLogout }: SettingsProps) {
  const email =
    localStorage.getItem("veridex_user") ||
    "Authenticated User";

  const settings = [
    {
      label: "Environment",
      value: "Local Development",
      icon: Server,
    },
    {
      label: "Backend",
      value: "FastAPI",
      icon: Server,
    },
    {
      label: "Database",
      value: "PostgreSQL",
      icon: Database,
    },
    {
      label: "AI Provider",
      value: "Ollama",
      icon: Brain,
    },
    {
      label: "AI Model",
      value: "llama3.2:3b",
      icon: Brain,
    },
    {
      label: "Firewall",
      value: "Active",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
            <SettingsIcon className="h-6 w-6 text-blue-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Settings</h1>

            <p className="mt-1 text-gray-400">
              Veridex environment and security configuration.
            </p>
          </div>
        </div>
      </div>

      {/* Account */}
      <section className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-5 flex items-center gap-3">
          <User className="h-5 w-5 text-blue-400" />

          <div>
            <h2 className="font-semibold">Account</h2>
            <p className="text-sm text-gray-500">
              Current authenticated session
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-gray-950 p-4">
          <p className="text-xs text-gray-500">Signed in as</p>

          <p className="mt-1 font-medium">{email}</p>
        </div>
      </section>

      {/* System configuration */}
      <section className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-6">
          <h2 className="font-semibold">System Configuration</h2>

          <p className="mt-1 text-sm text-gray-500">
            Current Veridex runtime configuration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {settings.map((setting) => {
            const Icon = setting.icon;

            return (
              <div
                key={setting.label}
                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950 p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-500" />

                  <span className="text-sm text-gray-400">
                    {setting.label}
                  </span>
                </div>

                <span
                  className={`text-sm font-medium ${
                    setting.value === "Active"
                      ? "text-green-400"
                      : "text-gray-200"
                  }`}
                >
                  {setting.value}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security */}
      <section className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-5 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-green-400" />

          <div>
            <h2 className="font-semibold">Security</h2>

            <p className="text-sm text-gray-500">
              Veridex security controls
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-gray-950 p-4">
            <span className="text-sm text-gray-300">
              JWT Authentication
            </span>

            <span className="text-sm font-medium text-green-400">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-950 p-4">
            <span className="text-sm text-gray-300">
              Agent Ownership Checks
            </span>

            <span className="text-sm font-medium text-green-400">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-950 p-4">
            <span className="text-sm text-gray-300">
              Audit Logging
            </span>

            <span className="text-sm font-medium text-green-400">
              Enabled
            </span>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Sign out</h2>

            <p className="mt-1 text-sm text-gray-400">
              End your current Veridex session.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}