import { Badge } from "@/components/ui/badge";
import { TicketPriority } from "@/lib/mockData";

const priorityConfig: Record<TicketPriority, { className: string; dot: string }> = {
  High:   { className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25",       dot: "bg-red-500"   },
  Medium: { className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25", dot: "bg-amber-500" },
  Low:    { className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25", dot: "bg-green-500" },
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={`text-xs font-medium gap-1.5 ${config.className}`}>
      {priority === "High" ? (
        <span className="relative flex w-1.5 h-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      )}
      {priority}
    </Badge>
  );
}
