"use client";

import { UserTopbar } from "./UserTopbar";

interface UserShellProps {
  children: React.ReactNode;
  onNewTicket: () => void;
  newTicketOpen: boolean;
}

export function UserShell({ children, onNewTicket, newTicketOpen }: UserShellProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex-col">
      <UserTopbar onNewTicket={onNewTicket} newTicketOpen={newTicketOpen} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
