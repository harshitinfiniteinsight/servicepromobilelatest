import { useState, useMemo } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar as CalendarIcon, Edit3, Trash2, Clock, Globe, CalendarDays } from "lucide-react";
import { mockEmployees } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import AddEmployeeScheduleModal from "@/components/modals/AddEmployeeScheduleModal";
import EditEmployeeScheduleModal from "@/components/modals/EditEmployeeScheduleModal";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

export interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  scheduledDate: string;
  scheduledDateEnd?: string;
  timezone: string;
  startTime: string;
  endTime: string;
  timeInterval: string;
}

// Mock schedule data
const mockSchedules: Schedule[] = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "Mike Johnson",
    scheduledDate: "2025-11-21",
    scheduledDateEnd: "2025-11-30",
    timezone: "America/New_York",
    startTime: "09:00",
    endTime: "17:00",
    timeInterval: "30 min",
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "Tom Wilson",
    scheduledDate: "2025-11-22",
    scheduledDateEnd: "2025-12-01",
    timezone: "America/Chicago",
    startTime: "08:00",
    endTime: "16:00",
    timeInterval: "15 min",
  },
  {
    id: "3",
    employeeId: "3",
    employeeName: "Chris Davis",
    scheduledDate: "2025-11-23",
    timezone: "America/Los_Angeles",
    startTime: "10:00",
    endTime: "18:00",
    timeInterval: "20 min",
  },
  {
    id: "4",
    employeeId: "4",
    employeeName: "Sarah Martinez",
    scheduledDate: "2025-11-24",
    scheduledDateEnd: "2025-12-05",
    timezone: "America/Denver",
    startTime: "07:00",
    endTime: "15:00",
    timeInterval: "30 min",
  },
];

const EmployeeSchedule = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  // Check if user is employee (EMPLOYEE LOGIN ONLY)
  const userType = localStorage.getItem("userType") || "merchant";
  const isEmployee = userType === "employee";
  const currentEmployeeId = localStorage.getItem("currentEmployeeId") || "1";

  // Get current employee info for pre-filling
  const currentEmployee = mockEmployees.find((emp) => emp.id === currentEmployeeId);

  // Filter schedules based on search query, date range, and employee access
  const filteredSchedules = useMemo(() => {
    let filtered = schedules;

    // EMPLOYEE LOGIN: Show only schedules belonging to logged-in employee
    if (isEmployee) {
      filtered = filtered.filter((schedule) => schedule.employeeId === currentEmployeeId);
    } else {
      // MERCHANT LOGIN: Filter by search query (employee name)
      filtered = filtered.filter((schedule) =>
        schedule.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date range if set
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((schedule) => {
        const scheduleDate = new Date(schedule.scheduledDate);
        const scheduleEndDate = schedule.scheduledDateEnd
          ? new Date(schedule.scheduledDateEnd)
          : scheduleDate;

        if (dateRange.from && dateRange.to) {
          return (
            (scheduleDate >= dateRange.from && scheduleDate <= dateRange.to) ||
            (scheduleEndDate >= dateRange.from && scheduleEndDate <= dateRange.to) ||
            (scheduleDate <= dateRange.from && scheduleEndDate >= dateRange.to)
          );
        } else if (dateRange.from) {
          return scheduleEndDate >= dateRange.from;
        } else if (dateRange.to) {
          return scheduleDate <= dateRange.to;
        }
        return true;
      });
    }

    return filtered;
  }, [schedules, searchQuery, dateRange, isEmployee, currentEmployeeId]);

  const handleAddSchedule = (newSchedule: Schedule) => {
    setSchedules((prev) => [...prev, newSchedule]);
    setAddModalOpen(false);
    showSuccessToast("Schedule added successfully");
  };

  const handleEditSchedule = (schedule: Schedule) => {
    // EMPLOYEE LOGIN: Validate that employee can only edit their own schedules
    if (isEmployee && schedule.employeeId !== currentEmployeeId) {
      showErrorToast("You can only edit your own schedules");
      return;
    }
    setSelectedSchedule(schedule);
    setEditModalOpen(true);
  };

  const handleUpdateSchedule = (updatedSchedule: Schedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
    setEditModalOpen(false);
    setSelectedSchedule(null);
    showSuccessToast("Schedule updated successfully");
  };

  const handleDeleteClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedSchedule) {
      setSchedules((prev) => prev.filter((s) => s.id !== selectedSchedule.id));
      setDeleteDialogOpen(false);
      setSelectedSchedule(null);
      showSuccessToast("Schedule deleted successfully");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRangeDisplay = (startDate: string, endDate?: string) => {
    const start = formatDate(startDate);
    if (endDate) {
      const end = formatDate(endDate);
      return `${start} – ${end}`;
    }
    return start;
  };

  const handleDateRangeConfirm = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };

  const getMenuItems = (schedule: Schedule): KebabMenuItem[] => {
    return [
      {
        label: "Edit Schedule",
        icon: Edit3,
        action: () => handleEditSchedule(schedule),
      },
      {
        label: "Delete",
        icon: Trash2,
        action: () => handleDeleteClick(schedule),
        variant: "destructive",
      },
    ];
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      <TabletHeader
        title="Employee Schedule"
        showBack
        onBack={() => navigate("/employees")}
        className="px-4 md:px-6 lg:px-8"
      />

      <div className="flex-1 overflow-y-auto scrollable pb-8 pt-6">
        <div className="px-4 md:px-6 lg:px-8">
          {/* Split layout: 40% form (left) + 60% schedule list (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
            {/* LEFT SECTION: Add Schedule Form */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
                <div className="px-4 md:px-6 lg:px-8 pt-5 pb-6 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Add Schedule</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Employee *</Label>
                      <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                        <SelectTrigger className="h-11 border-gray-300">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEmployees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Start Date *</Label>
                      <Input
                        type="date"
                        className="h-11 border-gray-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">End Date</Label>
                      <Input
                        type="date"
                        className="h-11 border-gray-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Timezone *</Label>
                      <Input
                        placeholder="e.g., America/New_York"
                        className="h-11 border-gray-300"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Start Time *</Label>
                        <Input
                          type="time"
                          className="h-11 border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">End Time *</Label>
                        <Input
                          type="time"
                          className="h-11 border-gray-300"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Time Interval *</Label>
                      <Input
                        placeholder="e.g., 30 min"
                        className="h-11 border-gray-300"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-4">
                    <Button 
                      className="w-full rounded-full py-3 text-sm font-semibold"
                      onClick={() => setAddModalOpen(true)}
                    >
                      Add Schedule
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-full py-3 text-sm font-semibold border-gray-200 text-gray-700 hover:bg-muted"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION: Schedule List */}
            <div className="space-y-6">
              {/* Filters Row: Search + Date Range */}
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Search (≈60-65%) */}
                  <div className="md:col-span-8">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search by employee name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 pl-10 border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Date Range (≈35-40%) */}
                  <div className="md:col-span-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowDateRangePicker(true)}
                      className="w-full h-11 justify-start text-sm font-normal border-gray-300"
                    >
                      <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                      {dateRange.from && dateRange.to ? (
                        <span>
                          {format(dateRange.from, "MM/dd/yyyy")} - {format(dateRange.to, "MM/dd/yyyy")}
                        </span>
                      ) : dateRange.from ? (
                        <span>{format(dateRange.from, "MM/dd/yyyy")}</span>
                      ) : (
                        <span className="text-muted-foreground">Select date range</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Schedule Cards */}
              {filteredSchedules.length === 0 ? (
                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-12 text-center">
                  <p className="text-gray-500">No schedules found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4"
                    >
                      {/* Top Row: Employee Name and Menu */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <button
                          onClick={() => navigate(`/employees/${schedule.employeeId}`)}
                          className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left flex-1"
                        >
                          {schedule.employeeName}
                        </button>
                        <KebabMenu items={getMenuItems(schedule)} menuWidth="w-44" />
                      </div>

                      {/* Schedule Details */}
                      <div className="space-y-2.5 text-sm">
                        <div className="text-gray-600">
                          <span className="font-medium text-gray-900">
                            {formatDateRangeDisplay(schedule.scheduledDate, schedule.scheduledDateEnd)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Timezone: </span>
                            <span className="text-gray-900 font-medium">
                              {schedule.timezone.split("/")[1]?.replace("_", " ") || schedule.timezone}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Interval: </span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs ml-1">
                              {schedule.timeInterval}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Start: </span>
                            <span className="text-gray-900 font-medium">{schedule.startTime}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">End: </span>
                            <span className="text-gray-900 font-medium">{schedule.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain the same */}

      {/* Add Schedule Modal */}
      <AddEmployeeScheduleModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSave={handleAddSchedule}
        employees={mockEmployees.filter((e) => e.status === "Active")}
        isEmployee={isEmployee}
        currentEmployeeId={currentEmployeeId}
        currentEmployee={currentEmployee}
      />

      {/* Edit Schedule Modal */}
      {selectedSchedule && (
        <EditEmployeeScheduleModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          schedule={selectedSchedule}
          onUpdate={handleUpdateSchedule}
          employees={mockEmployees.filter((e) => e.status === "Active")}
          isEmployee={isEmployee}
          currentEmployeeId={currentEmployeeId}
          currentEmployee={currentEmployee}
        />
      )}

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        open={showDateRangePicker}
        onOpenChange={setShowDateRangePicker}
        initialRange={dateRange}
        onConfirm={handleDateRangeConfirm}
        resetToToday={false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)} className="h-10 px-6 text-sm font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="h-10 px-6 text-sm font-semibold bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeSchedule;
