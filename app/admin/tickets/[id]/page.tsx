"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Paperclip, Star, Trash2, Mail, Phone, MapPin, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTicketStore } from "@/stores/ticketStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { format } from "date-fns";
import { AgentLevel, EscalationStep } from "@/lib/mockData";

const methodIcon: Record<string, React.ElementType> = {
  Email: Mail, Call: Phone, Visit: MapPin,
};

const methodColor: Record<string, string> = {
  Email: "text-sky-600 dark:text-sky-400",
  Call:  "text-violet-600 dark:text-violet-400",
  Visit: "text-orange-600 dark:text-orange-400",
};

const sectorClass: Record<string, string> = {
  IT:         "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/50",
  Healthcare: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
  Education:  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
  Finance:    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700/50",
};

const levelColor: Record<AgentLevel, string> = {
  L1: "border-sky-400 bg-sky-50 dark:border-sky-600 dark:bg-sky-900/30",
  L2: "border-violet-400 bg-violet-50 dark:border-violet-600 dark:bg-violet-900/30",
  L3: "border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-900/30",
};

function EscalationStepper({ steps }: { steps: EscalationStep[] }) {
  const allLevels: AgentLevel[] = ["L1", "L2", "L3"];

  return (
    <div className="flex items-start gap-0">
      {allLevels.map((level, idx) => {
        const step = steps.find((s) => s.level === level);
        const Icon = step ? methodIcon[step.method] : Clock;
        const isLast = idx === allLevels.length - 1;

        return (
          <div key={level} className="flex items-start flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                step
                  ? step.outcome === "Resolved"
                    ? "border-green-400 bg-green-50 dark:border-green-500 dark:bg-green-900/20"
                    : step.outcome === "In Progress"
                    ? levelColor[level]
                    : "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/40"
                  : "border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800/50"
              }`}>
                {step?.outcome === "Resolved" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <Icon className={`w-4 h-4 ${step ? methodColor[step.method] : "text-slate-300 dark:text-slate-600"}`} />
                )}
              </div>
              <div className="mt-2 text-center">
                <RoleBadge level={level} />
                {step ? (
                  <>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1">{step.agentName}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{format(new Date(step.startedAt), "MMM d, HH:mm")}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-1 ${
                        step.outcome === "Resolved"
                          ? "text-green-600 border-green-200 dark:text-green-400 dark:border-green-700/50"
                          : step.outcome === "In Progress"
                          ? "text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-700/50"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {step.outcome}
                    </Badge>
                    {step.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 max-w-[140px] mx-auto">{step.notes}</p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Pending</p>
                )}
              </div>
            </div>
            {!isLast && (
              <div className="flex items-center mt-4">
                <div className={`h-0.5 w-8 ${step?.outcome === "Escalated" ? "bg-indigo-300 dark:bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`} />
                <ChevronRight className={`w-4 h-4 ${step?.outcome === "Escalated" ? "text-indigo-400 dark:text-indigo-500" : "text-slate-300 dark:text-slate-600"}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tickets = useTicketStore((s) => s.tickets);
  const starTicket = useTicketStore((s) => s.starTicket);
  const trashTicket = useTicketStore((s) => s.trashTicket);

  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        <p className="text-lg font-semibold">Ticket not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-3">Go back</Button>
      </div>
    );
  }

  const resolvedStep = ticket.escalationSteps.find((s) => s.outcome === "Resolved");

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-8 h-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-slate-400 dark:text-slate-500">{ticket.id}</span>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            {ticket.starred && <Star className="w-4 h-4 text-amber-400" fill="currentColor" />}
            {ticket.trashed && (
              <Badge variant="outline" className="text-xs text-red-500 border-red-200 dark:text-red-400 dark:border-red-700/50">
                Trashed
              </Badge>
            )}
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{ticket.nature}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => starTicket(ticket.id)}
            className={`gap-1.5 text-xs ${ticket.starred ? "text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-600/50" : ""}`}
          >
            <Star className="w-3.5 h-3.5" fill={ticket.starred ? "currentColor" : "none"} />
            {ticket.starred ? "Starred" : "Star"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => trashTicket(ticket.id)}
            className={`gap-1.5 text-xs ${
              ticket.trashed
                ? "text-green-600 border-green-300 dark:text-green-400 dark:border-green-600/50"
                : "text-red-600 border-red-200 dark:text-red-400 dark:border-red-700/50"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {ticket.trashed ? "Restore" : "Trash"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main content */}
        <div className="col-span-2 space-y-4">
          {/* Problem Description */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Problem Description</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{ticket.description}</p>
              {ticket.attachment && (
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
                  <Paperclip className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{ticket.attachment}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Escalation Timeline */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Escalation Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6">
              {ticket.escalationSteps.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">No escalation steps yet — ticket is awaiting sector assignment.</p>
              ) : (
                <EscalationStepper steps={ticket.escalationSteps} />
              )}
            </CardContent>
          </Card>

          {/* Resolution Log */}
          {resolvedStep && (
            <Card className="border-green-200 dark:border-green-800/50 bg-green-50/40 dark:bg-green-900/10">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Resolution Log
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Problem</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{ticket.description}</p>
                </div>
                <Separator className="dark:bg-slate-700" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Solution</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{resolvedStep.notes}</p>
                </div>
                <Separator className="dark:bg-slate-700" />
                <div className="flex gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <span>Resolved by <strong className="text-slate-700 dark:text-slate-200">{resolvedStep.agentName}</strong></span>
                  <span>Method: <strong className="text-slate-700 dark:text-slate-200">{resolvedStep.method}</strong></span>
                  {resolvedStep.resolvedAt && (
                    <span>At: <strong className="text-slate-700 dark:text-slate-200">{format(new Date(resolvedStep.resolvedAt), "MMM d, HH:mm")}</strong></span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">User</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{ticket.userName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{ticket.userEmail}</p>
              </div>
              <Separator className="dark:bg-slate-700" />
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Item</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{ticket.itemId}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{ticket.productName}</p>
              </div>
              <Separator className="dark:bg-slate-700" />
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Sector</p>
                {ticket.sector ? (
                  <Badge variant="outline" className={`text-xs font-medium ${sectorClass[ticket.sector] ?? "text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-600"}`}>
                    {ticket.sector}
                  </Badge>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Not assigned</p>
                )}
              </div>
              {ticket.assignedAgentName && (
                <>
                  <Separator className="dark:bg-slate-700" />
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Current Agent</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{ticket.assignedAgentName}</p>
                  </div>
                </>
              )}
              <Separator className="dark:bg-slate-700" />
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Submitted</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{format(new Date(ticket.createdAt), "MMM d, yyyy HH:mm")}</p>
              </div>
              <Separator className="dark:bg-slate-700" />
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Last Updated</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{format(new Date(ticket.updatedAt), "MMM d, yyyy HH:mm")}</p>
              </div>
            </CardContent>
          </Card>

          {!ticket.sector && (
            <Button className="w-full text-xs" size="sm">
              Assign to Sector
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
