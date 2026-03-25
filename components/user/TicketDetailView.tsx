"use client";

import {
  Paperclip, CheckCircle2, Clock, User, ArrowUpCircle,
  CircleDot, Package, Layers,
} from "lucide-react";
import { useTicketStore } from "@/stores/ticketStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TicketDetailViewProps {
  ticketId: string;
}

const sectorColor: Record<string, string> = {
  IT:         "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  Healthcare: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  Education:  "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  Finance:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
};

const stepOutcomeIcon = (outcome: string) => {
  if (outcome === "Resolved")   return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  if (outcome === "Escalated")  return <ArrowUpCircle className="w-3.5 h-3.5 text-amber-500" />;
  return <CircleDot className="w-3.5 h-3.5 text-indigo-500" />;
};

export function TicketDetailView({ ticketId }: TicketDetailViewProps) {
  const { tickets } = useTicketStore();
  const ticket = tickets.find((t) => t.id === ticketId);

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
        Ticket not found.
      </div>
    );
  }

  const isTerminal = ticket.status === "Resolved" || ticket.status === "Closed";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-sky-500 dark:text-sky-400">{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <h2 className={cn(
            "text-base font-bold tracking-tight",
            isTerminal
              ? "text-slate-400 dark:text-slate-500"
              : "text-slate-900 dark:text-white"
          )}>
            {ticket.nature}
          </h2>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {ticket.sector && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border",
                sectorColor[ticket.sector] ?? "bg-slate-50 text-slate-600 border-slate-200"
              )}>
                <Layers className="w-3 h-3" />
                {ticket.sector}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Package className="w-3 h-3" />
              {ticket.productName}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Clock className="w-3 h-3" />
              {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* Description */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Attachment */}
        {ticket.attachment && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{ticket.attachment}</span>
          </div>
        )}

        {/* Assigned agent */}
        {ticket.assignedAgentName && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
            <User className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs text-indigo-700 dark:text-indigo-400">
              Assigned to <span className="font-semibold">{ticket.assignedAgentName}</span>
            </span>
          </div>
        )}

        {/* Escalation timeline */}
        {ticket.escalationSteps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Timeline</p>
            <div className="relative pl-5">
              {/* Vertical line */}
              {ticket.escalationSteps.length > 1 && (
                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-700" />
              )}

              <div className="space-y-4">
                {ticket.escalationSteps.map((step, idx) => (
                  <div key={idx} className="relative flex gap-3">
                    {/* Dot */}
                    <div className="absolute -left-5 top-0.5 w-3.5 h-3.5 flex items-center justify-center">
                      {stepOutcomeIcon(step.outcome)}
                    </div>

                    <div className="flex-1 min-w-0 bg-white dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {step.level} — {step.agentName}
                        </span>
                        <span className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          step.outcome === "Resolved"  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                          step.outcome === "Escalated" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                          "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                        )}>
                          {step.outcome}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>via {step.method}</span>
                        <span>{format(new Date(step.startedAt), "MMM d, h:mm a")}</span>
                      </div>
                      {step.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 leading-snug">
                          "{step.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No activity yet */}
        {ticket.escalationSteps.length === 0 && !ticket.assignedAgentName && (
          <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
            Awaiting assignment — our team will be in touch shortly.
          </div>
        )}

      </div>
    </div>
  );
}
