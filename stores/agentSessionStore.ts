import { create } from "zustand";

// Simulates an authenticated agent session.
// Backend integration: replace setCurrentAgent with a POST /api/auth/agent-login call
// that returns a JWT, then decode it here or store the agent profile from the response.

interface AgentSessionStore {
  currentAgentId: string | null;
  setCurrentAgent: (id: string) => void;
  logout: () => void;
}

export const useAgentSessionStore = create<AgentSessionStore>((set) => ({
  currentAgentId: null,
  setCurrentAgent: (id) => set({ currentAgentId: id }),
  logout: () => set({ currentAgentId: null }),
}));
