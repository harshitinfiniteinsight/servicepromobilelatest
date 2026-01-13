import { useMemo, useState, useEffect } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockEmployees } from "@/data/mobileMockData";
import { ChevronDown, Pencil, GripVertical, MapPin, Clock, MoreHorizontal, UserCog } from "lucide-react";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import ReassignEmployeeModal from "@/components/modals/ReassignEmployeeModal";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { showSuccessToast } from "@/utils/toast";

const todayStr = () => new Date().toISOString().slice(0, 10);

const colorPalette = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-teal-500",
  "bg-orange-500",
];

const getEmpColor = (id: string) => {
  const idx = Math.abs(parseInt(id, 10)) % colorPalette.length;
  return colorPalette[idx] || "bg-gray-400";
};

// Mock job data with coordinates for demo
interface JobStop {
  id: string;
  customerName: string;
  service: string;
  address: string;
  time: string;
  status: string;
  lat: number;
  lng: number;
  routeOrder: number;
}

const mockJobStops: JobStop[] = [
  {
    id: "job-1",
    customerName: "Robert Miller",
    service: "AC Maintenance",
    address: "789 Pine Rd, Chicago, IL",
    time: "09:00 AM",
    status: "Scheduled",
    lat: 41.8781,
    lng: -87.6298,
    routeOrder: 0,
  },
  {
    id: "job-2",
    customerName: "Jennifer Wilson",
    service: "Plumbing Repair",
    address: "456 Oak Ave, Chicago, IL",
    time: "11:00 AM",
    status: "Scheduled",
    lat: 41.8831,
    lng: -87.6251,
    routeOrder: 1,
  },
  {
    id: "job-3",
    customerName: "John Smith",
    service: "HVAC Installation",
    address: "123 Main St, Chicago, IL",
    time: "02:00 PM",
    status: "Scheduled",
    lat: 41.8881,
    lng: -87.6301,
    routeOrder: 2,
  },
  {
    id: "job-4",
    customerName: "Emma Davis",
    service: "Electrical Work",
    address: "321 Elm St, Chicago, IL",
    time: "04:00 PM",
    status: "Scheduled",
    lat: 41.8731,
    lng: -87.6201,
    routeOrder: 3,
  },
];

// Custom numbered marker icon
const createNumberedIcon = (number: number) => {
  return L.divIcon({
    html: `<div style="
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${number}</div>`,
    className: "custom-numbered-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Map bounds auto-fit component
const MapBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [positions, map]);
  
  return null;
};

// Sortable job card component
const SortableJobCard = ({ job, index }: { job: JobStop; index: number }) => {
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
      className="rounded-xl border border-gray-100 bg-white shadow-sm p-3 flex items-start gap-3"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing flex-shrink-0 text-gray-400 hover:text-gray-600 mt-1"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <Badge className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold p-0 mt-1">
        {index + 1}
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{job.customerName}</p>
            <p className="text-xs text-gray-600 mt-0.5">{job.service}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{job.address}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{job.time}</span>
              </div>
              <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                {job.status}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmployeeJobRoute = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate("/employees");

  // LEFT: Add Route selections
  const [leftEmpId, setLeftEmpId] = useState<string>("");
  const [leftDate, setLeftDate] = useState<string>(todayStr());
  const [jobStops, setJobStops] = useState<JobStop[]>([]);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editingEmpDate, setEditingEmpDate] = useState<string>(todayStr());

  // Load jobs when employee and date are selected
  useEffect(() => {
    if (leftEmpId && leftDate) {
      // Simulate loading jobs for selected employee/date
      // In real app, this would be an API call
      setJobStops([...mockJobStops]);
    } else {
      setJobStops([]);
    }
  }, [leftEmpId, leftDate]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setJobStops((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveRoute = () => {
    // Persist route order (in real app, save to backend)
    console.log("Saving route order:", jobStops.map((j, idx) => ({ id: j.id, order: idx })));
    showSuccessToast("Route updated successfully");
  };

  const handleEditEmployee = (empId: string) => {
    setEditingEmpId(empId);
    setEditingEmpDate(todayStr());
    setJobStops([...mockJobStops]);
  };

  const handleCloseEdit = () => {
    setEditingEmpId(null);
    setJobStops([]);
  };

  const handleUpdateRoute = () => {
    // Persist updated route order
    console.log("Updating route for employee:", editingEmpId, jobStops.map((j, idx) => ({ id: j.id, order: idx })));
    showSuccessToast("Route updated successfully");
  };

  // Map positions for polyline
  const positions: [number, number][] = jobStops.map((j) => [j.lat, j.lng]);

  // RIGHT: Filters
  const [filterEmpId, setFilterEmpId] = useState<string>("all");
  const [filterRange, setFilterRange] = useState<{ from: Date | undefined; to: Date | undefined }>(() => {
    const t = new Date();
    const d = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
    return { from: d, to: d };
  });
  const [showFilterDateRange, setShowFilterDateRange] = useState(false);

  // Expanded employees state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  // Reassign Employee Modal state
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: string; empId: string; address: string } | null>(null);

  // Handler to open reassign modal
  const handleReassignEmployee = (jobId: string, empId: string, address: string) => {
    setSelectedJob({ id: jobId, empId, address });
    setShowReassignModal(true);
  };

  // Handler to open Google Maps
  const handleShowOnMap = (address: string) => {
    if (!address || address.trim() === "") {
      return;
    }
    const encodedAddress = encodeURIComponent(address.trim());
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, "_blank");
  };

  // Handler for reassign modal save
  const handleReassignSave = (newEmployeeId: string) => {
    const employee = mockEmployees.find(emp => emp.id === newEmployeeId);
    if (employee) {
      showSuccessToast(`Job reassigned to ${employee.name}`);
      setShowReassignModal(false);
      setSelectedJob(null);
    }
  };

  // DEMO DATA: Hardcoded employees with 4 stops each
  const routeData = useMemo(() => {
    // Demo employees list
    const demoEmployees = [
      { id: "1", name: "Mike Johnson" },
      { id: "2", name: "Tom Wilson" },
      { id: "3", name: "Chris Davis" },
      { id: "4", name: "Sarah Martinez" },
      { id: "5", name: "James Anderson" },
      { id: "6", name: "Lisa Thompson" },
      { id: "7", name: "Robert Garcia" },
      { id: "8", name: "Emily Brown" },
      { id: "9", name: "David Lee" },
    ];

    // Filter by selected employee if not "all"
    const filtered = filterEmpId === "all" 
      ? demoEmployees 
      : demoEmployees.filter(e => e.id === filterEmpId);

    // Return demo structure with 4 stops each
    return filtered.map(emp => ({
      emp,
      stopCount: 4
    }));
  }, [filterEmpId]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      <TabletHeader title="Job Route" showBack onBack={handleBack} className="px-4 md:px-6 lg:px-8" />

      <div className="flex-1 overflow-y-auto scrollable pb-8 pt-6">
        <div className="px-4 md:px-6 lg:px-8">
          {/* Split layout: Left (Add Route) fixed-ish, Right (Route List) */}
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
            {/* LEFT: Add Route or Edit Route */}
            <div className="space-y-6">
              {editingEmpId ? (
                // EDIT ROUTE VIEW
                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <div className="px-4 md:px-6 lg:px-8 pt-5 pb-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Edit Route</h2>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCloseEdit}>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>

                    {/* Row: Employee (read-only) + Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Employee</Label>
                        <div className="h-11 rounded-md border border-gray-300 bg-gray-50 flex items-center px-3">
                          <p className="text-sm text-gray-700">{mockEmployees.find(e => e.id === editingEmpId)?.name || "—"}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Date</Label>
                        <Input type="date" value={editingEmpDate} onChange={(e) => setEditingEmpDate(e.target.value)} className="h-11 border-gray-300" />
                      </div>
                    </div>

                    {/* Map */}
                    <div className="rounded-xl overflow-hidden border border-gray-200 h-[280px]">
                      <MapContainer
                        center={[41.8781, -87.6298]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {jobStops.map((job, idx) => (
                          <Marker
                            key={job.id}
                            position={[job.lat, job.lng]}
                            icon={createNumberedIcon(idx + 1)}
                          />
                        ))}
                        {positions.length > 1 && (
                          <Polyline
                            positions={positions}
                            color="#f97316"
                            weight={4}
                            opacity={0.8}
                            dashArray="0"
                          />
                        )}
                        <MapBounds positions={positions} />
                      </MapContainer>
                    </div>

                    {/* Route Stops List */}
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Route Stops</h3>
                        <p className="text-xs text-gray-500 mt-1">Drag to reorder stops and optimize the route</p>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={jobStops.map((j) => j.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {jobStops.map((job, idx) => (
                              <SortableJobCard key={job.id} job={job} index={idx} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>

                    {/* Update Route Button */}
                    <Button
                      className="w-full rounded-full py-3 text-sm font-semibold"
                      onClick={handleUpdateRoute}
                    >
                      Update Route
                    </Button>
                  </div>
                </div>
              ) : (
                // ADD ROUTE VIEW
                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <div className="px-4 md:px-6 lg:px-8 pt-5 pb-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Add Route</h2>

                    {/* Row: Employee + Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Employee</Label>
                        <Select value={leftEmpId} onValueChange={setLeftEmpId}>
                          <SelectTrigger className="h-11 border-gray-300">
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockEmployees.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Date</Label>
                        <Input type="date" value={leftDate} onChange={(e) => setLeftDate(e.target.value)} className="h-11 border-gray-300" />
                      </div>
                    </div>

                    {/* Map and Route Stops */}
                    <div>
                      {!leftEmpId || !leftDate ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                          Select employee and date to load assigned jobs
                        </div>
                      ) : jobStops.length === 0 ? (
                        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
                          No jobs assigned for this date
                        </div>
                      ) : (
                        <>
                          {/* Map */}
                          <div className="rounded-xl overflow-hidden border border-gray-200 h-[280px]">
                            <MapContainer
                              center={[41.8781, -87.6298]}
                              zoom={13}
                              style={{ height: "100%", width: "100%" }}
                              scrollWheelZoom={false}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              {jobStops.map((job, idx) => (
                                <Marker
                                  key={job.id}
                                  position={[job.lat, job.lng]}
                                  icon={createNumberedIcon(idx + 1)}
                                />
                              ))}
                              {positions.length > 1 && (
                                <Polyline
                                  positions={positions}
                                  color="#f97316"
                                  weight={4}
                                  opacity={0.8}
                                  dashArray="0"
                                />
                              )}
                              <MapBounds positions={positions} />
                            </MapContainer>
                          </div>

                          {/* Route Stops List */}
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-900">Route Stops</h3>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                            >
                              <SortableContext
                                items={jobStops.map((j) => j.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="space-y-2">
                                  {jobStops.map((job, idx) => (
                                    <SortableJobCard key={job.id} job={job} index={idx} />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          </div>

                          {/* Save Route Button */}
                          <Button
                            className="w-full rounded-full py-3 text-sm font-semibold"
                            onClick={handleSaveRoute}
                          >
                            Save Route
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Route List */}
            <div className="flex flex-col gap-6">
              {/* Filters Row */}
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Employee filter */}
                  <div className="md:col-span-6">
                    <Label className="text-xs text-gray-600 mb-1 block">Employee</Label>
                    <Select value={filterEmpId} onValueChange={setFilterEmpId}>
                      <SelectTrigger className="h-11 border-gray-300">
                        <SelectValue placeholder="All Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {mockEmployees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="md:col-span-6">
                    <Label className="text-xs text-gray-600 mb-1 block">Date Range</Label>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilterDateRange(true)}
                      className="w-full h-11 justify-start text-sm font-normal border-gray-300"
                    >
                      {filterRange.from && filterRange.to ? (
                        <span>
                          {format(filterRange.from, "MM/dd/yyyy")} - {format(filterRange.to, "MM/dd/yyyy")}
                        </span>
                      ) : filterRange.from ? (
                        <span>{format(filterRange.from, "MM/dd/yyyy")}</span>
                      ) : (
                        <span className="text-muted-foreground">Select date range</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Employee route cards */}
              <div className="space-y-3">
                {routeData.map(({ emp, stopCount }) => (
                  <div 
                    key={emp.id} 
                    className={`rounded-2xl border shadow-sm overflow-hidden transition-colors ${
                      editingEmpId === emp.id 
                        ? "border-blue-300 bg-blue-50" 
                        : "border-gray-100 bg-white"
                    }`}
                  >

                    <div 
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Close other accordions, toggle this one
                        setExpanded(expanded[emp.id] ? {} : { [emp.id]: true });
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`h-2.5 w-2.5 rounded-full ${getEmpColor(emp.id)}`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{stopCount} stops</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEmployee(emp.id);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 pointer-events-none">
                          <ChevronDown className={`h-4 w-4 transition-transform ${expanded[emp.id] ? "rotate-180" : ""}`} />
                        </Button>
                      </div>
                    </div>
                    
                    {expanded[emp.id] && (
                      <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                        {/* Demo jobs for this employee */}
                        {[
                          { id: "j1", customer: "Robert Miller", service: "AC Maintenance", address: "789 Pine Rd, Chicago, IL", time: "09:00 AM", status: "current" },
                          { id: "j2", customer: "Jennifer Wilson", service: "Plumbing Repair", address: "456 Oak Ave, Chicago, IL", time: "11:00 AM", status: "next" },
                          { id: "j3", customer: "John Smith", service: "HVAC Installation", address: "123 Main St, Chicago, IL", time: "02:00 PM", status: "scheduled" },
                          { id: "j4", customer: "Emma Davis", service: "Electrical Work", address: "321 Elm St, Chicago, IL", time: "04:00 PM", status: "scheduled" },
                        ].map((job, jobIdx) => {
                          const menuItems: KebabMenuItem[] = [
                            {
                              label: "Reassign employee",
                              icon: UserCog,
                              action: () => handleReassignEmployee(job.id, emp.id, job.address),
                            },
                            {
                              label: "Show on map",
                              icon: MapPin,
                              action: () => handleShowOnMap(job.address),
                            },
                          ];

                          return (
                            <div 
                              key={job.id} 
                              className={`rounded-xl border p-4 flex items-start gap-3 ${
                                job.status === "current" 
                                  ? "bg-white border-orange-300 border-2" 
                                  : "bg-white border-gray-100"
                              }`}
                            >
                              {/* Status indicator */}
                              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                  job.status === "current" 
                                    ? "bg-orange-500" 
                                    : job.status === "next" 
                                    ? "bg-blue-500" 
                                    : "bg-gray-400"
                                }`}>
                                  {jobIdx + 1}
                                </div>
                                {job.status === "current" && (
                                  <span className="text-xs font-semibold text-orange-600 whitespace-nowrap">Current</span>
                                )}
                                {job.status === "next" && (
                                  <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">Next</span>
                                )}
                              </div>
                              
                              {/* Job details */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{job.customer}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{job.service}</p>
                                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{job.address}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span>{job.time}</span>
                                </div>
                              </div>
                              
                              {/* Status dropdown and menu */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 hover:border-gray-300">
                                  <option>Scheduled</option>
                                  <option>In Progress</option>
                                  <option>Completed</option>
                                  <option>Cancelled</option>
                                </select>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <KebabMenu items={menuItems} menuWidth="w-48" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        open={showFilterDateRange}
        onOpenChange={setShowFilterDateRange}
        initialRange={filterRange}
        onConfirm={(range) => setFilterRange(range)}
      />

      {/* Reassign Employee Modal */}
      {selectedJob && (
        <ReassignEmployeeModal
          isOpen={showReassignModal}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedJob(null);
          }}
          currentEmployeeId={selectedJob.empId}
          estimateId={selectedJob.id}
          onSave={handleReassignSave}
        />
      )}
    </div>
  );
};

export default EmployeeJobRoute;
