// Availability thresholds for agent auto-capacity management.
// Backend integration: these values should come from a config API endpoint.

export const CAPACITY_THRESHOLD = 10; // activeTickets >= this → agent becomes "at_capacity"
export const RESUME_THRESHOLD = 6;    // activeTickets <= this → agent returns to "available"

// Hysteresis zone: 7–9 tickets = no state change (prevents rapid toggling)
