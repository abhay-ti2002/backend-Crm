"use client";

import { useState } from "react";
import { Package, Paperclip, ChevronDown, ChevronUp, AlertTriangle, Clock, User } from "lucide-react";
import { Ticket } from "@/lib/mockData";
import { useTicketStore } from "@/stores/ticketStore";
import { users } from "@/lib/mockData";
import { products } from "@/lib/mockData";
import { format } from "date-fns";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface CustomerPanelProps {
  ticket: Ticket;
}

export function CustomerPanel({ ticket }: CustomerPanelProps) {
  const { tickets } = useTicketStore();
  const [descExpanded, setDescExpanded] = useState(false);

  const customer = users.find((u) => u.id === ticket.userId);
  const product = products.find((p) => p.id === ticket.itemId);

  // Ticket stats for this customer
  const customerTickets = tickets.filter((t) => t.userId === ticket.userId);
  const openCount = customerTickets.filter((t) => !["Resolved", "Closed"].includes(t.status) && !t.trashed).length;
  const resolvedCount = customerTickets.filter((t) => ["Resolved", "Closed"].includes(t.status)).length;

  // History: other tickets by this customer, most recent first
  const history = customerTickets
    .filter((t) => t.id !== ticket.id && !t.trashed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const shortDesc = ticket.description.slice(0, 100);
  const needsTruncation = ticket.description.length > 100;

  return (
    <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">

      {/* ── Customer Identity ── */}
      <section className="pb-5">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Customer</p>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
            {customer?.avatar ?? <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {customer?.name ?? ticket.userName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{customer?.email ?? ticket.userEmail}</p>
            {customer?.lastActive && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last active {format(new Date(customer.lastActive), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>

        {/* Ticket stats */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "Total", value: customerTickets.length },
            { label: "Open", value: openCount },
            { label: "Resolved", value: resolvedCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800/60 rounded-lg px-2 py-2 text-center">
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono tabular-nums">{value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Current Ticket ── */}
      <section className="py-5">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Current Ticket</p>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{ticket.id}</span>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            Created {format(new Date(ticket.createdAt), "MMM d, yyyy · h:mm a")}
          </p>

          {/* Issue nature */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Issue</p>
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-snug">{ticket.nature}</p>
          </div>

          {/* Description with truncation */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Description</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {descExpanded || !needsTruncation ? ticket.description : `${shortDesc}…`}
            </p>
            {needsTruncation && (
              <button
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-1 flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium"
              >
                {descExpanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
              </button>
            )}
          </div>

          {/* Attachment */}
          {ticket.attachment && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
              <Paperclip className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{ticket.attachment}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Product ── */}
      {product && (
        <section className="py-5">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Product</p>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{product.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{product.category} · {product.id}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Stock: <span className="font-semibold text-slate-700 dark:text-slate-200">{product.stock} {product.unit}</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tickets: <span className="font-semibold text-slate-700 dark:text-slate-200">{product.ticketCount}</span>
                </span>
              </div>
              {product.stock <= 5 && (
                <div className="mt-2 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md px-2.5 py-1.5">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span className="text-[11px] font-medium">Low stock</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Ticket History ── */}
      <section className="pt-5">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Ticket History
        </p>
        {history.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No other tickets from this customer.</p>
        ) : (
          <div className="space-y-2">
            {history.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">{t.id}</span>
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 truncate leading-snug">{t.productName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {format(new Date(t.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
