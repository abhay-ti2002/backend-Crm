// ─── Admin credentials ────────────────────────────────────────────────────────

export const adminCredentials = {
  email: "admin@crm.io",
  password: "admin123",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type Sector = "Finance" | "IT" | "HR" | "Operations" | "Support" | "Healthcare" | "Education";
export type AgentLevel = "L1" | "L2" | "L3";
export type ResolutionMethod = "Email" | "Call" | "Visit";
export type TicketStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Escalated to L2"
  | "Escalated to L3"
  | "Resolved"
  | "Closed"
  | "Forwarded";
export type TicketPriority = "High" | "Medium" | "Low";
export type TicketLabel = "New" | "Assigned" | "Unassigned" | "Starred" | "Trashed";
export type AgentAvailability = "available" | "at_capacity" | "offline";

export interface Agent {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  level: AgentLevel;
  sector: Sector;
  supervisorId: string | null;
  activeTickets: number;
  resolvedTickets: number;
  // true when the agent is signed in to the portal
  online: boolean;
  // Auto-computed from activeTickets; "offline" = not signed in
  // Backend integration: PATCH /api/agents/:id/availability
  availability: AgentAvailability;
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
  assignedAgentEmail: string | null;
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
  password: string;
  avatar: string;
  ticketCount: number;
  lastActive: string;
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export const agents: Agent[] = [];

// ─── Tickets ──────────────────────────────────────────────────────────────────

export const tickets: Ticket[] = [
  {
    id: "TKT-001", userId: "u1", userName: "Jasskaran Singh", userEmail: "jass@user.io",
    itemId: "ITM-401", productName: "Dell Laptop XPS 15", nature: "Hardware failure — screen flickering",
    description: "The laptop screen starts flickering after 10 minutes of use. Issue is reproducible consistently.",
    attachment: "screen_flicker.mp4", status: "Escalated to L2", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "IT", assignedAgentId: "a2", assignedAgentName: "Arjun Mehta", assignedAgentEmail: "agent@crm.io",
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
    starred: true, trashed: false, sector: "Healthcare", assignedAgentId: "a9", assignedAgentName: "Meera Das", assignedAgentEmail: "agent@crm.io",
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
    starred: false, trashed: false, sector: "Education", assignedAgentId: "a12", assignedAgentName: "Rahul Singh", assignedAgentEmail: "agent@crm.io",
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
    starred: true, trashed: false, sector: "Finance", assignedAgentId: "a13", assignedAgentName: "Pooja Verma", assignedAgentEmail: "agent@crm.io",
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
    starred: false, trashed: false, sector: null, assignedAgentId: null, assignedAgentName: null, assignedAgentEmail: null,
    escalationSteps: [],
    createdAt: "2026-03-24T07:30:00Z", updatedAt: "2026-03-24T07:30:00Z",
  },
  {
    id: "TKT-006", userId: "u6", userName: "Kavya Reddy", userEmail: "kavya@user.io",
    itemId: "ITM-088", productName: "HP Printer LaserJet", nature: "Printer offline on network",
    description: "Printer shows offline status even though it's powered on and connected to the same network.",
    attachment: null, status: "Open", priority: "Low", label: "New",
    starred: false, trashed: false, sector: null, assignedAgentId: null, assignedAgentName: null, assignedAgentEmail: null,
    escalationSteps: [],
    createdAt: "2026-03-24T08:00:00Z", updatedAt: "2026-03-24T08:00:00Z",
  },
  {
    id: "TKT-007", userId: "u7", userName: "Farhan Sheikh", userEmail: "farhan@user.io",
    itemId: "ITM-320", productName: "Virtual Classroom Tool", nature: "Audio not working during live sessions",
    description: "Teachers report that students cannot hear them during live class sessions despite mic working.",
    attachment: "audio_test.mp4", status: "In Progress", priority: "Medium", label: "Assigned",
    starred: false, trashed: false, sector: "Education", assignedAgentId: "a12", assignedAgentName: "Rahul Singh", assignedAgentEmail: "agent@crm.io",
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
    starred: false, trashed: false, sector: "Healthcare", assignedAgentId: "a8", assignedAgentName: "Vivek Gupta", assignedAgentEmail: "agent@crm.io",
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
    starred: false, trashed: true, sector: null, assignedAgentId: null, assignedAgentName: null, assignedAgentEmail: null,
    escalationSteps: [],
    createdAt: "2026-03-23T15:00:00Z", updatedAt: "2026-03-23T15:30:00Z",
  },
  {
    id: "TKT-010", userId: "u9", userName: "Bhavna Choudhary", userEmail: "bhavna@user.io",
    itemId: "ITM-780", productName: "Accounting Software Pro", nature: "GST report export failing",
    description: "Exporting GST report to PDF crashes the application every time for the March period.",
    attachment: "crash_log.txt", status: "Open", priority: "Medium", label: "New",
    starred: false, trashed: false, sector: null, assignedAgentId: null, assignedAgentName: null, assignedAgentEmail: null,
    escalationSteps: [],
    createdAt: "2026-03-24T09:00:00Z", updatedAt: "2026-03-24T09:00:00Z",
  },

  // ── Karan Bose (a4, IT L1) ──────────────────────────────────────────────────
  {
    id: "TKT-014", userId: "u5", userName: "Deepak Kumar", userEmail: "deepak@user.io",
    itemId: "ITM-401", productName: "Dell Laptop XPS 15", nature: "BSOD on startup after Windows update",
    description: "Laptop throws a blue screen error (SYSTEM_SERVICE_EXCEPTION) right after the latest Windows update was applied. The machine reboots in a loop.",
    attachment: "bsod_dump.txt", status: "In Progress", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "IT", assignedAgentId: "a4", assignedAgentName: "Karan Bose", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a4", agentName: "Karan Bose", method: "Call", startedAt: "2026-03-23T09:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Initiated safe-mode boot and ran SFC scan. Awaiting results from user." },
    ],
    createdAt: "2026-03-23T08:30:00Z", updatedAt: "2026-03-23T09:00:00Z",
  },
  {
    id: "TKT-015", userId: "u6", userName: "Kavya Reddy", userEmail: "kavya@user.io",
    itemId: "ITM-088", productName: "HP Printer LaserJet", nature: "Print jobs stuck in queue",
    description: "All print jobs get stuck in the Windows print queue and cannot be cleared even after spooler restart.",
    attachment: null, status: "Assigned", priority: "Medium", label: "Assigned",
    starred: false, trashed: false, sector: "IT", assignedAgentId: "a4", assignedAgentName: "Karan Bose", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a4", agentName: "Karan Bose", method: "Email", startedAt: "2026-03-24T10:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Sent printer driver reinstallation guide to user." },
    ],
    createdAt: "2026-03-24T09:45:00Z", updatedAt: "2026-03-24T10:00:00Z",
  },
  {
    id: "TKT-016", userId: "u7", userName: "Farhan Sheikh", userEmail: "farhan@user.io",
    itemId: "ITM-050", productName: "USB Hub 7-Port", nature: "USB hub only powers 3 of 7 ports",
    description: "After plugging in a USB hub, only 3 ports receive power. Remaining 4 ports show devices as unrecognised.",
    attachment: null, status: "Assigned", priority: "Low", label: "Assigned",
    starred: false, trashed: false, sector: "IT", assignedAgentId: "a4", assignedAgentName: "Karan Bose", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a4", agentName: "Karan Bose", method: "Email", startedAt: "2026-03-24T11:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Asked user to test on another machine to isolate port vs hub issue." },
    ],
    createdAt: "2026-03-24T10:30:00Z", updatedAt: "2026-03-24T11:00:00Z",
  },

  // ── Sneha Iyer (a5, IT L1) ──────────────────────────────────────────────────
  {
    id: "TKT-017", userId: "u3", userName: "Rohan Tiwari", userEmail: "rohan@user.io",
    itemId: "ITM-210", productName: "Network Switch Pro", nature: "VPN disconnects every 15 minutes",
    description: "Company VPN drops connection every 15 minutes precisely. Users in the Hyderabad branch are affected. Reconnecting manually each time is blocking work.",
    attachment: "vpn_logs.txt", status: "In Progress", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "IT", assignedAgentId: "a5", assignedAgentName: "Sneha Iyer", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a5", agentName: "Sneha Iyer", method: "Call", startedAt: "2026-03-22T13:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Collected VPN logs. Identified keep-alive setting mismatch — pushing config update." },
    ],
    createdAt: "2026-03-22T12:30:00Z", updatedAt: "2026-03-22T13:00:00Z",
  },
  {
    id: "TKT-018", userId: "u4", userName: "Sonal Mehta", userEmail: "sonal@user.io",
    itemId: "ITM-401", productName: "Dell Laptop XPS 15", nature: "Battery drains from 100% to 20% in 90 mins",
    description: "Laptop battery health dropped significantly after a firmware update. Full charge now lasts less than 2 hours under normal load.",
    attachment: null, status: "Assigned", priority: "Medium", label: "Assigned",
    starred: false, trashed: false, sector: "IT", assignedAgentId: "a5", assignedAgentName: "Sneha Iyer", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a5", agentName: "Sneha Iyer", method: "Email", startedAt: "2026-03-24T08:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Sent power calibration and battery report steps. Awaiting battery health report from user." },
    ],
    createdAt: "2026-03-23T17:00:00Z", updatedAt: "2026-03-24T08:00:00Z",
  },

  // ── Meera Das (a9, Healthcare L1) ────────────────────────────────────────────
  {
    id: "TKT-019", userId: "u2", userName: "Anita Desai", userEmail: "anita@user.io",
    itemId: "ITM-102", productName: "Patient Monitor Model Z", nature: "Alarm thresholds reset after power cycle",
    description: "Every time the monitor is power-cycled the SpO2 and HR alarm thresholds reset to factory defaults, requiring manual reconfiguration each shift.",
    attachment: "monitor_config.pdf", status: "In Progress", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "Healthcare", assignedAgentId: "a9", assignedAgentName: "Meera Das", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a9", agentName: "Meera Das", method: "Call", startedAt: "2026-03-23T11:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Contacted device manufacturer. Waiting for firmware patch ETA." },
    ],
    createdAt: "2026-03-23T10:30:00Z", updatedAt: "2026-03-23T11:00:00Z",
  },
  {
    id: "TKT-020", userId: "u8", userName: "Geeta Pillai", userEmail: "geeta@user.io",
    itemId: "ITM-999", productName: "Blood Pressure Monitor", nature: "Device won't pair with mobile app",
    description: "Bluetooth pairing between the BP monitor and the hospital mobile app fails on all ward tablets. App shows 'Device not found' despite monitor being in pairing mode.",
    attachment: null, status: "Assigned", priority: "Medium", label: "Assigned",
    starred: false, trashed: false, sector: "Healthcare", assignedAgentId: "a9", assignedAgentName: "Meera Das", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a9", agentName: "Meera Das", method: "Email", startedAt: "2026-03-24T09:30:00Z", resolvedAt: null, outcome: "In Progress", notes: "Sent Bluetooth reset and re-pair guide. Asked nursing staff to confirm BLE is enabled on tablets." },
    ],
    createdAt: "2026-03-24T09:00:00Z", updatedAt: "2026-03-24T09:30:00Z",
  },

  // ── Rahul Singh (a12, Education L1) ──────────────────────────────────────────
  {
    id: "TKT-021", userId: "u9", userName: "Bhavna Choudhary", userEmail: "bhavna@user.io",
    itemId: "ITM-310", productName: "LMS Platform License", nature: "Assignment submissions not saving",
    description: "Students submit assignments via the LMS portal but submissions are not recorded. The portal shows a success message but the instructor sees no submission in the grade book.",
    attachment: "lms_error.png", status: "In Progress", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "Education", assignedAgentId: "a12", assignedAgentName: "Rahul Singh", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a12", agentName: "Rahul Singh", method: "Email", startedAt: "2026-03-24T07:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Identified database write failure in submission module. Raised a platform support ticket with the LMS vendor." },
    ],
    createdAt: "2026-03-24T06:30:00Z", updatedAt: "2026-03-24T07:00:00Z",
  },

  // ── Tanya Saxena (a15, Finance L1) ───────────────────────────────────────────
  {
    id: "TKT-022", userId: "u9", userName: "Bhavna Choudhary", userEmail: "bhavna@user.io",
    itemId: "ITM-780", productName: "Accounting Software Pro", nature: "Invoice numbering reset to 1 after month-end",
    description: "After running the month-end close process, the invoice auto-numbering sequence reset back to 1 instead of continuing from the last number, causing duplicate invoice numbers.",
    attachment: "invoice_sequence.xlsx", status: "In Progress", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "Finance", assignedAgentId: "a15", assignedAgentName: "Tanya Saxena", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a15", agentName: "Tanya Saxena", method: "Call", startedAt: "2026-03-24T08:30:00Z", resolvedAt: null, outcome: "In Progress", notes: "Reviewed month-end procedure logs. Found sequence counter not persisting correctly. Escalation may be required." },
    ],
    createdAt: "2026-03-24T08:00:00Z", updatedAt: "2026-03-24T08:30:00Z",
  },
  {
    id: "TKT-023", userId: "u4", userName: "Sonal Mehta", userEmail: "sonal@user.io",
    itemId: "ITM-555", productName: "Payroll Software Suite", nature: "PF deduction not calculating correctly for new joiners",
    description: "Employees who joined after March 1st have incorrect PF deductions in the March payslip. The system is using the old CTC instead of the new joining salary.",
    attachment: null, status: "Assigned", priority: "Medium", label: "Assigned",
    starred: false, trashed: false, sector: "Finance", assignedAgentId: "a15", assignedAgentName: "Tanya Saxena", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a15", agentName: "Tanya Saxena", method: "Email", startedAt: "2026-03-24T10:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Verified joining dates and salary configurations. Issue confirmed for 3 employees. Preparing correction batch." },
    ],
    createdAt: "2026-03-24T09:30:00Z", updatedAt: "2026-03-24T10:00:00Z",
  },

  // ── Arjun Mehta (a2, IT L2) ──────────────────────────────────────────────────
  {
    id: "TKT-024", userId: "u5", userName: "Deepak Kumar", userEmail: "deepak@user.io",
    itemId: "ITM-205", productName: "Firewall Appliance", nature: "Firewall dropping HTTPS traffic intermittently",
    description: "Certain HTTPS requests to external APIs are being silently dropped by the firewall. Affects CI/CD pipelines and payment gateway integrations.",
    attachment: "firewall_trace.pcap", status: "In Progress", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "IT", assignedAgentId: "a2", assignedAgentName: "Arjun Mehta", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L2", agentId: "a2", agentName: "Arjun Mehta", method: "Call", startedAt: "2026-03-24T11:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "Reviewing packet captures. Suspect deep packet inspection rule causing false positives on API traffic." },
    ],
    createdAt: "2026-03-24T10:00:00Z", updatedAt: "2026-03-24T11:00:00Z",
  },

  // ── Vivek Gupta (a8, Healthcare L2) ──────────────────────────────────────────
  {
    id: "TKT-025", userId: "u2", userName: "Anita Desai", userEmail: "anita@user.io",
    itemId: "ITM-102", productName: "Patient Monitor Model Z", nature: "Network connectivity drops in ICU wing",
    description: "Patient monitors in the ICU wing lose network connectivity every 4-6 hours, causing gaps in remote monitoring data. Issue started after network switch replacement last week.",
    attachment: "network_topology.pdf", status: "Escalated to L2", priority: "High", label: "Assigned",
    starred: true, trashed: false, sector: "Healthcare", assignedAgentId: "a8", assignedAgentName: "Vivek Gupta", assignedAgentEmail: "agent@crm.io",
    escalationSteps: [
      { level: "L1", agentId: "a9", agentName: "Meera Das", method: "Email", startedAt: "2026-03-22T08:00:00Z", resolvedAt: "2026-03-22T14:00:00Z", outcome: "Escalated", notes: "Basic network troubleshooting exhausted. Switch configuration requires L2 access." },
      { level: "L2", agentId: "a8", agentName: "Vivek Gupta", method: "Visit", startedAt: "2026-03-23T09:00:00Z", resolvedAt: null, outcome: "In Progress", notes: "On-site visit completed. Identified VLAN misconfiguration on the new switch. Applying fix in maintenance window tonight." },
    ],
    createdAt: "2026-03-22T07:30:00Z", updatedAt: "2026-03-23T09:00:00Z",
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
  { id: "u1", name: "Jasskaran Singh", email: "jass@user.io", password: "user123", avatar: "JS", ticketCount: 2, lastActive: "2026-03-24T08:00:00Z" },
  { id: "u2", name: "Anita Desai", email: "anita@user.io", password: "user123", avatar: "AD", ticketCount: 1, lastActive: "2026-03-22T10:00:00Z" },
  { id: "u3", name: "Rohan Tiwari", email: "rohan@user.io", password: "user123", avatar: "RT", ticketCount: 1, lastActive: "2026-03-18T15:00:00Z" },
  { id: "u4", name: "Sonal Mehta", email: "sonal@user.io", password: "user123", avatar: "SM", ticketCount: 1, lastActive: "2026-03-19T08:00:00Z" },
  { id: "u5", name: "Deepak Kumar", email: "deepak@user.io", password: "user123", avatar: "DK", ticketCount: 1, lastActive: "2026-03-24T07:30:00Z" },
  { id: "u6", name: "Kavya Reddy", email: "kavya@user.io", password: "user123", avatar: "KR", ticketCount: 1, lastActive: "2026-03-24T08:00:00Z" },
  { id: "u7", name: "Farhan Sheikh", email: "farhan@user.io", password: "user123", avatar: "FS", ticketCount: 1, lastActive: "2026-03-23T09:30:00Z" },
  { id: "u8", name: "Geeta Pillai", email: "geeta@user.io", password: "user123", avatar: "GP", ticketCount: 1, lastActive: "2026-03-15T08:30:00Z" },
  { id: "u9", name: "Bhavna Choudhary", email: "bhavna@user.io", password: "user123", avatar: "BC", ticketCount: 1, lastActive: "2026-03-24T09:00:00Z" },
];
