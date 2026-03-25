import { AgentLevel, Sector } from "@/lib/mockData";
import { useAgentStore } from "@/stores/agentStore";

// ─── Request / Response shapes ────────────────────────────────────────────────
// These match the expected REST contract. Keep in sync with your backend schema.

export interface CreateAgentPayload {
  name: string;
  email: string;
  sector: Sector;
  level: AgentLevel;
}

export interface CreateAgentResult {
  id: string;
  name: string;
  email: string;
  sector: Sector;
  level: AgentLevel;
}

// ─── Service function ─────────────────────────────────────────────────────────

/**
 * Creates a new agent.
 *
 * BACKEND INTEGRATION: replace the entire function body with:
 *
 *   const res = await fetch("/api/agents", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(payload),
 *   });
 *   if (!res.ok) {
 *     const msg = await res.text().catch(() => "Unknown error");
 *     throw new Error(msg);
 *   }
 *   return res.json() as Promise<CreateAgentResult>;
 */
export async function createAgent(
  payload: CreateAgentPayload
): Promise<CreateAgentResult> {
  const { addAgent } = useAgentStore.getState();
  addAgent(payload);
  // Retrieve the record that was just inserted (matched by email + name)
  const created = useAgentStore
    .getState()
    .agents.find((a) => a.email === payload.email && a.name === payload.name)!;
  return {
    id: created.id,
    name: created.name,
    email: created.email,
    sector: created.sector,
    level: created.level,
  };
}
