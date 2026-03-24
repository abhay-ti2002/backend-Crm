import { create } from "zustand";
import { tickets as mockTickets, Ticket, TicketLabel, TicketPriority, TicketStatus, Sector, AgentLevel } from "@/lib/mockData";

interface TicketFilters {
  label: TicketLabel | "All";
  priority: TicketPriority | "All";
  status: TicketStatus | "All";
  sector: Sector | "All";
  agentLevel: AgentLevel | "All";
  itemId: string;
  search: string;
}

interface TicketStore {
  tickets: Ticket[];
  filters: TicketFilters;
  selectedTicketId: string | null;
  setFilter: <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) => void;
  resetFilters: () => void;
  setSelectedTicket: (id: string | null) => void;
  starTicket: (id: string) => void;
  trashTicket: (id: string) => void;
  setPriority: (id: string, priority: TicketPriority) => void;
  assignSector: (id: string, sector: Sector, agentId: string, agentName: string) => void;
  filteredTickets: () => Ticket[];
  counts: () => Record<string, number>;
}

const defaultFilters: TicketFilters = {
  label: "All",
  priority: "All",
  status: "All",
  sector: "All",
  agentLevel: "All",
  itemId: "",
  search: "",
};

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: mockTickets,
  filters: defaultFilters,
  selectedTicketId: null,

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: defaultFilters }),

  setSelectedTicket: (id) => set({ selectedTicketId: id }),

  starTicket: (id) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id ? { ...t, starred: !t.starred, label: !t.starred ? "Starred" : t.label === "Starred" ? "Assigned" : t.label } : t
      ),
    })),

  trashTicket: (id) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id ? { ...t, trashed: !t.trashed, label: !t.trashed ? "Trashed" : "Unassigned" } : t
      ),
    })),

  setPriority: (id, priority) =>
    set((s) => ({
      tickets: s.tickets.map((t) => (t.id === id ? { ...t, priority } : t)),
    })),

  assignSector: (id, sector, agentId, agentName) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id
          ? { ...t, sector, assignedAgentId: agentId, assignedAgentName: agentName, status: "Assigned", label: "Assigned" }
          : t
      ),
    })),

  filteredTickets: () => {
    const { tickets, filters } = get();
    return tickets.filter((t) => {
      if (filters.label !== "All") {
        if (filters.label === "Starred" && !t.starred) return false;
        if (filters.label === "Trashed" && !t.trashed) return false;
        if (filters.label === "New" && t.label !== "New") return false;
        if (filters.label === "Assigned" && t.label !== "Assigned") return false;
        if (filters.label === "Unassigned" && t.label !== "Unassigned") return false;
      }
      if (filters.priority !== "All" && t.priority !== filters.priority) return false;
      if (filters.status !== "All" && t.status !== filters.status) return false;
      if (filters.sector !== "All" && t.sector !== filters.sector) return false;
      if (filters.itemId && !t.itemId.toLowerCase().includes(filters.itemId.toLowerCase())) return false;
      if (filters.search && !t.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !t.userName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !t.nature.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  },

  counts: () => {
    const { tickets } = get();
    return {
      total: tickets.filter((t) => !t.trashed).length,
      new: tickets.filter((t) => t.label === "New" && !t.trashed).length,
      assigned: tickets.filter((t) => t.label === "Assigned" && !t.trashed).length,
      unassigned: tickets.filter((t) => t.label === "Unassigned" && !t.trashed).length,
      starred: tickets.filter((t) => t.starred && !t.trashed).length,
      trashed: tickets.filter((t) => t.trashed).length,
      high: tickets.filter((t) => t.priority === "High" && !t.trashed).length,
      medium: tickets.filter((t) => t.priority === "Medium" && !t.trashed).length,
      low: tickets.filter((t) => t.priority === "Low" && !t.trashed).length,
    };
  },
}));
