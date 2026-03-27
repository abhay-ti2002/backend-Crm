"use client";

import { toast } from "sonner";
import { useState } from "react";
import { ArrowUpCircle, CheckCircle2, Save, Wifi, WifiOff, AlertCircle, ArrowRightCircle, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTicketStore } from "@/stores/ticketStore";
import { useAgentStore } from "@/stores/agentStore";
import { useAgentSessionStore } from "@/stores/agentSessionStore";
import { Ticket, TicketStatus } from "@/lib/mockData";
import { CAPACITY_THRESHOLD } from "@/lib/constants";

interface ActionPanelProps {
  ticket: Ticket;
}

const statusFlow: Record<string, TicketStatus[]> = {
  "Assigned": ["In Progress"],
  "In Progress": ["Resolved", "Forwarded"],
  "Escalated to L2": ["In Progress", "Resolved", "Forwarded"],
  "Escalated to L3": ["In Progress", "Resolved", "Forwarded"],
};

const statusLabel: Record<string, string> = {
  "In Progress": "Mark In Progress",
  "Resolved": "Mark Resolved",
  "Forwarded": "Forward Ticket",
};

export function ActionPanel({ ticket }: ActionPanelProps) {
  const { updateTicketStatus, escalateTicket, addNote } = useTicketStore();
  const { agents, findNextLevel, decrementActiveTickets, incrementActiveTickets } = useAgentStore();
  const { currentAgentId } = useAgentSessionStore();

  const [note, setNote] = useState(
    ticket.escalationSteps[ticket.escalationSteps.length - 1]?.notes ?? ""
  );
  const [noteSaved, setNoteSaved] = useState(false);

  const currentAgent = agents.find((a) => a.id === currentAgentId);
  const isTerminal = ticket.status === "Resolved" || ticket.status === "Closed";

  const nextStatuses = statusFlow[ticket.status] ?? [];

  // Determine if this agent can escalate
  const canEscalate =
    !isTerminal &&
    currentAgent &&
    ticket.assignedAgentId === currentAgent.id &&
    (currentAgent.level === "L1" || currentAgent.level === "L2");

  const escalateToLevel = currentAgent?.level === "L1" ? "L2" : "L3";
  const nextAgent = canEscalate && ticket.sector
    ? findNextLevel(ticket.sector, escalateToLevel as "L2" | "L3")
    : null;

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await updateTicketStatus(ticket.id, status);
      if ((status === "Resolved" || status === "Closed") && ticket.assignedAgentId) {
        decrementActiveTickets(ticket.assignedAgentId);
      }

      if (status === "Resolved") {
        toast.success("Ticket resolved", { icon: <TicketIcon className="w-4 h-4 text-emerald-500" /> });
      } else if (status === "Forwarded") {
        toast.success("Ticket forwarded successfully", { icon: <ArrowRightCircle className="w-4 h-4 text-indigo-500" /> });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleEscalate = () => {
    if (!nextAgent || !currentAgent || !ticket.sector) return;
    escalateTicket(ticket.id, escalateToLevel as "L2" | "L3", nextAgent, currentAgent.id);
    decrementActiveTickets(currentAgent.id);
    incrementActiveTickets(nextAgent.id);
    toast.success(`Ticket escalated successfully to ${escalateToLevel}`, { icon: <ArrowUpCircle className="w-4 h-4 text-amber-500" /> });
  };

  const handleSaveNote = () => {
    addNote(ticket.id, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  if (isTerminal) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ticket {ticket.status}</p>
        <p className="text-xs text-slate-400">No further actions available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status actions */}
      {nextStatuses.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Update Status
          </p>
          <div className="space-y-2">
            {nextStatuses.map((s) => (
              <Button
                key={s}
                onClick={() => handleStatusChange(s)}
                variant={s === "Resolved" ? "default" : s === "Forwarded" ? "secondary" : "outline"}
                size="sm"
                className={`w-full justify-start gap-2 text-sm ${s === "Resolved"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                    : s === "Forwarded"
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
              >
                {s === "Forwarded" ? (
                  <ArrowRightCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {statusLabel[s] ?? s}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Escalation */}
      {canEscalate && (
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Escalate to {escalateToLevel}
          </p>
          {nextAgent ? (() => {
            const availConfig = {
              available: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Available", icon: Wifi, pulse: true },
              at_capacity: { dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400", label: "At Capacity", icon: AlertCircle, pulse: false },
              offline: { dot: "bg-slate-400", text: "text-slate-500 dark:text-slate-400", label: "Offline", icon: WifiOff, pulse: false },
            };
            const avail = availConfig[nextAgent.availability];
            const AvailIcon = avail.icon;
            const pct = Math.min(nextAgent.activeTickets / CAPACITY_THRESHOLD, 1);
            return (
              <div className="rounded-xl border border-amber-100 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10 p-3 space-y-3">
                {/* Agent identity */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {nextAgent.avatar}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${avail.dot} ${avail.pulse ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{nextAgent.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        {nextAgent.level}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{nextAgent.sector}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-semibold ${avail.text}`}>
                    <AvailIcon className="w-3 h-3 shrink-0" />
                    {avail.label}
                  </div>
                </div>

                {/* Capacity bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Current load</span>
                    <span className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-300">
                      {nextAgent.activeTickets}/{CAPACITY_THRESHOLD} tickets
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct >= 1 ? "bg-red-500" : pct >= 0.7 ? "bg-amber-400" : "bg-emerald-500"
                        }`}
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                </div>

                {/* Confirm button */}
                <Button
                  onClick={handleEscalate}
                  size="sm"
                  className="w-full gap-2 text-sm bg-amber-500 hover:bg-amber-600 text-white border-0"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Escalate to {escalateToLevel}
                </Button>
              </div>
            );
          })() : (
            <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
              No {escalateToLevel} agents available in {ticket.sector}
            </p>
          )}
        </div>
      )}

      {/* Note */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Notes
        </p>
        <textarea
          value={note}
          onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }}
          placeholder="Add notes about actions taken…"
          rows={4}
          className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
        />
        <Button
          onClick={handleSaveNote}
          disabled={!note.trim()}
          size="sm"
          variant="outline"
          className={`mt-2 w-full gap-2 text-sm transition-colors ${noteSaved
              ? "border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
              : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            }`}
        >
          <Save className="w-3.5 h-3.5" />
          {noteSaved ? "Saved!" : "Save Note"}
        </Button>
      </div>
    </div>
  );
}
