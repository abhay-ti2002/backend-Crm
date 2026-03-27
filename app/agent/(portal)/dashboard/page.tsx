"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Ticket as TicketIcon,
  CheckCircle2,
  ArrowUpCircle,
  ChevronRight,
} from "lucide-react";
import { useTicketStore } from "@/stores/ticketStore";
import { useAuth } from "@/context/AuthContext";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { tickets, fetchTickets } = useTicketStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading dashboard…</div>;
  }
  if (!isAuthenticated || !user) return null;

  // ── Real MongoDB _id — AuthContext normalises: { ...userData, id: userData.id || userData._id }
  const currentAgentId: string = (user as any).id || (user as any)._id || "";

  // ── Filter: assignedAgentId is set from bt.assignedTo?._id in mapBackendTicketToFrontend
  //    Both sides are real Mongo _ids now → they will match ✅
  const myTickets = tickets
    .filter((t) => t.assignedAgentId === currentAgentId && !t.trashed)
    .sort((a, b) => {
      const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
    });

  const activeCount = myTickets.filter((t) => !["Resolved", "Closed"].includes(t.status)).length;
  const resolvedCount = myTickets.filter((t) => ["Resolved", "Closed"].includes(t.status)).length;
  const escalatedCount = myTickets.filter((t) => t.status.toLowerCase().startsWith("escalated")).length;

  const agentName = (user as any).name ?? "Agent";
  const agentSector = (user as any).sector ?? "";
  const agentRole = (user as any).role ?? "";

  return (
    <div className="min-h-full [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] dark:[background-image:radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">

        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {agentName.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {[agentSector, agentRole].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active", value: activeCount, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/40", icon: TicketIcon },
            { label: "Escalated", value: escalatedCount, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/40", icon: ArrowUpCircle },
            { label: "Resolved", value: resolvedCount, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/40", icon: CheckCircle2 },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className={`rounded-2xl ${bg} px-4 py-4`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
              </div>
              <p className={`text-3xl font-bold font-mono tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* My Assigned Tickets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">My Assigned Tickets</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{myTickets.length} total</span>
          </div>

          {myTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-16 flex flex-col items-center justify-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">All clear — no tickets assigned</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">New tickets will appear here when assigned to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myTickets.map((ticket) => {
                const isTerminal = ["Resolved", "Closed"].includes(ticket.status);
                const priorityBar =
                  ticket.priority === "High" ? "bg-red-500" :
                    ticket.priority === "Medium" ? "bg-amber-400" : "bg-green-400";

                return (
                  <Link
                    key={ticket.id}
                    href={`/agent/tickets/${ticket.id}`}
                    className={`group flex flex-col rounded-xl border overflow-hidden transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${isTerminal
                        ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-60"
                        : "border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-700/50"
                      }`}
                  >
                    <div className={`h-1 w-full ${priorityBar}`} />

                    <div className="px-4 py-3.5 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                          #{ticket.id.slice(-6)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ticket.priority === "High"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                            : ticket.priority === "Medium"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                              : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                          }`}>
                          {ticket.priority}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isTerminal
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : ticket.status.toLowerCase().startsWith("escalated")
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                          }`}>
                          {ticket.status}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                        {ticket.nature}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {ticket.productName} · {ticket.userName}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Updated {format(new Date(ticket.updatedAt), "MMM d")}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}