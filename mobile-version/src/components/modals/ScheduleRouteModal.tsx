import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Clock, GripVertical } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mockJobs, mockEmployees } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

// Draggable Route Stop Card Component
interface RouteStopCardProps {
  job: typeof mockJobs[0];
  index: number;
  empColor: string;
}

const RouteStopCard = ({ job, index, empColor }: RouteStopCardProps) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm",
        isDragging && "shadow-lg"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
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
            <Badge className="text-[10px] px-2 py-0.5 shrink-0 bg-gray-100 text-gray-700 border-gray-200">
              Scheduled
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
};

const ScheduleRouteModal = ({ isOpen, onClose, onSave, initialEmployeeId, mode = "create" }: ScheduleRouteModalProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [routeStops, setRouteStops] = useState<typeof mockJobs>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Determine text based on mode
  const modalTitle = mode === "edit" ? "Edit Route" : "Schedule Route";
  const buttonText = mode === "edit" ? "Update Route" : "Save Route";
  const savingText = mode === "edit" ? "Updating..." : "Saving...";

  // Get employees with jobs for today
  const employeesWithJobs = useMemo(() => {
    const employeeIds = new Set(mockJobs.map((job) => job.technicianId));
    return mockEmployees.filter((emp) => employeeIds.has(emp.id));
  }, []);

  // Get jobs for selected employee
  const employeeJobs = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return mockJobs.filter((job) => job.technicianId === selectedEmployeeId);
  }, [selectedEmployeeId]);

  // Load saved route order or use default time-based order
  useEffect(() => {
    if (selectedEmployeeId && employeeJobs.length > 0) {
      const savedOrderKey = `route_order_${selectedEmployeeId}`;
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
  }, [selectedEmployeeId, employeeJobs]);

  // Auto-select employee: use initialEmployeeId if provided, otherwise first employee
  useEffect(() => {
    if (isOpen && !selectedEmployeeId && employeesWithJobs.length > 0) {
      if (initialEmployeeId && employeesWithJobs.some(emp => emp.id === initialEmployeeId)) {
        setSelectedEmployeeId(initialEmployeeId);
      } else {
        setSelectedEmployeeId(employeesWithJobs[0].id);
      }
    }
  }, [isOpen, selectedEmployeeId, employeesWithJobs, initialEmployeeId]);

  // Reset selected employee when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedEmployeeId("");
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
      // Save to localStorage
      const orderedIds = routeStops.map((job) => job.id);
      const savedOrderKey = `route_order_${selectedEmployeeId}`;
      localStorage.setItem(savedOrderKey, JSON.stringify(orderedIds));

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
          {/* Employee Selector */}
          <div className="px-4 pt-4 pb-3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Employee</label>
            <div className="relative">
              {selectedEmployee && (
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10"
                  style={{ backgroundColor: empColor }}
                />
              )}
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-full bg-white border-gray-300 h-10 pl-8">
                  <SelectValue placeholder="Select Employee">
                    {selectedEmployee
                      ? `${selectedEmployee.name} (${employeeJobs.length} ${employeeJobs.length === 1 ? "stop" : "stops"})`
                      : "Select Employee"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employeesWithJobs.map((employee) => {
                    const empJobs = mockJobs.filter((job) => job.technicianId === employee.id);
                    const empCol = employeeColors[employee.id] || "#3b82f6";
                    return (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: empCol }}
                          />
                          <span>{employee.name}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({empJobs.length} {empJobs.length === 1 ? "stop" : "stops"})
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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

          {!selectedEmployeeId && (
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
    </Dialog>
  );
};

export default ScheduleRouteModal;

