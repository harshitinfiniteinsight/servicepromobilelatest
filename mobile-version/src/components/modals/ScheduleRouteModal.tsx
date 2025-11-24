import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, MapPin, Clock, GripVertical, Calendar as CalendarIcon, Circle, XCircle, ChevronDown, UserCog, Edit } from "lucide-react";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mockJobs, mockEmployees, mockInvoices, mockEstimates, mockAgreements } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import ReassignEmployeeModal from "@/components/modals/ReassignEmployeeModal";

// Create numbered marker icon with order number and employee color
// Replaces the old createCustomIcon and createCheckIcon functions
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

interface ScheduleRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, orderedJobIds: string[]) => void;
  initialEmployeeId?: string; // Optional: pre-select this employee when modal opens
  mode?: "create" | "edit"; // Modal mode: "create" (default) or "edit"
}

// Employee colors mapping
const employeeColors: Record<string, string> = {
  "1": "#F97316", // Orange
  "2": "#3B82F6", // Blue
  "3": "#10B981", // Green
  "4": "#8B5CF6", // Purple
  "5": "#EC4899", // Pink
};

// Get status badge styling for Edit Route modal (only Scheduled and Cancelled)
const getStatusBadgeForRoute = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      // Default to Scheduled if status is not one of the allowed options
      return "bg-orange-100 text-orange-700 border-orange-200";
  }
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
      return estimate.status === "Paid" ? "Paid" : "Open";
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

// Draggable Route Stop Card Component
interface RouteStopCardProps {
  job: typeof mockJobs[0];
  index: number;
  empColor: string;
  status: string;
  onStatusChange: (jobId: string, newStatus: string) => void;
  onReassignEmployee: (job: typeof mockJobs[0]) => void;
  onEditJob: (job: typeof mockJobs[0]) => void;
}

const RouteStopCard = ({ job, index, empColor, status, onStatusChange, onReassignEmployee, onEditJob }: RouteStopCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Ensure status is either Scheduled or Cancelled
  const currentStatus = status === "Cancelled" ? "Cancelled" : "Scheduled";
  const paymentStatus = getPaymentStatus(job);

  // Build menu items
  const menuItems: KebabMenuItem[] = [
    {
      label: "Reassign Employee",
      icon: UserCog,
      action: () => onReassignEmployee(job),
      separator: false,
    },
  ];

  // Add Edit option only if payment status is Open
  if (paymentStatus === "Open") {
    menuItems.push({
      label: "Edit Job",
      icon: Edit,
      action: () => onEditJob(job),
      separator: false,
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white p-3 rounded-xl border border-gray-200 shadow-sm",
        isDragging && "shadow-lg"
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Stop Number - Dynamically syncs with map marker number via index position */}
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ backgroundColor: empColor }}
        >
          {index + 1}
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {job.customerName}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Status Dropdown - Only Scheduled and Cancelled */}
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  value={currentStatus}
                  onValueChange={(value) => onStatusChange(job.id, value)}
                >
                  <SelectTrigger
                    className={cn(
                      "h-auto py-0.5 px-2 text-[10px] font-medium border rounded-full shrink-0 w-auto min-w-[75px] max-w-[95px]",
                      "focus:ring-1 focus:ring-offset-0 focus:ring-orange-500",
                      getStatusBadgeForRoute(currentStatus),
                      "hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer"
                    )}
                  >
                    <SelectValue>
                      <span className="truncate">{currentStatus}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[9999] min-w-[140px] rounded-lg shadow-lg" 
                    position="popper" 
                    sideOffset={4}
                    align="end"
                    side="bottom"
                  >
                    <SelectItem value="Scheduled" className="text-xs py-2 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Circle className="h-3 w-3 text-orange-600" />
                        Scheduled
                      </span>
                    </SelectItem>
                    <SelectItem value="Cancelled" className="text-xs py-2 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-red-600" />
                        Cancelled
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Three-dot Kebab Menu */}
              <div onClick={(e) => e.stopPropagation()}>
                <KebabMenu
                  items={menuItems}
                  align="end"
                  menuWidth="w-48"
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-1.5 font-medium">{job.title}</p>

          <p className="text-xs text-gray-600 mb-1.5 line-clamp-1 flex items-start gap-1.5">
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
};

const ScheduleRouteModal = ({ isOpen, onClose, onSave, initialEmployeeId, mode = "create" }: ScheduleRouteModalProps) => {
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [routeStops, setRouteStops] = useState<typeof mockJobs>([]);
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedJobForReassign, setSelectedJobForReassign] = useState<typeof mockJobs[0] | null>(null);

  // Determine text based on mode
  const modalTitle = mode === "edit" ? "Edit Route" : "Schedule Route";
  const buttonText = mode === "edit" ? "Update Route" : "Save Route";
  const savingText = mode === "edit" ? "Updating..." : "Saving...";

  // Format date for comparison (YYYY-MM-DD)
  const formatDateForComparison = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get all employees (not filtered by jobs) - show full list
  const allEmployees = useMemo(() => {
    return mockEmployees;
  }, []);

  // Calculate number of stops for each employee on selected date
  const getEmployeeStopCount = (employeeId: string): number => {
    const dateStr = formatDateForComparison(selectedDate);
    return mockJobs.filter(
      (job) => job.technicianId === employeeId && job.date === dateStr
    ).length;
  };

  // Generate demo jobs for an employee if no real jobs exist
  const generateDemoJobs = (employeeId: string, dateStr: string, employeeName: string): typeof mockJobs => {
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

  // Get jobs for selected employee and date, or generate demo jobs if none exist
  const employeeJobs = useMemo(() => {
    if (!selectedEmployeeId) return [];
    const dateStr = formatDateForComparison(selectedDate);
    const realJobs = mockJobs.filter(
      (job) => job.technicianId === selectedEmployeeId && job.date === dateStr
    );
    
    // If no real jobs exist, generate demo jobs
    if (realJobs.length === 0) {
      const selectedEmployee = mockEmployees.find(emp => emp.id === selectedEmployeeId);
      if (selectedEmployee) {
        return generateDemoJobs(selectedEmployeeId, dateStr, selectedEmployee.name);
      }
    }
    
    return realJobs;
  }, [selectedEmployeeId, selectedDate]);

  // Initialize job statuses from route stops or load saved statuses
  useEffect(() => {
    if (routeStops.length > 0 && selectedEmployeeId) {
      const dateStr = formatDateForComparison(selectedDate);
      const statusKey = `route_statuses_${selectedEmployeeId}_${dateStr}`;
      const savedStatuses = localStorage.getItem(statusKey);
      
      if (savedStatuses) {
        try {
          const parsedStatuses = JSON.parse(savedStatuses);
          // Merge saved statuses with current route stops, ensuring all jobs have a status
          const initialStatuses: Record<string, string> = {};
          routeStops.forEach((job) => {
            // Use saved status if available, otherwise use job status or default to Scheduled
            const savedStatus = parsedStatuses[job.id];
            if (savedStatus === "Cancelled") {
              initialStatuses[job.id] = "Cancelled";
            } else {
              initialStatuses[job.id] = "Scheduled";
            }
          });
          setJobStatuses(initialStatuses);
        } catch (error) {
          // If parsing fails, initialize from job statuses
          const initialStatuses: Record<string, string> = {};
          routeStops.forEach((job) => {
            const status = job.status === "Cancelled" ? "Cancelled" : "Scheduled";
            initialStatuses[job.id] = status;
          });
          setJobStatuses(initialStatuses);
        }
      } else {
        // No saved statuses, initialize from job statuses
        const initialStatuses: Record<string, string> = {};
        routeStops.forEach((job) => {
          const status = job.status === "Cancelled" ? "Cancelled" : "Scheduled";
          initialStatuses[job.id] = status;
        });
        setJobStatuses(initialStatuses);
      }
    }
  }, [routeStops, selectedEmployeeId, selectedDate]);

  // Load saved route order or use default time-based order
  useEffect(() => {
    if (selectedEmployeeId && employeeJobs.length > 0) {
      const dateStr = formatDateForComparison(selectedDate);
      const savedOrderKey = `route_order_${selectedEmployeeId}_${dateStr}`;
      const savedOrder = localStorage.getItem(savedOrderKey);
      
      if (savedOrder) {
        try {
          const orderedIds = JSON.parse(savedOrder);
          // Reorder jobs based on saved order
          const orderedJobs = orderedIds
            .map((id: string) => employeeJobs.find((job) => job.id === id))
            .filter(Boolean) as typeof mockJobs;
          
          // Add any new jobs not in saved order
          const newJobs = employeeJobs.filter(
            (job) => !orderedIds.includes(job.id)
          );
          
          setRouteStops([...orderedJobs, ...newJobs]);
        } catch (error) {
          // If parsing fails, use default order
          setRouteStops([...employeeJobs]);
        }
      } else {
        // Default: sort by time
        const sorted = [...employeeJobs].sort((a, b) => {
          const timeA = a.time;
          const timeB = b.time;
          return timeA.localeCompare(timeB);
        });
        setRouteStops(sorted);
      }
    } else {
      setRouteStops([]);
    }
  }, [selectedEmployeeId, employeeJobs, selectedDate]);

  // Handle job status change in Route Stops
  const handleJobStatusChange = (jobId: string, newStatus: string) => {
    // Ensure only Scheduled or Cancelled
    const validStatus = newStatus === "Cancelled" ? "Cancelled" : "Scheduled";
    setJobStatuses((prev) => ({
      ...prev,
      [jobId]: validStatus,
    }));
  };

  // Handle reassign employee
  const handleReassignEmployee = (job: typeof mockJobs[0]) => {
    setSelectedJobForReassign(job);
    setShowReassignModal(true);
  };

  // Handle edit job
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
    // Close the modal when navigating to edit
    onClose();
  };

  // Check if user is employee (when initialEmployeeId is provided and matches logged-in employee)
  const isEmployeeMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    const userType = localStorage.getItem("userType");
    const currentEmployeeId = localStorage.getItem("currentEmployeeId");
    return userType === "employee" && initialEmployeeId === currentEmployeeId;
  }, [initialEmployeeId]);

  // Auto-select employee: use initialEmployeeId if provided (especially for edit mode or employee mode), otherwise first employee with jobs on selected date
  useEffect(() => {
    if (isOpen) {
      // In edit mode or employee mode, always use initialEmployeeId if provided
      if ((mode === "edit" || isEmployeeMode) && initialEmployeeId && allEmployees.some(emp => emp.id === initialEmployeeId)) {
        if (selectedEmployeeId !== initialEmployeeId) {
          setSelectedEmployeeId(initialEmployeeId);
        }
      } else if (!selectedEmployeeId) {
        // In create mode (merchant), auto-select initialEmployeeId if provided, otherwise first employee with jobs
        if (initialEmployeeId && allEmployees.some(emp => emp.id === initialEmployeeId)) {
          setSelectedEmployeeId(initialEmployeeId);
        } else {
          const dateStr = formatDateForComparison(selectedDate);
          const employeeWithJobs = allEmployees.find(emp => 
            mockJobs.some(job => job.technicianId === emp.id && job.date === dateStr)
          );
          if (employeeWithJobs) {
            setSelectedEmployeeId(employeeWithJobs.id);
          }
        }
      }
    }
  }, [isOpen, selectedEmployeeId, allEmployees, initialEmployeeId, selectedDate, mode, isEmployeeMode]);

  // Reset selected employee, date, and job statuses when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedEmployeeId("");
      setSelectedDate(new Date());
      setJobStatuses({});
      setShowReassignModal(false);
      setSelectedJobForReassign(null);
    }
  }, [isOpen]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - updates routeStops array, which triggers automatic updates to:
  // - Marker numbers (via jobCoordinates order recalculation)
  // - Polyline connectors (via polylineCoordinates recalculation)
  // - Card badge numbers (via index recalculation)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRouteStops((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Calculate map center and job coordinates
  const mapCenter = useMemo(() => {
    if (routeStops.length === 0) return [41.8781, -87.6298] as [number, number];
    
    // Calculate average of all job locations
    const avgLat = 41.8781; // Default Chicago area
    const avgLng = -87.6298;
    return [avgLat, avgLng] as [number, number];
  }, [routeStops]);

  // Calculate job coordinates and order numbers based on current routeStops array position
  // This automatically updates when routeStops is reordered via drag-and-drop
  const jobCoordinates = useMemo(() => {
    return routeStops.map((job, index) => {
      // Distribute jobs around center point based on their position in the route
      const angle = (index * (360 / Math.max(routeStops.length, 1))) * (Math.PI / 180);
      const radius = 0.015; // ~1.5km radius
      const lat = mapCenter[0] + Math.cos(angle) * radius;
      const lng = mapCenter[1] + Math.sin(angle) * radius;
      return {
        job,
        order: index + 1, // Route sequence number (1, 2, 3...)
        coordinates: [lat, lng] as [number, number],
      };
    });
  }, [routeStops, mapCenter]);

  // Extract coordinates array for polyline (ordered by route sequence)
  const polylineCoordinates = useMemo(() => {
    return jobCoordinates.map(({ coordinates }) => coordinates);
  }, [jobCoordinates]);

  // Create a key for polyline based on route order for efficient re-rendering
  const polylineKey = useMemo(() => {
    return routeStops.map((job) => job.id).join('-');
  }, [routeStops]);

  // Get current job (In Progress)
  const currentJob = routeStops.find((job) => job.status === "In Progress");
  const empColor = selectedEmployeeId ? (employeeColors[selectedEmployeeId] || "#3b82f6") : "#3b82f6";

  // Handle save
  const handleSave = async () => {
    if (routeStops.length < 2) {
      toast.error("At least 2 stops are required to save a route");
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage with date included in key
      const orderedIds = routeStops.map((job) => job.id);
      const dateStr = formatDateForComparison(selectedDate);
      const savedOrderKey = `route_order_${selectedEmployeeId}_${dateStr}`;
      localStorage.setItem(savedOrderKey, JSON.stringify(orderedIds));

      // Save job statuses
      const statusKey = `route_statuses_${selectedEmployeeId}_${dateStr}`;
      localStorage.setItem(statusKey, JSON.stringify(jobStatuses));

      // Call onSave callback
      onSave(selectedEmployeeId, orderedIds);

      toast.success("Route saved successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save route");
      console.error("Error saving route:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedEmployee = mockEmployees.find((emp) => emp.id === selectedEmployeeId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 m-0 flex h-full max-h-full w-full max-w-full flex-col gap-0 rounded-none p-0 sm:!left-1/2 sm:!top-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[720px] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">{modalTitle}</DialogTitle>
        <DialogDescription className="sr-only">{modalTitle} modal</DialogDescription>

        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between safe-top">
          <h2 className="text-base font-semibold text-white">{modalTitle}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-orange-600 h-9 w-9 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#FDF4EF] flex flex-col">
          {/* Employee Selector and Date Picker Row */}
          <div className="px-4 pt-4 pb-3">
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Employee Selector */}
              <div className="min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Select Employee</label>
                <div className="relative">
                  {selectedEmployee && (
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10"
                      style={{ backgroundColor: empColor }}
                    />
                  )}
                  <Select 
                    value={selectedEmployeeId} 
                    onValueChange={setSelectedEmployeeId}
                    disabled={mode === "edit" || isEmployeeMode}
                  >
                    <SelectTrigger 
                      className={cn(
                        "w-full bg-white border-gray-300 h-10 pl-8",
                        (mode === "edit" || isEmployeeMode) && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <SelectValue placeholder="Select Employee">
                        {selectedEmployee
                          ? `${selectedEmployee.name} (${employeeJobs.length} ${employeeJobs.length === 1 ? "stop" : "stops"})`
                          : "Select Employee"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {allEmployees.map((employee) => {
                        const stopCount = getEmployeeStopCount(employee.id);
                        const empCol = employeeColors[employee.id] || "#3b82f6";
                        return (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: empCol }}
                              />
                              <span>{employee.name}</span>
                              {stopCount > 0 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  ({stopCount} {stopCount === 1 ? "stop" : "stops"})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Selector */}
              <div className="min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-white border-gray-300 h-10 justify-start text-left font-normal hover:bg-gray-50"
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
                          // If current employee has no jobs on new date, reset selection
                          const dateStr = formatDateForComparison(date);
                          if (selectedEmployeeId) {
                            const hasJobsOnNewDate = mockJobs.some(
                              (job) => job.technicianId === selectedEmployeeId && job.date === dateStr
                            );
                            if (!hasJobsOnNewDate) {
                              setSelectedEmployeeId("");
                            }
                          }
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Map Section */}
          {selectedEmployeeId && routeStops.length > 0 && (
            <div className="px-4 pb-3">
              <div className="relative h-[280px] rounded-2xl shadow-lg overflow-hidden border border-gray-200 bg-white">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                  scrollWheelZoom={false}
                  zoomControl={true}
                  className="rounded-2xl"
                >
                  <MapUpdater coordinates={polylineCoordinates} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Route Polyline - Connects markers in order, updates dynamically when route is reordered */}
                  {polylineCoordinates.length > 1 && (
                    <Polyline
                      key={`polyline-${polylineKey}`}
                      positions={polylineCoordinates}
                      pathOptions={{
                        color: "#FF7A00",
                        weight: 4,
                        opacity: 0.9,
                        smoothFactor: 1,
                      }}
                    />
                  )}

                  {/* Job Location Markers with Numbers - Dynamically update when route is reordered */}
                  {jobCoordinates.map(({ job, coordinates, order }) => {
                    const isCurrentJob = job.id === currentJob?.id;
                    const isCompleted = job.status === "Completed";

                    // Create icon with current order number (updates automatically when routeStops changes)
                    const icon = createNumberedMarkerIcon(
                      order,
                      empColor,
                      isCompleted,
                      isCurrentJob
                    );

                    return (
                      <Marker key={job.id} position={coordinates} icon={icon}>
                        <Popup>
                          <div className="min-w-[150px]">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: empColor }}
                              />
                              <span className="text-xs font-medium">Stop {order}</span>
                            </div>
                            <p className="font-semibold text-gray-900 mb-1">{job.customerName}</p>
                            <p className="text-xs text-gray-600 mb-1">{job.title}</p>
                            <p className="text-xs text-gray-500 mb-2">{job.location}</p>
                            <Badge className={cn("text-[10px] px-1.5 py-0.5", 
                              isCompleted ? "bg-green-100 text-green-700 border-green-200" :
                              isCurrentJob ? "bg-orange-100 text-orange-700 border-orange-200" :
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

          {/* Draggable Route Cards */}
          {selectedEmployeeId && routeStops.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Route Stops</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Drag to reorder stops and optimize the route
                </p>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={routeStops.map((job) => job.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2.5">
                    {routeStops.map((job, index) => (
                      <RouteStopCard
                        key={job.id}
                        job={job}
                        index={index}
                        empColor={empColor}
                        status={jobStatuses[job.id] || (job.status === "Cancelled" ? "Cancelled" : "Scheduled")}
                        onStatusChange={handleJobStatusChange}
                        onReassignEmployee={handleReassignEmployee}
                        onEditJob={handleEditJob}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {selectedEmployeeId && routeStops.length === 0 && (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No stops available for this employee</p>
              </div>
            </div>
          )}

          {!selectedEmployeeId && mode !== "edit" && (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Please select an employee to schedule their route</p>
              </div>
            </div>
          )}
        </div>

        {/* Save Button - Fixed at Bottom */}
        {selectedEmployeeId && routeStops.length >= 2 && (
          <div
            className="fixed left-0 right-0 bg-white border-t border-gray-200 z-40 px-4 py-3 safe-bottom"
            style={{
              bottom: 'env(safe-area-inset-bottom)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
            }}
          >
            <Button
              onClick={handleSave}
              disabled={isSaving || routeStops.length < 2}
              className="w-full h-12 rounded-xl font-medium text-base bg-[#F97316] hover:bg-[#EA6820] text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? savingText : buttonText}
            </Button>
          </div>
        )}
      </DialogContent>

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
              // In production, this would call an API endpoint
              // For now, we'll just show a success message
              toast.success(`Employee reassigned to ${newEmployee.name}`);
              setShowReassignModal(false);
              setSelectedJobForReassign(null);
              // In production, you would update the job data here and refresh route stops
            }
          }}
        />
      )}
    </Dialog>
  );
};

export default ScheduleRouteModal;

