"use client";

import { useState } from "react";
import { ChevronDown, X, FileText, SlidersHorizontal, Building2, GitBranch, Zap, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLogStore } from "@/stores/logStore";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { MethodBadge } from "@/components/shared/MethodBadge";
import { Sector, AgentLevel, ResolutionMethod, TicketPriority } from "@/lib/mockData";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const sectorClass: Record<string, string> = {
  IT:         "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30",
  Healthcare: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  Education:  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  Finance:    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30",
};

const methodAccent: Record<string, string> = {
  Email: "border-l-sky-400",
  Call:  "border-l-violet-400",
  Visit: "border-l-orange-400",
};

const methodBg: Record<string, string> = {
  Email: "bg-sky-50/60 dark:bg-sky-500/5",
  Call:  "bg-violet-50/60 dark:bg-violet-500/5",
  Visit: "bg-orange-50/60 dark:bg-orange-500/5",
};

const COLS = "grid-cols-[2.5rem_5.5rem_1fr_7rem_6rem_8rem_7rem_5rem_8.5rem]";
const TH = "py-3 px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500";

export default function LogsPage() {
  const { filters, setFilter, resetFilters, filteredLogs } = useLogStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const logs = filteredLogs();

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const activeCount = [
    filters.sector !== "All",
    filters.level !== "All",
    filters.method !== "All",
    filters.priority !== "All",
    !!filters.agentName,
    !!filters.itemId,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-heading text-base font-semibold text-slate-800 dark:text-slate-100">
          Resolution Logs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {logs.length} log{logs.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 shadow-sm">
        <div className="flex items-center gap-1.5 px-2 mr-0.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Filters</span>
        </div>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        <Select value={filters.sector} onValueChange={(v) => setFilter("sector", v as Sector | "All")}>
          <SelectTrigger className="border-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:border-transparent h-7 text-xs px-2 w-auto gap-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Building2 className="w-3 h-3 text-indigo-400 dark:text-indigo-400 shrink-0" />
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sectors</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        <Select value={filters.level} onValueChange={(v) => setFilter("level", v as AgentLevel | "All")}>
          <SelectTrigger className="border-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:border-transparent h-7 text-xs px-2 w-auto gap-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <GitBranch className="w-3 h-3 text-violet-400 dark:text-violet-400 shrink-0" />
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Levels</SelectItem>
            <SelectItem value="L1">L1 — Email</SelectItem>
            <SelectItem value="L2">L2 — Call</SelectItem>
            <SelectItem value="L3">L3 — Visit</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        <Select value={filters.method} onValueChange={(v) => setFilter("method", v as ResolutionMethod | "All")}>
          <SelectTrigger className="border-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:border-transparent h-7 text-xs px-2 w-auto gap-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Zap className="w-3 h-3 text-amber-400 dark:text-amber-400 shrink-0" />
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Methods</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Call">Call</SelectItem>
            <SelectItem value="Visit">Visit</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        <Select value={filters.priority} onValueChange={(v) => setFilter("priority", v as TicketPriority | "All")}>
          <SelectTrigger className="border-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:border-transparent h-7 text-xs px-2 w-auto gap-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Flag className="w-3 h-3 text-rose-400 dark:text-rose-400 shrink-0" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-2 py-0.5 rounded-md transition-colors whitespace-nowrap ml-auto"
          >
            <X className="w-3 h-3" />
            Clear {activeCount}
          </button>
        )}
      </div>

      {/* Logs list */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No logs match the current filters</p>
            </div>
          ) : (
            <div className="">
              <div className="min-w-200">
                {/* Header */}
                <div className={`grid ${COLS} font-bold border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60`}>
                  <div className="" />
                  <div className={TH}>Ticket</div>
                  <div className={TH}>Problem</div>
                  <div className={TH}>Priority</div>
                  <div className={TH}>Sector</div>
                  <div className={TH}>Resolved By</div>
                  <div className={TH}>Method</div>
                  <div className={`${TH} text-right`}>Time</div>
                  <div className={`${TH} text-right`}>Resolved At</div>
                </div>

                {/* Rows */}
                {logs.map((log) => {
                  const isOpen = expanded.has(log.id);
                  return (
                    <div key={log.id}>
                      {/* Summary row */}
                      <div
                        className={cn(
                          `grid ${COLS} border-b border-slate-100 dark:border-slate-700/50 transition-colors duration-100 cursor-pointer`,
                          isOpen
                            ? "bg-slate-50/80 dark:bg-slate-800/50"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        )}
                        onClick={() => toggle(log.id)}
                      >
                        {/* Chevron */}
                        <div className="py-3.5 px-4 flex items-center">
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        </div>

                        {/* Ticket ID + item */}
                        <div className="py-3.5 px-4 flex flex-col justify-center">
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{log.ticketId}</span>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{log.itemId}</p>
                        </div>

                        {/* Problem summary */}
                        <div className="py-3.5 px-4 flex flex-col justify-center min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                            {log.problemSummary}
                          </p>
                          {/* <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {log.solutionSummary}
                          </p> */}
                        </div>

                        {/* Priority */}
                        <div className="py-3.5 px-4 flex items-center">
                          <PriorityBadge priority={log.priority} />
                        </div>

                        {/* Sector */}
                        <div className="py-3.5 px-4 flex items-center">
                          <Badge variant="outline" className={`text-xs font-medium ${sectorClass[log.sector] ?? "text-slate-600 border-slate-200"}`}>
                            {log.sector}
                          </Badge>
                        </div>

                        {/* Resolved By */}
                        <div className="py-3.5 px-4 flex flex-col justify-center">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{log.resolvedBy}</p>
                          <div className="mt-0.5">
                            <RoleBadge level={log.resolvedByLevel} showMethod={false} />
                          </div>
                        </div>

                        {/* Method */}
                        <div className="py-3.5 px-4 flex items-center">
                          <MethodBadge method={log.method} />
                        </div>

                        {/* Time */}
                        <div className="py-3.5 px-4 flex items-center justify-end">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{log.timeToResolve}</span>
                        </div>

                        {/* Resolved At */}
                        <div className="py-3.5 px-4 flex items-center justify-end">
                          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                            {format(new Date(log.resolvedAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                      </div>

                      {/* Expanded detail — animated via grid-rows */}
                      <div
                        className={cn(
                          "grid overflow-hidden transition-[grid-template-rows] duration-300",
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        )}
                        style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
                      >
                        <div className="min-h-0">
                          <div className={cn(
                            "border-b border-slate-100 dark:border-slate-700/50",
                            methodBg[log.method] ?? ""
                          )}>
                            <div
                              className={cn(
                                "px-5 py-4 border-l-4 ml-10 transition-[opacity,transform] duration-300",
                                isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
                                methodAccent[log.method] ?? "border-l-slate-300"
                              )}
                              style={{
                                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
                                transitionDelay: isOpen ? "60ms" : "0ms",
                              }}
                            >
                              <div className="grid grid-cols-2 gap-8">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                                    Full Problem Description
                                  </p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {log.problemSummary}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                                    Resolution
                                  </p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {log.solutionSummary}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
