import { create } from "zustand";
import { tickets as mockTickets, Ticket, TicketLabel, TicketPriority, TicketStatus, Sector, AgentLevel, EscalationStep, Agent } from "@/lib/mockData";
import { getTickets, BackendTicket, updateTicketStatusApi, forwardTicketApi } from "@/lib/api/tickets";

interface TicketFilters {
  label: TicketLabel | "All";
  priority: TicketPriority | "All";
  status: TicketStatus | "All";
  sector: Sector | "All";
  agentLevel: AgentLevel | "All";
  itemId: string;
  search: string;
}

// Shape for creating a new ticket.
// Backend integration: POST /api/tickets with this body.
export interface NewTicketData {
  userId: string;
  userName: string;
  userEmail: string;
  itemId: string;
  productName: string;
  nature: string;
  description: string;
  attachment: string | null;
  sector: Sector;
  priority: TicketPriority;
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
  assignSector: (id: string, sector: Sector, agentId: string, agentName: string, agentEmail: string) => void;
  filteredTickets: () => Ticket[];
  counts: () => Record<string, number>;
  // Agent-facing actions
  // Backend integration: each maps to a dedicated API endpoint (see comments per action)
  createTicket: (data: NewTicketData, assignedAgent: Agent | null) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<void>;
  forwardTicket: (id: string) => Promise<void>;
  escalateTicket: (id: string, toLevel: "L2" | "L3", newAgent: Agent, currentAgentId: string) => void;
  addNote: (id: string, note: string) => void;
  acceptPendingTicket: (id: string, agent: Agent) => void;
  fetchTickets: () => Promise<void>;
}

const mapStatus = (backendStatus: string): TicketStatus => {
  switch (backendStatus.toLowerCase()) {
    case "new": return "Open";
    case "received": return "In Progress";
    case "resolved": return "Resolved";
    case "forwarded": return "Forwarded";
    case "rejected": return "Closed";
    case "closed": return "Closed";
    default: return "Open";
  }
};

const mapLabel = (bt: BackendTicket): TicketLabel => {
  if (bt.status === "new") return "New";
  if (bt.assignedTo) return "Assigned";
  return "Unassigned";
};

const mapBackendTicketToFrontend = (bt: BackendTicket): Ticket => {
  return {
    id: bt._id,
    userId: bt.createdBy?._id || "unknown",
    userName: bt.createdBy?.name || "Customer",
    userEmail: bt.createdBy?.email || "",
    itemId: (bt.itemId as any)?._id || bt.itemId || "N/A",
    productName: (bt.itemId as any)?.nature || (bt.itemId as any)?.name || "General Product",
    nature: bt.title,
    description: bt.description,
    attachment: null,
    status: mapStatus(bt.status),
    priority: "Medium", // Backend should ideally provide this
    label: mapLabel(bt),
    starred: false,
    trashed: false,
    sector: bt.sector as Sector,
    assignedAgentId: bt.assignedTo?._id || null,
    assignedAgentName: bt.assignedTo?.name || null,
    assignedAgentEmail: bt.assignedTo?.email || null,
    escalationSteps: bt.history.map(h => ({
      level: "L1", // Simplified
      agentId: h.performedBy?._id || h.performedBy || "unknown",
      agentName: h.performedBy?.name || (h.action?.includes("Customer") ? bt.createdBy?.name : "Agent"),
      method: "Email",
      startedAt: h.timestamp,
      resolvedAt: null,
      outcome: h.action?.includes("Resolved") ? "Resolved" : "In Progress",
      notes: h.action
    })),
    createdAt: bt.createdAt,
    updatedAt: bt.updatedAt,
  };
};

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
  tickets: [],
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

  assignSector: (id, sector, agentId, agentName, agentEmail) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id
          ? { ...t, sector, assignedAgentId: agentId, assignedAgentName: agentName, assignedAgentEmail: agentEmail, status: "Assigned", label: "Assigned" }
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

  // Creates a new ticket and auto-assigns it if an available agent is provided.
  // Backend integration: POST /api/tickets — server performs auto-assign and returns the created ticket.
  createTicket: (data, assignedAgent) => {
    const now = new Date().toISOString();
    const id = `TKT-${String(get().tickets.length + 1).padStart(3, "0")}`;

    const escalationSteps: EscalationStep[] = assignedAgent
      ? [{
        level: "L1",
        agentId: assignedAgent.id,
        agentName: assignedAgent.name,
        method: "Email",
        startedAt: now,
        resolvedAt: null,
        outcome: "In Progress",
        notes: "",
      }]
      : [];

    const newTicket: Ticket = {
      id,
      ...data,
      status: assignedAgent ? "Assigned" : "Open",
      label: assignedAgent ? "Assigned" : "Unassigned",
      starred: false,
      trashed: false,
      assignedAgentId: assignedAgent?.id ?? null,
      assignedAgentName: assignedAgent?.name ?? null,
      assignedAgentEmail: assignedAgent?.email ?? null,
      escalationSteps,
      createdAt: now,
      updatedAt: now,
    };

    set((s) => ({ tickets: [newTicket, ...s.tickets] }));
  },

  // Updates the status of a ticket and closes/updates the active escalation step.
  // Backend integration: PATCH /api/tickets/:id/status
  updateTicketStatus: async (id, status) => {
    try {
      // Mapping frontend status to backend expected strings
      const backendStatusMap: Record<string, string> = {
        "Open": "new",
        "In Progress": "received",
        "Resolved": "resolved",
        "Forwarded": "forwarded",
        "Closed": "closed"
      };

      const backendStatus = backendStatusMap[status] || status.toLowerCase();
      const updatedBackendTicket = await updateTicketStatusApi(id, backendStatus);
      const updatedTicket = mapBackendTicketToFrontend(updatedBackendTicket);

      set((s) => ({
        tickets: s.tickets.map((t) => (t.id === id ? updatedTicket : t)),
      }));
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      throw error;
    }
  },

  // Forwards a ticket (escalates to next level)
  // Backend integration: PATCH /api/tickets/:id/forward
  forwardTicket: async (id) => {
    try {
      const updatedBackendTicket = await forwardTicketApi(id);
      const updatedTicket = mapBackendTicketToFrontend(updatedBackendTicket);

      set((s) => ({
        tickets: s.tickets.map((t) => (t.id === id ? updatedTicket : t)),
      }));
    } catch (error) {
      console.error("Failed to forward ticket:", error);
      throw error;
    }
  },

  // Escalates a ticket to the next level agent.
  // Closes the current escalation step and opens a new one for the target agent.
  // Backend integration: POST /api/tickets/:id/escalate
  escalateTicket: (id, toLevel, newAgent, _currentAgentId) => {
    const now = new Date().toISOString();
    const newStatus: TicketStatus = toLevel === "L2" ? "Escalated to L2" : "Escalated to L3";

    set((s) => ({
      tickets: s.tickets.map((t) => {
        if (t.id !== id) return t;
        const updatedSteps: EscalationStep[] = [
          ...t.escalationSteps.map((step, idx) =>
            idx === t.escalationSteps.length - 1
              ? { ...step, outcome: "Escalated" as const, resolvedAt: now }
              : step
          ),
          {
            level: toLevel,
            agentId: newAgent.id,
            agentName: newAgent.name,
            method: "Email" as const,
            startedAt: now,
            resolvedAt: null,
            outcome: "In Progress" as const,
            notes: "",
          },
        ];
        return {
          ...t,
          status: newStatus,
          assignedAgentId: newAgent.id,
          assignedAgentName: newAgent.name,
          assignedAgentEmail: newAgent.email,
          label: "Assigned" as const,
          escalationSteps: updatedSteps,
          updatedAt: now,
        };
      }),
    }));
  },

  // Appends or replaces the note on the active escalation step.
  // Backend integration: POST /api/tickets/:id/notes
  addNote: (id, note) => {
    set((s) => ({
      tickets: s.tickets.map((t) => {
        if (t.id !== id || t.escalationSteps.length === 0) return t;
        return {
          ...t,
          updatedAt: new Date().toISOString(),
          escalationSteps: t.escalationSteps.map((step, idx) =>
            idx === t.escalationSteps.length - 1 ? { ...step, notes: note } : step
          ),
        };
      }),
    }));
  },

  // Self-assigns an unassigned (pending pool) ticket to an agent who is at capacity.
  // Backend integration: POST /api/tickets/:id/accept
  acceptPendingTicket: (id, agent) => {
    const now = new Date().toISOString();
    set((s) => ({
      tickets: s.tickets.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: "Assigned" as const,
          label: "Assigned" as const,
          assignedAgentId: agent.id,
          assignedAgentName: agent.name,
          assignedAgentEmail: agent.email,
          updatedAt: now,
          escalationSteps: [
            ...t.escalationSteps,
            {
              level: "L1" as const,
              agentId: agent.id,
              agentName: agent.name,
              method: "Email" as const,
              startedAt: now,
              resolvedAt: null,
              outcome: "In Progress" as const,
              notes: "",
            },
          ],
        };
      }),
    }));
  },

  fetchTickets: async () => {
    try {
      const backendTickets = await getTickets();
      const mapped = backendTickets.map(mapBackendTicketToFrontend);
      set({ tickets: mapped });
    } catch (error) {
      console.error("[TicketStore] Error fetching tickets:", error);
    }
  },
}));
