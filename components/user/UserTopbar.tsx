"use client";

import { useState } from "react";
import {
  Bell, Sun, Moon, Plus, TicketCheck,
  CheckCircle2, Clock, ArrowUpCircle, Ticket,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useUserSessionStore } from "@/stores/userSessionStore";
import { useTicketStore } from "@/stores/ticketStore";
import { users } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface UserTopbarProps {
  onNewTicket: () => void;
  newTicketOpen: boolean;
}

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

export function UserTopbar({ onNewTicket, newTicketOpen }: UserTopbarProps) {
  const { theme, toggle } = useTheme();
  const { currentUserId } = useUserSessionStore();
  const { tickets } = useTicketStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds,   setReadIds]   = useState<Set<string>>(new Set());

  const currentUser = users.find((u) => u.id === currentUserId);

  // Derive notifications from this user's tickets
  const userTickets = tickets.filter((t) => !t.trashed && t.userId === currentUserId);

  const notifications: Notif[] = userTickets.slice(0, 6).map((t): Notif => {
    const isResolved  = t.status === "Resolved" || t.status === "Closed";
    const isEscalated = t.status.startsWith("Escalated");
    const type: NotifType = isResolved ? "resolved" : isEscalated ? "escalated" : "assigned";
    return {
      id:       t.id,
      type,
      title:    `${t.id} — ${
        type === "resolved"  ? "Resolved" :
        type === "escalated" ? `Escalated to ${t.status.replace("Escalated to ", "")}` :
        t.assignedAgentId    ? "Assigned to an agent" : "Awaiting assignment"
      }`,
      subtitle: t.nature,
      time:     new Date(t.updatedAt),
      read:     readIds.has(t.id),
    };
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900">

      {/* Left: Logo + title */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <TicketCheck className="w-5 h-5 text-indigo-500 shrink-0" />
        <div className="min-w-0">
          <span className="font-heading font-bold text-slate-900 dark:text-white text-sm tracking-tight">TICKR</span>
          <span className="ml-2 text-xs text-slate-400 dark:text-slate-500 font-medium">User Portal</span>
        </div>
      </div>

      {/* Right actions: New → Bell → Theme → Logout */}
      <div className="flex items-center gap-1">

        {/* New Ticket button */}
        <button
          onClick={onNewTicket}
          className={cn(
            "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold",
            "transition-[background-color,color,transform] duration-150 active:scale-95",
            newTicketOpen
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/25"
          )}
          title="New Ticket"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
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

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
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

                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-600">
                    Showing updates for your tickets
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
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
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>


        {/* User avatar */}
        {currentUser && (
          <div
            className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0 ml-1"
            title={currentUser.name}
          >
            {currentUser.avatar}
          </div>
        )}

      </div>
    </header>
  );
}
