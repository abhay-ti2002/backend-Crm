"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Ticket, Users, Package, FileText, UserCog,
  PanelLeftClose, PanelRightClose, ChevronRight,
  Star, Inbox, CircleDot, Trash2, Mail, TicketCheck, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTicketStore } from "@/stores/ticketStore";
import { useAdminSessionStore } from "@/stores/adminSessionStore";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { href: "/admin",          label: "Dashboard",  Icon: LayoutDashboard, iconClass: "text-indigo-400"  },
  { href: "/admin/tickets",  label: "Tickets",    Icon: Ticket,          iconClass: "text-sky-400"     },
  { href: "/admin/agents",   label: "Agents",     Icon: UserCog,         iconClass: "text-violet-400"  },
  { href: "/admin/products", label: "Products",   Icon: Package,         iconClass: "text-emerald-400" },
  { href: "/admin/logs",     label: "Logs",       Icon: FileText,        iconClass: "text-amber-400"   },
  // { href: "/admin/users",    label: "Users",      Icon: Users,           iconClass: "text-rose-400"    },
];

const labelItems = [
  { key: "New",        label: "New",        Icon: Inbox,     countKey: "new"        as const, iconClass: "text-sky-400"    },
  { key: "Assigned",   label: "Assigned",   Icon: CircleDot, countKey: "assigned"   as const, iconClass: "text-violet-400" },
  { key: "Unassigned", label: "Unassigned", Icon: Mail,      countKey: "unassigned" as const, iconClass: "text-slate-400"  },
  { key: "Starred",    label: "Starred",    Icon: Star,      countKey: "starred"    as const, iconClass: "text-amber-400"  },
  { key: "Trashed",    label: "Trashed",    Icon: Trash2,    countKey: "trashed"    as const, iconClass: "text-rose-500"   },
];

// Shared easing — ease-out-quart: fast start, smooth deceleration
const EASE = "cubic-bezier(0.25, 1, 0.5, 1)";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminSessionStore();
  const tickets = useTicketStore((s) => s.tickets);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const counts = {
    new:        tickets.filter((t) => t.label === "New"        && !t.trashed).length,
    assigned:   tickets.filter((t) => t.label === "Assigned"   && !t.trashed).length,
    unassigned: tickets.filter((t) => t.label === "Unassigned" && !t.trashed).length,
    starred:    tickets.filter((t) => t.starred                && !t.trashed).length,
    trashed:    tickets.filter((t) => t.trashed).length,
  };

  return (
    <aside
      style={{ transitionTimingFunction: EASE, willChange: "width" }}
      className={cn(
        "shrink-0 bg-slate-900 border-r border-white/10 flex flex-col h-full",
        "border-t-2 border-t-indigo-500 overflow-hidden",
        "transition-[width] duration-300",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* ── Header: brand + toggle ───────────────────────────────────── */}
      <div className="h-14 flex items-center border-b border-white/10 shrink-0 px-3 gap-1">
        {/* Brand name */}
        <span
          style={{ transitionTimingFunction: EASE }}
          className={cn(
            "font-heading text-lg font-bold text-white tracking-tight",
            "overflow-hidden whitespace-nowrap flex items-center gap-1.5",
            "transition-[max-width,opacity,transform] duration-300",
            collapsed
              ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
              : "max-w-44 opacity-100 translate-x-0 pl-2"
          )}
        >
          <div className="group flex items-center justify-center gap-2">
            <TicketCheck className="w-5 h-5 -rotate-30 group-hover:rotate-0 transition-all duration-500 text-indigo-400 shrink-0" />
            <a href="/" className="cursor-pointer">TICKR</a>
          </div>
        </span>

        {/* Toggle button — PanelLeftClose when open, PanelRightClose when collapsed */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
            "text-slate-500 hover:text-white hover:bg-white/10",
            "transition-colors duration-150 active:scale-95",
            collapsed ? "ml-auto mr-auto" : "ml-auto"
          )}
        >
          {collapsed
            ? <PanelRightClose className="w-4 h-4" />
            : <PanelLeftClose  className="w-4 h-4" />
          }
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">

        {/* Main navigation */}
        {mainNav.map(({ href, label, Icon, iconClass }, idx) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "group flex items-center py-2 rounded-lg text-sm font-medium",
                "transition-colors duration-150",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                active
                  ? "bg-indigo-500 text-white"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  "transition-transform duration-150 group-hover:scale-110 group-active:scale-95",
                  active ? "text-white" : iconClass
                )}
              />

              <span
                style={{
                  transitionTimingFunction: EASE,
                  transitionDelay: collapsed ? "0ms" : `${idx * 18}ms`,
                }}
                className={cn(
                  "overflow-hidden whitespace-nowrap",
                  "transition-[max-width,opacity] duration-280",
                  collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
                )}
              >
                {label}
              </span>

              {active && !collapsed && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-indigo-300" />
              )}
            </Link>
          );
        })}

        {/* Section divider */}
        <div
          style={{ transitionTimingFunction: EASE }}
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-250",
            collapsed ? "max-h-0 opacity-0" : "max-h-16 opacity-100"
          )}
        >
          <Separator className="my-3 bg-white/10" />
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Ticket Views
          </p>
        </div>

        {/* Ticket label quick-filters */}
        {labelItems.map(({ key, label, Icon, countKey, iconClass }, idx) => {
          const count = counts[countKey] ?? 0;
          return (
            <Link
              key={key}
              href={`/admin/tickets?label=${key}`}
              title={collapsed ? label : undefined}
              className={cn(
                "group flex items-center py-2 rounded-lg text-sm font-medium",
                "text-slate-400 hover:bg-white/10 hover:text-white transition-colors duration-150",
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  "transition-transform duration-150 group-hover:scale-110 group-active:scale-95",
                  iconClass
                )}
              />

              <span
                style={{
                  transitionTimingFunction: EASE,
                  transitionDelay: collapsed ? "0ms" : `${(mainNav.length + idx) * 18}ms`,
                }}
                className={cn(
                  "overflow-hidden whitespace-nowrap",
                  "transition-[max-width,opacity] duration-280",
                  collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
                )}
              >
                {label}
              </span>

              {count > 0 && !collapsed && (
                <span className="ml-auto text-xs bg-white/10 text-slate-300 rounded-full px-1.5 py-0.5 leading-none shrink-0">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: admin profile ────────────────────────────────────── */}
      <div
        style={{ transitionTimingFunction: EASE }}
        className={cn(
          "border-t border-white/10 shrink-0 transition-[padding] duration-300",
          collapsed ? "p-2" : "p-4"
        )}>

        {/* Sign out button */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "group w-full flex items-center rounded-lg text-sm font-medium",
            "text-slate-400 hover:text-rose-400 hover:bg-white/5 active:scale-[0.97]",
            "transition-[color,background-color,transform] duration-150",
            collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"
          )}
        >
          <LogOut className={cn(
            "w-4 h-4 shrink-0",
            !collapsed && "transition-transform duration-150 group-hover:translate-x-0.5"
          )} />
          <span
            style={{ transitionTimingFunction: EASE }}
            className={cn(
              "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-280",
              collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
            )}
          >
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
