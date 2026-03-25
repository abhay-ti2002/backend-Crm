import { create } from "zustand";
import { resolutionLogs as mockLogs, ResolutionLog, Sector, AgentLevel, ResolutionMethod, TicketPriority } from "@/lib/mockData";

interface LogFilters {
  sector: Sector | "All";
  level: AgentLevel | "All";
  method: ResolutionMethod | "All";
  priority: TicketPriority | "All";
  agentName: string;
  itemId: string;
}

interface LogStore {
  logs: ResolutionLog[];
  filters: LogFilters;
  setFilter: <K extends keyof LogFilters>(key: K, value: LogFilters[K]) => void;
  resetFilters: () => void;
  filteredLogs: () => ResolutionLog[];
}

const defaultFilters: LogFilters = {
  sector: "All",
  level: "All",
  method: "All",
  priority: "All",
  agentName: "",
  itemId: "",
};

export const useLogStore = create<LogStore>((set, get) => ({
  logs: mockLogs,
  filters: defaultFilters,

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: defaultFilters }),

  filteredLogs: () => {
    const { logs, filters } = get();
    return logs.filter((l) => {
      if (filters.sector !== "All" && l.sector !== filters.sector) return false;
      if (filters.level !== "All" && l.resolvedByLevel !== filters.level) return false;
      if (filters.method !== "All" && l.method !== filters.method) return false;
      if (filters.priority !== "All" && l.priority !== filters.priority) return false;
      if (filters.agentName && !l.resolvedBy.toLowerCase().includes(filters.agentName.toLowerCase())) return false;
      if (filters.itemId && !l.itemId.toLowerCase().includes(filters.itemId.toLowerCase())) return false;
      return true;
    });
  },
}));
