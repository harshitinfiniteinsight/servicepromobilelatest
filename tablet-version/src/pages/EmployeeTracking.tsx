import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { mockJobs, mockEmployees, mockInvoices, mockEstimates, mockAgreements, mockCustomers } from "@/data/mobileMockData";
import { MapPin, Clock, CheckCircle2, Circle, Navigation, Route, ChevronDown, Plus, Pencil, Calendar as CalendarIcon, XCircle, UserCog, Edit, MessageSquare, FileText, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import ScheduleRouteModal from "@/components/modals/ScheduleRouteModal";
import ReassignEmployeeModal from "@/components/modals/ReassignEmployeeModal";
import SendFeedbackFormModal from "@/components/modals/SendFeedbackFormModal";
import ViewFeedbackModal from "@/components/modals/ViewFeedbackModal";
import FeedbackFormModal from "@/components/modals/FeedbackFormModal";
import RescheduleJobModal from "@/components/modals/RescheduleJobModal";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// Fix for default marker icons in Leaflet with Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different job statuses
const createCustomIcon = (color: string, isPulsing: boolean = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isPulsing ? "animation: pulse 2s infinite;" : ""}
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createCheckIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background-color: #10b981;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        font-weight: bold;
      ">✓</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Component to center map on employee location
const MapCenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 13);
  return null;
};

// Create numbered marker icon with order number and employee color
const createNumberedMarkerIcon = (
  order: number,
  employeeColor: string,
  isCompleted: boolean = false,
  isCurrent: boolean = false
) => {
  return L.divIcon({
    className: "route-marker",
    html: `
      <div class="marker-wrapper" style="position: relative;">
        <div class="marker-circle" style="
          width: 32px;
          height: 32px;
          background-color: ${isCompleted ? "#10b981" : employeeColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
          ${isCurrent ? "animation: pulse 2s infinite;" : ""}
        ">
          ${order}
        </div>
        ${isCompleted ? `
          <div class="checkmark-badge" style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 18px;
            height: 18px;
            background-color: #10b981;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          ">✓</div>
        ` : ""}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to update map bounds and center on all stops
const MapUpdater = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      // Create bounds from all coordinates
      const bounds = L.latLngBounds(coordinates);
      // Fit map to bounds with padding
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 15,
      });
    }
  }, [coordinates, map]);

  return null;
};

const EmployeeTracking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my-route" | "live-location">("my-route");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Single date for employee Scheduled Route tab
  const [employeeSelectedDate, setEmployeeSelectedDate] = useState<Date>(new Date());
  const [expandedAccordion, setExpandedAccordion] = useState<string>("");
  const [showScheduleRouteModal, setShowScheduleRouteModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | undefined>(undefined);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedJobForReassign, setSelectedJobForReassign] = useState<typeof mockJobs[0] | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedJobForReschedule, setSelectedJobForReschedule] = useState<typeof mockJobs[0] | null>(null);

  // Get current employee ID from localStorage
  const currentEmployeeId = localStorage.getItem("currentEmployeeId") || "1";
  
  // Check if user is employee or merchant
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") || "merchant" : "merchant";
  const isEmployee = userType === "employee";

  // Assign colors to employees (matching system colors)
  const employeeColors: Record<string, string> = {
    "1": "#F97316", // Orange
    "2": "#3B82F6", // Blue
    "3": "#10B981", // Green
    "4": "#8B5CF6", // Purple
    "5": "#EC4899", // Pink
  };

  // State to manage job status updates
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>(() => {
    const initialStatuses: Record<string, string> = {};
    mockJobs.forEach((job) => {
      if (isEmployee) {
        if (job.technicianId === currentEmployeeId) {
          initialStatuses[job.id] = job.status;
        }
      } else {
        // Merchant: track all jobs
        initialStatuses[job.id] = job.status;
      }
    });
    return initialStatuses;
  });

  // State to manage job assignments (technicianId updates)
  const [jobAssignments, setJobAssignments] = useState<Record<string, { technicianId: string; technicianName: string }>>({});
  const [jobScheduleOverrides, setJobScheduleOverrides] = useState<Record<string, { date: string; time: string; technicianId: string; technicianName: string; location?: string }>>({});

  // Format date for comparison (YYYY-MM-DD)
  const formatDateForComparison = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get job time overrides for a specific employee and date
  const getJobTimeOverrides = (employeeId: string, dateStr: string): Record<string, string> => {
    const timeOverridesKey = `job_time_overrides_${employeeId}_${dateStr}`;
    const stored = localStorage.getItem(timeOverridesKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  };

  // Generate demo jobs for an employee if no real jobs exist
  const generateDemoJobsForEmployee = (employeeId: string, dateStr: string, employeeName: string): typeof mockJobs => {
    const demoJobTemplates = [
      { title: "HVAC Service Call", time: "09:00 AM", status: "Scheduled" as const, location: "123 Main St, Chicago, IL" },
      { title: "Plumbing Inspection", time: "11:00 AM", status: "Scheduled" as const, location: "456 Oak Ave, Chicago, IL" },
      { title: "AC Maintenance", time: "02:00 PM", status: "Scheduled" as const, location: "789 Pine Rd, Chicago, IL" },
      { title: "Electrical Repair", time: "04:00 PM", status: "Scheduled" as const, location: "321 Elm St, Chicago, IL" },
    ];

    const demoCustomers = [
      "John Smith", "Sarah Johnson", "Robert Miller", "Emma Davis"
    ];

    return demoJobTemplates.map((template, index) => ({
      id: `DEMO-${employeeId}-${dateStr}-${index + 1}`,
      title: template.title,
      customerId: `demo-${index + 1}`,
      customerName: demoCustomers[index] || `Customer ${index + 1}`,
      technicianId: employeeId,
      technicianName: employeeName,
      date: dateStr,
      time: template.time,
      status: template.status,
      location: template.location,
    }));
  };

  // Filter jobs based on login type and selected date, or generate demo jobs if none exist
  // Employee: Only their jobs (filtered by date) | Merchant: All employees' jobs (filtered by single date)
  const employeeJobs = useMemo(() => {
    let filteredJobs: typeof mockJobs = [];
    
    // Determine which date to use based on tab and user type
    let dateToUse: Date;
    if (isEmployee && activeTab === "my-route") {
      // Employee Scheduled Route tab: Use employeeSelectedDate
      dateToUse = employeeSelectedDate;
    } else {
      // Merchant or Employee Live Location tab: Use selectedDate
      dateToUse = selectedDate;
    }
    
    const dateStr = formatDateForComparison(dateToUse);
    const jobsWithOverrides = mockJobs.map((job) => {
      const override = jobScheduleOverrides[job.id];
      if (!override) return job;
      return {
        ...job,
        date: override.date,
        time: override.time,
        technicianId: override.technicianId,
        technicianName: override.technicianName,
        location: override.location ?? job.location,
      };
    });

    filteredJobs = jobsWithOverrides.filter((job) => job.date === dateStr);
    
    // Apply job assignments (reassignments) to jobs
    filteredJobs = filteredJobs.map((job) => {
      const assignment = jobAssignments[job.id];
      if (assignment) {
        return {
          ...job,
          technicianId: assignment.technicianId,
          technicianName: assignment.technicianName,
        };
      }
      return job;
    });
    
    if (isEmployee) {
      // Employee: Filter by employee ID only
      filteredJobs = filteredJobs.filter((job) => job.technicianId === currentEmployeeId);
      
      // If no jobs exist, generate demo jobs for this employee
      if (filteredJobs.length === 0) {
        const employee = mockEmployees.find(emp => emp.id === currentEmployeeId);
        if (employee) {
          filteredJobs = generateDemoJobsForEmployee(currentEmployeeId, dateStr, employee.name);
        }
      }
    } else {
      // Merchant: Show all jobs for selected date
      // If no jobs exist, generate demo jobs for all employees
      if (filteredJobs.length === 0) {
        const demoJobs: typeof mockJobs = [];
        mockEmployees.forEach((employee) => {
          const empDemoJobs = generateDemoJobsForEmployee(employee.id, dateStr, employee.name);
          demoJobs.push(...empDemoJobs);
        });
        filteredJobs = demoJobs;
      }
    }
    
    // Apply job time overrides (from route scheduling) and status overrides
    return filteredJobs.map((job) => {
      const timeOverrides = getJobTimeOverrides(job.technicianId, dateStr);
      const overriddenTime = timeOverrides[job.id] || job.time;

      return {
        ...job,
        time: overriddenTime,
        status: (jobStatuses[job.id] || job.status) as "Scheduled" | "In Progress" | "Completed" | "Cancel",
      };
    });
  }, [currentEmployeeId, jobStatuses, jobAssignments, jobScheduleOverrides, isEmployee, selectedDate, employeeSelectedDate, activeTab]);

  // Helper function to convert time string to minutes for comparison
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
    if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
    return totalMinutes;
  };

  // Get current time in minutes
  const getCurrentTimeMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Load saved route order for an employee
  const getSavedRouteOrder = (employeeId: string): string[] | null => {
    const savedOrderKey = `route_order_${employeeId}`;
    const savedOrder = localStorage.getItem(savedOrderKey);
    if (savedOrder) {
      try {
        return JSON.parse(savedOrder);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  // Sort jobs by start time ascending, then by status (Completed at bottom)
  // Apply saved route order if available
  const sortedJobs = useMemo(() => {
    let jobs = [...employeeJobs];
    
    // Apply saved route order per employee
    if (!isEmployee) {
      // For merchant: apply order per employee group
      const jobsByEmp: Record<string, typeof employeeJobs> = {};
      const orderedJobs: typeof employeeJobs = [];
      
      // Group jobs by employee
      jobs.forEach((job) => {
        if (!jobsByEmp[job.technicianId]) {
          jobsByEmp[job.technicianId] = [];
        }
        jobsByEmp[job.technicianId].push(job);
      });
      
      // Apply saved order for each employee
      Object.entries(jobsByEmp).forEach(([empId, empJobs]) => {
        const savedOrder = getSavedRouteOrder(empId);
        if (savedOrder && savedOrder.length > 0) {
          // Reorder based on saved order
          const ordered = savedOrder
            .map((id) => empJobs.find((job) => job.id === id))
            .filter(Boolean) as typeof employeeJobs;
          const unordered = empJobs.filter((job) => !savedOrder.includes(job.id));
          orderedJobs.push(...ordered, ...unordered);
        } else {
          // Default sort for this employee's jobs
          const sorted = empJobs.sort((a, b) => {
            const aCompleted = a.status === "Completed" || a.status === "Cancel";
            const bCompleted = b.status === "Completed" || b.status === "Cancel";
            if (aCompleted !== bCompleted) {
              return aCompleted ? 1 : -1;
            }
            if (!aCompleted && !bCompleted) {
              return timeToMinutes(a.time) - timeToMinutes(b.time);
            }
            return timeToMinutes(b.time) - timeToMinutes(a.time);
          });
          orderedJobs.push(...sorted);
        }
      });
      
      jobs = orderedJobs;
    } else {
      // For employee: apply their saved route order
      const savedOrder = getSavedRouteOrder(currentEmployeeId);
      if (savedOrder && savedOrder.length > 0) {
        const ordered = savedOrder
          .map((id) => jobs.find((job) => job.id === id))
          .filter(Boolean) as typeof employeeJobs;
        const unordered = jobs.filter((job) => !savedOrder.includes(job.id));
        
        // Sort unordered jobs by default logic
        const sortedUnordered = unordered.sort((a, b) => {
          const aCompleted = a.status === "Completed" || a.status === "Cancel";
          const bCompleted = b.status === "Completed" || b.status === "Cancel";
          if (aCompleted !== bCompleted) {
            return aCompleted ? 1 : -1;
          }
          if (!aCompleted && !bCompleted) {
            return timeToMinutes(a.time) - timeToMinutes(b.time);
          }
          return timeToMinutes(b.time) - timeToMinutes(a.time);
        });
        
        jobs = [...ordered, ...sortedUnordered];
      } else {
        // Default sort
        jobs = jobs.sort((a, b) => {
          const aCompleted = a.status === "Completed" || a.status === "Cancel";
          const bCompleted = b.status === "Completed" || b.status === "Cancel";
          if (aCompleted !== bCompleted) {
            return aCompleted ? 1 : -1;
          }
          if (!aCompleted && !bCompleted) {
            return timeToMinutes(a.time) - timeToMinutes(b.time);
          }
          return timeToMinutes(b.time) - timeToMinutes(a.time);
        });
      }
    }
    
    return jobs;
  }, [employeeJobs, isEmployee, currentEmployeeId]);

  // Find current stop (job with start time closest to current time but not completed)
  const currentStopIndex = useMemo(() => {
    const currentTime = getCurrentTimeMinutes();
    let closestIndex = -1;
    let closestDiff = Infinity;

    sortedJobs.forEach((job, index) => {
      if (job.status === "Completed" || job.status === "Cancel") return;
      
      const jobTime = timeToMinutes(job.time);
      const diff = Math.abs(jobTime - currentTime);
      
      // Prefer jobs that haven't started yet (future jobs)
      // But if all are past, pick the most recent
      if (jobTime >= currentTime - 30) { // Allow 30 min buffer for "current"
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = index;
        }
      } else if (closestIndex === -1) {
        // If no future jobs, use the most recent past job
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = index;
        }
      }
    });

    // Fallback: if no job found, use first In Progress job
    if (closestIndex === -1) {
      closestIndex = sortedJobs.findIndex((job) => job.status === "In Progress");
    }

    return closestIndex;
  }, [sortedJobs]);

  // Find next stop (first Scheduled job after current, or first Scheduled if no current)
  const nextStopIndex = useMemo(() => {
    if (currentStopIndex >= 0 && currentStopIndex < sortedJobs.length - 1) {
      // Find first Scheduled job after current stop
      for (let i = currentStopIndex + 1; i < sortedJobs.length; i++) {
        if (sortedJobs[i].status === "Scheduled") {
          return i;
        }
      }
    }
    // If no current stop or no scheduled after current, find first Scheduled
    return sortedJobs.findIndex((job) => job.status === "Scheduled");
  }, [sortedJobs, currentStopIndex]);

  // Helper function to find current stop index for a given job list
  const getCurrentStopIndex = (jobs: typeof sortedJobs): number => {
    const currentTime = getCurrentTimeMinutes();
    let closestIndex = -1;
    let closestDiff = Infinity;

    jobs.forEach((job, index) => {
      if (job.status === "Completed" || job.status === "Cancel") return;
      
      const jobTime = timeToMinutes(job.time);
      const diff = Math.abs(jobTime - currentTime);
      
      // Prefer jobs that haven't started yet (future jobs)
      // But if all are past, pick the most recent
      if (jobTime >= currentTime - 30) { // Allow 30 min buffer for "current"
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = index;
        }
      } else if (closestIndex === -1) {
        // If no future jobs, use the most recent past job
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = index;
        }
      }
    });

    // Fallback: if no job found, use first In Progress job
    if (closestIndex === -1) {
      closestIndex = jobs.findIndex((job) => job.status === "In Progress");
    }

    return closestIndex;
  };

  // Helper function to find next stop index for a given job list
  const getNextStopIndex = (jobs: typeof sortedJobs, currentIndex: number): number => {
    if (currentIndex >= 0 && currentIndex < jobs.length - 1) {
      // Find first Scheduled job after current stop
      for (let i = currentIndex + 1; i < jobs.length; i++) {
        if (jobs[i].status === "Scheduled") {
          return i;
        }
      }
    }
    // If no current stop or no scheduled after current, find first Scheduled
    return jobs.findIndex((job) => job.status === "Scheduled");
  };

  // Filter jobs by selected employee (for merchant login)
  const filteredJobsForDisplay = useMemo(() => {
    if (isEmployee) {
      return sortedJobs;
    }
    // Merchant: Filter by selected employee
    if (selectedEmployeeFilter === "all") {
      return sortedJobs;
    }
    return sortedJobs.filter((job) => job.technicianId === selectedEmployeeFilter);
  }, [sortedJobs, selectedEmployeeFilter, isEmployee]);

  // Group jobs by employee (for merchant login)
  // Includes employees who originally had jobs on the selected date, even if they now have 0 after reassignment
  const jobsByEmployee = useMemo(() => {
    if (isEmployee) {
      return { [currentEmployeeId]: filteredJobsForDisplay };
    }
    
    // Determine which date to use
    const dateStr = formatDateForComparison(selectedDate);
    
    // Get all employees who originally had jobs on this date (from mockJobs)
    const employeesWithOriginalJobs = new Set<string>();
    mockJobs.forEach((job) => {
      if (job.date === dateStr) {
        // Check if this job has been reassigned
        const assignment = jobAssignments[job.id];
        const currentTechnicianId = assignment ? assignment.technicianId : job.technicianId;
        employeesWithOriginalJobs.add(currentTechnicianId);
        // Also include original employee if job was reassigned
        if (assignment && assignment.technicianId !== job.technicianId) {
          employeesWithOriginalJobs.add(job.technicianId);
        }
      }
    });
    
    // Group current jobs by employee
    const grouped: Record<string, typeof filteredJobsForDisplay> = {};
    filteredJobsForDisplay.forEach((job) => {
      if (!grouped[job.technicianId]) {
        grouped[job.technicianId] = [];
      }
      grouped[job.technicianId].push(job);
    });
    
    // Ensure all employees who originally had jobs (or currently have jobs) are included
    employeesWithOriginalJobs.forEach((employeeId) => {
      if (!grouped[employeeId]) {
        grouped[employeeId] = [];
      }
    });
    
    return grouped;
  }, [filteredJobsForDisplay, isEmployee, currentEmployeeId, selectedDate, jobAssignments]);

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Scheduled":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Cancel":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Handle job status update
  // Track feedback status for jobs
  const [jobFeedbackStatus, setJobFeedbackStatus] = useState<Record<string, { exists: boolean; feedback?: { rating: number; comment: string; submittedAt: string } }>>(() => {
    try {
      const stored = localStorage.getItem("jobFeedbackStatus");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  });

  // Check if feedback exists for a job
  const hasFeedback = (jobId: string) => {
    return jobFeedbackStatus[jobId]?.exists === true;
  };

  // Modals state for feedback
  const [showFeedbackFormModal, setShowFeedbackFormModal] = useState(false);
  const [showViewFeedbackModal, setShowViewFeedbackModal] = useState(false);
  const [showFillFeedbackFormModal, setShowFillFeedbackFormModal] = useState(false);
  const [selectedJobForFeedback, setSelectedJobForFeedback] = useState<typeof mockJobs[0] | null>(null);

  // Auto-send feedback form email (without showing modal)
  const autoSendFeedbackFormEmail = async (jobId: string) => {
    const allJobs = [...mockJobs, ...mockInvoices.map(inv => ({
      id: inv.id,
      customerId: inv.customerId,
      customerName: inv.customerName,
      title: `Invoice ${inv.id}`,
    })), ...mockEstimates.map(est => ({
      id: est.id,
      customerId: est.customerId,
      customerName: est.customerName,
      title: `Estimate ${est.id}`,
    })), ...mockAgreements.map(agr => ({
      id: agr.id,
      customerId: agr.customerId,
      customerName: agr.customerName,
      title: agr.type,
    }))];
    
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;
    
    const customer = mockCustomers.find(c => c.id === job.customerId);
    const customerEmail = customer?.email || "";
    
    if (!customerEmail) {
      console.warn(`No email found for customer ${job.customerName}`);
      return;
    }
    
    // In production, this would be an API call to send the email
    // For now, simulate async email sending
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mark feedback form as sent
    setJobFeedbackStatus(prev => {
      const updated = {
        ...prev,
        [jobId]: { exists: false } // Form sent, but feedback not yet received
      };
      localStorage.setItem("jobFeedbackStatus", JSON.stringify(updated));
      return updated;
    });
    
    toast.success(`Feedback form sent automatically to ${customerEmail}`);
  };

  // Handle feedback form send (shows modal)
  const handleSendFeedbackForm = (jobId: string) => {
    const allJobs = [...mockJobs, ...mockInvoices.map(inv => ({
      id: inv.id,
      customerId: inv.customerId,
      customerName: inv.customerName,
      title: `Invoice ${inv.id}`,
      technicianId: "1",
      technicianName: "Mike Johnson",
      date: inv.issueDate,
      time: "09:00 AM",
      status: inv.status === "Paid" ? "Completed" : "Scheduled",
      location: mockCustomers.find(c => c.id === inv.customerId)?.address || "",
    })), ...mockEstimates.map(est => ({
      id: est.id,
      customerId: est.customerId,
      customerName: est.customerName,
      title: `Estimate ${est.id}`,
      technicianId: "1",
      technicianName: "Mike Johnson",
      date: est.date,
      time: "10:00 AM",
      status: est.status === "Paid" ? "Completed" : "Scheduled",
      location: mockCustomers.find(c => c.id === est.customerId)?.address || "",
    })), ...mockAgreements.map(agr => ({
      id: agr.id,
      customerId: agr.customerId,
      customerName: agr.customerName,
      title: agr.type,
      technicianId: "1",
      technicianName: "Mike Johnson",
      date: agr.startDate,
      time: "11:00 AM",
      status: agr.status === "Paid" ? "Completed" : "In Progress",
      location: mockCustomers.find(c => c.id === agr.customerId)?.address || "",
    }))];
    
    const job = allJobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForFeedback(job as typeof mockJobs[0]);
      setShowFeedbackFormModal(true);
    }
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    const oldStatus = jobStatuses[jobId] || mockJobs.find(j => j.id === jobId)?.status || "";
    
    setJobStatuses((prev) => ({
      ...prev,
      [jobId]: newStatus,
    }));
    
    // Check if status changed to Completed
    if (newStatus === "Completed" && oldStatus !== "Completed") {
      const feedbackAutoSendEnabled = typeof window !== "undefined" 
        ? localStorage.getItem("autoSendFeedback") === "true" 
        : false;
      
      if (!hasFeedback(jobId)) {
        if (feedbackAutoSendEnabled) {
          // Auto-send email without showing modal (async, non-blocking)
          autoSendFeedbackFormEmail(jobId).catch(err => {
            console.error("Failed to auto-send feedback form:", err);
            toast.error("Failed to send feedback form automatically");
          });
        } else {
          // Show modal with delivery options
          setTimeout(() => {
            handleSendFeedbackForm(jobId);
          }, 100);
        }
      }
    }
    
    toast.success(`Job status updated to ${newStatus}`);
  };

  // Determine payment status from job
  const getPaymentStatus = (job: typeof mockJobs[0]): "Paid" | "Open" => {
    const id = job.id.toUpperCase();
    
    // Check invoice status
    if (id.startsWith("INV")) {
      const invoice = mockInvoices.find(inv => inv.id === job.id);
      if (invoice) {
        return invoice.status === "Paid" ? "Paid" : "Open";
      }
    }
    
    // Check estimate status
    if (id.startsWith("EST")) {
      const estimate = mockEstimates.find(est => est.id === job.id);
      if (estimate) {
        return (estimate.status === "Converted to Invoice" || estimate.status === "Paid") ? "Paid" : "Open";
      }
    }
    
    // Check agreement status
    if (id.startsWith("AGR") || id.includes("AGR")) {
      const agreement = mockAgreements.find(agr => agr.id === job.id);
      if (agreement) {
        return agreement.status === "Paid" ? "Paid" : "Open";
      }
    }
    
    // For generic JOB-XXX IDs, use job status
    if (job.status === "Completed" || job.status === "Feedback Received") return "Paid";
    return "Open";
  };

  // Determine job type for navigation
  const getJobType = (jobId: string): "Invoice" | "Estimate" | "Agreement" | "Job" => {
    const id = jobId.toUpperCase();
    if (id.startsWith("INV")) return "Invoice";
    if (id.startsWith("EST")) return "Estimate";
    if (id.startsWith("AGR") || id.includes("AGR")) return "Agreement";
    return "Job";
  };

  // Handle reassign employee
  const handleReassignEmployee = (job: typeof mockJobs[0]) => {
    setSelectedJobForReassign(job);
    setShowReassignModal(true);
  };

  // Handle reschedule job
  const handleRescheduleJob = (job: typeof mockJobs[0]) => {
    setSelectedJobForReschedule(job);
    setShowRescheduleModal(true);
  };

  const handleRescheduleConfirm = (newDate: string, newTime: string, newEmployeeId: string, updatedAddress?: string) => {
    if (!selectedJobForReschedule) return;

    const newEmployee = mockEmployees.find((emp) => emp.id === newEmployeeId);

    setJobScheduleOverrides((prev) => ({
      ...prev,
      [selectedJobForReschedule.id]: {
        date: newDate,
        time: newTime,
        technicianId: newEmployeeId,
        technicianName: newEmployee?.name || selectedJobForReschedule.technicianName,
        location: updatedAddress ?? selectedJobForReschedule.location,
      },
    }));

    toast.success("Job rescheduled successfully");
    setShowRescheduleModal(false);
    setSelectedJobForReschedule(null);
  };

  // Handle edit navigation
  const handleEditJob = (job: typeof mockJobs[0]) => {
    const jobType = getJobType(job.id);
    if (jobType === "Invoice") {
      navigate(`/invoices/${job.id}/edit`);
    } else if (jobType === "Estimate") {
      navigate(`/estimates/${job.id}/edit`);
    } else if (jobType === "Agreement") {
      navigate(`/agreements/${job.id}/edit`);
    } else {
      navigate(`/jobs/${job.id}/edit`);
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "In Progress":
        return <Circle className="h-4 w-4 text-orange-600 fill-orange-600" />;
      case "Scheduled":
        return <Circle className="h-4 w-4 text-gray-400" />;
      case "Cancel":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get current job (In Progress) - for blue marker
  const currentJob = sortedJobs.find((job) => job.status === "In Progress");

  // Mock employee current location (in real app, this would come from GPS)
  const employeeCurrentLocation: [number, number] = [41.8781, -87.6298]; // Chicago area coordinates

  // Get all employees with jobs for today (for merchant login)
  const employeesWithJobs = useMemo(() => {
    if (isEmployee) {
      const employee = mockEmployees.find((emp) => emp.id === currentEmployeeId);
      return employee ? [employee] : [];
    }
    
    const employeeIds = new Set(employeeJobs.map((job) => job.technicianId));
    return mockEmployees.filter((emp) => employeeIds.has(emp.id));
  }, [employeeJobs, isEmployee, currentEmployeeId]);

  // Get employee locations (mock - in production, use GPS)
  const employeeLocations = useMemo(() => {
    const locations: Record<string, [number, number]> = {};
    employeesWithJobs.forEach((emp, index) => {
      // Distribute employees around a center point
      const angle = (index * (360 / Math.max(employeesWithJobs.length, 1))) * (Math.PI / 180);
      const radius = 0.01; // ~1km radius
      const lat = employeeCurrentLocation[0] + Math.cos(angle) * radius;
      const lng = employeeCurrentLocation[1] + Math.sin(angle) * radius;
      locations[emp.id] = [lat, lng];
    });
    
    // For employee login, use center location
    if (isEmployee) {
      locations[currentEmployeeId] = employeeCurrentLocation;
    }
    
    return locations;
  }, [employeesWithJobs, employeeCurrentLocation, isEmployee, currentEmployeeId]);
  
  // Calculate map center (for merchant: center of all employees, for employee: their location)
  const mapCenter = useMemo(() => {
    if (isEmployee) {
      return employeeCurrentLocation;
    }
    // Merchant: Calculate center of all employee locations
    const locations = Object.values(employeeLocations);
    if (locations.length === 0) return employeeCurrentLocation;
    
    const avgLat = locations.reduce((sum, loc) => sum + loc[0], 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc[1], 0) / locations.length;
    return [avgLat, avgLng] as [number, number];
  }, [isEmployee, employeeLocations, employeeCurrentLocation]);

  // Convert job locations to coordinates (mock - in production, use geocoding)
  const jobCoordinates = useMemo(() => {
    return employeeJobs.map((job, index) => {
      const employeeLocation = employeeLocations[job.technicianId] || employeeCurrentLocation;
      // Distribute jobs around employee location
      const angle = (index * (360 / Math.max(employeeJobs.filter(j => j.technicianId === job.technicianId).length, 1))) * (Math.PI / 180);
      const radius = 0.015; // ~1.5km radius
      const lat = employeeLocation[0] + Math.cos(angle) * radius;
      const lng = employeeLocation[1] + Math.sin(angle) * radius;
      return {
        job,
        coordinates: [lat, lng] as [number, number],
        employeeLocation,
      };
    });
  }, [employeeJobs, employeeLocations, employeeCurrentLocation]);

  // Calculate route coordinates for employee's scheduled route (with order numbers)
  const employeeRouteCoordinates = useMemo(() => {
    if (!isEmployee || sortedJobs.length === 0) return [];
    
    return sortedJobs.map((job, index) => {
      // Distribute jobs around employee's current location
      const angle = (index * (360 / Math.max(sortedJobs.length, 1))) * (Math.PI / 180);
      const radius = 0.015; // ~1.5km radius
      const lat = employeeCurrentLocation[0] + Math.cos(angle) * radius;
      const lng = employeeCurrentLocation[1] + Math.sin(angle) * radius;
      return {
        job,
        order: index + 1, // Route sequence number (1, 2, 3...)
        coordinates: [lat, lng] as [number, number],
      };
    });
  }, [isEmployee, sortedJobs, employeeCurrentLocation]);

  // Extract coordinates array for polyline (employee route)
  const employeePolylineCoordinates = useMemo(() => {
    return employeeRouteCoordinates.map(({ coordinates }) => coordinates);
  }, [employeeRouteCoordinates]);

  // Create a key for polyline based on route order for efficient re-rendering
  const employeePolylineKey = useMemo(() => {
    return sortedJobs.map((job) => job.id).join('-');
  }, [sortedJobs]);

  // Get employee color for markers
  const employeeColor = useMemo(() => {
    return employeeColors[currentEmployeeId] || "#3b82f6";
  }, [currentEmployeeId]);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FDF4EF" }}>
      <MobileHeader 
        title="Scheduled Route" 
        showBack={true}
        actions={
          !isEmployee && (
            <button
              onClick={() => setShowScheduleRouteModal(true)}
              className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-md flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shrink-0 text-xs font-medium"
              aria-label="Schedule Route"
            >
              <Plus className="h-4 w-4" />
              <span>Add Route</span>
            </button>
          )
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col pt-14">
        {/* Tab Navigation - Show both tabs for both merchant and employee logins */}
        <div className="flex items-center border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("my-route")}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors relative",
              activeTab === "my-route"
                ? "text-orange-600"
                : "text-gray-600"
            )}
          >
            <span className={cn(
              "flex items-center justify-center gap-1.5",
              activeTab === "my-route" && "font-semibold"
            )}>
              <Route className={cn(
                "h-4 w-4 transition-colors",
                activeTab === "my-route" ? "text-orange-600" : "text-gray-500"
              )} />
              {isEmployee ? "Scheduled Route" : "Schedule Route"}
            </span>
            {activeTab === "my-route" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("live-location")}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors relative",
              activeTab === "live-location"
                ? "text-orange-600"
                : "text-gray-600"
            )}
          >
            <span className={cn(
              "flex items-center justify-center gap-1.5",
              activeTab === "live-location" && "font-semibold"
            )}>
              <Navigation className={cn(
                "h-4 w-4 transition-colors",
                activeTab === "live-location" ? "text-orange-600" : "text-gray-500"
              )} />
              Live Location
            </span>
            {activeTab === "live-location" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
        </div>

        {/* Schedule Route Tab - Show for both merchant and employee logins */}
        {activeTab === "my-route" && (
          <div className="flex-1 overflow-hidden flex flex-col bg-[#FDF4EF]">
            <div className="flex-1 overflow-y-auto scrollable px-4 py-4">
              {sortedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Route className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No jobs scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Employee Filter + Date Picker Row - Merchant Only */}
                  {!isEmployee && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
                          <SelectTrigger className="flex-1 bg-white border-gray-300 h-9 text-sm">
                            <SelectValue>
                              {selectedEmployeeFilter === "all" 
                                ? "All Employees" 
                                : mockEmployees.find(emp => emp.id === selectedEmployeeFilter)?.name || "All Employees"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Employees</SelectItem>
                            {employeesWithJobs.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 bg-white border-gray-300 h-9 justify-start text-left font-normal hover:bg-gray-50 text-sm px-3"
                            >
                              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-500" />
                              {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                if (date) {
                                  setSelectedDate(date);
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  {isEmployee ? (
                    // Employee Login: Map + Single list
                    <>
                      {/* Date Filter + Add Route Button - Employee Only */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          {/* Date Picker */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-1 bg-white border-gray-300 h-9 justify-start text-left font-normal hover:bg-gray-50 text-sm px-3"
                              >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-500" />
                                {employeeSelectedDate ? format(employeeSelectedDate, "MMM dd, yyyy") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={employeeSelectedDate}
                                onSelect={(date) => {
                                  if (date) {
                                    setEmployeeSelectedDate(date);
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>

                          {/* Add Route Button */}
                          <button
                            onClick={() => {
                              // Pre-fill with current employee for employee login (but don't set editingEmployeeId to keep it in create mode)
                              // The modal will detect employee mode and pre-fill/disable the dropdown
                              setShowScheduleRouteModal(true);
                            }}
                            className="h-9 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-md flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shrink-0 text-xs font-medium"
                            aria-label="Add Route"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Route</span>
                          </button>
                        </div>
                      </div>

                      {/* Route Map - Employee View */}
                      {sortedJobs.length > 0 && (
                        <div className="mb-4">
                          {/* Heading with Date and Edit Icon */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-800">
                              Scheduled Route for {format(employeeSelectedDate, "dd/MM/yyyy")}
                            </h3>
                            <button
                              onClick={() => {
                                setEditingEmployeeId(currentEmployeeId);
                                setShowScheduleRouteModal(true);
                              }}
                              className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                              aria-label="Edit Route"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="relative h-[280px] rounded-2xl shadow-lg overflow-hidden border border-gray-200 bg-white">
                            <MapContainer
                              center={employeeCurrentLocation}
                              zoom={13}
                              style={{ height: "100%", width: "100%", zIndex: 0 }}
                              scrollWheelZoom={false}
                              zoomControl={true}
                              className="rounded-2xl"
                            >
                              <MapUpdater coordinates={employeePolylineCoordinates} />
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />

                              {/* Route Polyline - Connects markers in order, updates dynamically when route changes */}
                              {employeePolylineCoordinates.length > 1 && (
                                <Polyline
                                  key={`employee-polyline-${employeePolylineKey}`}
                                  positions={employeePolylineCoordinates}
                                  pathOptions={{
                                    color: "#FF7A00",
                                    weight: 4,
                                    opacity: 0.9,
                                  }}
                                />
                              )}

                              {/* Job Location Markers with Numbers */}
                              {employeeRouteCoordinates.map(({ job, coordinates, order }) => {
                                const isCurrentStop = order === (currentStopIndex + 1);
                                const isCompleted = job.status === "Completed";

                                // Create icon with order number
                                const icon = createNumberedMarkerIcon(
                                  order,
                                  employeeColor,
                                  isCompleted,
                                  isCurrentStop
                                );

                                return (
                                  <Marker key={job.id} position={coordinates} icon={icon}>
                                    <Popup>
                                      <div className="min-w-[150px]">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: employeeColor }}
                                          />
                                          <span className="text-xs font-medium">Stop {order}</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 mb-1">{job.customerName}</p>
                                        <p className="text-xs text-gray-600 mb-1">{job.title}</p>
                                        <p className="text-xs text-gray-500 mb-2">{job.location}</p>
                                        <Badge className={cn("text-[10px] px-1.5 py-0.5", 
                                          isCompleted ? "bg-green-100 text-green-700 border-green-200" :
                                          isCurrentStop ? "bg-orange-100 text-orange-700 border-orange-200" :
                                          "bg-gray-100 text-gray-700 border-gray-200"
                                        )}>
                                          {job.status}
                                        </Badge>
                                      </div>
                                    </Popup>
                                  </Marker>
                                );
                              })}
                            </MapContainer>
                          </div>
                        </div>
                      )}

                      {/* Job Cards List */}
                      {sortedJobs.map((job, index) => {
                        const isCurrentStop = index === currentStopIndex;
                        const isNextStop = index === nextStopIndex && !isCurrentStop;
                      
                        return (
                        <div
                          key={job.id}
                          className={cn(
                            "bg-white p-3.5 rounded-xl border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden",
                            isCurrentStop 
                              ? "border-orange-300 bg-orange-50/30" 
                              : "border-gray-200"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Radio Indicator */}
                            <div className="flex-shrink-0 mt-0.5 relative">
                              {isCurrentStop ? (
                                <div className="relative">
                                  <div className="absolute inset-0 w-5 h-5 bg-orange-500 rounded-full opacity-20 animate-ping" />
                                  <div className="relative w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                                    <Circle className="h-2.5 w-2.5 text-white fill-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                  isNextStop 
                                    ? "border-orange-300 bg-orange-50" 
                                    : "border-gray-300 bg-white"
                                )}>
                                  <Circle className="h-2.5 w-2.5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Job Details */}
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                                  <h4 className={cn(
                                    "font-semibold text-sm truncate",
                                    isCurrentStop ? "text-orange-700" : "text-gray-900"
                                  )}>
                                    {job.customerName}
                                  </h4>
                                  {isCurrentStop && (
                                    <Badge className="text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-700 border-orange-200 rounded-full shrink-0">
                                      Current Stop
                                    </Badge>
                                  )}
                                  {isNextStop && (
                                    <Badge className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200 rounded-full shrink-0">
                                      Next Stop
                                    </Badge>
                                  )}
                                </div>
                                {/* Status Dropdown - Schedule Route tab for employees */}
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={job.status}
                                    onValueChange={(value) => handleStatusChange(job.id, value)}
                                  >
                                    <SelectTrigger
                                      className={cn(
                                        "h-auto py-0.5 px-2 text-[10px] font-medium border rounded-full shrink-0 w-auto min-w-[70px] max-w-[100px]",
                                        "focus:ring-1 focus:ring-offset-0 focus:ring-orange-500",
                                        getStatusBadge(job.status),
                                        "hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer"
                                      )}
                                    >
                                      <SelectValue>
                                        <span className="truncate">{job.status}</span>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent 
                                      className="z-[9999] min-w-[160px] rounded-lg shadow-lg" 
                                      position="popper" 
                                      sideOffset={4}
                                      align="end"
                                      side="bottom"
                                    >
                                      <SelectItem value="Scheduled" className="text-xs py-2 cursor-pointer">
                                        <span className="flex items-center gap-2">
                                          <Circle className="h-3 w-3 text-gray-400" />
                                          Scheduled
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="In Progress" className="text-xs py-2 cursor-pointer">
                                        <span className="flex items-center gap-2">
                                          <Circle className="h-3 w-3 text-orange-600 fill-orange-600" />
                                          In Progress
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="Completed" className="text-xs py-2 cursor-pointer">
                                        <span className="flex items-center gap-2">
                                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                                          Completed
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="Cancel" className="text-xs py-2 cursor-pointer">
                                        <span className="flex items-center gap-2">
                                          <XCircle className="h-3 w-3 text-red-600" />
                                          Cancel
                                        </span>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-700 mb-1.5 font-medium">{job.title}</p>
                              
                              <p className="text-xs text-gray-600 mb-2 line-clamp-1 flex items-start gap-1.5">
                                <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                <span className="flex-1 truncate">{job.location}</span>
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                <span className="font-medium">{job.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </>
                  ) : (
                    // Merchant Login: Accordion structure
                    <Accordion 
                      type="single" 
                      collapsible 
                      value={expandedAccordion}
                      onValueChange={setExpandedAccordion}
                      className="space-y-2"
                    >
                      {Object.entries(jobsByEmployee)
                        .filter(([employeeId]) => {
                          if (selectedEmployeeFilter === "all") return true;
                          return employeeId === selectedEmployeeFilter;
                        })
                        .map(([employeeId, jobs]) => {
                          const employee = mockEmployees.find(emp => emp.id === employeeId);
                          if (!employee) return null;
                          // Show accordion even if jobs.length === 0 (employee might have had jobs reassigned)
                          
                          const empColor = employeeColors[employeeId] || "#3b82f6";
                          const currentIdx = getCurrentStopIndex(jobs);
                          const nextIdx = getNextStopIndex(jobs, currentIdx);
                          
                          // Light tinted background based on employee color
                          const bgColor = `${empColor}15`; // 15 = ~8% opacity
                          
                          return (
                            <AccordionItem 
                              key={employeeId} 
                              value={employeeId}
                              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mb-2"
                            >
                              <AccordionTrigger 
                                className={cn(
                                  "px-4 py-2.5 hover:no-underline transition-all",
                                  "[&[data-state=open]]:bg-opacity-20 [&[data-state=open]]:rounded-t-xl",
                                  expandedAccordion === employeeId && "rounded-t-xl"
                                )}
                                style={{ backgroundColor: expandedAccordion === employeeId ? bgColor : 'transparent' }}
                              >
                                <div className="flex items-center gap-2.5 flex-1 text-left">
                                  <div 
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: empColor }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-800 leading-tight">{employee.name}</h4>
                                    <span className="text-xs text-gray-500 leading-tight">
                                      {jobs.length} {jobs.length === 1 ? "stop" : "stops"}
                                    </span>
                                  </div>
                                  {/* Edit Schedule Button - Merchant Only */}
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className="h-7 w-7 shrink-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full flex items-center justify-center cursor-pointer transition-colors mr-1"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent accordion toggle
                                      setEditingEmployeeId(employeeId);
                                      setShowScheduleRouteModal(true);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingEmployeeId(employeeId);
                                        setShowScheduleRouteModal(true);
                                      }
                                    }}
                                    aria-label={`Edit schedule for ${employee.name}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3 pt-2 bg-gray-50/50 rounded-b-xl">
                                {jobs.length === 0 ? (
                                  <div className="py-6 text-center">
                                    <p className="text-sm text-gray-500">No jobs assigned</p>
                                  </div>
                                ) : (
                                <div className="space-y-2.5">
                                  {jobs.map((job, index) => {
                                    const isCurrentStop = index === currentIdx;
                                    const isNextStop = index === nextIdx && !isCurrentStop;
                                    
                                    return (
                                      <div
                                        key={job.id}
                                        className={cn(
                                          "bg-white p-3 rounded-xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden",
                                          isCurrentStop 
                                            ? "border-orange-300 bg-orange-50/30" 
                                            : "border-gray-200"
                                        )}
                                      >
                                        <div className="flex items-start gap-3">
                                          {/* Radio Indicator */}
                                          <div className="flex-shrink-0 mt-0.5 relative">
                                            {isCurrentStop ? (
                                              <div className="relative">
                                                <div className="absolute inset-0 w-5 h-5 bg-orange-500 rounded-full opacity-20 animate-ping" />
                                                <div className="relative w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                                                  <Circle className="h-2.5 w-2.5 text-white fill-white" />
                                                </div>
                                              </div>
                                            ) : (
                                              <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                isNextStop 
                                                  ? "border-orange-300 bg-orange-50" 
                                                  : "border-gray-300 bg-white"
                                              )}>
                                                <Circle className="h-2.5 w-2.5 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                          
                                          {/* Job Details */}
                                          <div className="flex-1 min-w-0">
                                            {/* Row 1: Customer Name + Status + Kebab Menu */}
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                              <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
                                                <h4 className={cn(
                                                  "font-semibold text-sm truncate",
                                                  isCurrentStop ? "text-orange-700" : "text-gray-900"
                                                )}>
                                                  {job.customerName}
                                                </h4>
                                                {isCurrentStop && (
                                                  <Badge className="text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-700 border-orange-200 rounded-full shrink-0">
                                                    Current Stop
                                                  </Badge>
                                                )}
                                                {isNextStop && (
                                                  <Badge className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200 rounded-full shrink-0">
                                                    Next Stop
                                                  </Badge>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-1.5 shrink-0">
                                                {/* Status Dropdown - Schedule Route tab for merchants */}
                                                <div onClick={(e) => e.stopPropagation()}>
                                                  <Select
                                                    value={job.status}
                                                    onValueChange={(value) => handleStatusChange(job.id, value)}
                                                  >
                                                    <SelectTrigger
                                                      className={cn(
                                                        "h-auto py-0.5 px-2 text-[10px] font-medium border rounded-full shrink-0 w-auto min-w-[70px] max-w-[100px]",
                                                        "focus:ring-1 focus:ring-offset-0 focus:ring-orange-500",
                                                        getStatusBadge(job.status),
                                                        "hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer"
                                                      )}
                                                    >
                                                      <SelectValue>
                                                        <span className="truncate">{job.status}</span>
                                                      </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent 
                                                      className="z-[9999] min-w-[160px] rounded-lg shadow-lg" 
                                                      position="popper" 
                                                      sideOffset={4}
                                                      align="end"
                                                      side="bottom"
                                                    >
                                                      <SelectItem value="Scheduled" className="text-xs py-2 cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                          <Circle className="h-3 w-3 text-gray-400" />
                                                          Scheduled
                                                        </span>
                                                      </SelectItem>
                                                      <SelectItem value="In Progress" className="text-xs py-2 cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                          <Circle className="h-3 w-3 text-orange-600 fill-orange-600" />
                                                          In Progress
                                                        </span>
                                                      </SelectItem>
                                                      <SelectItem value="Completed" className="text-xs py-2 cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                          Completed
                                                        </span>
                                                      </SelectItem>
                                                      <SelectItem value="Cancel" className="text-xs py-2 cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                          <XCircle className="h-3 w-3 text-red-600" />
                                                          Cancel
                                                        </span>
                                                      </SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                            </div>
                                                {/* Three-dot Kebab Menu */}
                                                <div onClick={(e) => e.stopPropagation()}>
                                                  {(() => {
                                                    const paymentStatus = getPaymentStatus(job);
                                                    const feedbackAutoSendEnabled = typeof window !== "undefined" 
                                                      ? localStorage.getItem("autoSendFeedback") === "true" 
                                                      : false;
                                                    
                                                    const menuItems: KebabMenuItem[] = [
                                                      {
                                                        label: "Reassign Employee",
                                                        icon: UserCog,
                                                        action: () => handleReassignEmployee(job),
                                                        separator: false,
                                                      },
                                                    ];

                                                    if (job.status === "Scheduled") {
                                                      menuItems.push({
                                                        label: "Reschedule Job",
                                                        icon: RefreshCw,
                                                        action: () => handleRescheduleJob(job),
                                                        separator: false,
                                                      });
                                                    }
                                                    
                                                    // Add Edit option only if payment status is Open
                                                    if (paymentStatus === "Open") {
                                                      menuItems.push({
                                                        label: "Edit",
                                                        icon: Edit,
                                                        action: () => handleEditJob(job),
                                                        separator: false,
                                                      });
                                                    }
                                                    
                                                    // Feedback menu options based on global setting and feedback existence
                                                    const jobHasFeedback = hasFeedback(job.id);
                                                    
                                                    if (feedbackAutoSendEnabled) {
                                                      // Auto-send is ON: Only show "View Feedback" if feedback exists
                                                      if (jobHasFeedback) {
                                                        menuItems.push({
                                                          label: "View Feedback",
                                                          icon: MessageSquare,
                                                          action: () => {
                                                            setSelectedJobForFeedback(job);
                                                            setShowViewFeedbackModal(true);
                                                          },
                                                          separator: false,
                                                        });
                                                      }
                                                    } else {
                                                      // Auto-send is OFF: Show "Send Feedback Form" for completed jobs, and "View Feedback" if exists
                                                      if (jobHasFeedback) {
                                                        menuItems.push({
                                                          label: "View Feedback",
                                                          icon: MessageSquare,
                                                          action: () => {
                                                            setSelectedJobForFeedback(job);
                                                            setShowViewFeedbackModal(true);
                                                          },
                                                          separator: false,
                                                        });
                                                      }
                                                      
                                                      // Show "Send Feedback Form" for completed jobs (but not if feedback already exists)
                                                      if (job.status === "Completed" && !jobHasFeedback) {
                                                        menuItems.push({
                                                          label: "Send Feedback Form",
                                                          icon: FileText,
                                                          action: () => handleSendFeedbackForm(job.id),
                                                          separator: false,
                                                        });
                                                      }
                                                    }
                                                    
                                                    return (
                                                      <KebabMenu
                                                        items={menuItems}
                                                        align="end"
                                                        menuWidth="w-48"
                                                      />
                                                    );
                                                  })()}
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Row 2: Job Title */}
                                            <p className="text-sm text-gray-700 mb-1.5 font-medium">{job.title}</p>
                                            
                                            {/* Row 3: Location */}
                                            <p className="text-xs text-gray-600 mb-1.5 line-clamp-1 flex items-start gap-1.5">
                                              <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                              <span className="flex-1 truncate">{job.location}</span>
                                            </p>
                                            
                                            {/* Row 4: Time */}
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                              <Clock className="h-3.5 w-3.5 shrink-0" />
                                              <span className="font-medium">{job.time}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                    </Accordion>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Location Tab - Show for both merchant and employee logins */}
        {activeTab === "live-location" && (
          <div className="flex-1 overflow-hidden flex flex-col bg-[#FDF4EF]">
            {/* Map Container - Fixed at top */}
            <div className="px-4 pt-4 pb-3 flex-shrink-0">
              <div className="relative h-[280px] rounded-2xl shadow-lg overflow-hidden border border-gray-200 bg-white">
                {employeeJobs.length > 0 ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={isEmployee ? 13 : 12}
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                    scrollWheelZoom={false}
                    zoomControl={true}
                    className="rounded-2xl"
                  >
                    <MapCenter center={mapCenter} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Employee Location Markers (Merchant) or Single Employee (Employee Login) */}
                    {isEmployee ? (
                      <Marker position={employeeCurrentLocation} icon={createCustomIcon("#3b82f6", true)}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold text-blue-600">You</p>
                            <p className="text-xs text-gray-600">Current Location</p>
                          </div>
                        </Popup>
                      </Marker>
                    ) : (
                      // Merchant: Show all employees with their colors
                      employeesWithJobs.map((employee) => {
                        const empLocation = employeeLocations[employee.id];
                        if (!empLocation) return null;
                        const empColor = employeeColors[employee.id] || "#3b82f6";
                        return (
                          <Marker key={employee.id} position={empLocation} icon={createCustomIcon(empColor, true)}>
                            <Popup>
                              <div className="text-center min-w-[120px]">
                                <p className="font-semibold" style={{ color: empColor }}>{employee.name}</p>
                                <p className="text-xs text-gray-600">Current Location</p>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })
                    )}

                    {/* Job Location Markers */}
                    {jobCoordinates.map(({ job, coordinates }) => {
                      const isCurrentJob = job.id === currentJob?.id;
                      const isCompleted = job.status === "Completed";
                      const empColor = employeeColors[job.technicianId] || "#3b82f6";
                      
                      let icon;
                      if (isCurrentJob) {
                        icon = createCustomIcon(empColor, true); // Employee color pulsing for current job
                      } else if (isCompleted) {
                        icon = createCheckIcon(); // Green checkmark for completed
                      } else {
                        // Use employee color for pending jobs (merchant) or orange (employee)
                        icon = createCustomIcon(isEmployee ? "#f97316" : empColor, false);
                      }

                      const employee = mockEmployees.find(emp => emp.id === job.technicianId);

                      return (
                        <Marker key={job.id} position={coordinates} icon={icon}>
                          <Popup>
                            <div className="min-w-[150px]">
                              {!isEmployee && employee && (
                                <p className="text-xs font-medium mb-1" style={{ color: empColor }}>
                                  {employee.name}
                                </p>
                              )}
                              <p className="font-semibold text-gray-900 mb-1">{job.customerName}</p>
                              <p className="text-xs text-gray-600 mb-1">{job.title}</p>
                              <p className="text-xs text-gray-500 mb-2">{job.location}</p>
                              <Badge className={cn("text-[10px] px-1.5 py-0.5", getStatusBadge(job.status))}>
                                {job.status}
                              </Badge>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Navigation className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No jobs to display on map</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job List Below Map - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollable px-4 pb-4 min-h-0">
              {filteredJobsForDisplay.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No jobs scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {formatDateForComparison(selectedDate) === formatDateForComparison(new Date()) 
                        ? "Today's Stops" 
                        : `${format(selectedDate, "MMM dd, yyyy")} Stops`}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {filteredJobsForDisplay.length} {filteredJobsForDisplay.length === 1 ? "stop" : "stops"}
                    </span>
                  </div>

                  {/* Employee Filter + Date Picker (Merchant Only) - Below "Today's Stops" heading */}
                  {!isEmployee && (
                    <div className="mb-4 flex items-center gap-3">
                      <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
                        <SelectTrigger className="flex-1 bg-white border-gray-300 h-10">
                          <SelectValue>
                            {selectedEmployeeFilter === "all" 
                              ? "All Employees" 
                              : mockEmployees.find(emp => emp.id === selectedEmployeeFilter)?.name || "All Employees"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Employees</SelectItem>
                          {employeesWithJobs.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 bg-white border-gray-300 h-10 justify-start text-left font-normal hover:bg-gray-50"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (date) {
                                setSelectedDate(date);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Group by Employee (Merchant) or Single List (Employee) */}
                  {isEmployee ? (
                    // Employee Login: Single list
                    filteredJobsForDisplay.map((job, index) => {
                      const employeeJobsList = jobsByEmployee[currentEmployeeId] || [];
                      const currentIdx = getCurrentStopIndex(employeeJobsList);
                      const nextIdx = getNextStopIndex(employeeJobsList, currentIdx);
                      const isCurrentStop = index === currentIdx;
                      const isNextStop = index === nextIdx && !isCurrentStop;
                    
                    return (
                      <div
                        key={job.id}
                        className={cn(
                          "bg-white p-3.5 rounded-xl border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden",
                          isCurrentStop 
                            ? "border-orange-300 bg-orange-50/30" 
                            : "border-gray-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon / Radio Marker */}
                          <div className="flex-shrink-0 mt-0.5 relative">
                            {isCurrentStop ? (
                              <div className="relative">
                                <div className="absolute inset-0 w-5 h-5 bg-orange-500 rounded-full opacity-20 animate-ping" />
                                <div className="relative w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                                  <Circle className="h-2.5 w-2.5 text-white fill-white" />
                                </div>
                              </div>
                            ) : (
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                isNextStop 
                                  ? "border-orange-300 bg-orange-50" 
                                  : "border-gray-300 bg-white"
                              )}>
                                {getStatusIcon(job.status)}
                              </div>
                            )}
                          </div>
                          
                          {/* Job Details */}
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <h4 className={cn(
                                  "font-semibold text-sm truncate",
                                  isCurrentStop ? "text-orange-700" : "text-gray-900"
                                )}>
                                  {job.customerName}
                                </h4>
                                {isCurrentStop && (
                                  <Badge className="text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-700 border-orange-200 rounded-full shrink-0">
                                    Current Stop
                                  </Badge>
                                )}
                                {isNextStop && (
                                  <Badge className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200 rounded-full shrink-0">
                                    Next Stop
                                  </Badge>
                                )}
                              </div>
                              {/* Status Dropdown - Only in Live Location tab for employees */}
                              {isEmployee && activeTab === "live-location" && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={job.status}
                                  onValueChange={(value) => handleStatusChange(job.id, value)}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "h-auto py-0.5 px-2 text-[10px] font-medium border rounded-full shrink-0 w-auto min-w-[70px] max-w-[100px]",
                                      "focus:ring-1 focus:ring-offset-0 focus:ring-orange-500",
                                      getStatusBadge(job.status),
                                      "hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer"
                                    )}
                                  >
                                    <SelectValue>
                                        <span className="truncate">{job.status}</span>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent 
                                    className="z-[9999] min-w-[160px] rounded-lg shadow-lg" 
                                    position="popper" 
                                    sideOffset={4}
                                    align="end"
                                    side="bottom"
                                  >
                                    <SelectItem value="Scheduled" className="text-xs py-2 cursor-pointer">
                                      <span className="flex items-center gap-2">
                                        <Circle className="h-3 w-3 text-gray-400" />
                                        Scheduled
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="In Progress" className="text-xs py-2 cursor-pointer">
                                      <span className="flex items-center gap-2">
                                        <Circle className="h-3 w-3 text-orange-600 fill-orange-600" />
                                        In Progress
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="Completed" className="text-xs py-2 cursor-pointer">
                                      <span className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        Completed
                                      </span>
                                    </SelectItem>
                                      <SelectItem value="Cancel" className="text-xs py-2 cursor-pointer">
                                        <span className="flex items-center gap-2">
                                          <XCircle className="h-3 w-3 text-red-600" />
                                          Cancel
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              )}
                              {/* Status Badge for Merchant */}
                              {!isEmployee && (
                                <Badge className={cn(
                                  "text-[10px] px-2 py-0.5 shrink-0",
                                  getStatusBadge(job.status)
                                )}>
                                  {job.status}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-1.5 font-medium">{job.title}</p>
                            
                            <p className="text-xs text-gray-600 mb-2 line-clamp-1 flex items-start gap-1.5">
                              <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                              <span className="flex-1 truncate">{job.location}</span>
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-medium">{job.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                  ) : (
                    // Merchant Login: Group by employee
                    Object.entries(jobsByEmployee).map(([employeeId, jobs]) => {
                      const employee = mockEmployees.find(emp => emp.id === employeeId);
                      if (!employee || jobs.length === 0) return null;
                      
                      const empColor = employeeColors[employeeId] || "#3b82f6";
                      const currentIdx = getCurrentStopIndex(jobs);
                      const nextIdx = getNextStopIndex(jobs, currentIdx);
                      
                      return (
                        <div key={employeeId} className="space-y-2.5">
                          {/* Employee Header */}
                          <div className="flex items-center gap-2 mb-2 pt-2">
                            <div 
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: empColor }}
                            />
                            <h4 className="text-sm font-semibold text-gray-800">{employee.name}</h4>
                            <span className="text-xs text-gray-500">({jobs.length} {jobs.length === 1 ? "stop" : "stops"})</span>
                          </div>
                          
                          {/* Employee's Jobs */}
                          {jobs.map((job, index) => {
                            const isCurrentStop = index === currentIdx;
                            const isNextStop = index === nextIdx && !isCurrentStop;
                            
                            return (
                              <div
                                key={job.id}
                                className={cn(
                                  "bg-white p-3.5 rounded-xl border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden",
                                  isCurrentStop 
                                    ? "border-orange-300 bg-orange-50/30" 
                                    : "border-gray-200"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Status Icon / Radio Marker */}
                                  <div className="flex-shrink-0 mt-0.5 relative">
                                    {isCurrentStop ? (
                                      <div className="relative">
                                        <div className="absolute inset-0 w-5 h-5 bg-orange-500 rounded-full opacity-20 animate-ping" />
                                        <div className="relative w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                                          <Circle className="h-2.5 w-2.5 text-white fill-white" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                        isNextStop 
                                          ? "border-orange-300 bg-orange-50" 
                                          : "border-gray-300 bg-white"
                                      )}>
                                        {getStatusIcon(job.status)}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Job Details */}
                                  <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                                        <h4 className={cn(
                                          "font-semibold text-sm truncate",
                                          isCurrentStop ? "text-orange-700" : "text-gray-900"
                                        )}>
                                          {job.customerName}
                                        </h4>
                                        {isCurrentStop && (
                                          <Badge className="text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-700 border-orange-200 rounded-full shrink-0">
                                            Current Stop
                                          </Badge>
                                        )}
                                        {isNextStop && (
                                          <Badge className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200 rounded-full shrink-0">
                                            Next Stop
                                          </Badge>
                                        )}
                                      </div>
                                      {/* Status Dropdown for Merchant */}
                                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <Select
                                          value={job.status}
                                          onValueChange={(value) => handleStatusChange(job.id, value)}
                                        >
                                          <SelectTrigger
                                            className={cn(
                                              "h-auto py-0.5 px-2 text-[10px] font-medium border rounded-full shrink-0 w-auto min-w-[70px] max-w-[100px]",
                                              "focus:ring-1 focus:ring-offset-0 focus:ring-orange-500",
                                              getStatusBadge(job.status),
                                              "hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer"
                                            )}
                                          >
                                            <SelectValue>
                                                <span className="truncate">{job.status}</span>
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent 
                                            className="z-[9999] min-w-[160px] rounded-lg shadow-lg" 
                                            position="popper" 
                                            sideOffset={4}
                                            align="end"
                                            side="bottom"
                                          >
                                            <SelectItem value="Scheduled" className="text-xs py-2 cursor-pointer">
                                              <span className="flex items-center gap-2">
                                                <Circle className="h-3 w-3 text-gray-400" />
                                                Scheduled
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="In Progress" className="text-xs py-2 cursor-pointer">
                                              <span className="flex items-center gap-2">
                                                <Circle className="h-3 w-3 text-orange-600 fill-orange-600" />
                                                In Progress
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="Completed" className="text-xs py-2 cursor-pointer">
                                              <span className="flex items-center gap-2">
                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                Completed
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="Cancel" className="text-xs py-2 cursor-pointer">
                                              <span className="flex items-center gap-2">
                                                <XCircle className="h-3 w-3 text-red-600" />
                                                Cancel
                                              </span>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-700 mb-1.5 font-medium">{job.title}</p>
                                    
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-1 flex items-start gap-1.5">
                                      <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                      <span className="flex-1 truncate">{job.location}</span>
                                    </p>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <Clock className="h-3.5 w-3.5 shrink-0" />
                                      <span className="font-medium">{job.time}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Route Modal */}
      <ScheduleRouteModal
        isOpen={showScheduleRouteModal}
        onClose={() => {
          setShowScheduleRouteModal(false);
          setEditingEmployeeId(undefined);
        }}
        initialEmployeeId={editingEmployeeId || (isEmployee ? currentEmployeeId : undefined)}
        mode={editingEmployeeId ? "edit" : "create"}
        onSave={(_employeeId, _orderedJobIds) => {
          // Route is already saved in localStorage by the modal
          // Force re-render to show updated order
          setShowScheduleRouteModal(false);
          setEditingEmployeeId(undefined);
          // Trigger re-sort by updating a dependency
          toast.success("Route order updated successfully");
        }}
      />

      {/* Reassign Employee Modal */}
      {selectedJobForReassign && (
        <ReassignEmployeeModal
          isOpen={showReassignModal}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedJobForReassign(null);
          }}
          currentEmployeeId={selectedJobForReassign.technicianId}
          estimateId={selectedJobForReassign.id}
          onSave={(newEmployeeId) => {
            // Update the job's technician
            const newEmployee = mockEmployees.find(emp => emp.id === newEmployeeId);
            if (newEmployee && selectedJobForReassign) {
              // Get current assignment (or use original job assignment)
              const currentAssignment = jobAssignments[selectedJobForReassign.id];
              const oldEmployeeId = currentAssignment 
                ? currentAssignment.technicianId 
                : selectedJobForReassign.technicianId;
              
              // Update job assignment in state
              setJobAssignments((prev) => ({
                ...prev,
                [selectedJobForReassign.id]: {
                  technicianId: newEmployeeId,
                  technicianName: newEmployee.name,
                },
              }));
              
              // In production, this would call an API endpoint
              // Example: await reassignJob(selectedJobForReassign.id, newEmployeeId);
              
              toast.success(`Job reassigned to ${newEmployee.name}`);
              setShowReassignModal(false);
              setSelectedJobForReassign(null);
              
              // Auto-expand the new employee's accordion if it's different from the old one (merchant view only)
              if (oldEmployeeId !== newEmployeeId && !isEmployee) {
                // Small delay to ensure state updates have propagated
                setTimeout(() => {
                  setExpandedAccordion(newEmployeeId);
                }, 100);
              }
            }
          }}
        />
      )}

      {/* Reschedule Job Modal */}
      {selectedJobForReschedule && (
        <RescheduleJobModal
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedJobForReschedule(null);
          }}
          job={{
            id: selectedJobForReschedule.id,
            title: selectedJobForReschedule.title,
            customerName: selectedJobForReschedule.customerName,
            technicianId: selectedJobForReschedule.technicianId,
            technicianName: selectedJobForReschedule.technicianName,
            date: selectedJobForReschedule.date,
            time: selectedJobForReschedule.time,
            jobAddress: selectedJobForReschedule.location,
          }}
          onConfirm={handleRescheduleConfirm}
          onEditRoute={() => {
            setShowRescheduleModal(false);
            setSelectedJobForReschedule(null);
            setEditingEmployeeId(selectedJobForReschedule.technicianId);
            setShowScheduleRouteModal(true);
          }}
        />
      )}

      {/* Send Feedback Form Modal */}
      {selectedJobForFeedback && (
        <SendFeedbackFormModal
          isOpen={showFeedbackFormModal}
          onClose={() => {
            setShowFeedbackFormModal(false);
            setSelectedJobForFeedback(null);
          }}
          job={selectedJobForFeedback}
          customerEmail={mockCustomers.find(c => c.id === selectedJobForFeedback.customerId)?.email || ""}
          onSend={() => {
            setJobFeedbackStatus(prev => {
              const updated = {
                ...prev,
                [selectedJobForFeedback.id]: { exists: false }
              };
              localStorage.setItem("jobFeedbackStatus", JSON.stringify(updated));
              return updated;
            });
            setShowFeedbackFormModal(false);
            setSelectedJobForFeedback(null);
            toast.success("Feedback form sent successfully");
          }}
          onFillForm={() => {
            setShowFeedbackFormModal(false);
            setTimeout(() => {
              setShowFillFeedbackFormModal(true);
            }, 100);
          }}
        />
      )}

      {/* View Feedback Modal */}
      {selectedJobForFeedback && (
        <ViewFeedbackModal
          isOpen={showViewFeedbackModal}
          onClose={() => {
            setShowViewFeedbackModal(false);
            setSelectedJobForFeedback(null);
          }}
          job={selectedJobForFeedback}
          feedback={jobFeedbackStatus[selectedJobForFeedback.id]?.feedback}
        />
      )}

      {/* Fill Feedback Form Modal */}
      {selectedJobForFeedback && (
        <FeedbackFormModal
          isOpen={showFillFeedbackFormModal}
          onClose={() => {
            setShowFillFeedbackFormModal(false);
            setSelectedJobForFeedback(null);
          }}
          job={selectedJobForFeedback}
          onSubmit={(rating: number, comment: string) => {
            setJobFeedbackStatus(prev => {
              const updated = {
                ...prev,
                [selectedJobForFeedback.id]: {
                  exists: true,
                  feedback: {
                    rating,
                    comment,
                    submittedAt: new Date().toLocaleString(),
                  }
                }
              };
              localStorage.setItem("jobFeedbackStatus", JSON.stringify(updated));
              return updated;
            });
            setShowFillFeedbackFormModal(false);
            setSelectedJobForFeedback(null);
            toast.success("Feedback submitted successfully");
          }}
        />
      )}
    </div>
  );
};

export default EmployeeTracking;
