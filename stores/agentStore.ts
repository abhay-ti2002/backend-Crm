import { create } from "zustand";
import { agents as mockAgents, Agent, Sector, AgentLevel } from "@/lib/mockData";

type ViewMode = "chart" | "columns";

interface AgentStore {
  agents: Agent[];
  selectedSector: Sector | "All";
  viewMode: ViewMode;
  setSelectedSector: (sector: Sector | "All") => void;
  setViewMode: (mode: ViewMode) => void;
  agentsBySector: (sector: Sector) => Agent[];
  agentsByLevel: (sector: Sector, level: AgentLevel) => Agent[];
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: mockAgents,
  selectedSector: "All",
  viewMode: "columns",

  setSelectedSector: (sector) => set({ selectedSector: sector }),
  setViewMode: (mode) => set({ viewMode: mode }),

  agentsBySector: (sector) => get().agents.filter((a) => a.sector === sector),

  agentsByLevel: (sector, level) =>
    get().agents.filter((a) => a.sector === sector && a.level === level),
}));
