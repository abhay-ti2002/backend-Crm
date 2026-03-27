"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  TrendingUp, ChevronRight, CheckCircle2,
  Inbox, Clock, RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
interface BackendTicket {
  _id: string;
  title: string;
  description: string;
  sector: string;
  status: string;
  level: number;
  assignedTo: { _id: string; name: string; email: string } | null;
  createdBy: { _id: string; name: string; email: string } | null;
  itemId: any;
  orderId: any;
  history: any[];
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { pill: string; dot: string; label: string }> = {
  new:       { label: "New",       dot: "bg-blue-500",    pill: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" },
  forwarded: { label: "Forwarded", dot: "bg-purple-500",  pill: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" },
  resolved:  { label: "Resolved",  dot: "bg-emerald-500", pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
  closed:    { label: "Closed",    dot: "bg-slate-400",   pill: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status.toLowerCase()] ?? {
    label: status, dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };
}

function levelBar(level: number) {
  if (level >= 3) return "bg-red-500";
  if (level === 2) return "bg-amber-400";
  return "bg-green-400";
}

function isTerminal(status: string) {
  return ["resolved", "closed"].includes(status.toLowerCase());
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TicketProgressPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [tickets, setTickets]     = useState<BackendTicket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  // ── Fetch ALL tickets assigned to this agent directly from API ────────────
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data: BackendTicket[] = await api("/tickets");
        if (!mounted) return;

        const currentAgentId: string = (user as any)._id || (user as any).id || "";

        // Show tickets assigned to this agent
        const mine = data
          .filter((t) => t.assignedTo?._id === currentAgentId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        setTickets(mine);
      } catch {
        if (mounted) setError("Failed to load tickets.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <p className="text-xs">Loading tickets…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-red-500">{error}</div>
    );
  }

  const active   = tickets.filter((t) => !isTerminal(t.status));
  const resolved = tickets.filter((t) =>  isTerminal(t.status));

  return (
    <div className="min-h-full [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] dark:[background-image:radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
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
              All tickets assigned to you — track their current status
            </p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-20 flex flex-col items-center justify-center gap-3">
            <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No tickets assigned yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Tickets assigned to you will appear here.</p>
          </div>
        ) : (
          <>
            {/* Active */}
            {active.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Progress</h2>
                  <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {active.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {active.map((ticket) => <TicketRow key={ticket._id} ticket={ticket} />)}
                </div>
              </section>
            )}

            {/* Resolved */}
            {resolved.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolved / Closed</h2>
                  <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {resolved.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {resolved.map((ticket) => <TicketRow key={ticket._id} ticket={ticket} faded />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Ticket row card ───────────────────────────────────────────────────────────
function TicketRow({ ticket, faded }: { ticket: BackendTicket; faded?: boolean }) {
  const cfg = getStatus(ticket.status);
  const sku = ticket.itemId?.sku || ticket.itemId?.serialNumber || null;
  const customer = ticket.createdBy?.name || "—";

  return (
    <Link
      href={`/agent/tickets/${ticket._id}`}
      className={cn(
        "group flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5",
        faded
          ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-70 hover:opacity-100"
          : "border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-700/50"
      )}
    >
      {/* Level stripe */}
      <div className={cn("w-1 self-stretch rounded-full shrink-0", levelBar(ticket.level))} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
            #{ticket._id.slice(-6)}
          </span>
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1", cfg.pill)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            L{ticket.level}
          </span>
        </div>

        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-snug">
          {ticket.title}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {sku ? `${sku} · ` : ""}{customer}
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(new Date(ticket.updatedAt), "MMM d")}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
      </div>
    </Link>
  );
}