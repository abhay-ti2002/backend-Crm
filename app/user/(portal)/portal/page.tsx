"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserShell } from "@/components/user/UserShell";
import { TicketListPanel } from "@/components/user/TicketListPanel";
import { NewTicketForm } from "@/components/user/NewTicketForm";
import { TicketDetailView } from "@/components/user/TicketDetailView";

type RightPanel = "empty" | "new-ticket" | "detail";

export default function UserPortalPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const currentUserId = user?.id;

  const [rightPanel, setRightPanel] = useState<RightPanel>("empty");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading user portal...</div>;
  }

  if (!isAuthenticated || !currentUserId) return null;

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
    setRefreshKey(prev => prev + 1);
    alert(`Success! Your ticket has been submitted. (ID: ${newId})`);
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
          refreshTrigger={refreshKey}
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
