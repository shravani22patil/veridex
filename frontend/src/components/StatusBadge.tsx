interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    ALLOW: "bg-emerald-400/10 text-emerald-400",
    APPROVED: "bg-emerald-400/10 text-emerald-400",
    BLOCK: "bg-red-400/10 text-red-400",
    REJECTED: "bg-red-400/10 text-red-400",
    ASK: "bg-amber-400/10 text-amber-400",
    PENDING: "bg-amber-400/10 text-amber-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-gray-400/10 text-gray-400"
      }`}
    >
      {status}
    </span>
  );
}