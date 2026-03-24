// ─── Types ────────────────────────────────────────────────────────────────────

export type Sector = "IT" | "Healthcare" | "Education" | "Finance";
export type AgentLevel = "L1" | "L2" | "L3";
export type ResolutionMethod = "Email" | "Call" | "Visit";
export type TicketStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Escalated to L2"
  | "Escalated to L3"
  | "Resolved"
  | "Closed";
export type TicketPriority = "High" | "Medium" | "Low";
export type TicketLabel = "New" | "Assigned" | "Unassigned" | "Starred" | "Trashed";

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: AgentLevel;
  sector: Sector;
  supervisorId: string | null;
  activeTickets: number;
  resolvedTickets: number;
  online: boolean;
}

export interface EscalationStep {
  level: AgentLevel;
  agentId: string;
  agentName: string;
  method: ResolutionMethod;
  startedAt: string;
  resolvedAt: string | null;
  outcome: "Resolved" | "Escalated" | "In Progress";
  notes: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  itemId: string;
  productName: string;
  nature: string;
  description: string;
  attachment: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  label: TicketLabel;
  starred: boolean;
  trashed: boolean;
  sector: Sector | null;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  escalationSteps: EscalationStep[];
  createdAt: string;
  updatedAt: string;
}

export interface ResolutionLog {
  id: string;
  ticketId: string;
  itemId: string;
  productName: string;
  sector: Sector;
  problemSummary: string;
  solutionSummary: string;
  resolvedBy: string;
  resolvedByLevel: AgentLevel;
  method: ResolutionMethod;
  priority: TicketPriority;
  timeToResolve: string;
  resolvedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  sector: Sector;
  ticketCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  ticketCount: number;
  lastActive: string;
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export const agents: Agent[] = [
  // IT Sector
  { id: "a1", name: "Riya Sharma", email: "riya@crm.io", avatar: "RS", level: "L3", sector: "IT", supervisorId: null, activeTickets: 2, resolvedTickets: 48, online: true },
  { id: "a2", name: "Arjun Mehta", email: "arjun@crm.io", avatar: "AM", level: "L2", sector: "IT", supervisorId: "a1", activeTickets: 4, resolvedTickets: 31, online: true },
  { id: "a3", name: "Priya Nair", email: "priya@crm.io", avatar: "PN", level: "L2", sector: "IT", supervisorId: "a1", activeTickets: 3, resolvedTickets: 27, online: false },
  { id: "a4", name: "Karan Bose", email: "karan@crm.io", avatar: "KB", level: "L1", sector: "IT", supervisorId: "a2", activeTickets: 6, resolvedTickets: 19, online: true },
  { id: "a5", name: "Sneha Iyer", email: "sneha@crm.io", avatar: "SI", level: "L1", sector: "IT", supervisorId: "a2", activeTickets: 5, resolvedTickets: 14, online: true },
  { id: "a6", name: "Dev Patel", email: "dev@crm.io", avatar: "DP", level: "L1", sector: "IT", supervisorId: "a3", activeTickets: 7, resolvedTickets: 11, online: false },

  // Healthcare Sector
  { id: "a7", name: "Dr. Ananya Roy", email: "ananya@crm.io", avatar: "AR", level: "L3", sector: "Healthcare", supervisorId: null, activeTickets: 1, resolvedTickets: 52, online: true },
  { id: "a8", name: "Vivek Gupta", email: "vivek@crm.io", avatar: "VG", level: "L2", sector: "Healthcare", supervisorId: "a7", activeTickets: 3, resolvedTickets: 22, online: true },
  { id: "a9", name: "Meera Das", email: "meera@crm.io", avatar: "MD", level: "L1", sector: "Healthcare", supervisorId: "a8", activeTickets: 8, resolvedTickets: 9, online: false },

  // Education Sector
  { id: "a10", name: "Prof. Suresh Rao", email: "suresh@crm.io", avatar: "SR", level: "L3", sector: "Education", supervisorId: null, activeTickets: 0, resolvedTickets: 35, online: false },
  { id: "a11", name: "Nisha Kapoor", email: "nisha@crm.io", avatar: "NK", level: "L2", sector: "Education", supervisorId: "a10", activeTickets: 2, resolvedTickets: 18, online: true },
  { id: "a12", name: "Rahul Singh", email: "rahul@crm.io", avatar: "RS2", level: "L1", sector: "Education", supervisorId: "a11", activeTickets: 4, resolvedTickets: 7, online: true },

  // Finance Sector
  { id: "a13", name: "Pooja Verma", email: "pooja@crm.io", avatar: "PV", level: "L3", sector: "Finance", supervisorId: null, activeTickets: 1, resolvedTickets: 41, online: true },
  { id: "a14", name: "Amit Joshi", email: "amit@crm.io", avatar: "AJ", level: "L2", sector: "Finance", supervisorId: "a13", activeTickets: 3, resolvedTickets: 16, online: false },
  { id: "a15", name: "Tanya Saxena", email: "tanya@crm.io", avatar: "TS", level: "L1", sector: "Finance", supervisorId: "a14", activeTickets: 5, resolvedTickets: 8, online: true },
];

// ─── Tickets ──────────────────────────────────────────────────────────────────

export const tickets: Ticket[] = [
  {
    id: "TKT-001", userId: "u1", userName: "Jasskaran Singh", userEmail: "jass@user.io",
    itemId: "ITM-401", productName: "Dell Laptop XPS 15", nature: "Hardware failure — screen flickering",
    description: "The laptop screen starts flickering after 10 minutes of use. Issue is reproducible consistently.",
    attachment: "screen_flicker.mp4", status: "Escalated to L2", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "IT", assignedAgentId: "a2", assignedAgentName: "Arjun Mehta",
    escalationSteps: [
      { level: "L1", agentId: "a4", agentName: "Karan Bose", method: "Email", startedAt: "2026-03-20T09:00:00Z", resolvedAt: "2026-03-21T11:00:00Z", outcome: "Escalated", notes: "Sent troubleshooting email. User confirmed issue persists after driver update." },
      { level: "L2", agentId: "a2", agentName: "Arjun Mehta", method: "Call", startedAt: "2026-03-21T14:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Scheduled a call for hardware diagnostics." },
    ],
    createdAt: "2026-03-20T08:30:00Z", updatedAt: "2026-03-21T14:00:00Z",
  },
  {
    id: "TKT-002", userId: "u2", userName: "Anita Desai", userEmail: "anita@user.io",
    itemId: "ITM-102", productName: "Patient Monitor Model Z", nature: "Device not syncing with hospital software",
    description: "The patient monitor stops syncing data after 30 mins of operation. Critical for ward operations.",
    attachment: null, status: "Assigned", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "Healthcare", assignedAgentId: "a9", assignedAgentName: "Meera Das",
    escalationSteps: [
      { level: "L1", agentId: "a9", agentName: "Meera Das", method: "Email", startedAt: "2026-03-22T10:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Sent configuration guide via email." },
    ],
    createdAt: "2026-03-22T09:45:00Z", updatedAt: "2026-03-22T10:00:00Z",
  },
  {
    id: "TKT-003", userId: "u3", userName: "Rohan Tiwari", userEmail: "rohan@user.io",
    itemId: "ITM-310", productName: "LMS Platform License", nature: "Cannot access course materials",
    description: "Students in batch B-2024 cannot log into the LMS platform. Error 403 on all accounts.",
    attachment: "error_screenshot.png", status: "Resolved", priority: "Medium", label: "Assigned",
    starred: false, trashed: false, sector: "Education", assignedAgentId: "a12", assignedAgentName: "Rahul Singh",
    escalationSteps: [
      { level: "L1", agentId: "a12", agentName: "Rahul Singh", method: "Email", startedAt: "2026-03-18T09:00:00Z", resolvedAt: "2026-03-18T15:00:00Z", outcome: "Resolved", notes: "Reset permissions for batch B-2024 accounts. Issue was a misconfigured role assignment after a platform update." },
    ],
    createdAt: "2026-03-18T08:30:00Z", updatedAt: "2026-03-18T15:00:00Z",
  },
  {
    id: "TKT-004", userId: "u4", userName: "Sonal Mehta", userEmail: "sonal@user.io",
    itemId: "ITM-555", productName: "Payroll Software Suite", nature: "Salary disbursement calculation error",
    description: "March payroll shows incorrect TDS deductions for 12 employees in the Pune office.",
    attachment: "payroll_report.xlsx", status: "Escalated to L3", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "Finance", assignedAgentId: "a13", assignedAgentName: "Pooja Verma",
    escalationSteps: [
      { level: "L1", agentId: "a15", agentName: "Tanya Saxena", method: "Email", startedAt: "2026-03-19T09:00:00Z", resolvedAt: "2026-03-19T17:00:00Z", outcome: "Escalated", notes: "Reviewed configuration. Issue requires database-level fix." },
      { level: "L2", agentId: "a14", agentName: "Amit Joshi", method: "Call", startedAt: "2026-03-20T10:00:00Z", resolvedAt: "2026-03-20T16:00:00Z", outcome: "Escalated", notes: "On-call diagnosis done. Root cause in payroll engine config. L3 visit needed." },
      { level: "L3", agentId: "a13", agentName: "Pooja Verma", method: "Visit", startedAt: "2026-03-22T09:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Scheduled on-site visit to Pune office on 24 March." },
    ],
    createdAt: "2026-03-19T08:00:00Z", updatedAt: "2026-03-22T09:00:00Z",
  },
  {
    id: "TKT-005", userId: "u5", userName: "Deepak Kumar", userEmail: "deepak@user.io",
    itemId: "ITM-210", productName: "Network Switch Pro", nature: "Office network drops every 2 hours",
    description: "The network switch reboots automatically every 2 hours causing full office downtime.",
    attachment: "network_logs.txt", status: "Open", priority: "High", label: "Unassigned",
    starred: false, trashed: false, sector: null, assignedAgentId: null, assignedAgentName: null,
    escalationSteps: [],
    createdAt: "2026-03-24T07:30:00Z", updatedAt: "2026-03-24T07:30:00Z",
  },
  {
    id: "TKT-006", userId: "u6", userName: "Kavya Reddy", userEmail: "kavya@user.io",
    itemId: "ITM-088", productName: "HP Printer LaserJet", nature: "Printer offline on network",
    description: "Printer shows offline status even though it's powered on and connected to the same network.",
    attachment: null, status: "Open", priority: "Low", label: "New",
    starred: false, trashed: false, sector: null, assignedAgentId: null, assignedAgentName: null,
    escalationSteps: [],
    createdAt: "2026-03-24T08:00:00Z", updatedAt: "2026-03-24T08:00:00Z",
  },
  {
    id: "TKT-007", userId: "u7", userName: "Farhan Sheikh", userEmail: "farhan@user.io",
    itemId: "ITM-320", productName: "Virtual Classroom Tool", nature: "Audio not working during live sessions",
    description: "Teachers report that students cannot hear them during live class sessions despite mic working.",
    attachment: "audio_test.mp4", status: "In Progress", priority: "Medium", label: "Assigned",
    starred: false, trashed: false, sector: "Education", assignedAgentId: "a12", assignedAgentName: "Rahul Singh",
    escalationSteps: [
      { level: "L1", agentId: "a12", agentName: "Rahul Singh", method: "Email", startedAt: "2026-03-23T10:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Sent audio configuration guide and scheduled a follow-up." },
    ],
    createdAt: "2026-03-23T09:30:00Z", updatedAt: "2026-03-23T10:00:00Z",
  },
  {
    id: "TKT-008", userId: "u8", userName: "Geeta Pillai", userEmail: "geeta@user.io",
    itemId: "ITM-999", productName: "Blood Pressure Monitor", nature: "Readings inconsistent",
    description: "The monitor gives wildly different readings back to back. Suspected sensor calibration issue.",
    attachment: null, status: "Closed", priority: "Medium", label: "Assigned",
    starred: false, trashed: false, sector: "Healthcare", assignedAgentId: "a8", assignedAgentName: "Vivek Gupta",
    escalationSteps: [
      { level: "L1", agentId: "a9", agentName: "Meera Das", method: "Email", startedAt: "2026-03-15T09:00:00Z", resolvedAt: "2026-03-15T14:00:00Z", outcome: "Escalated", notes: "Email troubleshooting did not resolve. Escalated." },
      { level: "L2", agentId: "a8", agentName: "Vivek Gupta", method: "Call", startedAt: "2026-03-16T10:00:00Z", resolvedAt: "2026-03-16T12:00:00Z", outcome: "Resolved", notes: "Walked user through factory reset and recalibration. Readings now consistent." },
    ],
    createdAt: "2026-03-15T08:30:00Z", updatedAt: "2026-03-16T12:00:00Z",
  },
  {
    id: "TKT-009", userId: "u1", userName: "Jasskaran Singh", userEmail: "jass@user.io",
    itemId: "ITM-050", productName: "USB Hub 7-Port", nature: "USB hub not recognized",
    description: "Hub shows as unrecognized device. Tried different ports and cables, same issue.",
    attachment: null, status: "Open", priority: "Low", label: "New",
    starred: false, trashed: true, sector: null, assignedAgentId: null, assignedAgentName: null,
    escalationSteps: [],
    createdAt: "2026-03-23T15:00:00Z", updatedAt: "2026-03-23T15:30:00Z",
  },
  {
    id: "TKT-010", userId: "u9", userName: "Bhavna Choudhary", userEmail: "bhavna@user.io",
    itemId: "ITM-780", productName: "Accounting Software Pro", nature: "GST report export failing",
    description: "Exporting GST report to PDF crashes the application every time for the March period.",
    attachment: "crash_log.txt", status: "Open", priority: "Medium", label: "New",
    starred: false, trashed: false, sector: null, assignedAgentId: null, assignedAgentName: null,
    escalationSteps: [],
    createdAt: "2026-03-24T09:00:00Z", updatedAt: "2026-03-24T09:00:00Z",
  },
];

// ─── Resolution Logs ──────────────────────────────────────────────────────────

export const resolutionLogs: ResolutionLog[] = [
  {
    id: "LOG-001", ticketId: "TKT-003", itemId: "ITM-310", productName: "LMS Platform License",
    sector: "Education", problemSummary: "Students unable to access LMS — Error 403",
    solutionSummary: "Reset role permissions for batch B-2024 after platform update misconfiguration.",
    resolvedBy: "Rahul Singh", resolvedByLevel: "L1", method: "Email", priority: "Medium",
    timeToResolve: "6h 30m", resolvedAt: "2026-03-18T15:00:00Z",
  },
  {
    id: "LOG-002", ticketId: "TKT-008", itemId: "ITM-999", productName: "Blood Pressure Monitor",
    sector: "Healthcare", problemSummary: "Inconsistent blood pressure readings from device",
    solutionSummary: "Factory reset and recalibration performed over call. Sensor readings now stable.",
    resolvedBy: "Vivek Gupta", resolvedByLevel: "L2", method: "Call", priority: "Medium",
    timeToResolve: "1d 3h", resolvedAt: "2026-03-16T12:00:00Z",
  },
  {
    id: "LOG-003", ticketId: "TKT-011", itemId: "ITM-205", productName: "Firewall Appliance",
    sector: "IT", problemSummary: "Firewall blocking internal traffic after rule update",
    solutionSummary: "L3 visited site, identified misconfigured ACL rules, restored correct policy set.",
    resolvedBy: "Riya Sharma", resolvedByLevel: "L3", method: "Visit", priority: "High",
    timeToResolve: "2d 4h", resolvedAt: "2026-03-10T16:00:00Z",
  },
  {
    id: "LOG-004", ticketId: "TKT-012", itemId: "ITM-445", productName: "Tally ERP",
    sector: "Finance", problemSummary: "Balance sheet not matching after year-end closing",
    solutionSummary: "L1 identified journal entry error via email, corrected entries and re-ran closing.",
    resolvedBy: "Tanya Saxena", resolvedByLevel: "L1", method: "Email", priority: "High",
    timeToResolve: "4h 15m", resolvedAt: "2026-03-12T13:00:00Z",
  },
  {
    id: "LOG-005", ticketId: "TKT-013", itemId: "ITM-320", productName: "Virtual Classroom Tool",
    sector: "Education", problemSummary: "Video quality degraded during peak hours",
    solutionSummary: "L2 scheduled call, identified bandwidth throttling config, updated QoS settings.",
    resolvedBy: "Nisha Kapoor", resolvedByLevel: "L2", method: "Call", priority: "Low",
    timeToResolve: "5h 20m", resolvedAt: "2026-03-14T17:00:00Z",
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  { id: "ITM-401", name: "Dell Laptop XPS 15", category: "Laptop", stock: 12, unit: "units", sector: "IT", ticketCount: 3 },
  { id: "ITM-210", name: "Network Switch Pro", category: "Networking", stock: 4, unit: "units", sector: "IT", ticketCount: 5 },
  { id: "ITM-088", name: "HP Printer LaserJet", category: "Printer", stock: 7, unit: "units", sector: "IT", ticketCount: 2 },
  { id: "ITM-205", name: "Firewall Appliance", category: "Security", stock: 2, unit: "units", sector: "IT", ticketCount: 1 },
  { id: "ITM-050", name: "USB Hub 7-Port", category: "Accessories", stock: 35, unit: "units", sector: "IT", ticketCount: 1 },
  { id: "ITM-102", name: "Patient Monitor Model Z", category: "Medical Device", stock: 3, unit: "units", sector: "Healthcare", ticketCount: 4 },
  { id: "ITM-999", name: "Blood Pressure Monitor", category: "Medical Device", stock: 18, unit: "units", sector: "Healthcare", ticketCount: 2 },
  { id: "ITM-310", name: "LMS Platform License", category: "Software", stock: 500, unit: "licenses", sector: "Education", ticketCount: 6 },
  { id: "ITM-320", name: "Virtual Classroom Tool", category: "Software", stock: 200, unit: "licenses", sector: "Education", ticketCount: 3 },
  { id: "ITM-555", name: "Payroll Software Suite", category: "Software", stock: 50, unit: "licenses", sector: "Finance", ticketCount: 2 },
  { id: "ITM-780", name: "Accounting Software Pro", category: "Software", stock: 80, unit: "licenses", sector: "Finance", ticketCount: 3 },
  { id: "ITM-445", name: "Tally ERP", category: "Software", stock: 0, unit: "licenses", sector: "Finance", ticketCount: 1 },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const users: User[] = [
  { id: "u1", name: "Jasskaran Singh", email: "jass@user.io", avatar: "JS", ticketCount: 2, lastActive: "2026-03-24T08:00:00Z" },
  { id: "u2", name: "Anita Desai", email: "anita@user.io", avatar: "AD", ticketCount: 1, lastActive: "2026-03-22T10:00:00Z" },
  { id: "u3", name: "Rohan Tiwari", email: "rohan@user.io", avatar: "RT", ticketCount: 1, lastActive: "2026-03-18T15:00:00Z" },
  { id: "u4", name: "Sonal Mehta", email: "sonal@user.io", avatar: "SM", ticketCount: 1, lastActive: "2026-03-19T08:00:00Z" },
  { id: "u5", name: "Deepak Kumar", email: "deepak@user.io", avatar: "DK", ticketCount: 1, lastActive: "2026-03-24T07:30:00Z" },
  { id: "u6", name: "Kavya Reddy", email: "kavya@user.io", avatar: "KR", ticketCount: 1, lastActive: "2026-03-24T08:00:00Z" },
  { id: "u7", name: "Farhan Sheikh", email: "farhan@user.io", avatar: "FS", ticketCount: 1, lastActive: "2026-03-23T09:30:00Z" },
  { id: "u8", name: "Geeta Pillai", email: "geeta@user.io", avatar: "GP", ticketCount: 1, lastActive: "2026-03-15T08:30:00Z" },
  { id: "u9", name: "Bhavna Choudhary", email: "bhavna@user.io", avatar: "BC", ticketCount: 1, lastActive: "2026-03-24T09:00:00Z" },
];
