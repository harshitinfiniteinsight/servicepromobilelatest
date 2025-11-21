import { useState, useMemo, useEffect } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { mockJobs, mockEmployees } from "@/data/mobileMockData";
import { MapPin, Clock, CheckCircle2, Circle, Navigation, Route, ChevronDown, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import ScheduleRouteModal from "@/components/modals/ScheduleRouteModal";

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
  const [activeTab, setActiveTab] = useState<"my-route" | "live-location">("live-location");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all");
  const [expandedAccordion, setExpandedAccordion] = useState<string>("");
  const [showScheduleRouteModal, setShowScheduleRouteModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | undefined>(undefined);

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

  // Get today's date in YYYY-MM-DD format
  // For demo purposes, we'll show jobs from mock data (which has dates in 2024)
  // In production, this would use actual today's date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

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

  // Filter jobs based on login type
  // Employee: Only their jobs | Merchant: All employees' jobs
  const employeeJobs = useMemo(() => {
    let filteredJobs = mockJobs;
    
    if (isEmployee) {
      // Employee: Filter by employee ID only
      filteredJobs = mockJobs.filter((job) => job.technicianId === currentEmployeeId);
    }
    // Merchant: Show all jobs (no filter by employee ID)
    
    return filteredJobs.map((job) => ({
      ...job,
      status: (jobStatuses[job.id] || job.status) as "Scheduled" | "In Progress" | "Completed",
    }));
  }, [currentEmployeeId, jobStatuses, isEmployee]);

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
            const aCompleted = a.status === "Completed";
            const bCompleted = b.status === "Completed";
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
          const aCompleted = a.status === "Completed";
          const bCompleted = b.status === "Completed";
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
          const aCompleted = a.status === "Completed";
          const bCompleted = b.status === "Completed";
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
      if (job.status === "Completed") return;
      
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
      if (job.status === "Completed") return;
      
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
  const jobsByEmployee = useMemo(() => {
    if (isEmployee) {
      return { [currentEmployeeId]: filteredJobsForDisplay };
    }
    
    const grouped: Record<string, typeof filteredJobsForDisplay> = {};
    filteredJobsForDisplay.forEach((job) => {
      if (!grouped[job.technicianId]) {
        grouped[job.technicianId] = [];
      }
      grouped[job.technicianId].push(job);
    });
    return grouped;
  }, [filteredJobsForDisplay, isEmployee, currentEmployeeId]);

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Scheduled":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Handle job status update
  const handleStatusChange = (jobId: string, newStatus: string) => {
    setJobStatuses((prev) => ({
      ...prev,
      [jobId]: newStatus,
    }));
    
    // In production, this would call an API endpoint
    // Example: await updateJobStatus(jobId, newStatus);
    
    toast.success(`Job status updated to ${newStatus}`);
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
      <MobileHeader title="Employee Tracking" showBack={true} />

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
                  {/* Employee Filter Dropdown + Add Button Row - Merchant Only */}
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
                      <button
                        onClick={() => setShowScheduleRouteModal(true)}
                        className="h-10 w-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0"
                        aria-label={isEmployee ? "Scheduled Route" : "Schedule Route"}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {isEmployee ? (
                    // Employee Login: Map + Single list
                    <>
                      {/* Route Map - Employee View */}
                      {sortedJobs.length > 0 && (
                        <div className="mb-4">
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
                                    smoothFactor: 1,
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
                                <Badge className={cn(
                                  "text-[10px] px-2 py-0.5 shrink-0",
                                  getStatusBadge(job.status)
                                )}>
                                  {job.status}
                                </Badge>
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
                          if (!employee || jobs.length === 0) return null;
                          
                          const empColor = employeeColors[employeeId] || "#3b82f6";
                          const currentIdx = getCurrentStopIndex(jobs);
                          const nextIdx = getNextStopIndex(jobs, currentIdx);
                          
                          // Light tinted background based on employee color
                          const bgColor = `${empColor}15`; // 15 = ~8% opacity
                          
                          return (
                            <AccordionItem 
                              key={employeeId} 
                              value={employeeId}
                              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                            >
                              <AccordionTrigger 
                                className={cn(
                                  "px-4 py-3 hover:no-underline [&[data-state=open]]:bg-opacity-20",
                                  "transition-colors"
                                )}
                                style={{ backgroundColor: expandedAccordion === employeeId ? bgColor : 'transparent' }}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div 
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: empColor }}
                                  />
                                  <div className="flex-1 text-left">
                                    <h4 className="text-sm font-semibold text-gray-800">{employee.name}</h4>
                                    <span className="text-xs text-gray-500">
                                      {jobs.length} {jobs.length === 1 ? "stop" : "stops"}
                                    </span>
                                  </div>
                                  {/* Edit Schedule Button - Merchant Only */}
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className="h-8 w-8 shrink-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full flex items-center justify-center cursor-pointer transition-colors"
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
                                    <Pencil className="h-4 w-4" />
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4 pt-2">
                                <div className="space-y-2.5">
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
                                              <Badge className={cn(
                                                "text-[10px] px-2 py-0.5 shrink-0",
                                                getStatusBadge(job.status)
                                              )}>
                                                {job.status}
                                              </Badge>
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
                    <h3 className="text-sm font-semibold text-gray-800">Today's Stops</h3>
                    <span className="text-xs text-gray-500">
                      {filteredJobsForDisplay.length} {filteredJobsForDisplay.length === 1 ? "stop" : "stops"}
                    </span>
                  </div>

                  {/* Employee Filter Dropdown (Merchant Only) - Below "Today's Stops" heading */}
                  {!isEmployee && (
                    <div className="mb-4">
                      <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
                        <SelectTrigger className="w-full bg-white border-gray-300 h-10">
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
                              {isEmployee && (
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
                                      <span className="flex items-center gap-1 whitespace-nowrap">
                                        <span className="truncate">{job.status}</span>
                                        <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
                                      </span>
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
                                              <span className="flex items-center gap-1 whitespace-nowrap">
                                                <span className="truncate">{job.status}</span>
                                                <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
                                              </span>
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
        initialEmployeeId={editingEmployeeId}
        mode={editingEmployeeId ? "edit" : "create"}
        onSave={(employeeId, orderedJobIds) => {
          // Route is already saved in localStorage by the modal
          // Force re-render to show updated order
          setShowScheduleRouteModal(false);
          setEditingEmployeeId(undefined);
          // Trigger re-sort by updating a dependency
          toast.success("Route order updated successfully");
        }}
      />
    </div>
  );
};

export default EmployeeTracking;
