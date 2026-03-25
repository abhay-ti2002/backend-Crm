import type { ElementType } from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin } from "lucide-react";
import { ResolutionMethod } from "@/lib/mockData";

const methodConfig: Record<ResolutionMethod, { className: string; Icon: ElementType }> = {
  Email: { className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25",         Icon: Mail   },
  Call:  { className: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/25", Icon: Phone  },
  Visit: { className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/25", Icon: MapPin },
};

export function MethodBadge({ method }: { method: ResolutionMethod }) {
  const { className, Icon } = methodConfig[method];
  return (
    <Badge variant="outline" className={`text-xs font-medium gap-1.5 ${className}`}>
      <Icon className="w-3 h-3 shrink-0" />
      {method}
    </Badge>
  );
}
