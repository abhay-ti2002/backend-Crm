"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import { useUserSessionStore } from "@/stores/userSessionStore";
import { UserShell } from "@/components/user/UserShell";
import { TicketListPanel } from "@/components/user/TicketListPanel";
import { NewTicketForm } from "@/components/user/NewTicketForm";
import { TicketDetailView } from "@/components/user/TicketDetailView";

type RightPanel = "empty" | "new-ticket" | "detail";

export default function UserPortalPage() {
  const router = useRouter();
  const { currentUserId } = useUserSessionStore();

  const [rightPanel, setRightPanel] = useState<RightPanel>("empty");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) router.replace("/login");
  }, [currentUserId, router]);

  if (!currentUserId) return null;

  const handleNewTicket = () => {
    setSelectedTicketId(null);
    setRightPanel((prev) => (prev === "new-ticket" ? "empty" : "new-ticket"));
  };

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setRightPanel("detail");
  };

  const handleFormSuccess = (newId: string) => {
    setSelectedTicketId(newId);
    setRightPanel("detail");
  };

  const handleFormCancel = () => {
    setRightPanel(selectedTicketId ? "detail" : "empty");
  };

  return (
    <UserShell onNewTicket={handleNewTicket} newTicketOpen={rightPanel === "new-ticket"}>
      <div className="flex h-full">

        {/* Left: ticket list */}
        <TicketListPanel
          selectedTicketId={selectedTicketId}
          onSelectTicket={handleSelectTicket}
        />

        {/* Right: context panel */}
        <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950">
          {rightPanel === "empty" && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Inbox className="w-8 h-8 opacity-50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select a ticket to view details</p>
                <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">or click <span className="font-semibold text-indigo-500">+ New</span> to raise a ticket</p>
              </div>
            </div>
          )}

          {rightPanel === "new-ticket" && (
            <NewTicketForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}

          {rightPanel === "detail" && selectedTicketId && (
            <TicketDetailView ticketId={selectedTicketId} />
          )}
        </div>

      </div>
    </UserShell>
  );
}
