"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell, Sun, Moon, CheckCircle2, Clock, ArrowUpCircle, Ticket,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAgentSessionStore } from "@/stores/agentSessionStore";
import { useAgentStore } from "@/stores/agentStore";
import { useTicketStore } from "@/stores/ticketStore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AgentTopbarProps {
  collapsed?: boolean;
}

const PAGE_TITLES: Record<string, string> = {
  "/agent/dashboard": "Dashboard",
  "/agent/tickets":   "My Tickets",
};

type NotifType = "assigned" | "escalated" | "resolved";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  subtitle: string;
  time: Date;
  read: boolean;
}

const notifIcon: Record<NotifType, React.ElementType> = {
  assigned:  Ticket,
  escalated: ArrowUpCircle,
  resolved:  CheckCircle2,
};
const notifColor: Record<NotifType, string> = {
  assigned:  "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
  escalated: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
  resolved:  "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
};

export function AgentTopbar({ collapsed }: AgentTopbarProps) {
  const pathname          = usePathname();
  const { theme, toggle } = useTheme();
  const { currentAgentId } = useAgentSessionStore();
  const { agents }         = useAgentStore();
  const { tickets }        = useTicketStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds,   setReadIds]   = useState<Set<string>>(new Set());

  const agent = agents.find((a) => a.id === currentAgentId);

  // Derive notifications from agent's recent ticket events
  const notifications: Notif[] = agent
    ? tickets
        .filter((t) => !t.trashed && (
          t.assignedAgentId === agent.id ||
          t.escalationSteps.some((s) => s.agentId === agent.id)
        ))
        .slice(0, 6)
        .map((t): Notif => {
          const isResolved = t.status === "Resolved" || t.status === "Closed";
          const isEscalated = t.status.startsWith("Escalated");
          const type: NotifType = isResolved ? "resolved" : isEscalated ? "escalated" : "assigned";
          return {
            id:       t.id,
            type,
            title:    `${t.id} — ${
              type === "resolved" ? "Resolved" :
              type === "escalated" ? `Escalated to ${t.status.replace("Escalated to ", "")}` :
              "Assigned to you"
            }`,
            subtitle: t.nature,
            time:     new Date(t.updatedAt),
            read:     readIds.has(t.id),
          };
        })
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  // Page title — handle dynamic ticket detail route
  const isTicketDetail = pathname.startsWith("/agent/tickets/") && pathname !== "/agent/tickets";
  const pageTitle = isTicketDetail
    ? "Ticket Detail"
    : (PAGE_TITLES[pathname] ?? "Agent Portal");

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900">

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
            "hover:bg-slate-100 dark:hover:bg-white/8 active:scale-90",
            "transition-[color,background-color,transform] duration-150"
          )}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark"
            ? <Sun  className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center relative",
              "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              "hover:bg-slate-100 dark:hover:bg-white/8 active:scale-90",
              "transition-[color,background-color,transform] duration-150"
            )}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/40 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Items */}
                {notifications.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                    <Bell className="w-6 h-6" />
                    <p className="text-xs font-medium">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                    {notifications.map((notif) => {
                      const Icon = notifIcon[notif.type];
                      return (
                        <div
                          key={notif.id}
                          onClick={() => setReadIds((s) => new Set([...s, notif.id]))}
                          className={cn(
                            "flex items-start gap-3 px-4 py-3 cursor-pointer",
                            "hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-100",
                            !notif.read && "bg-indigo-50/40 dark:bg-indigo-500/5"
                          )}
                        >
                          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", notifColor[notif.type])}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-xs leading-snug truncate",
                              notif.read
                                ? "text-slate-500 dark:text-slate-400"
                                : "font-semibold text-slate-800 dark:text-slate-100"
                            )}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{notif.subtitle}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              {formatDistanceToNow(notif.time, { addSuffix: true })}
                            </p>
                          </div>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-600">
                    Showing activity for your assigned tickets
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
