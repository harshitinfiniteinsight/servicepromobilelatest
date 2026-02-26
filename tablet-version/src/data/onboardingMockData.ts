/**
 * Business-specific mock data for onboarding preview slides.
 * Filters and curates data from mobileMockData for each business type.
 */

import type { BusinessId } from "@/data/onboardingContent";
import {
  mockJobs,
  mockEstimates,
  mockInvoices,
  mockAppointments,
  mockAgreements,
  mockInventory,
  mockEmployees,
  mockCustomers,
} from "@/data/mobileMockData";

// --- Plumbing keywords ---
const PLUMBER_JOB_KEYWORDS = [
  "plumb",
  "water heater",
  "drain",
  "leak",
  "pipe",
  "kitchen",
  "faucet",
  "garbage disposal",
  "bathroom",
  "emergency",
];
const isPlumberJob = (title: string, services: string[]) =>
  PLUMBER_JOB_KEYWORDS.some(
    (k) =>
      title.toLowerCase().includes(k) ||
      services.some((s) => s.toLowerCase().includes(k))
  );

// --- Carpenter keywords (jobs + inventory) ---
const CARPENTER_JOB_KEYWORDS = [
  "bathroom remodel",
  "cabinet",
  "woodwork",
  "renovation",
  "custom",
  "tile",
];
const isCarpenterJob = (title: string) =>
  CARPENTER_JOB_KEYWORDS.some((k) => title.toLowerCase().includes(k));
const CARPENTER_INVENTORY_CATEGORIES = ["Tools", "Plumbing"]; // Lumber, hardware often in tools or generic
const carpenterInventoryItems = ["Pipe", "Faucet", "Lumber", "Wood", "Hardware"];

// --- Electrician keywords ---
const ELECTRICIAN_JOB_KEYWORDS = [
  "panel",
  "outlet",
  "electrical",
  "circuit",
  "wire",
];
const isElectricianJob = (title: string, services: string[]) =>
  ELECTRICIAN_JOB_KEYWORDS.some(
    (k) =>
      title.toLowerCase().includes(k) ||
      services.some((s) => s.toLowerCase().includes(k))
  );
const ELECTRICIAN_INVENTORY_KEYWORDS = ["electrical", "wire", "breaker", "outlet", "conduit"];

// --- HVAC keywords ---
const HVAC_JOB_KEYWORDS = [
  "hvac",
  "ac ",
  " ac",
  "furnace",
  "duct",
  "thermostat",
  "maintenance",
];
const isHvacJob = (title: string, services: string[]) =>
  HVAC_JOB_KEYWORDS.some(
    (k) =>
      title.toLowerCase().includes(k) ||
      services.some((s) => s.toLowerCase().includes(k))
  );

// --- Appointment service keywords ---
const plumberService = (s: string) =>
  ["plumb", "drain", "leak", "water heater", "pipe", "kitchen"].some((k) =>
    s.toLowerCase().includes(k)
  );
const electricianService = (s: string) =>
  ["panel", "outlet", "electrical"].some((k) => s.toLowerCase().includes(k));
const hvacService = (s: string) =>
  ["hvac", "ac", "duct", "thermostat", "furnace", "maintenance"].some((k) =>
    s.toLowerCase().includes(k)
  );

export function getOnboardingJobs(businessId: BusinessId) {
  switch (businessId) {
    case "plumber":
      return mockJobs
        .filter((j) => isPlumberJob(j.title, j.services))
        .slice(0, 3);
    case "carpenter":
      return mockJobs
        .filter((j) => isCarpenterJob(j.title))
        .slice(0, 3);
    case "electrician":
      return mockJobs
        .filter((j) => isElectricianJob(j.title, j.services))
        .slice(0, 3);
    case "hvac":
      return mockJobs
        .filter((j) => isHvacJob(j.title, j.services))
        .slice(0, 3);
    case "general":
      return mockJobs.slice(0, 4);
    default:
      return mockJobs.slice(0, 3);
  }
}

/** Jobs with mixed statuses (Scheduled, In Progress, Completed) for journey step 5 */
export function getOnboardingJobsWithMixedStatus(businessId: BusinessId) {
  const filtered = getOnboardingJobs(businessId);
  const scheduled = filtered.find((j) => j.status === "Scheduled") ?? mockJobs.find((j) => j.status === "Scheduled");
  const inProgress = filtered.find((j) => j.status === "In Progress") ?? mockJobs.find((j) => j.status === "In Progress");
  const completed = filtered.find((j) => j.status === "Completed") ?? mockJobs.find((j) => j.status === "Completed");
  return [scheduled, inProgress, completed].filter(Boolean).slice(0, 3);
}

export function getOnboardingEstimates(businessId: BusinessId) {
  switch (businessId) {
    case "plumber":
      return mockEstimates.slice(0, 2); // Generic; plumbing estimates often similar
    case "carpenter":
      return mockEstimates.filter((e) => e.amount >= 1000).slice(0, 2); // Project-scale
    case "electrician":
      return mockEstimates.slice(1, 3);
    case "hvac":
      return mockEstimates.slice(0, 2);
    case "general":
      return mockEstimates.slice(0, 2);
    default:
      return mockEstimates.slice(0, 2);
  }
}

export function getOnboardingInvoices(businessId: BusinessId) {
  switch (businessId) {
    case "plumber":
      return mockInvoices.filter((i) => i.status === "Paid" || i.status === "Open").slice(0, 2);
    case "carpenter":
      return mockInvoices.slice(1, 3);
    case "electrician":
      return mockInvoices.slice(2, 4);
    case "hvac":
      return mockInvoices.filter((i) => i.status === "Paid").slice(0, 2);
    case "general":
      return mockInvoices.slice(0, 2);
    default:
      return mockInvoices.slice(0, 2);
  }
}

export function getOnboardingAppointments(businessId: BusinessId) {
  let result: typeof mockAppointments;
  switch (businessId) {
    case "plumber":
      result = mockAppointments.filter((a) => plumberService(a.service));
      break;
    case "carpenter":
      result = mockAppointments.filter(
        (a) =>
          a.service.toLowerCase().includes("remodel") ||
          a.service.toLowerCase().includes("cabinet") ||
          a.service.toLowerCase().includes("kitchen")
      );
      break;
    case "electrician":
      result = mockAppointments.filter((a) => electricianService(a.service));
      break;
    case "hvac":
      result = mockAppointments.filter((a) => hvacService(a.service));
      break;
    case "general":
      return mockAppointments.slice(0, 4);
    default:
      return mockAppointments.slice(0, 3);
  }
  const arr = result.length > 0 ? result : mockAppointments;
  return arr.slice(0, 3);
}

export function getOnboardingAgreements(businessId: BusinessId) {
  switch (businessId) {
    case "hvac":
      return mockAgreements.slice(0, 3); // HVAC emphasizes service agreements
    case "plumber":
    case "carpenter":
    case "electrician":
    case "general":
      return mockAgreements.slice(0, 3);
    default:
      return mockAgreements.slice(0, 3);
  }
}

export function getOnboardingInventory(businessId: BusinessId) {
  switch (businessId) {
    case "carpenter":
      return mockInventory
        .filter((i) =>
          carpenterInventoryItems.some((k) =>
            i.name.toLowerCase().includes(k.toLowerCase())
          )
        )
        .slice(0, 3);
    case "electrician":
      return mockInventory
        .filter((i) =>
          ELECTRICIAN_INVENTORY_KEYWORDS.some((k) =>
            i.name.toLowerCase().includes(k)
          )
        )
        .slice(0, 3);
    case "plumber":
      return mockInventory
        .filter((i) => i.category === "Plumbing")
        .slice(0, 3);
    case "hvac":
      return mockInventory
        .filter((i) => i.category === "HVAC")
        .slice(0, 3);
    case "general":
      return mockInventory.slice(0, 3);
    default:
      return mockInventory.slice(0, 3);
  }
}

export function getOnboardingEmployees(businessId: BusinessId) {
  const roleByBusiness: Record<BusinessId, string[]> = {
    plumber:     ["Lead Plumber", "Plumber", "Apprentice"],
    electrician: ["Master Electrician", "Journeyman", "Apprentice"],
    hvac:        ["HVAC Technician", "HVAC Technician", "Apprentice"],
    carpenter:   ["Lead Carpenter", "Carpenter", "Apprentice"],
    general:     ["Field Technician", "Technician", "Apprentice"],
  };
  const roles = roleByBusiness[businessId] ?? roleByBusiness.general;
  return mockEmployees.slice(0, 3).map((e, i) => ({
    id: e.id,
    name: e.name,
    role: roles[i],
    status: (["Available", "On Job", "Off Duty"] as const)[i % 3],
    jobsToday: [3, 2, 1][i],
    initials: e.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2),
  }));
}

export function getOnboardingCrmCustomers(_businessId: BusinessId) {
  return mockCustomers.slice(0, 3).map((c, i) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    lastService: ["2 days ago", "1 week ago", "3 weeks ago"][i],
    totalJobs: [12, 7, 4][i],
    lifetimeValue: [c.totalSpent ?? 3840, 1950, 890][i],
  }));
}

export function getOnboardingStoreItems(businessId: BusinessId) {
  const storeData: Record<BusinessId, { id: string; name: string; category: string; price: number; stock: number }[]> = {
    plumber: [
      { id: "s1", name: "Ball Valve 3/4\"", category: "Fittings", price: 14.99, stock: 48 },
      { id: "s2", name: "P-Trap Assembly", category: "Drain", price: 8.50, stock: 32 },
      { id: "s3", name: "Teflon Tape (10pk)", category: "Seals", price: 6.99, stock: 120 },
    ],
    electrician: [
      { id: "s1", name: "GFCI Outlet 20A", category: "Outlets", price: 18.99, stock: 55 },
      { id: "s2", name: "Wire Nut 300pk", category: "Connectors", price: 12.99, stock: 20 },
      { id: "s3", name: "Circuit Breaker 20A", category: "Breakers", price: 24.50, stock: 38 },
    ],
    hvac: [
      { id: "s1", name: "HVAC Filter 16x20", category: "Filters", price: 25.99, stock: 150 },
      { id: "s2", name: "Refrigerant R-410A", category: "Refrigerant", price: 89.00, stock: 12 },
      { id: "s3", name: "Thermostat Wiring Kit", category: "Controls", price: 19.99, stock: 44 },
    ],
    carpenter: [
      { id: "s1", name: "Oak Board 1x6x8ft", category: "Lumber", price: 22.99, stock: 60 },
      { id: "s2", name: "Wood Screws 5lb Box", category: "Fasteners", price: 15.50, stock: 85 },
      { id: "s3", name: "Wood Stain Walnut Qt", category: "Finish", price: 28.99, stock: 30 },
    ],
    general: [
      { id: "s1", name: "HVAC Filter 16x20", category: "HVAC", price: 25.99, stock: 150 },
      { id: "s2", name: "GFCI Outlet 20A", category: "Electrical", price: 18.99, stock: 55 },
      { id: "s3", name: "Ball Valve 3/4\"", category: "Plumbing", price: 14.99, stock: 48 },
    ],
  };
  return storeData[businessId] ?? storeData.general;
}

export function getOnboardingFeedback(businessId: BusinessId) {
  const feedbackByBusiness: Record<BusinessId, { id: string; customerName: string; rating: number; comment: string; jobRef: string; daysAgo: number }[]> = {
    plumber: [
      { id: "f1", customerName: "Sarah Mitchell", rating: 5, comment: "Fixed our burst pipe in 30 minutes. Incredibly fast and professional!", jobRef: "JOB-042 · Emergency Pipe Repair", daysAgo: 1 },
      { id: "f2", customerName: "Tom Bradley", rating: 5, comment: "Best plumber in town. Water heater installed same day, no mess.", jobRef: "JOB-039 · Water Heater Install", daysAgo: 4 },
      { id: "f3", customerName: "Lisa Park", rating: 4, comment: "Great job on the bathroom remodel plumbing. Very thorough.", jobRef: "JOB-035 · Bathroom Plumbing", daysAgo: 10 },
    ],
    electrician: [
      { id: "f1", customerName: "David Chen", rating: 5, comment: "Panel upgrade was flawless. Passed inspection first try.", jobRef: "JOB-051 · Panel Upgrade", daysAgo: 2 },
      { id: "f2", customerName: "Karen White", rating: 5, comment: "Installed 8 new outlets, very clean work, zero issues.", jobRef: "JOB-048 · Outlet Installation", daysAgo: 6 },
      { id: "f3", customerName: "Steve Morris", rating: 4, comment: "Fixed the wiring issue quickly. Reasonable price.", jobRef: "JOB-044 · Wiring Repair", daysAgo: 12 },
    ],
    hvac: [
      { id: "f1", customerName: "Jennifer Lopez", rating: 5, comment: "AC tune-up made a huge difference. Runs like new!", jobRef: "JOB-061 · AC Maintenance", daysAgo: 1 },
      { id: "f2", customerName: "Mark Thompson", rating: 5, comment: "Furnace replacement done in one day. Super professional team.", jobRef: "JOB-058 · Furnace Install", daysAgo: 5 },
      { id: "f3", customerName: "Amy Richardson", rating: 5, comment: "Annual maintenance plan is totally worth it. Always on time.", jobRef: "AGR-012 · Annual Plan", daysAgo: 9 },
    ],
    carpenter: [
      { id: "f1", customerName: "Robert Evans", rating: 5, comment: "Custom cabinets are absolutely beautiful. Perfect fit!", jobRef: "JOB-033 · Cabinet Install", daysAgo: 3 },
      { id: "f2", customerName: "Susan Clark", rating: 5, comment: "Deck build was perfect. Finished on time and on budget.", jobRef: "JOB-029 · Deck Construction", daysAgo: 7 },
      { id: "f3", customerName: "Michael Young", rating: 4, comment: "Great woodwork on the shelving. Would hire again.", jobRef: "JOB-026 · Custom Shelving", daysAgo: 14 },
    ],
    general: [
      { id: "f1", customerName: "Patricia Hall", rating: 5, comment: "One call handled plumbing, electrical, and HVAC. Incredible service!", jobRef: "JOB-072 · Full Home Service", daysAgo: 2 },
      { id: "f2", customerName: "James Williams", rating: 5, comment: "Assigned the right tech for every job. Really organized company.", jobRef: "JOB-068 · Multi-Trade Service", daysAgo: 5 },
      { id: "f3", customerName: "Nancy Turner", rating: 5, comment: "Everything was tracked in one app — estimates, invoices, everything.", jobRef: "JOB-065 · HVAC + Electrical", daysAgo: 11 },
    ],
  };
  return feedbackByBusiness[businessId] ?? feedbackByBusiness.general;
}
