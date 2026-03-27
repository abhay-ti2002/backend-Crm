"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Inbox, Clock, RefreshCw } from "lucide-react";
import { api } from "@/lib/api/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface BackendTicket {
  _id: string;
  title: string;
  description: string;
  sector: string;
  status: string; // "new" | "forwarded" | "resolved" | "closed"
  level: number;
  createdBy: { _id: string; name: string; email: string } | null;
  assignedTo: { _id: string; name: string; email: string } | null;
  itemId: any;
  orderId: any;
  history: any[];
  createdAt: string;
  updatedAt: string;
}

interface TicketListPanelProps {
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
  refreshTrigger?: number;
}

// ── Status pill config ───────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string; pill: string }> = {
  new:       { label: "New",       dot: "bg-blue-500",    pill: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" },
  forwarded: { label: "Forwarded", dot: "bg-purple-500",  pill: "bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" },
  resolved:  { label: "Resolved",  dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
  closed:    { label: "Closed",    dot: "bg-slate-400",   pill: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status.toLowerCase()] ?? {
    label: status,
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };
}

export function TicketListPanel({ selectedTicketId, onSelectTicket, refreshTrigger }: TicketListPanelProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<BackendTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // current user's mongo _id
  const currentUserId: string = (user as any)?._id || (user as any)?.id || "";

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data: BackendTicket[] = await api("/tickets");
        if (!mounted) return;

        // Filter only tickets raised by this user
        const mine = data.filter((t) => t.createdBy?._id === currentUserId);
        // Newest first
        mine.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTickets(mine);
      } catch {
        if (mounted) setError("Failed to load tickets. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (currentUserId) load();
  }, [currentUserId, refreshTrigger]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <p className="text-xs">Loading your tickets…</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          My Tickets
        </span>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
          {tickets.length} total
        </span>
      </div>

      {/* Empty state */}
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Inbox className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No tickets raised yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Click <span className="font-semibold text-indigo-500">+ New</span> to raise your first ticket
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {tickets.map((ticket) => {
            const cfg      = getStatusConfig(ticket.status);
            const selected = selectedTicketId === ticket._id;
            const sku      = ticket.itemId?.sku || ticket.itemId?.serialNumber || null;

            return (
              <button
                key={ticket._id}
                onClick={() => onSelectTicket(ticket._id)}
                className={cn(
                  "w-full text-left px-4 py-3.5 transition-colors duration-100 flex flex-col gap-1.5",
                  selected
                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-l-2 border-indigo-500"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border-l-2 border-transparent"
                )}
              >
                {/* Top: ID + status pill */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    #{ticket._id.slice(-6)}
                  </span>
                  <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full", cfg.pill)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                    {cfg.label}
                  </span>
                </div>

                {/* Title */}
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                  {ticket.title}
                </p>

                {/* Sub info */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                  {sku && <span className="truncate max-w-[100px]">{sku}</span>}
                  {sku && <span>·</span>}
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}