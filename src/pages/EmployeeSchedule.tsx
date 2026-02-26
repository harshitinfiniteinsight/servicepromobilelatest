import { useState, useMemo } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileCard from "@/components/mobile/MobileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FDF4EF" }}>
      <MobileHeader
        title="Employee Schedule"
        showBack={true}
        actions={
          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="h-8 w-8 p-0 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-4">
        {/* Filters Row: Search (MERCHANT ONLY) + Date Range */}
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex items-center gap-2">
            {/* Search Bar - MERCHANT LOGIN ONLY (removed for employees) */}
            {!isEmployee && (
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by employee name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-lg border-gray-300"
                />
              </div>
            )}
            {/* Date Range Button - Full width for EMPLOYEE, flex-shrink for MERCHANT */}
            <Button
              variant="outline"
              onClick={() => setShowDateRangePicker(true)}
              className={cn(
                "h-9 px-2.5 text-xs font-normal justify-start gap-1.5",
                isEmployee ? "w-full" : "flex-[0.48] min-w-0"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {dateRange.from && dateRange.to ? (
                <span className="truncate text-left text-xs">
                  {format(dateRange.from, "MM/dd/yyyy")} - {format(dateRange.to, "MM/dd/yyyy")}
                </span>
              ) : dateRange.from ? (
                <span className="truncate text-left text-xs">{format(dateRange.from, "MM/dd/yyyy")}</span>
              ) : (
                <span className="text-muted-foreground truncate text-left text-xs">Date Range</span>
              )}
            </Button>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="px-4 py-4 space-y-3">
          {filteredSchedules.length === 0 ? (
            <MobileCard className="p-8 text-center">
              <p className="text-gray-500">No schedules found</p>
            </MobileCard>
          ) : (
            filteredSchedules.map((schedule) => (
              <MobileCard
                key={schedule.id}
                className="p-3 rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Top Row: Employee Name (bold) and 3-dot Menu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <button
                    onClick={() => navigate(`/employees/${schedule.employeeId}`)}
                    className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors text-left flex-1 min-w-0"
                  >
                    {schedule.employeeName}
                  </button>
                  <KebabMenu items={getMenuItems(schedule)} menuWidth="w-44" />
                </div>

                {/* Content Rows */}
                <div className="space-y-2.5">
                  {/* Scheduled Date: Show full range */}
                  <div className="text-sm">
                    <span className="text-gray-600">Scheduled Date: </span>
                    <span className="text-gray-900 font-medium">
                      {formatDateRangeDisplay(schedule.scheduledDate, schedule.scheduledDateEnd)}
                    </span>
                  </div>

                  {/* Timezone & Time Interval on SAME row */}
                  <div className="flex items-center justify-between gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <span className="text-gray-600">Timezone: </span>
                      <span className="text-gray-900 font-medium truncate">
                        {schedule.timezone.split("/")[1]?.replace("_", " ") || schedule.timezone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-gray-600">Time Interval: </span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                      >
                        {schedule.timeInterval}
                      </Badge>
                    </div>
                  </div>

                  {/* Start Time & End Time on SAME row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Start Time: </span>
                      <span className="text-gray-900 font-medium">{schedule.startTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">End Time: </span>
                      <span className="text-gray-900 font-medium">{schedule.endTime}</span>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))
          )}
        </div>
      </div>

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
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
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
