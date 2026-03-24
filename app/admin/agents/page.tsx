"use client";

import dynamic from "next/dynamic";
import { LayoutGrid, GitBranch, Plus, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAgentStore } from "@/stores/agentStore";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Agent, AgentLevel, Sector } from "@/lib/mockData";

// react-organizational-chart uses document — loaded client-side only
const AgentOrgChart = dynamic(
  () => import("@/components/admin/AgentOrgChart").then((m) => m.AgentOrgChart),
  { ssr: false, loading: () => <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">Loading chart…</p> }
);

const SECTORS: Sector[] = ["IT", "Healthcare", "Education", "Finance"];
const LEVELS: AgentLevel[] = ["L1", "L2", "L3"];

const levelMeta: Record<AgentLevel, { bg: string; border: string }> = {
  L1: { bg: "bg-sky-50 dark:bg-sky-500/10",    border: "border-sky-200 dark:border-sky-500/30" },
  L2: { bg: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/30" },
  L3: { bg: "bg-rose-50 dark:bg-rose-500/10",   border: "border-rose-200 dark:border-rose-500/30" },
};

const levelAvatarColor: Record<AgentLevel, string> = {
  L1: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
  L2: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  L3: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-9 h-9">
            <AvatarFallback className={`text-xs font-semibold ${levelAvatarColor[agent.level]}`}>
              {agent.avatar}
            </AvatarFallback>
          </Avatar>
          {/* Sonar ping behind the dot for online agents — communicates "live" */}
          {agent.online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-60" />
          )}
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${agent.online ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{agent.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{agent.email}</p>
        </div>
        {agent.online
          ? <Wifi className="w-3.5 h-3.5 text-green-500 shrink-0" />
          : <WifiOff className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <RoleBadge level={agent.level} showMethod={false} />
        <div className="flex gap-3 ml-auto text-xs text-slate-500 dark:text-slate-400">
          <span><span className="font-bold text-slate-700 dark:text-slate-200">{agent.activeTickets}</span> active</span>
          <span><span className="font-bold text-slate-700 dark:text-slate-200">{agent.resolvedTickets}</span> resolved</span>
        </div>
      </div>
    </div>
  );
}

function ColumnsView({ sector }: { sector: Sector }) {
  const { agentsByLevel } = useAgentStore();
  return (
    <div className="grid grid-cols-3 gap-4">
      {LEVELS.map((level) => {
        const levelAgents = agentsByLevel(sector, level);
        const meta = levelMeta[level];
        return (
          <div key={level} className={`rounded-xl border ${meta.border} ${meta.bg} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <RoleBadge level={level} />
              <span className="text-xs text-slate-400 dark:text-slate-500">{levelAgents.length} agent{levelAgents.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-3">
              {levelAgents.length === 0
                ? <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No agents</p>
                : levelAgents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentsPage() {
  const { selectedSector, viewMode, setSelectedSector, setViewMode, agents } = useAgentStore();
  const displaySector: Sector = selectedSector === "All" ? SECTORS[0] : selectedSector;

  const sectorCounts = SECTORS.reduce<Record<Sector, number>>((acc, s) => {
    acc[s] = agents.filter((a) => a.sector === s).length;
    return acc;
  }, {} as Record<Sector, number>);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h2 className="font-heading text-base font-semibold text-slate-800 dark:text-slate-100">Agent Hierarchy</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{agents.length} agents across {SECTORS.length} sectors</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Agent
        </Button>
      </div>

      {/* Sector tabs + View toggle */}
      <div className="flex items-center gap-3">
        <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 gap-1">
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSector(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                displaySector === s ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {s}
              <Badge
                variant={displaySector === s ? "secondary" : "outline"}
                className={`text-[10px] py-0 px-1.5 ${displaySector === s ? "bg-indigo-500 text-white border-0" : "dark:border-slate-600 dark:text-slate-400"}`}
              >
                {sectorCounts[s]}
              </Badge>
            </button>
          ))}
        </div>

        <div className="ml-auto flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 gap-1">
          <button
            onClick={() => setViewMode("columns")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === "columns" ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Columns
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === "chart" ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" /> Chart
          </button>
        </div>
      </div>

      {/* View */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-5">
          {viewMode === "columns"
            ? <ColumnsView sector={displaySector} />
            : <AgentOrgChart sector={displaySector} agents={agents} />}
        </CardContent>
      </Card>
    </div>
  );
}
