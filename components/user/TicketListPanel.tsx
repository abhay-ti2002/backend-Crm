"use client";

import { useRouter } from "next/navigation";
import { Inbox, LogOut } from "lucide-react";
import { useTicketStore } from "@/stores/ticketStore";
import { useUserSessionStore } from "@/stores/userSessionStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TicketListPanelProps {
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
}

export function TicketListPanel({ selectedTicketId, onSelectTicket }: TicketListPanelProps) {
  const router = useRouter();
  const { currentUserId, logout } = useUserSessionStore();
  const { tickets } = useTicketStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const myTickets = tickets
    .filter((t) => t.userId === currentUserId && !t.trashed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="w-80 shrink-0 flex flex-col h-full border-r border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900">

      {/* Panel header */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">My Tickets</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">
          {myTickets.length} {myTickets.length === 1 ? "ticket" : "tickets"}
        </p>
      </div>

      {/* Ticket list — flex-1 + min-h-0 lets it shrink so the footer stays pinned */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {myTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 dark:text-slate-500 px-6 text-center">
            <Inbox className="w-10 h-10 opacity-40" />
            <div>
              <p className="text-sm font-medium">No tickets yet</p>
              <p className="text-xs mt-0.5">Click + to raise your first ticket</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              return (
                <button
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket.id)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 flex flex-col gap-1.5 transition-colors duration-100",
                    "border-l-2",
                    isSelected
                      ? "bg-indigo-50/60 dark:bg-indigo-500/10 border-l-indigo-500"
                      : "border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  {/* ID + date */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-sky-500 dark:text-sky-400 shrink-0">
                      {ticket.id}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                      {format(new Date(ticket.createdAt), "MMM d")}
                    </span>
                  </div>

                  {/* Nature / problem title */}
                  <p className={cn(
                    "text-xs leading-snug line-clamp-1",
                    isSelected
                      ? "font-medium text-slate-800 dark:text-slate-100"
                      : "text-slate-600 dark:text-slate-300"
                  )}>
                    {ticket.nature}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: sign out */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-3">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
            "text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400",
            "hover:bg-rose-50 dark:hover:bg-rose-500/10 active:scale-[0.98]",
            "transition-[color,background-color,transform] duration-150"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}
