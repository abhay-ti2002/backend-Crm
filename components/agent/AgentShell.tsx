"use client";

import { useState } from "react";
import { AgentSidebar } from "./AgentSidebar";
import { AgentTopbar } from "./AgentTopbar";

export function AgentShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <AgentSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AgentTopbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
