import { create } from "zustand";
import { agents as mockAgents, Agent, Sector, AgentLevel } from "@/lib/mockData";

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
      online: false,
    };
    set({ agents: [...get().agents, newAgent] });
  },

  agentsBySector: (sector) => get().agents.filter((a) => a.sector === sector),

  agentsByLevel: (sector, level) =>
    get().agents.filter((a) => a.sector === sector && a.level === level),
}));
