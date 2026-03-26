import { AgentLevel, Sector } from "@/lib/mockData";
import { api } from "./api";

// ─── Request / Response shapes ────────────────────────────────────────────────
// These match the expected REST contract. Keep in sync with your backend schema.

export interface CreateAgentPayload {
  name: string;
  email: string;
  password: string;
  sector: string;
  supportLevel: number;
}

export interface CreateAgentResult {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    sector: string;
    supportLevel: number;
  };
}

// ─── Service function ─────────────────────────────────────────────────────────

/**
 * Creates a new agent.
 */
export async function createAgent(
  payload: CreateAgentPayload
): Promise<CreateAgentResult> {
  return api("/admin/add-agent", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
