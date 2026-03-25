import { Badge } from "@/components/ui/badge";
import { AgentLevel } from "@/lib/mockData";

const levelConfig: Record<AgentLevel, { className: string; label: string }> = {
  L1: { className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25",         label: "L1 · Email" },
  L2: { className: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/25", label: "L2 · Call"  },
  L3: { className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/25",     label: "L3 · Visit" },
};

export function RoleBadge({ level, showMethod = true }: { level: AgentLevel; showMethod?: boolean }) {
  const config = levelConfig[level];
  return (
    <Badge variant="outline" className={`text-xs font-semibold ${config.className}`}>
      {showMethod ? config.label : level}
    </Badge>
  );
}
