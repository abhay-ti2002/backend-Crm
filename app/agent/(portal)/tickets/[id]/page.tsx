"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft, CheckCircle2, Clock,
  PanelRightClose, PanelRightOpen,
  Package, MapPin, CreditCard, User, RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
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
  history: Array<{
    _id?: string;
    action: string;
    performedBy?: { _id: string; name: string; email: string };
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === "resolved" || s === "closed"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : s === "forwarded"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", cls)}>
      {status}
    </span>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AgentTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [ticket, setTicket]       = useState<BackendTicket | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [rightOpen, setRightOpen] = useState(true);

  // ── Redirect if not authed ────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  // ── Fetch ticket directly from API (works on refresh) ────────────────────
  useEffect(() => {
    if (!params.id) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api(`/tickets/${params.id}`);
        if (mounted) setTicket(data);
      } catch {
        if (mounted) setError("Ticket not found or you don't have access.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [params.id]);

  // ── Update status ─────────────────────────────────────────────────────────
  async function handleStatusUpdate(newStatus: string) {
    if (!ticket) return;
    try {
      const updated = await api(`/tickets/${ticket._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setTicket(updated);
    } catch {
      alert("Failed to update status. Please try again.");
    }
  }

  // ── Forward ticket ────────────────────────────────────────────────────────
  async function handleForward() {
    if (!ticket) return;
    try {
      const updated = await api(`/tickets/${ticket._id}/forward`, { method: "PATCH" });
      setTicket(updated);
    } catch {
      alert("Failed to forward ticket. Please try again.");
    }
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <p className="text-xs">Loading ticket…</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <p className="text-sm font-medium">{error ?? "Ticket not found"}</p>
        <Link href="/agent/dashboard" className="text-xs text-indigo-500 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const isTerminal = ["resolved", "closed"].includes(ticket.status.toLowerCase());
  const order      = ticket.orderId;
  const item       = ticket.itemId;
  const agent      = ticket.assignedTo;

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
        <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
          #{ticket._id.slice(-6)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            L{ticket.level}
          </span>
          <StatusChip status={ticket.status} />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* ── Col 1: Main info + history ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-w-0">

          {/* Title block */}
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {ticket.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(ticket.createdAt), "MMM d, yyyy · h:mm a")}
              </span>
              <span>{ticket.sector} sector</span>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Item details */}
          {item && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Item</p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-3 grid grid-cols-2 gap-3">
                {item.sku          && <InfoRow icon={<Package className="w-3.5 h-3.5" />}      label="SKU"          value={item.sku} />}
                {item.serialNumber && <InfoRow icon={<Package className="w-3.5 h-3.5" />}      label="Serial No."   value={item.serialNumber} />}
                {item.location     && <InfoRow icon={<MapPin className="w-3.5 h-3.5" />}       label="Location"     value={item.location} />}
                {item.status       && <InfoRow icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Item Status"  value={item.status} />}
              </div>
            </div>
          )}

          {/* Order details */}
          {order && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Order</p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-3 grid grid-cols-2 gap-3">
                {order.totalAmount != null && <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Amount"        value={`₹${order.totalAmount.toLocaleString()}`} />}
                {order.paymentStatus       && <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Payment"       value={order.paymentStatus} />}
                {order.paymentMethod       && <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Method"        value={order.paymentMethod} />}
                {order.shippingAddress     && <InfoRow icon={<MapPin className="w-3.5 h-3.5" />}     label="Ship To"       value={order.shippingAddress} />}
                {order.status              && <InfoRow icon={<CheckCircle2 className="w-3.5 h-3.5"/>} label="Order Status" value={order.status} />}
              </div>
            </div>
          )}

          {/* Activity history */}
          {ticket.history.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Activity</p>
              <div className="relative pl-5 space-y-4">
                {ticket.history.length > 1 && (
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
                )}
                {ticket.history.map((h, idx) => (
                  <div key={h._id ?? idx} className="relative flex gap-3">
                    <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-white dark:border-slate-950" />
                    <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-2 space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{h.action}</p>
                      {h.performedBy?.name && (
                        <p className="text-[10px] text-slate-400">by {h.performedBy.name}</p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {format(new Date(h.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Col 2: Actions panel ── */}
        <div
          style={{ transition: `width 300ms ${EASE}` }}
          className={cn(
            "shrink-0 flex flex-col border-l border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900",
            rightOpen ? "w-80" : "w-10"
          )}
        >
          <div className={cn(
            "h-12 shrink-0 flex items-center border-b border-slate-100 dark:border-slate-800",
            rightOpen ? "px-4 justify-between" : "justify-center"
          )}>
            {rightOpen && (
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </h2>
            )}
            <button
              onClick={() => setRightOpen((v) => !v)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {rightOpen
                ? <PanelRightClose className="w-4 h-4" />
                : <PanelRightOpen  className="w-4 h-4" />
              }
            </button>
          </div>

          <div className={cn(
            "flex-1 overflow-y-auto transition-opacity duration-200",
            rightOpen ? "opacity-100 px-4 py-5" : "opacity-0 pointer-events-none overflow-hidden"
          )}>
            {/* Assigned agent */}
            {agent && (
              <div className="mb-5 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <User className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wide">Assigned To</p>
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{agent.name}</p>
                  <p className="text-[10px] text-indigo-400">{agent.email}</p>
                </div>
              </div>
            )}

            {isTerminal ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">{ticket.status}</p>
                <p className="text-xs text-slate-400">This ticket is closed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Update Status
                </p>

                {/* Mark as resolved */}
                <button
                  onClick={() => handleStatusUpdate("resolved")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Resolved
                </button>

                {/* Forward to next level */}
                {ticket.level < 3 && (
                  <button
                    onClick={handleForward}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                  >
                    <PanelRightOpen className="w-4 h-4" />
                    Forward to L{ticket.level + 1}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}