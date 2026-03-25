import { Badge } from "@/components/ui/badge";
import { TicketStatus } from "@/lib/mockData";

const statusConfig: Record<TicketStatus, { label: string; dot: string; className: string }> = {
  "Open":            { label: "Open",          dot: "bg-blue-500",   className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25"     },
  "Assigned":        { label: "Assigned",      dot: "bg-indigo-500", className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/25" },
  "In Progress":     { label: "In Progress",   dot: "bg-amber-500",  className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25"  },
  "Escalated to L2": { label: "Escalated L2",  dot: "bg-orange-500", className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/25" },
  "Escalated to L3": { label: "Escalated L3",  dot: "bg-red-500",    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25"     },
  "Resolved":        { label: "Resolved",      dot: "bg-green-500",  className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25"  },
  "Closed":          { label: "Closed",        dot: "bg-slate-400",  className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/50" },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status] ?? { label: status, dot: "bg-slate-400", className: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400" };
  return (
    <Badge variant="outline" className={`text-xs font-medium gap-1.5 ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </Badge>
  );
}
