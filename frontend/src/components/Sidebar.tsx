import {
  Activity,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";

type Page =
  | "dashboard"
  | "agents"
  | "policies"
  | "approvals"
  | "security"
  | "audit"
  | "analytics"
  | "settings";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  approvalCount: number;
}

const navigation: {
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "policies", label: "Policies", icon: ShieldAlert },
  { id: "approvals", label: "Approvals", icon: ClipboardCheck },
  { id: "security", label: "Security Lab", icon: FlaskConical },
  { id: "audit", label: "Audit Log", icon: FileText },
  { id: "analytics", label: "Analytics", icon: Activity },
];

export default function Sidebar({
  activePage,
  onNavigate,
  approvalCount,
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0c1019]">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-blue-400/20">
          <ShieldCheck className="h-6 w-6 text-blue-400" />
        </div>

        <div>
          <h1 className="text-lg font-semibold tracking-tight">Veridex</h1>
          <p className="text-xs text-gray-500">Agent Security Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                active
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <Icon className="h-4 w-4" />

              <span className="flex-1">{item.label}</span>

              {item.id === "approvals" && approvalCount > 0 && (
                <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-400">
                  {approvalCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => onNavigate("settings")}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${
            activePage === "settings"
              ? "bg-blue-500/10 text-blue-400"
              : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-300">
              Firewall Active
            </p>
            <p className="text-[10px] text-emerald-400">
              Runtime protected
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}