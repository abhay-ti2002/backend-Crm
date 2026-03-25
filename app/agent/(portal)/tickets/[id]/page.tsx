"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, Circle, Clock, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useAgentSessionStore } from "@/stores/agentSessionStore";
import { useTicketStore } from "@/stores/ticketStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { ActionPanel } from "@/components/agent/ActionPanel";
import { CustomerPanel } from "@/components/agent/CustomerPanel";
import { cn } from "@/lib/utils";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const methodIcon: Record<string, string> = {
  Email: "✉",
  Call: "📞",
  Visit: "🏢",
};

export default function AgentTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentAgentId } = useAgentSessionStore();
  const { tickets } = useTicketStore();

  const [actionsOpen,  setActionsOpen]  = useState(true);
  const [customerOpen, setCustomerOpen] = useState(true);

  useEffect(() => {
    if (!currentAgentId) router.replace("/login");
  }, [currentAgentId, router]);

  const ticket = tickets.find((t) => t.id === params.id);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 dark:text-slate-500">
        <p className="text-sm font-medium">Ticket not found</p>
        <Link href="/agent/dashboard" className="text-xs text-indigo-500 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isTerminal = ticket.status === "Resolved" || ticket.status === "Closed";

  return (
    <div className="h-full flex flex-col">
      {/* ── Top bar ── */}
      <div className="shrink-0 h-14 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 flex items-center px-6 gap-4">
        <Link
          href="/agent/dashboard"
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{ticket.id}</span>
        <div className="ml-auto flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* ── 3-column body ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* ── Col 1: Ticket info + timeline ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-w-0">
          {/* Title block */}
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {ticket.nature}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{format(new Date(ticket.createdAt), "MMM d, yyyy · h:mm a")}</span>
              <span>{ticket.sector} sector</span>
            </p>
          </div>

          {/* Escalation timeline */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Escalation Timeline
            </h2>
            {ticket.escalationSteps.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No escalation steps yet.</p>
            ) : (
              <ol className="relative space-y-0">
                {ticket.escalationSteps.map((step, idx) => {
                  const isLast = idx === ticket.escalationSteps.length - 1;
                  const isDone = step.outcome !== "In Progress";
                  return (
                    <li key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                      {!isLast && (
                        <div className="absolute left-[13px] top-7 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                      )}
                      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isDone
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      }`}>
                        {isDone
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <Circle className="w-3.5 h-3.5" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            step.level === "L1"
                              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                              : step.level === "L2"
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}>{step.level}</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{step.agentName}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{methodIcon[step.method] ?? step.method} {step.method}</span>
                          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                            step.outcome === "Resolved"  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                            step.outcome === "Escalated" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                            "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                          }`}>{step.outcome}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                          <Clock className="w-3 h-3 shrink-0" />
                          {format(new Date(step.startedAt), "MMM d, h:mm a")}
                          {step.resolvedAt && <> — {format(new Date(step.resolvedAt), "MMM d, h:mm a")}</>}
                        </p>
                        {step.notes && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 leading-relaxed">
                            {step.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        {/* ── Col 2: Actions ── */}
        <div
          style={{ transition: `width 300ms ${EASE}` }}
          className={cn(
            "shrink-0 flex flex-col border-l border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900",
            actionsOpen ? "w-80" : "w-10"
          )}
        >
          {/* Column header */}
          <div className={cn(
            "h-12 shrink-0 flex items-center border-b border-slate-100 dark:border-slate-800",
            actionsOpen ? "px-4 justify-between" : "justify-center"
          )}>
            {actionsOpen && (
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </h2>
            )}
            <button
              onClick={() => setActionsOpen((v) => !v)}
              title={actionsOpen ? "Collapse actions" : "Expand actions"}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 shrink-0"
            >
              <PanelRightOpen className={cn("w-4 h-4 transition-transform duration-300", actionsOpen ? "rotate-180" : "rotate-0")} />
            </button>
          </div>

          {/* Column content */}
          <div
            style={{ transition: `opacity 200ms ${EASE}` }}
            className={cn(
              "flex-1 overflow-y-auto",
              actionsOpen ? "opacity-100 px-4 py-5" : "opacity-0 pointer-events-none overflow-hidden"
            )}
          >
            {isTerminal ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{ticket.status}</p>
              </div>
            ) : (
              <ActionPanel ticket={ticket} />
            )}
          </div>
        </div>

        {/* ── Col 3: Customer panel ── */}
        <div
          style={{ transition: `width 300ms ${EASE}` }}
          className={cn(
            "shrink-0 flex flex-col border-l border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900",
            customerOpen ? "w-96" : "w-10"
          )}
        >
          {/* Column header */}
          <div className={cn(
            "h-12 shrink-0 flex items-center border-b border-slate-100 dark:border-slate-800",
            customerOpen ? "px-4 justify-between" : "justify-center"
          )}>
            {customerOpen && (
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Customer
              </h2>
            )}
            <button
              onClick={() => setCustomerOpen((v) => !v)}
              title={customerOpen ? "Collapse customer" : "Expand customer"}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 shrink-0"
            >
              <PanelRightClose className={cn("w-4 h-4 transition-transform duration-300", customerOpen ? "rotate-0" : "rotate-180")} />
            </button>
          </div>

          {/* Column content */}
          <div
            style={{ transition: `opacity 200ms ${EASE}` }}
            className={cn(
              "flex-1 overflow-y-auto",
              "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700",
              "[&::-webkit-scrollbar-thumb:hover]:bg-indigo-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-indigo-500",
              customerOpen ? "opacity-100 px-4 py-5" : "opacity-0 pointer-events-none overflow-hidden"
            )}
          >
            <CustomerPanel ticket={ticket} />
          </div>
        </div>
      </div>
    </div>
  );
}
