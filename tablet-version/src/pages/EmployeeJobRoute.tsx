import { useMemo, useState, useEffect } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockEmployees } from "@/data/mobileMockData";
import { ChevronDown, MapPin, Clock, UserCog, CalendarClock, Eye } from "lucide-react";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import ReassignEmployeeModal from "@/components/modals/ReassignEmployeeModal";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RescheduleJobModal from "@/components/modals/RescheduleJobModal";
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

// Custom numbered marker icon
const createNumberedIcon = (number: number, highlighted = false) => {
  return L.divIcon({
    html: `<div style="
      background: ${highlighted ? "#f97316" : "#3b82f6"};
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
      box-shadow: ${highlighted ? "0 0 0 4px rgba(249,115,22,0.25)" : "0 2px 8px rgba(0,0,0,0.3)"};
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

const EmployeeJobRoute = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate("/employees");

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

  const [highlightedJobKey, setHighlightedJobKey] = useState<string | null>(null);
  const getHighlightKey = (empId: string, jobId: string) => `${empId}:${jobId}`;

  // Reassign Employee Modal state
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: string; empId: string; address: string } | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedJobForReschedule, setSelectedJobForReschedule] = useState<{
    id: string;
    title: string;
    customerName: string;
    technicianId: string;
    technicianName: string;
    date: string;
    time: string;
    jobAddress: string;
  } | null>(null);

  // Handler to open reassign modal
  const handleReassignEmployee = (jobId: string, empId: string, address: string) => {
    setSelectedJob({ id: jobId, empId, address });
    setShowReassignModal(true);
  };

  const handleShowOnMap = (empId: string, jobId: string) => {
    setHighlightedJobKey(getHighlightKey(empId, jobId));
    const mapElement = document.getElementById(`employee-route-map-${empId}`);
    mapElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleViewJobDetails = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleRescheduleJob = (job: { id: string; customer: string; service: string; address: string; time: string }, emp: { id: string; name: string }) => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedJobForReschedule({
      id: job.id,
      title: job.service,
      customerName: job.customer,
      technicianId: emp.id,
      technicianName: emp.name,
      date: today,
      time: job.time,
      jobAddress: job.address,
    });
    setShowRescheduleModal(true);
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
      <TabletHeader title="Scheduled Route" showBack onBack={handleBack} className="px-4 md:px-6 lg:px-8" />

      <div className="flex-1 overflow-y-auto scrollable pb-8 pt-6">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-6">
              {/* Filters Row */}
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Employee filter */}
                  <div className="md:col-span-6 min-w-0">
                    <Label className="text-xs text-gray-600 mb-1 block">Employee</Label>
                    <Select value={filterEmpId} onValueChange={setFilterEmpId}>
                      <SelectTrigger className="h-11 border-gray-300 min-w-0">
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
                  <div className="md:col-span-6 min-w-0">
                    <Label className="text-xs text-gray-600 mb-1 block">Date Range</Label>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilterDateRange(true)}
                      className="w-full h-11 justify-start text-sm font-normal border-gray-300 min-w-0"
                    >
                      {filterRange.from && filterRange.to ? (
                        <span className="truncate">
                          {format(filterRange.from, "MM/dd/yyyy")} - {format(filterRange.to, "MM/dd/yyyy")}
                        </span>
                      ) : filterRange.from ? (
                        <span className="truncate">{format(filterRange.from, "MM/dd/yyyy")}</span>
                      ) : (
                        <span className="text-muted-foreground truncate">Select date range</span>
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
                      "border-gray-100 bg-white"
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 pointer-events-none">
                          <ChevronDown className={`h-4 w-4 transition-transform ${expanded[emp.id] ? "rotate-180" : ""}`} />
                        </Button>
                      </div>
                    </div>
                    
                    {expanded[emp.id] && (
                      <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                        {/* Demo jobs for this employee with coordinates */}
                        {(() => {
                          const employeeJobs = [
                            { id: "j1", customer: "Robert Miller", service: "AC Maintenance", address: "789 Pine Rd, Chicago, IL", time: "09:00 AM", status: "current", lat: 41.8781, lng: -87.6298 },
                            { id: "j2", customer: "Jennifer Wilson", service: "Plumbing Repair", address: "456 Oak Ave, Chicago, IL", time: "11:00 AM", status: "next", lat: 41.8831, lng: -87.6251 },
                            { id: "j3", customer: "John Smith", service: "HVAC Installation", address: "123 Main St, Chicago, IL", time: "02:00 PM", status: "scheduled", lat: 41.8881, lng: -87.6301 },
                            { id: "j4", customer: "Emma Davis", service: "Electrical Work", address: "321 Elm St, Chicago, IL", time: "04:00 PM", status: "scheduled", lat: 41.8731, lng: -87.6201 },
                          ];

                          // Map positions for this employee's jobs
                          const mapPositions: [number, number][] = employeeJobs.map((j) => [j.lat, j.lng]);

                          return (
                            <>
                              {/* Map showing all job locations */}
                              <div
                                id={`employee-route-map-${emp.id}`}
                                className="rounded-xl overflow-hidden border border-gray-200 h-[250px] md:h-[300px]"
                              >
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
                                  {employeeJobs.map((job, idx) => (
                                    <Marker
                                      key={job.id}
                                      position={[job.lat, job.lng]}
                                      icon={createNumberedIcon(
                                        idx + 1,
                                        highlightedJobKey === getHighlightKey(emp.id, job.id)
                                      )}
                                    />
                                  ))}
                                  {mapPositions.length > 1 && (
                                    <Polyline
                                      positions={mapPositions}
                                      color="#f97316"
                                      weight={4}
                                      opacity={0.8}
                                      dashArray="0"
                                    />
                                  )}
                                  <MapBounds positions={mapPositions} />
                                </MapContainer>
                              </div>

                              {/* Job Cards List */}
                              <div className="space-y-3">
                                {employeeJobs.map((job, jobIdx) => {
                                  const menuItems: KebabMenuItem[] = [
                                    {
                                      label: "View Job Details",
                                      icon: Eye,
                                      action: () => handleViewJobDetails(job.id),
                                    },
                                    {
                                      label: "Reschedule Job",
                                      icon: CalendarClock,
                                      action: () => handleRescheduleJob(job, emp),
                                    },
                                    {
                                      label: "Reassign Employee",
                                      icon: UserCog,
                                      action: () => handleReassignEmployee(job.id, emp.id, job.address),
                                    },
                                    {
                                      label: "Show on Map",
                                      icon: MapPin,
                                      action: () => handleShowOnMap(emp.id, job.id),
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
                            </>
                          );
                        })()}
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
      {selectedJobForReschedule && (
        <RescheduleJobModal
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedJobForReschedule(null);
          }}
          onConfirm={(date, time, employeeId, updatedAddress) => {
            const employee = mockEmployees.find(emp => emp.id === employeeId);
            showSuccessToast(`Job rescheduled to ${date} at ${time}${employee ? ` with ${employee.name}` : ""}`);
            if (updatedAddress) {
              showSuccessToast("Job address updated");
            }
            setShowRescheduleModal(false);
            setSelectedJobForReschedule(null);
          }}
          job={selectedJobForReschedule}
        />
      )}

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
