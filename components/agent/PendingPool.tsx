"use client";

import { Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { useTicketStore } from "@/stores/ticketStore";
import { useAgentStore } from "@/stores/agentStore";
import { useAgentSessionStore } from "@/stores/agentSessionStore";
import { Ticket, Sector } from "@/lib/mockData";

interface PendingPoolProps {
  sector: Sector;
}

export function PendingPool({ sector }: PendingPoolProps) {
  const { tickets, acceptPendingTicket } = useTicketStore();
  const { agents, incrementActiveTickets } = useAgentStore();
  const { currentAgentId } = useAgentSessionStore();

  const pendingTickets = tickets.filter(
    (t) => t.sector === sector && t.assignedAgentId === null && !t.trashed && t.status === "Open"
  );

  const currentAgent = agents.find((a) => a.id === currentAgentId);

  if (pendingTickets.length === 0) return null;

  const handleAccept = (ticket: Ticket) => {
    if (!currentAgent) return;
    acceptPendingTicket(ticket.id, currentAgent);
    incrementActiveTickets(currentAgent.id);
  };

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-amber-200 dark:border-amber-700/40">
        <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Sector Pending Tickets
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500">
            All {sector} agents are at capacity. You can accept these voluntarily.
          </p>
        </div>
        <span className="ml-auto text-xs font-bold bg-amber-200 dark:bg-amber-700/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
          {pendingTickets.length}
        </span>
      </div>

      {/* Ticket list */}
      <div className="divide-y divide-amber-100 dark:divide-amber-800/30">
        {pendingTickets.map((ticket) => (
          <div key={ticket.id} className="flex items-center gap-4 px-5 py-3.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400">{ticket.id}</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{ticket.nature}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {ticket.productName} · {ticket.userName}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {format(new Date(ticket.createdAt), "MMM d, h:mm a")}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleAccept(ticket)}
              className="shrink-0 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Accept
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
