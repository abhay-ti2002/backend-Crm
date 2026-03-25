"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  TrendingUp, ChevronRight, ArrowRight, CheckCircle2,
  Inbox, Clock, ChevronDown,
} from "lucide-react";
import { useAgentSessionStore } from "@/stores/agentSessionStore";
import { useAgentStore } from "@/stores/agentStore";
import { useTicketStore } from "@/stores/ticketStore";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TicketStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: TicketStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: "In Progress", label: "In Progress", icon: Clock,         color: "text-indigo-600 dark:text-indigo-400" },
  { value: "Resolved",    label: "Resolved",    icon: CheckCircle2,  color: "text-emerald-600 dark:text-emerald-400" },
];

function StatusDropdown({ ticketId, current }: { ticketId: string; current: TicketStatus }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { updateTicketStatus } = useTicketStore();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = STATUS_OPTIONS.find((o) => o.value === current);
  const Icon = selected?.icon ?? Clock;

  return (
    <div ref={ref} className="relative" onClick={(e) => e.preventDefault()}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold",
          "transition-colors duration-150",
          open
            ? "bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
          selected?.color ?? "text-slate-500"
        )}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{selected?.label ?? current}</span>
        <ChevronDown className={cn("w-3 h-3 shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          {STATUS_OPTIONS.map(({ value, label, icon: OptionIcon, color }) => (
            <button
              key={value}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateTicketStatus(ticketId, value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-left",
                "transition-colors duration-100 hover:bg-slate-50 dark:hover:bg-slate-700/60",
                value === current
                  ? cn("bg-slate-50 dark:bg-slate-700/50", color)
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              <OptionIcon className={cn("w-3.5 h-3.5 shrink-0", value === current ? color : "text-slate-400")} />
              {label}
              {value === current && (
                <CheckCircle2 className="w-3 h-3 ml-auto text-emerald-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TicketProgressPage() {
  const router = useRouter();
  const { currentAgentId } = useAgentSessionStore();
  const { agents } = useAgentStore();
  const { tickets } = useTicketStore();

  useEffect(() => {
    if (!currentAgentId) router.replace("/login");
  }, [currentAgentId, router]);

  const agent = agents.find((a) => a.id === currentAgentId);
  if (!agent) return null;

  const escalatedByMe = tickets
    .filter(
      (t) =>
        !t.trashed &&
        t.escalationSteps.some((s) => s.agentId === agent.id && s.outcome === "Escalated")
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const active   = escalatedByMe.filter((t) => !["Resolved", "Closed"].includes(t.status));
  const resolved = escalatedByMe.filter((t) =>  ["Resolved", "Closed"].includes(t.status));

  return (
    <div className="min-h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[20px_20px]">
    <div className="p-6 max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ticket Progress
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tickets you escalated to L2 / L3 — track what&apos;s happening
          </p>
        </div>
      </div>

      {escalatedByMe.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-20 flex flex-col items-center justify-center gap-3">
          <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No escalated tickets</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Tickets you escalate will appear here.</p>
        </div>
      ) : (
        <>
          {/* Active escalations */}
          {active.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  In Progress
                </h2>
                <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                  {active.length}
                </span>
              </div>
              <div className="space-y-2">
                {active.map((ticket) => {
                  const currentStep = [...ticket.escalationSteps].reverse().find((s) => s.outcome === "In Progress");
                  const myStep = ticket.escalationSteps.find((s) => s.agentId === agent.id && s.outcome === "Escalated");
                  return (
                    <Link
                      key={ticket.id}
                      href={`/agent/tickets/${ticket.id}`}
                      className="group flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 px-4 py-3.5 transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 hover:border-indigo-200 dark:hover:border-indigo-700/50"
                    >
                      {/* Priority bar */}
                      <div className={`w-1 self-stretch rounded-full shrink-0 ${
                        ticket.priority === "High" ? "bg-red-500" :
                        ticket.priority === "Medium" ? "bg-amber-400" : "bg-green-400"
                      }`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">{ticket.id}</span>
                          <PriorityBadge priority={ticket.priority} />
                          <StatusBadge status={ticket.status} />
                        </div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-snug">
                          {ticket.nature}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                          {ticket.productName} · {ticket.userName}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            You ({myStep?.level ?? agent.level})
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                          {currentStep ? (
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 px-1.5 py-0.5 rounded">
                              {currentStep.agentName} ({currentStep.level})
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-1.5 py-0.5 rounded">
                              Pending assignment
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: status dropdown + date + arrow */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <StatusDropdown ticketId={ticket.id} current={ticket.status} />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {format(new Date(ticket.updatedAt), "MMM d")}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Resolved
                </h2>
                <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                  {resolved.length}
                </span>
              </div>
              <div className="space-y-2">
                {resolved.map((ticket) => {
                  const myStep = ticket.escalationSteps.find((s) => s.agentId === agent.id && s.outcome === "Escalated");
                  const resolverStep = [...ticket.escalationSteps].reverse().find((s) => s.outcome === "Resolved");
                  return (
                    <Link
                      key={ticket.id}
                      href={`/agent/tickets/${ticket.id}`}
                      className="group flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-70 px-4 py-3.5 transition-all duration-150 hover:opacity-100 hover:shadow-sm hover:-translate-y-0.5"
                    >
                      <div className={`w-1 self-stretch rounded-full shrink-0 ${
                        ticket.priority === "High" ? "bg-red-500" :
                        ticket.priority === "Medium" ? "bg-amber-400" : "bg-green-400"
                      }`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">{ticket.id}</span>
                          <PriorityBadge priority={ticket.priority} />
                          <StatusBadge status={ticket.status} />
                        </div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-snug">
                          {ticket.nature}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                          {ticket.productName} · {ticket.userName}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            You ({myStep?.level ?? agent.level})
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                          {resolverStep ? (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded">
                              Resolved by {resolverStep.agentName} ({resolverStep.level})
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded">
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <StatusDropdown ticketId={ticket.id} current={ticket.status} />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {format(new Date(ticket.updatedAt), "MMM d")}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
    </div>
  );
}
