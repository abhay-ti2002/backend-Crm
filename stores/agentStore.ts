import { create } from "zustand";
import { agents as mockAgents, Agent, Sector, AgentLevel } from "@/lib/mockData";
import { CAPACITY_THRESHOLD, RESUME_THRESHOLD } from "@/lib/constants";

type ViewMode = "chart" | "columns";

type NewAgent = Pick<Agent, "name" | "email" | "sector" | "level">;

interface AgentStore {
  agents: Agent[];
  selectedSector: Sector | "All";
  viewMode: ViewMode;
  setSelectedSector: (sector: Sector | "All") => void;
  setViewMode: (mode: ViewMode) => void;
  addAgent: (data: NewAgent) => void;
  agentsBySector: (sector: Sector) => Agent[];
  agentsByLevel: (sector: Sector, level: AgentLevel) => Agent[];
  // Availability management
  // Backend integration: each of these should call PATCH /api/agents/:id/availability
  updateAvailability: (agentId: string) => void;
  setOffline: (agentId: string, offline: boolean) => void;
  incrementActiveTickets: (agentId: string) => void;
  decrementActiveTickets: (agentId: string) => void;
  // Login
  // Backend integration: POST /api/auth/agent-login → sets online: true server-side
  setOnlineOnLogin: (agentId: string) => void;
  // Auto-assignment
  // Backend integration: server should own this logic; these are client-side mirrors
  autoAssign: (sector: Sector) => Agent | null;
  findNextLevel: (sector: Sector, level: "L2" | "L3") => Agent | null;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: mockAgents,
  selectedSector: "All",
  viewMode: "columns",

  setSelectedSector: (sector) => set({ selectedSector: sector }),
  setViewMode: (mode) => set({ viewMode: mode }),

  addAgent: (data) => {
    const initials = data.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const newAgent: Agent = {
      id: `a${Date.now()}`,
      name: data.name,
      email: data.email,
      avatar: initials,
      level: data.level,
      sector: data.sector,
      supervisorId: null,
      activeTickets: 0,
      resolvedTickets: 0,
      password:"assword123",
      online: false,
      availability: "offline",
    };
    set({ agents: [...get().agents, newAgent] });
  },

  agentsBySector: (sector) => get().agents.filter((a) => a.sector === sector),

  agentsByLevel: (sector, level) =>
    get().agents.filter((a) => a.sector === sector && a.level === level),

  // Recalculates availability after a ticket count change.
  // Hysteresis: only transitions at the threshold boundaries to prevent rapid toggling.
  updateAvailability: (agentId) => {
    set((s) => ({
      agents: s.agents.map((a) => {
        if (a.id !== agentId) return a;
        if (a.availability === "offline") return a; // manual offline — never override
        if (a.activeTickets >= CAPACITY_THRESHOLD) return { ...a, availability: "at_capacity" };
        if (a.activeTickets <= RESUME_THRESHOLD && a.availability === "at_capacity") return { ...a, availability: "available" };
        return a;
      }),
    }));
  },

  // Sets agent online when they log in, restoring availability from offline.
  setOnlineOnLogin: (agentId) => {
    set((s) => ({
      agents: s.agents.map((a) => {
        if (a.id !== agentId) return a;
        const availability = a.activeTickets >= CAPACITY_THRESHOLD ? "at_capacity" : "available";
        return { ...a, online: true, availability };
      }),
    }));
  },

  // Manual offline toggle (agent ends/starts their shift).
  setOffline: (agentId, offline) => {
    set((s) => ({
      agents: s.agents.map((a) => {
        if (a.id !== agentId) return a;
        const availability = offline
          ? "offline"
          : a.activeTickets >= CAPACITY_THRESHOLD
          ? "at_capacity"
          : "available";
        return { ...a, availability, online: !offline };
      }),
    }));
  },

  incrementActiveTickets: (agentId) => {
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId ? { ...a, activeTickets: a.activeTickets + 1 } : a
      ),
    }));
    get().updateAvailability(agentId);
  },

  decrementActiveTickets: (agentId) => {
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId
          ? { ...a, activeTickets: Math.max(0, a.activeTickets - 1), resolvedTickets: a.resolvedTickets + 1 }
          : a
      ),
    }));
    get().updateAvailability(agentId);
  },

  // Returns the least-loaded available L1 agent in the given sector, or null if none available.
  autoAssign: (sector) => {
    const candidates = get().agents.filter(
      (a) => a.sector === sector && a.level === "L1" && a.availability === "available"
    );
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => a.activeTickets - b.activeTickets)[0];
  },

  // Returns the least-loaded non-offline agent at the target escalation level in the sector.
  findNextLevel: (sector, level) => {
    const candidates = get().agents.filter(
      (a) => a.sector === sector && a.level === level && a.activeTickets < CAPACITY_THRESHOLD
    );
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => a.activeTickets - b.activeTickets)[0];
  },
}));
