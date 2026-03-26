"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket, CheckCircle, Clock, Users, Star, Trash2, Inbox,
  CircleDot, Mail, TrendingUp, Award, ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTicketStore } from "@/stores/ticketStore";
import { useAgentStore } from "@/stores/agentStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import type { Agent } from "@/lib/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LabelList, Cell,
} from "recharts";

const ticketTrendData = [
  { date: "Mar 17", open: 3, resolved: 5 },
  { date: "Mar 18", open: 5, resolved: 4 },
  { date: "Mar 19", open: 7, resolved: 3 },
  { date: "Mar 20", open: 6, resolved: 6 },
  { date: "Mar 21", open: 4, resolved: 7 },
  { date: "Mar 22", open: 8, resolved: 5 },
  { date: "Mar 23", open: 5, resolved: 8 },
  { date: "Mar 24", open: 4, resolved: 3 },
];

const sectorData = [
  { name: "IT",         value: 5, fill: "#818cf8" },
  { name: "Healthcare", value: 3, fill: "#4ade80" },
  { name: "Education",  value: 2, fill: "#facc15" },
  { name: "Finance",    value: 2, fill: "#fb7185" },
];


interface CountCardProps {
  label: string;
  count: number;
  Icon: React.ElementType;
  iconClass: string;
  bgClass: string;
  href: string;
}

function GreetingBanner({ unassigned, high }: { unassigned: number; high: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const sub = unassigned > 0
    ? `${unassigned} ticket${unassigned !== 1 ? "s" : ""} waiting for sector assignment.`
    : high > 0
      ? `${high} high-priority ticket${high !== 1 ? "s" : ""} need${high === 1 ? "s" : ""} your attention.`
      : "All tickets are assigned and on track.";

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl px-6 py-4">
      <div className="absolute left-0 inset-y-0 w-1 bg-indigo-400/70 dark:bg-indigo-500/60 rounded-l-xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="font-heading text-lg font-semibold text-slate-800 dark:text-slate-100">{greeting}, Admin.</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
        </div>
        {high > 0 && (
          <Link
            href="/admin/tickets?priority=High"
            className="shrink-0 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-colors duration-150 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {high} high priority
          </Link>
        )}
      </div>
    </div>
  );
}

function CountCard({ label, count, Icon, iconClass, bgClass, href }: CountCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 cursor-pointer border-slate-200 dark:border-slate-700">
        <CardContent className="p-5 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
            <Icon className={`w-5 h-5 ${iconClass}`} />
          </div>
          <div>
            <p className="font-heading text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none">{count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase mt-1">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const MINI_TH = "py-2.5 px-5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500";
const ROW = "border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-100";

/* ── Agent Heatmap ───────────────────────────────────────────────── */
const HEAT_METRICS = [
  { key: "resolvedTickets" as const, label: "Resolved", hue: "indigo" as const },
  { key: "activeTickets"   as const, label: "Active",   hue: "amber"  as const },
];
const RANK_COLORS = [
  "text-amber-500 dark:text-amber-400",
  "text-slate-400 dark:text-slate-500",
  "text-orange-500 dark:text-orange-400",
  "text-slate-400 dark:text-slate-500",
  "text-slate-400 dark:text-slate-500",
];
const RANK_LABELS = ["1st", "2nd", "3rd", "4th", "5th"];
const LEVEL_STYLE: Record<string, { bg: string; fg: string }> = {
  L1: { bg: "rgba(129,140,248,0.15)", fg: "#6366f1" },
  L2: { bg: "rgba(139, 92,246,0.15)", fg: "#7c3aed" },
  L3: { bg: "rgba(192,132,252,0.15)", fg: "#9333ea" },
};

function heatBg(hue: "indigo" | "amber", t: number): string {
  const a = (0.1 + t * 0.82).toFixed(2);
  return hue === "indigo"
    ? `rgba(99,102,241,${a})`
    : `rgba(245,158,11,${a})`;
}
function heatFg(hue: "indigo" | "amber", t: number): string {
  if (t > 0.52) return "#fff";
  return hue === "indigo" ? "#4338ca" : "#b45309";
}

function AgentHeatmap({ agents }: { agents: Agent[] }) {
  const maxResolved = Math.max(...agents.map((a) => a.resolvedTickets), 1);
  const maxActive   = Math.max(...agents.map((a) => a.activeTickets), 1);
  const maxes = { resolvedTickets: maxResolved, activeTickets: maxActive };
  const cols  = `4rem repeat(${agents.length}, 1fr)`;

  return (
    <div className="w-full h-full flex flex-col gap-1">
      {/* Column headers */}
      <div className="grid gap-1 shrink-0" style={{ gridTemplateColumns: cols }}>
        <div />
        {agents.map((a, i) => (
          <div key={a.id} className="flex flex-col items-center pb-0.5 min-w-0">
            <span className={`text-[10px] font-bold tabular-nums ${RANK_COLORS[i]}`}>
              {RANK_LABELS[i]}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-full text-center leading-tight">
              {a.name.split(" ")[0]}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-full text-center">
              {a.sector}
            </span>
          </div>
        ))}
      </div>

      {/* Resolved + Active rows */}
      {HEAT_METRICS.map(({ key, label, hue }) => (
        <div key={key} className="grid gap-1 flex-1 items-stretch" style={{ gridTemplateColumns: cols }}>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 leading-tight self-center">
            {label}
          </span>
          {agents.map((a) => {
            const val = a[key];
            const t   = val / maxes[key];
            return (
              <div
                key={a.id}
                className="rounded-lg flex items-center justify-center text-xs font-bold transition-transform duration-150 hover:scale-[1.05] cursor-default select-none"
                style={{ backgroundColor: heatBg(hue, t), color: heatFg(hue, t) }}
                title={`${a.name} — ${label}: ${val}`}
              >
                {val}
              </div>
            );
          })}
        </div>
      ))}

      {/* Level row */}
      <div className="grid gap-1 flex-1 items-stretch" style={{ gridTemplateColumns: cols }}>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 leading-tight self-center">
          Level
        </span>
        {agents.map((a) => {
          const { bg, fg } = LEVEL_STYLE[a.level] ?? { bg: "rgba(148,163,184,0.15)", fg: "#64748b" };
          return (
            <div
              key={a.id}
              className="rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: bg, color: fg }}
            >
              {a.level}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const tickets = useTicketStore((s) => s.tickets);
  const counts = {
    total:      tickets.filter((t) => !t.trashed).length,
    new:        tickets.filter((t) => t.label === "New"        && !t.trashed).length,
    assigned:   tickets.filter((t) => t.label === "Assigned"   && !t.trashed).length,
    unassigned: tickets.filter((t) => t.label === "Unassigned" && !t.trashed).length,
    starred:    tickets.filter((t) => t.starred                && !t.trashed).length,
    trashed:    tickets.filter((t) => t.trashed).length,
    high:       tickets.filter((t) => t.priority === "High"    && !t.trashed).length,
    medium:     tickets.filter((t) => t.priority === "Medium"  && !t.trashed).length,
    low:        tickets.filter((t) => t.priority === "Low"     && !t.trashed).length,
  };
  const agents = useAgentStore((s) => s.agents);

  const recentTickets = [...tickets]
    .filter((t) => !t.trashed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const topAgents = [...agents]
    .sort((a, b) => b.resolvedTickets - a.resolvedTickets)
    .slice(0, 5);

  // Animate charts on initial mount only — prevents re-animation on sidebar resize
  const [animateOnce, setAnimateOnce] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setAnimateOnce(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div 
    style={{
      backgroundImage: "radial-gradient(rgba(99,102,241,0.6) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    }}
    className="space-y-6">
      {/* Time-aware greeting */}
      <GreetingBanner unassigned={counts.unassigned} high={counts.high} />

      {/* Ticket Count Strip */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <CountCard label="Total"      count={counts.total}      Icon={Ticket}    iconClass="text-indigo-600 dark:text-indigo-400"  bgClass="bg-indigo-50 dark:bg-indigo-500/20"  href="/admin/tickets" />
        <CountCard label="New"        count={counts.new}        Icon={Inbox}     iconClass="text-blue-600 dark:text-blue-400"    bgClass="bg-blue-50 dark:bg-blue-500/20"    href="/admin/tickets?label=New" />
        <CountCard label="Assigned"   count={counts.assigned}   Icon={CircleDot} iconClass="text-violet-600 dark:text-violet-400" bgClass="bg-violet-50 dark:bg-violet-500/20"  href="/admin/tickets?label=Assigned" />
        <CountCard label="Unassigned" count={counts.unassigned} Icon={Mail}      iconClass="text-amber-600 dark:text-amber-400"   bgClass="bg-amber-50 dark:bg-amber-500/20"   href="/admin/tickets?label=Unassigned" />
        <CountCard label="Starred"    count={counts.starred}    Icon={Star}      iconClass="text-yellow-600 dark:text-yellow-400" bgClass="bg-yellow-50 dark:bg-yellow-500/20"  href="/admin/tickets?label=Starred" />
        <CountCard label="Trashed"    count={counts.trashed}    Icon={Trash2}    iconClass="text-red-500 dark:text-red-400"     bgClass="bg-red-50 dark:bg-red-500/20"      href="/admin/tickets?label=Trashed" />
      </div>

      {/* Priority & Status Strip */}
      <div className="flex items-center justify-center gap-5 px-1 flex-wrap w-full border-slate-200 dark:border-slate-700 p-2 rounded-lg bg-white dark:bg-slate-800">
        <span
        style={{
          fontFamily: "Jost"
        }} 
        className="font-bold">TASKS</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span className="text-sm text-slate-500 dark:text-slate-400">HIGH</span>
          <span className="font-heading text-base font-bold text-slate-800 dark:text-slate-100 tabular-nums">{counts.high}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span className="text-sm text-slate-500 dark:text-slate-400">MEDIUM</span>
          <span className="font-heading text-base font-bold text-slate-800 dark:text-slate-100 tabular-nums">{counts.medium}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-sm text-slate-500 dark:text-slate-400">LOW</span>
          <span className="font-heading text-base font-bold text-slate-800 dark:text-slate-100 tabular-nums">{counts.low}</span>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
          <span className="tabular-nums">{tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length}</span> RESOLVED
        </span>
        <span className="flex font-semibold items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="tabular-nums">{tickets.filter(t => t.status === "In Progress").length}</span> IN PROGRESS
        </span>
        <span className="flex font-semibold items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="tabular-nums">{agents.filter(a => a.online).length}</span> ONLINE
        </span>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticket Trend */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700">
          <CardHeader className="pt-4 pb-3">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Ticket Trend — Last 8 Days</span>
              <div className="ml-auto flex items-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400/80" />Open</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-400/80" />Resolved</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200} debounce={0}>
              <AreaChart data={ticketTrendData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-700/60" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "currentColor", className: "text-slate-400 dark:text-slate-500" }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor", className: "text-slate-400 dark:text-slate-500" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ fontWeight: 600 }}
                  cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 2" }}
                />
                <Area
                  type="monotone"
                  dataKey="open"
                  name="Open"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#gradOpen)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#22d3ee" }}
                  isAnimationActive={animateOnce}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="url(#gradResolved)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#4ade80" }}
                  isAnimationActive={animateOnce}
                  animationDuration={900}
                  animationEasing="ease-out"
                  animationBegin={150}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Distribution */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pt-4 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tickets by Sector</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200} debounce={0}>
              <BarChart
                data={sectorData}
                layout="vertical"
                margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-slate-100 dark:text-slate-700/60" />
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor", className: "text-slate-500 dark:text-slate-400" }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  cursor={{ fill: "currentColor", className: "text-slate-100/60 dark:text-slate-700/30" }}
                  formatter={(v: number | any) => [v, "Tickets"]}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={animateOnce}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {sectorData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    style={{ fontSize: 11, fontWeight: 700, fill: "currentColor" }}
                    className="text-slate-600 dark:text-slate-300"
                    formatter={(v: number | any) => {
                      const total = sectorData.reduce((sum, x) => sum + x.value, 0);
                      return `${v} (${Math.round((v / total) * 100)}%)`;
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tickets */}
        <Card className="border-slate-200 dark:border-slate-700 flex flex-col h-[340px]">
          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            {/* Sticky header */}
            <div className="grid grid-cols-[1fr_5.5rem_8.5rem_4.5rem] border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 shrink-0">
              <div className={MINI_TH}>ID / Nature</div>
              <div className={MINI_TH}>Priority</div>
              <div className={MINI_TH}>Status</div>
              <div className={`${MINI_TH} text-right`}>Date</div>
            </div>
            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:var(--color-slate-300)_transparent] dark:[scrollbar-color:var(--color-slate-700)_transparent]">
              {recentTickets.map((t) => (
                <div key={t.id} className={`grid grid-cols-[1fr_5.5rem_8.5rem_4.5rem] ${ROW} group/row`}>
                  <div className="py-2.5 px-5 min-w-0">
                    <Link href={`/admin/tickets/${t.id}`} className="block min-w-0">
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{t.id}</span>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors">{t.nature}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{t.userName}</p>
                    </Link>
                  </div>
                  <div className="py-2.5 px-5 flex items-start pt-3">
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="py-2.5 px-5 flex items-start pt-3">
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="py-2.5 px-5 text-right flex items-start justify-end pt-3 text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                    {format(new Date(t.createdAt), "MMM d")}
                  </div>
                </div>
              ))}
            </div>
            {/* Pinned footer */}
            <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-700/50 shrink-0">
              <Link
                href="/admin/tickets"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 w-fit transition-colors"
              >
                View all tickets <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Agents */}
        <Card className="border-slate-200 dark:border-slate-700 flex flex-col h-[340px]">
          <CardHeader className="pt-3 pb-2 shrink-0">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Top Agents by Resolved
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-3 flex-1 min-h-0">
            <AgentHeatmap agents={topAgents} />
          </CardContent>
          <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-700/50 shrink-0">
            <Link
              href="/admin/agents"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 w-fit transition-colors"
            >
              View all agents <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
