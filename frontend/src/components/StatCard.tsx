import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1019] p-5 transition hover:border-white/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>

      <p className="mt-5 text-2xl font-semibold">{value}</p>

      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}