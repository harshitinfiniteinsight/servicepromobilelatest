import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, X, Calendar as CalendarIcon } from "lucide-react";
import DateRangePickerModal from "./DateRangePickerModal";
import { Schedule } from "@/pages/EmployeeSchedule";
import { showErrorToast } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import TimePickerModal from "./TimePickerModal";

interface EditEmployeeScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
  onUpdate: (schedule: Schedule) => void;
  employees: Array<{ id: string; name: string }>;
  isEmployee?: boolean; // EMPLOYEE LOGIN ONLY: If true, employee field is disabled
  currentEmployeeId?: string; // Current logged-in employee ID
  currentEmployee?: { id: string; name: string } | undefined; // Current employee info
}

const weekDays = [
  { label: "S", value: "Sunday" },
  { label: "M", value: "Monday" },
  { label: "T", value: "Tuesday" },
  { label: "W", value: "Wednesday" },
  { label: "T", value: "Thursday" },
  { label: "F", value: "Friday" },
  { label: "S", value: "Saturday" },
];

const EditEmployeeScheduleModal = ({
  open,
  onOpenChange,
  schedule,
  onUpdate,
  employees,
  isEmployee = false,
  currentEmployeeId,
  currentEmployee,
}: EditEmployeeScheduleModalProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState("30");
  const [timezone, setTimezone] = useState("America/New_York");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<"start" | "end">("start");
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // Load schedule data when modal opens
  useEffect(() => {
    if (open && schedule) {
      // EMPLOYEE LOGIN: Validate that employee can only edit their own schedules
      if (isEmployee && schedule.employeeId !== currentEmployeeId) {
        showErrorToast("You can only edit your own schedules");
        onOpenChange(false);
        return;
      }

      // EMPLOYEE LOGIN: Force use logged-in employee, MERCHANT: Use schedule's employee
      if (isEmployee && currentEmployeeId && currentEmployee) {
        setSelectedEmployeeId(currentEmployeeId);
        setSelectedEmployeeName(currentEmployee.name);
      } else {
        setSelectedEmployeeId(schedule.employeeId);
        setSelectedEmployeeName(schedule.employeeName);
      }

      // Parse scheduled date
      const startDate = schedule.scheduledDate ? new Date(schedule.scheduledDate) : undefined;
      const endDate = schedule.scheduledDateEnd ? new Date(schedule.scheduledDateEnd) : undefined;
      setDateRange({
        from: startDate,
        to: endDate,
      });
      setTimezone(schedule.timezone);
      setStartTime(schedule.startTime);
      setEndTime(schedule.endTime);
      // Extract number from "30 min" format
      const intervalMatch = schedule.timeInterval.match(/\d+/);
      setTimeSlot(intervalMatch ? intervalMatch[0] : "30");
      // Initialize week days (you may need to derive this from schedule data)
      setSelectedWeekDays([]);
      setShowTimePicker(false);
      setShowDateRangePicker(false);
    }
  }, [open, schedule, isEmployee, currentEmployeeId, currentEmployee, onOpenChange]);

  // Update employee name when employee ID changes
  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      if (employee) {
        setSelectedEmployeeName(employee.name);
      }
    }
  }, [selectedEmployeeId, employees]);

  const handleTimePickerOpen = (mode: "start" | "end") => {
    setTimePickerMode(mode);
    setShowTimePicker(true);
  };

  const handleTimePickerConfirm = (time: string) => {
    if (timePickerMode === "start") {
      setStartTime(time);
    } else {
      setEndTime(time);
    }
    setShowTimePicker(false);
  };

  const formatTimeDisplay = (time: string) => {
    if (!time) return "--:-- --";
    const [h, m] = time.split(":").map(Number);
    const h12 = h % 12 || 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const toggleWeekDay = (dayValue: string) => {
    setSelectedWeekDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleDateRangeConfirm = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    setShowDateRangePicker(false);
  };

  const handleUpdate = () => {
    if (!schedule) return;

    // Validation
    if (!selectedEmployeeId || !dateRange.from || !startTime || !endTime || !timeSlot || selectedWeekDays.length === 0) {
      showErrorToast("Please fill in all required fields");
      return;
    }

    if (startTime >= endTime) {
      showErrorToast("End time must be after start time");
      return;
    }

    const updatedSchedule: Schedule = {
      ...schedule,
      employeeId: selectedEmployeeId,
      employeeName: selectedEmployeeName,
      scheduledDate: format(dateRange.from!, "yyyy-MM-dd"),
      scheduledDateEnd: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      timezone,
      startTime,
      endTime,
      timeInterval: `${timeSlot} min`,
    };

    onUpdate(updatedSchedule);
  };

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Phoenix",
    "America/Anchorage",
    "America/Honolulu",
  ];

  const timeSlotOptions = ["5", "10", "15", "20", "30", "45", "60"];

  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92%] max-h-[90vh] overflow-y-auto rounded-xl p-0 bg-white [&>button]:hidden shadow-xl">
        <DialogDescription className="sr-only">
          Edit employee schedule
        </DialogDescription>
        
        {/* Header with Orange Background */}
        <DialogHeader className="px-4 pt-4 pb-3 bg-orange-500 rounded-t-xl relative">
          <DialogTitle className="text-base font-semibold text-white text-center">
            Edit Schedule
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-orange-600 text-white absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="px-4 py-3 space-y-3 bg-white">
          {/* Select Employee */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Select Employee <span className="text-red-500">*</span>
            </Label>
            {/* EMPLOYEE LOGIN: Disabled field pre-filled with logged-in employee */}
            {isEmployee ? (
              <div className="relative">
                <Input
                  type="text"
                  value={selectedEmployeeName || ""}
                  disabled
                  readOnly
                  className="h-10 rounded-lg border-gray-300 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                />
                <input type="hidden" value={selectedEmployeeId} />
              </div>
            ) : (
              /* MERCHANT LOGIN: Editable dropdown */
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="h-10 rounded-lg border-gray-300 text-sm">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Schedule Date Range */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Schedule Date <span className="text-red-500">*</span>
            </Label>
            <Button
              variant="outline"
              onClick={() => setShowDateRangePicker(true)}
              className={cn(
                "w-full justify-start text-left font-normal h-10 rounded-lg border-gray-300 text-sm",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {dateRange.from && dateRange.to ? (
                  `${format(dateRange.from, "MM/dd/yyyy")} - ${format(dateRange.to, "MM/dd/yyyy")}`
                ) : dateRange.from ? (
                  format(dateRange.from, "MM/dd/yyyy")
                ) : (
                  "Select date range"
                )}
              </span>
            </Button>
          </div>

          {/* Week Days - All in One Row */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Select Week Days <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-1.5 justify-between">
              {weekDays.map((day, index) => {
                const isSelected = selectedWeekDays.includes(day.value);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleWeekDay(day.value)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all flex-shrink-0 active:scale-95",
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-300"
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot and Timezone on Same Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Time Slot */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Time Slot <span className="text-red-500">*</span>
              </Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="h-10 rounded-lg border-gray-300 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlotOptions.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Timezone <span className="text-red-500">*</span>
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="h-10 rounded-lg border-gray-300 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.split("/")[1]?.replace("_", " ") || tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Time and End Time on Same Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTimePickerOpen("start")}
                className="w-full h-10 rounded-lg border-gray-300 justify-start text-left font-normal hover:bg-gray-50 text-sm"
              >
                <Clock className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className={cn("flex-1 truncate", !startTime && "text-gray-400")}>
                  {startTime ? formatTimeDisplay(startTime) : "--:-- --"}
                </span>
              </Button>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                End Time <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTimePickerOpen("end")}
                className="w-full h-10 rounded-lg border-gray-300 justify-start text-left font-normal hover:bg-gray-50 text-sm"
              >
                <Clock className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className={cn("flex-1 truncate", !endTime && "text-gray-400")}>
                  {endTime ? formatTimeDisplay(endTime) : "--:-- --"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions - Orange Update Button */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
          <Button
            onClick={handleUpdate}
            className="w-full h-11 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm shadow-sm active:scale-[0.98] transition-transform"
          >
            Update
          </Button>
        </div>
      </DialogContent>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker}
        initialTime={timePickerMode === "start" ? startTime : endTime}
        onCancel={() => setShowTimePicker(false)}
        onConfirm={handleTimePickerConfirm}
        mode={timePickerMode}
      />

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        open={showDateRangePicker}
        onOpenChange={setShowDateRangePicker}
        initialRange={dateRange}
        onConfirm={handleDateRangeConfirm}
      />
    </Dialog>
  );
};

export default EditEmployeeScheduleModal;
