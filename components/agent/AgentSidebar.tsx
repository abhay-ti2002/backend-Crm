"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, TrendingUp, LogOut, Wifi, WifiOff, AlertCircle, TicketCheck, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useAgentSessionStore } from "@/stores/agentSessionStore";
import { useAgentStore } from "@/stores/agentStore";
import { cn } from "@/lib/utils";
import { CAPACITY_THRESHOLD } from "@/lib/constants";

const NAV = [
  { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { label: "Ticket Progress", href: "/agent/tickets", icon: TrendingUp },
];

const availabilityConfig = {
  available:   { label: "Available",   dot: "bg-emerald-500", bar: "bg-emerald-500", textColor: "text-emerald-400", icon: Wifi,        pulse: true  },
  at_capacity: { label: "At Capacity", dot: "bg-amber-400",   bar: "bg-amber-400",   textColor: "text-amber-400",   icon: AlertCircle, pulse: false },
  offline:     { label: "Offline",     dot: "bg-slate-500",   bar: "bg-slate-500",   textColor: "text-slate-400",   icon: WifiOff,     pulse: false },
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

interface AgentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AgentSidebar({ collapsed, onToggle }: AgentSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { currentAgentId, logout } = useAgentSessionStore();
  const { agents, setOffline }     = useAgentStore();

  const agent = agents.find((a) => a.id === currentAgentId);

  const handleLogout = () => {
    if (agent) setOffline(agent.id, true); // online: false, availability: "offline"
    logout();
    router.push("/login");
  };

  const avail     = agent ? availabilityConfig[agent.availability] : availabilityConfig.offline;
  const AvailIcon = avail.icon;

  const usedSlots  = agent?.activeTickets ?? 0;
  const freeSlots  = Math.max(CAPACITY_THRESHOLD - usedSlots, 0);
  const pct        = Math.min(usedSlots / CAPACITY_THRESHOLD, 1);

  return (
    <aside
      style={{ transition: `width 320ms ${EASE}` }}
      className={cn(
        "shrink-0 flex flex-col h-screen bg-slate-900 border-r border-white/10 overflow-hidden",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* ── Logo + toggle ── */}
      <div className="h-14 flex items-center border-b border-white/10 shrink-0 px-3 gap-2">
        {/* Expanded: logo left, toggle right */}
        {!collapsed && (
          <>
            <div className="group flex items-center gap-2 flex-1 min-w-0">
              <TicketCheck className="w-5 h-5 -rotate-12 group-hover:rotate-0 transition-transform duration-500 text-indigo-400 shrink-0" />
              <span className="font-heading font-bold text-white text-base tracking-tight whitespace-nowrap">TICKR</span>
              <span className="text-xs font-medium text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded whitespace-nowrap">
                Agent
              </span>
            </div>
            <button
              onClick={onToggle}
              title="Close sidebar"
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-150"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
        {/* Collapsed: toggle centered */}
        {collapsed && (
          <button
            onClick={onToggle}
            title="Open sidebar"
            className="w-full flex justify-center items-center py-1 text-slate-400 hover:text-white active:scale-90 transition-all duration-150"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Agent identity ── */}
      {agent && (
        <div
          style={{ transition: `padding 320ms ${EASE}` }}
          className={cn(
            "border-b border-white/10 shrink-0",
            collapsed ? "px-2 py-3" : "px-4 py-4"
          )}
        >
          {/* Avatar row */}
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            {/* Avatar with online-status ring dot */}
            <div className="relative shrink-0">
              <div
                title={collapsed ? agent.name : undefined}
                className={cn(
                  "w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center",
                  "text-white text-xs font-bold",
                  "ring-2 ring-transparent hover:ring-indigo-400/50 transition-shadow duration-200"
                )}
              >
                {agent.avatar}
              </div>
              {/* Online indicator dot */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900",
                  avail.dot,
                  avail.pulse && "animate-pulse"
                )}
              />
            </div>

            {/* Name + sector */}
            <div
              style={{ transition: `opacity 180ms ${EASE}, width 320ms ${EASE}` }}
              className={cn(
                "min-w-0 overflow-hidden",
                collapsed ? "w-0 opacity-0" : "flex-1 opacity-100"
              )}
            >
              <p className="text-sm font-semibold text-white truncate leading-tight whitespace-nowrap">{agent.name}</p>
              <p className="text-xs text-slate-400 truncate whitespace-nowrap">{agent.sector} · {agent.level}</p>
            </div>
          </div>

          {/* Expanded: availability indicator + capacity meter */}
          <div
            style={{ transition: `opacity 180ms ${EASE}` }}
            className={cn(collapsed ? "opacity-0 pointer-events-none h-0 overflow-hidden" : "opacity-100 mt-3 space-y-2")}
          >
            {/* Read-only availability indicator */}
            <div className={cn(
              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium",
              "bg-white/5",
              avail.textColor
            )}>
              <AvailIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{avail.label}</span>
            </div>

            {/* Slot capacity meter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Capacity</span>
                <span className={cn("text-[10px] font-bold tabular-nums", avail.textColor)}>
                  {usedSlots}/{CAPACITY_THRESHOLD}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", avail.bar)}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {freeSlots > 0
                  ? `${freeSlots} slot${freeSlots !== 1 ? "s" : ""} free`
                  : "At full capacity"}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }, idx) => {
          const active = pathname === href ||
            (href !== "/agent/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{ animation: `sidebar-nav-in 280ms ${EASE} ${idx * 60}ms both` }}
              className={cn(
                "group flex items-center rounded-lg text-sm font-medium",
                "transition-colors duration-150 active:scale-[0.97]",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
                active
                  ? "bg-indigo-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/8"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 shrink-0",
                !active && !collapsed && "transition-transform duration-150 group-hover:translate-x-0.5"
              )} />
              <span
                style={{ transition: `opacity 180ms ${EASE}` }}
                className={cn("overflow-hidden whitespace-nowrap", collapsed ? "w-0 opacity-0" : "opacity-100")}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Sign out ── */}
      <div className="px-2 py-3 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "group w-full flex items-center rounded-lg text-sm font-medium",
            "text-slate-400 hover:text-rose-400 hover:bg-white/5 active:scale-[0.97]",
            "transition-[color,background-color,transform] duration-150",
            collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2"
          )}
        >
          <LogOut className={cn(
            "w-4 h-4 shrink-0",
            !collapsed && "transition-transform duration-150 group-hover:translate-x-0.5"
          )} />
          <span
            style={{ transition: `opacity 180ms ${EASE}` }}
            className={cn("overflow-hidden whitespace-nowrap", collapsed ? "w-0 opacity-0" : "opacity-100")}
          >
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
