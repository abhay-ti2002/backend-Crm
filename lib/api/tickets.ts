import { api } from "./api";

/**
 * Backend Ticket Shape
 */
export interface BackendTicket {
  _id: string;
  title: string;
  description: string;
  sector: string;
  status: string;
  level: number;
  createdBy: { _id: string; name: string; email: string } | null;
  assignedTo: { _id: string; name: string; email: string } | null;
  orderId: any | null;
  itemId: any | null;
  history: any[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetches all tickets (Admin sees all, Agent sees assigned, Customer sees created)
 */
export async function getTickets(): Promise<BackendTicket[]> {
  return api("/tickets");
}

/**
 * Fetches all tickets (History view)
 */
export async function getTicketHistory(): Promise<BackendTicket[]> {
  return api("/tickets/history");
}

/**
 * Updates a ticket status
 */
export async function updateTicketStatusApi(id: string, status: string): Promise<BackendTicket> {
  return api(`/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/**
 * Forwards a ticket (escalates to next level)
 */
export async function forwardTicketApi(id: string): Promise<BackendTicket> {
  return api(`/tickets/${id}/forward`, {
    method: "PATCH",
  });
}
