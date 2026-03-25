import { AgentShell } from "@/components/agent/AgentShell";

export default function AgentPortalLayout({ children }: { children: React.ReactNode }) {
  return <AgentShell>{children}</AgentShell>;
}
