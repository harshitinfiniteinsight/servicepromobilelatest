import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, User, Mail, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { mockEmployees } from "@/data/mobileMockData";

interface RescheduleJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, employeeId: string) => void;
  job: {
    id: string;
    title: string;
    customerName: string;
    technicianId: string;
    technicianName: string;
    date: string;
    time: string;
  };
}

// Generate available time slots for a given date
const generateTimeSlots = (date: Date): string[] => {
  // Mock availability - in production, this would come from employee schedule
  const dayOfWeek = date.getDay();
  
  // Weekend - fewer slots
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];
  }
  
  // Weekday - full day
  return [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];
};

// Check if a date is available (mock implementation)
const isDateAvailable = (date: Date): boolean => {
  const today = startOfDay(new Date());
  // Past dates are not available
  if (isBefore(date, today)) return false;
  
  // For demo: make some random days unavailable
  const dayOfMonth = date.getDate();
  // Days 5, 12, 19, 26 are unavailable
  if (dayOfMonth % 7 === 5) return false;
  
  return true;
};

/**
 * RescheduleJobModal - Allows users to reschedule an existing job
 * 
 * PROTOTYPE NOTES:
 * - This modal reuses the ScheduleServiceModal layout
 * - Pre-fills with current job date/time/employee
 * - Allows changing date, time, and assigned employee
 * - Updates existing job locally (no backend call)
 * 
 * TODO for production:
 * - Add real API call to update job schedule
 * - Add validation for employee availability
 * - Add conflict detection for overlapping jobs
 * - Add notification to affected parties
 */
const RescheduleJobModal = ({
  isOpen,
  onClose,
  onConfirm,
  job,
}: RescheduleJobModalProps) => {
  // Get available technicians for reassignment
  const availableTechnicians = useMemo(() => {
    return mockEmployees.filter(emp => 
      ["Senior Technician", "Technician", "Electrician", "Apprentice"].includes(emp.role)
    );
  }, []);

  // Parse job date to Date object
  const parseJobDate = (dateStr: string): Date => {
    try {
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  };

  // Initialize state with current job values
  const [currentMonth, setCurrentMonth] = useState(() => {
    const jobDate = parseJobDate(job.date);
    return startOfMonth(jobDate);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => parseJobDate(job.date));
  const [selectedTime, setSelectedTime] = useState<string | null>(job.time || null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(job.technicianId || availableTechnicians[0]?.id || "1");
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset state when job changes or modal opens
  useEffect(() => {
    if (isOpen && job) {
      const jobDate = parseJobDate(job.date);
      setCurrentMonth(startOfMonth(jobDate));
      setSelectedDate(jobDate);
      setSelectedTime(job.time || null);
      setSelectedEmployeeId(job.technicianId || availableTechnicians[0]?.id || "1");
      setIsConfirming(false);
    }
  }, [isOpen, job, availableTechnicians]);

  // Get selected employee details
  const selectedEmployee = useMemo(() => {
    return availableTechnicians.find(emp => emp.id === selectedEmployeeId) || availableTechnicians[0];
  }, [selectedEmployeeId, availableTechnicians]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add padding for the first week
    const startDayOfWeek = monthStart.getDay();
    const paddingDays = Array(startDayOfWeek).fill(null);
    
    return [...paddingDays, ...days];
  }, [currentMonth]);

  // Get time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlots(selectedDate);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateAvailable(date)) return;
    setSelectedDate(date);
    // Only reset time if the new date doesn't have the current time slot
    const slots = generateTimeSlots(date);
    if (selectedTime && !slots.includes(selectedTime)) {
      setSelectedTime(null);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = async () => {
    // Prevent duplicate submissions
    if (!selectedDate || !selectedTime || isConfirming) return;
    
    setIsConfirming(true);
    
    try {
      // Format date for the job
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // Small delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call onConfirm with the new date, time, and employee
      onConfirm(formattedDate, selectedTime, selectedEmployeeId);
    } catch (error) {
      console.error("Error rescheduling job:", error);
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setIsConfirming(false);
    onClose();
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const canConfirm = selectedDate && selectedTime;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[calc(100%-40px)] max-w-[380px] mx-auto p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col bg-white rounded-2xl shadow-xl border-0">
        <DialogTitle className="sr-only">Reschedule Job</DialogTitle>
        <DialogDescription className="sr-only">
          Select a new date, time, and employee to reschedule the job
        </DialogDescription>
        
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b bg-white sticky top-0 z-10 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Reschedule Job</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Job Info */}
          <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">Rescheduling</p>
            <p className="text-sm font-semibold text-gray-900">{job.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">Customer: {job.customerName}</p>
          </div>

          {/* Employee Selection */}
          <div className="mx-4 mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Assign Employee</label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 bg-gray-50">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <span className="text-sm">{selectedEmployee?.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableTechnicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id} className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-orange-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{tech.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{tech.role}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee Info Card */}
          {selectedEmployee && (
            <div className="mx-4 mt-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedEmployee.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{selectedEmployee.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Section */}
          <div className="px-5 py-5">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors -ml-1"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h3 className="text-base font-semibold text-gray-900">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors -mr-1"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                const isAvailable = isDateAvailable(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateSelect(day)}
                    disabled={!isAvailable}
                    className={cn(
                      "h-10 w-full rounded-full flex items-center justify-center text-sm transition-all",
                      isSelected
                        ? "bg-orange-500 text-white font-semibold"
                        : isCurrentDay
                        ? "bg-orange-100 text-orange-700 font-medium"
                        : isAvailable && isCurrentMonth
                        ? "text-gray-900 hover:bg-gray-100"
                        : !isCurrentMonth
                        ? "text-gray-300"
                        : "text-gray-300 cursor-not-allowed"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Section */}
          {selectedDate && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Available Times for {format(selectedDate, "MMM d, yyyy")}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  
                  return (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={cn(
                        "py-3 px-4 rounded-xl text-sm font-medium transition-all",
                        isSelected
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t bg-white sticky bottom-0 rounded-b-2xl">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl text-sm font-medium"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
              onClick={handleConfirm}
              disabled={!canConfirm || isConfirming}
            >
              {isConfirming ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Reschedule Job"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleJobModal;
