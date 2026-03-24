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
  Email: "text-sky-600", Call: "text-violet-600", Visit: "text-orange-600",
};

const sectorClass: Record<string, string> = {
  IT:         "bg-indigo-100 text-indigo-700 border-indigo-200",
  Healthcare: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Education:  "bg-amber-100 text-amber-700 border-amber-200",
  Finance:    "bg-sky-100 text-sky-700 border-sky-200",
};

const levelColor: Record<AgentLevel, string> = {
  L1: "border-sky-400 bg-sky-50",
  L2: "border-violet-400 bg-violet-50",
  L3: "border-rose-400 bg-rose-50",
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
                    ? "border-green-400 bg-green-50"
                    : step.outcome === "In Progress"
                    ? levelColor[level]
                    : "border-slate-300 bg-slate-50"
                  : "border-dashed border-slate-300 bg-white"
              }`}>
                {step?.outcome === "Resolved" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Icon className={`w-4 h-4 ${step ? methodColor[step.method] : "text-slate-300"}`} />
                )}
              </div>
              <div className="mt-2 text-center">
                <RoleBadge level={level} />
                {step ? (
                  <>
                    <p className="text-xs font-medium text-slate-700 mt-1">{step.agentName}</p>
                    <p className="text-[11px] text-slate-400">{format(new Date(step.startedAt), "MMM d, HH:mm")}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-1 ${
                        step.outcome === "Resolved" ? "text-green-600 border-green-200" :
                        step.outcome === "In Progress" ? "text-amber-600 border-amber-200" :
                        "text-slate-500"
                      }`}
                    >
                      {step.outcome}
                    </Badge>
                    {step.notes && (
                      <p className="text-[11px] text-slate-500 mt-1.5 max-w-[140px] mx-auto">{step.notes}</p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Pending</p>
                )}
              </div>
            </div>
            {!isLast && (
              <div className="flex items-center mt-4">
                <div className={`h-0.5 w-8 ${step?.outcome === "Escalated" ? "bg-indigo-300" : "bg-slate-200"}`} />
                <ChevronRight className={`w-4 h-4 ${step?.outcome === "Escalated" ? "text-indigo-400" : "text-slate-300"}`} />
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
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
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
            <span className="font-mono text-sm text-slate-400">{ticket.id}</span>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            {ticket.starred && <Star className="w-4 h-4 text-amber-400" fill="currentColor" />}
            {ticket.trashed && <Badge variant="outline" className="text-xs text-red-500 border-red-200">Trashed</Badge>}
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mt-0.5">{ticket.nature}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => starTicket(ticket.id)}
            className={`gap-1.5 text-xs ${ticket.starred ? "text-amber-600 border-amber-300" : ""}`}
          >
            <Star className="w-3.5 h-3.5" fill={ticket.starred ? "currentColor" : "none"} />
            {ticket.starred ? "Starred" : "Star"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => trashTicket(ticket.id)}
            className={`gap-1.5 text-xs ${ticket.trashed ? "text-green-600 border-green-300" : "text-red-600 border-red-200"}`}
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
          <Card className="border-slate-200">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-slate-700">Problem Description</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>
              {ticket.attachment && (
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 w-fit">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-600 font-medium">{ticket.attachment}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Escalation Timeline */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-slate-700">Escalation Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6">
              {ticket.escalationSteps.length === 0 ? (
                <p className="text-sm text-slate-400">No escalation steps yet — ticket is awaiting sector assignment.</p>
              ) : (
                <EscalationStepper steps={ticket.escalationSteps} />
              )}
            </CardContent>
          </Card>

          {/* Resolution Log */}
          {resolvedStep && (
            <Card className="border-green-200 bg-green-50/40">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Resolution Log
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-0.5">Problem</p>
                  <p className="text-sm text-slate-700">{ticket.description}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-0.5">Solution</p>
                  <p className="text-sm text-slate-700">{resolvedStep.notes}</p>
                </div>
                <Separator />
                <div className="flex gap-6 text-xs text-slate-500">
                  <span>Resolved by <strong className="text-slate-700">{resolvedStep.agentName}</strong></span>
                  <span>Method: <strong className="text-slate-700">{resolvedStep.method}</strong></span>
                  {resolvedStep.resolvedAt && (
                    <span>At: <strong className="text-slate-700">{format(new Date(resolvedStep.resolvedAt), "MMM d, HH:mm")}</strong></span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">User</p>
                <p className="text-sm font-medium text-slate-800">{ticket.userName}</p>
                <p className="text-xs text-slate-400">{ticket.userEmail}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Item</p>
                <p className="text-sm font-medium text-slate-800">{ticket.itemId}</p>
                <p className="text-xs text-slate-400">{ticket.productName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Sector</p>
                {ticket.sector ? (
                  <Badge variant="outline" className={`text-xs font-medium ${sectorClass[ticket.sector] ?? "text-slate-600 border-slate-200"}`}>{ticket.sector}</Badge>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">Not assigned</p>
                )}
              </div>
              {ticket.assignedAgentName && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1">Current Agent</p>
                    <p className="text-sm font-medium text-slate-800">{ticket.assignedAgentName}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Submitted</p>
                <p className="text-sm text-slate-700">{format(new Date(ticket.createdAt), "MMM d, yyyy HH:mm")}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Last Updated</p>
                <p className="text-sm text-slate-700">{format(new Date(ticket.updatedAt), "MMM d, yyyy HH:mm")}</p>
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
