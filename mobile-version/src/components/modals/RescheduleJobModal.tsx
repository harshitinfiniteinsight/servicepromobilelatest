import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, User, RefreshCw, MapPin, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { mockEmployees, mockJobs } from "@/data/mobileMockData";
import AddressAutocomplete, { AddressData } from "@/components/common/AddressAutocomplete";

interface RescheduleJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, employeeId: string, updatedAddress?: string) => void;
  job: {
    id: string;
    title: string;
    customerName: string;
    technicianId: string;
    technicianName: string;
    date: string;
    time: string;
    jobAddress: string; // Required - existing jobs must have an address
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

/**
 * Get disabled time slots for an employee on a specific date
 * Returns array of time strings that are already booked
 */
const getDisabledTimeSlots = (date: Date, employeeId: string): string[] => {
  const dateString = format(date, "yyyy-MM-dd");
  
  // Find all jobs for this employee on this date
  const employeeJobsOnDate = mockJobs.filter(job => 
    job.technicianId === employeeId && 
    job.date === dateString
  );
  
  // Extract booked time slots
  return employeeJobsOnDate.map(job => job.time);
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
  
  // Address state - for existing jobs, address is pre-filled and read-only by default
  const [showAddressEditor, setShowAddressEditor] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(job.jobAddress);
  const [addressData, setAddressData] = useState<AddressData>(() => {
    // Job address is always present for existing jobs
    return {
      streetAddress: job.jobAddress,
      zipcode: "",
      country: "United States",
      fullAddress: job.jobAddress,
    };
  });

  // Reset state when job changes or modal opens
  useEffect(() => {
    if (isOpen && job) {
      const jobDate = parseJobDate(job.date);
      setCurrentMonth(startOfMonth(jobDate));
      setSelectedDate(jobDate);
      setSelectedTime(job.time || null);
      setSelectedEmployeeId(job.technicianId || availableTechnicians[0]?.id || "1");
      setIsConfirming(false);
      // Reset address state - address is always present for existing jobs
      setShowAddressEditor(false);
      setCurrentAddress(job.jobAddress);
      setAddressData({
        streetAddress: job.jobAddress,
        zipcode: "",
        country: "United States",
        fullAddress: job.jobAddress,
      });
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

  // Get time slots for selected date and disabled slots for selected employee
  const { timeSlots, disabledSlots } = useMemo(() => {
    if (!selectedDate) return { timeSlots: [], disabledSlots: [] };
    
    const slots = generateTimeSlots(selectedDate);
    const disabledTimes = getDisabledTimeSlots(selectedDate, selectedEmployeeId);
    
    return {
      timeSlots: slots,
      disabledSlots: disabledTimes,
    };
  }, [selectedDate, selectedEmployeeId]);

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
    // Only allow selection of available time slots
    if (!disabledSlots.includes(time)) {
      setSelectedTime(time);
    }
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
      
      // Get final address (use fullAddress if available, otherwise currentAddress)
      const finalAddress = addressData.fullAddress || currentAddress || job.jobAddress;
      
      // Call onConfirm with the new date, time, employee, and address
      onConfirm(formattedDate, selectedTime, selectedEmployeeId, finalAddress);
    } catch (error) {
      console.error("Error rescheduling job:", error);
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setIsConfirming(false);
    setShowAddressEditor(false);
    setCurrentAddress(job.jobAddress);
    setAddressData({
      streetAddress: job.jobAddress,
      zipcode: "",
      country: "United States",
      fullAddress: job.jobAddress,
    });
    onClose();
  };

  // Address handlers
  const handleAddressChange = (data: AddressData) => {
    setAddressData(data);
    setCurrentAddress(data.fullAddress || data.streetAddress);
  };

  const handleAddressSave = () => {
    setShowAddressEditor(false);
  };

  const handleAddressCancel = () => {
    // Revert to original job address
    setCurrentAddress(job.jobAddress);
    setAddressData({
      streetAddress: job.jobAddress,
      zipcode: "",
      country: "United States",
      fullAddress: job.jobAddress,
    });
    setShowAddressEditor(false);
  };

  const displayAddress = addressData.fullAddress || currentAddress || job.jobAddress;
  const isAddressValid = !!(addressData.streetAddress && addressData.zipcode && addressData.country);

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
          {/* Informational Banner */}
          <div className="mx-4 mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-900">
              You can only change the date of this job from here. To change the time, click Edit Route and update the job schedule.
            </p>
          </div>

          {/* Job Info */}
          <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">Rescheduling</p>
            <p className="text-sm font-semibold text-gray-900">{job.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">Customer: {job.customerName}</p>
          </div>

          {/* Job Title - Read-only display */}
          <div className="mx-4 mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Job Title</label>
            <div className="h-12 px-3 rounded-xl border border-gray-200 bg-gray-100 flex items-center">
              <span className="text-sm text-gray-700">{job.title}</span>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="mx-4 mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Assign Employee</label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-full h-14 rounded-xl border-gray-200 bg-gray-50">
                <SelectValue>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900">{selectedEmployee?.name}</span>
                      <span className="text-xs text-gray-500">{selectedEmployee?.email}</span>
                    </div>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableTechnicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{tech.name}</span>
                        <span className="text-xs text-gray-500">{tech.email}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Address Section */}
          <div className="mx-4 mt-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Job Address</h3>
                </div>
              </div>
              {/* Edit button - always available since address is always present for existing jobs */}
              {!showAddressEditor && (
                <button
                  type="button"
                  onClick={() => setShowAddressEditor(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              )}
            </div>

            {/* Address Content */}
            {!showAddressEditor ? (
              /* Read-only Address Card - address is always present for existing jobs */
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 break-words leading-relaxed">
                      {displayAddress}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Address Editor */
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <AddressAutocomplete
                  value={addressData}
                  onChange={handleAddressChange}
                  showHeading={false}
                  required={true}
                  className="space-y-3"
                />
                
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddressCancel}
                    className="flex-1 h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddressSave}
                    disabled={showAddressEditor && !isAddressValid && !job.jobAddress}
                    className="flex-1 h-9 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    Save Address
                  </Button>
                </div>
              </div>
            )}
          </div>

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
                  const isDisabled = disabledSlots.includes(time);
                  
                  return (
                    <div key={time} className="relative group">
                      <button
                        onClick={() => handleTimeSelect(time)}
                        disabled={isDisabled}
                        className={cn(
                          "w-full py-3 px-4 rounded-xl text-sm font-medium transition-all",
                          isDisabled
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                        title={isDisabled ? "This time slot is already booked" : ""}
                      >
                        {time}
                      </button>
                      {isDisabled && (
                        <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          Already booked
                        </div>
                      )}
                    </div>
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
