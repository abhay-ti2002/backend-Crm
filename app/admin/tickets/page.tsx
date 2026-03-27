"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Star, Trash2, MoreHorizontal, Paperclip, ExternalLink,
  Inbox, CircleDot, Mail, Filter, X, SlidersHorizontal, Flag, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTicketStore } from "@/stores/ticketStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { TicketLabel, TicketPriority, TicketStatus, Sector } from "@/lib/mockData";
import { format } from "date-fns";

const sectorClass: Record<string, string> = {
  IT:         "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30",
  Healthcare: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  Education:  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  Finance:    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30",
};

const labelItems = [
  { key: "All",        label: "All Tickets",  Icon: Filter },
  { key: "New",        label: "New",          Icon: Inbox },
  { key: "Assigned",   label: "Assigned",     Icon: CircleDot },
  { key: "Unassigned", label: "Unassigned",   Icon: Mail },
  { key: "Starred",    label: "Starred",      Icon: Star },
  { key: "Trashed",    label: "Trashed",      Icon: Trash2 },
] as const;

const COLS = "grid-cols-[6.5rem_1fr_16rem_6.5rem_9rem_6.5rem_4.5rem_2.5rem]";

const TH = "py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500";

function TicketsContent() {
  const searchParams = useSearchParams();
  const { filters, setFilter, resetFilters, filteredTickets, starTicket, trashTicket, setPriority, fetchTickets } = useTicketStore();
  const allTickets = useTicketStore((s) => s.tickets);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  const c = {
    total:      allTickets.filter((t) => !t.trashed).length,
    new:        allTickets.filter((t) => t.label === "New"        && !t.trashed).length,
    assigned:   allTickets.filter((t) => t.label === "Assigned"   && !t.trashed).length,
    unassigned: allTickets.filter((t) => t.label === "Unassigned" && !t.trashed).length,
    starred:    allTickets.filter((t) => t.starred                && !t.trashed).length,
    trashed:    allTickets.filter((t) => t.trashed).length,
  };

  useEffect(() => {
    const label = searchParams.get("label") as TicketLabel | null;
    if (label) setFilter("label", label);
  }, [searchParams, setFilter]);

  const tickets = filteredTickets();

  const activeFiltersCount = [
    filters.priority !== "All",
    filters.status !== "All",
    filters.sector !== "All",
    !!filters.itemId,
  ].filter(Boolean).length;

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* Left label sidebar */}
      <aside className="w-44 shrink-0 space-y-0.5">
        {labelItems.map(({ key, label, Icon }) => {
          const count = key === "All" ? c.total : key === "Starred" ? c.starred : key === "Trashed" ? c.trashed : key === "New" ? c.new : key === "Assigned" ? c.assigned : c.unassigned;
          return (
            <button
              key={key}
              onClick={() => setFilter("label", key as TicketLabel | "All")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 text-left ${
                filters.label === key
                  ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none tabular-nums ${
                  filters.label === key
                    ? "bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
        {/* Filter toolbar */}
        <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 px-2 mr-0.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Filters</span>
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

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

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

          <Select value={filters.status} onValueChange={(v) => setFilter("status", v as TicketStatus | "All")}>
            <SelectTrigger className="border-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:border-transparent h-7 text-xs px-2 w-auto gap-1 hover:bg-slate-100 dark:hover:bg-slate-800">
              <CircleDot className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Escalated to L2">Escalated to L2</SelectItem>
              <SelectItem value="Escalated to L3">Escalated to L3</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

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

          <div className="flex items-center gap-2 ml-auto pl-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-2 py-0.5 rounded-md transition-colors whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                Clear {activeFiltersCount}
              </button>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums pr-1 whitespace-nowrap">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Ticket list */}
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No tickets found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-50 leading-relaxed">
                {filters.label !== "All"
                  ? `No ${filters.label.toLowerCase()} tickets match your current filters.`
                  : "No tickets match the current filters."}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Sticky header */}
              <div className={`grid ${COLS} border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 shrink-0`}>
                <div className={TH}>ID</div>
                <div className={TH}>Nature / User</div>
                <div className={TH}>Agent</div>
                <div className={TH}>Priority</div>
                <div className={TH}>Status</div>
                <div className={TH}>Sector</div>
                <div className={TH}>Date</div>
                <div className="py-2.5 px-3" />
              </div>

              {/* Scrollable rows */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:var(--color-slate-300)_transparent] dark:[scrollbar-color:var(--color-slate-700)_transparent]">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className={`grid ${COLS} border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-100 group/row min-h-[5.5rem]`}
                  >
                    {/* ID */}
                    <div className="py-4 px-3 flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">{t.id}</span>
                      {t.attachment && <Paperclip className="w-3 h-3 cursor-pointer text-slate-300 dark:text-slate-600 shrink-0" />}
                    </div>

                    {/* Nature / User */}
                    <div className="py-4 px-3 flex items-center gap-2 min-w-0">
                      {t.starred && <Star className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate leading-tight">{t.nature}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {t.userName} · <span className="font-mono">{t.itemId}</span>
                        </p>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="py-4 px-3 flex items-center">
                      <PriorityBadge priority={t.priority} />
                    </div>

                    {/* Status */}
                    <div className="py-4 px-3 flex items-center">
                      <StatusBadge status={t.status} />
                    </div>

                    {/* Agent */}
                    <div className="py-4 px-3 flex items-center min-w-0">
                      {t.assignedAgentName ? (
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[12px] font-bold text-indigo-500 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                            {t.assignedAgentName.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-800 dark:text-slate-100 font-bold leading-tight break-all">
                              {t.assignedAgentName}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium break-all">
                              {t.assignedAgentEmail}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                      )}
                    </div>

                    {/* Sector */}
                    <div className="py-4 px-3 flex items-center">
                      {t.sector ? (
                        <Badge variant="outline" className={`text-xs font-medium ${sectorClass[t.sector] ?? "text-slate-600 border-slate-200"}`}>
                          {t.sector}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="py-4 px-3 flex items-center">
                      <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                        {format(new Date(t.createdAt), "MMM d")}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="py-4 px-3 flex items-center">
                      <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-150">
                        <Link href={`/admin/tickets/${t.id}`}>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-accent transition-colors">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-sm">
                            <DropdownMenuItem onClick={() => setPriority(t.id, "High")}>Set High Priority</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriority(t.id, "Medium")}>Set Medium Priority</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPriority(t.id, "Low")}>Set Low Priority</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => starTicket(t.id)}>
                              {t.starred ? "Unstar" : "Star"} Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => trashTicket(t.id)}
                              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                            >
                              {t.trashed ? "Restore from Trash" : "Mark as False Report"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense>
      <TicketsContent />
    </Suspense>
  );
}
