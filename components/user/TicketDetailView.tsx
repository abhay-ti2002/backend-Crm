"use client";

import {
  CheckCircle2, Clock, Phone, RefreshCw,
  Package, Layers, MapPin, CreditCard, User,
} from "lucide-react";
import { api } from "@/lib/api/api";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TicketDetailViewProps {
  ticketId: string;
}

// ── Status-based banner shown to the user ────────────────────────────────────
const STATUS_BANNER: Record<string, {
  icon: React.ReactNode;
  bg: string;
  title: string;
  message: string;
}> = {
  new: {
    icon: <Clock className="w-5 h-5 text-blue-500" />,
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30",
    title: "Ticket Received",
    message: "We've received your request and it will be assigned to an agent shortly. Thank you for your patience!",
  },
  forwarded: {
    icon: <Phone className="w-5 h-5 text-purple-500" />,
    bg: "bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/30",
    title: "In Progress — You May Get a Call Anytime",
    message: "Our team is actively working on your query. You may receive a call or update anytime. We are trying our best to resolve your issue as soon as possible!",
  },
  resolved: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30",
    title: "Your Query Has Been Resolved 🎉",
    message: "Thank you for reaching out to us! Your issue has been resolved. We hope you're satisfied with our support. Thank you for visiting!",
  },
  closed: {
    icon: <CheckCircle2 className="w-5 h-5 text-slate-400" />,
    bg: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
    title: "Ticket Closed",
    message: "This ticket has been closed. If you face any further issues, feel free to raise a new ticket.",
  },
};

function getBanner(status: string) {
  return STATUS_BANNER[status.toLowerCase()] ?? STATUS_BANNER["new"];
}

// ── Small info row helper ────────────────────────────────────────────────────
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

export function TicketDetailView({ ticketId }: TicketDetailViewProps) {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchTicket() {
      setLoading(true);
      setError(null);
      try {
        const data = await api(`/tickets/${ticketId}`);
        if (mounted) setTicket(data);
      } catch {
        if (mounted) setError("Could not load ticket details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (ticketId) fetchTicket();
    return () => { mounted = false; };
  }, [ticketId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <p className="text-xs">Loading ticket…</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-slate-400">
        {error ?? "Ticket not found."}
      </div>
    );
  }

  const banner  = getBanner(ticket.status);
  const order   = ticket.orderId;
  const item    = ticket.itemId;
  const agent   = ticket.assignedTo;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-6 py-6 space-y-6">

        {/* ── Ticket ID + title ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-indigo-500">
              #{ticket._id?.slice(-6) ?? ticketId.slice(-6)}
            </span>
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
              ticket.status === "resolved" || ticket.status === "closed"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                : ticket.status === "forwarded"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
            )}>
              {ticket.status}
            </span>
            {ticket.sector && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1">
                <Layers className="w-2.5 h-2.5" />
                {ticket.sector}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {ticket.title}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Raised on {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        {/* ── Status banner ── */}
        <div className={cn("rounded-xl border px-4 py-3.5 flex gap-3 items-start", banner.bg)}>
          <div className="shrink-0 mt-0.5">{banner.icon}</div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{banner.title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{banner.message}</p>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* ── Description ── */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Issue</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* ── Assigned agent ── */}
        {agent && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
            <User className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wide">Assigned Agent</p>
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{agent.name}</p>
              <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{agent.email}</p>
            </div>
          </div>
        )}

        {/* ── Item details ── */}
        {item && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Item Details</p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-3 grid grid-cols-2 gap-3">
              {item.sku        && <InfoRow icon={<Package className="w-3.5 h-3.5" />}     label="SKU"           value={item.sku} />}
              {item.serialNumber && <InfoRow icon={<Package className="w-3.5 h-3.5" />}   label="Serial No."    value={item.serialNumber} />}
              {item.location   && <InfoRow icon={<MapPin className="w-3.5 h-3.5" />}      label="Location"      value={item.location} />}
              {item.status     && <InfoRow icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Item Status"  value={item.status} />}
            </div>
          </div>
        )}

        {/* ── Order details ── */}
        {order && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Order Details</p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4 py-3 grid grid-cols-2 gap-3">
              {order.totalAmount  != null && <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Amount"         value={`₹${order.totalAmount.toLocaleString()}`} />}
              {order.paymentStatus        && <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Payment"        value={order.paymentStatus} />}
              {order.paymentMethod        && <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Method"         value={order.paymentMethod} />}
              {order.shippingAddress      && <InfoRow icon={<MapPin className="w-3.5 h-3.5" />}     label="Ship To"        value={order.shippingAddress} />}
              {order.status               && <InfoRow icon={<CheckCircle2 className="w-3.5 h-3.5"/>} label="Order Status"  value={order.status} />}
            </div>
          </div>
        )}

        {/* ── History timeline ── */}
        {ticket.history && ticket.history.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Activity</p>
            <div className="relative pl-5 space-y-4">
              {ticket.history.length > 1 && (
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
              )}
              {ticket.history.map((h: any, idx: number) => (
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
    </div>
  );
}