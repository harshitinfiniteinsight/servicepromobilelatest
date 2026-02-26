import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, Clock, User, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import AddressAutocomplete, { AddressData } from "@/components/common/AddressAutocomplete";
import { mockEmployees } from "@/data/mobileMockData";

interface ScheduleServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, employeeId: string, updatedAddress?: string, jobTitle?: string) => void;
  employee: {
    id: string;
    name: string;
    email: string;
  };
  sourceType: "invoice" | "estimate" | "agreement";
  sourceId: string;
  jobAddress?: string;
  defaultJobTitle?: string;
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

const ScheduleServiceModal = ({
  isOpen,
  onClose,
  onConfirm,
  employee,
  jobAddress,
  defaultJobTitle,
  // sourceType and sourceId are passed for potential future use (e.g., display in modal)
}: ScheduleServiceModalProps) => {
  // Get available technicians for employee selection
  const availableTechnicians = useMemo(() => {
    return mockEmployees.filter(emp => 
      ["Senior Technician", "Technician", "Electrician", "Apprentice"].includes(emp.role)
    );
  }, []);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employee.id);
  // Job Title state - required field
  const [jobTitle, setJobTitle] = useState(defaultJobTitle || "Service Job");
  // Accordion state for Job Address - collapsed by default
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(jobAddress || "");
  const [addressData, setAddressData] = useState<AddressData>(() => {
    // Parse initial address into AddressData format
    if (jobAddress) {
      return {
        streetAddress: jobAddress,
        zipcode: "",
        country: "United States",
        fullAddress: jobAddress,
      };
    }
    return {
      streetAddress: "",
      zipcode: "",
      country: "",
      fullAddress: "",
    };
  });

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
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = async () => {
    // Prevent duplicate submissions - also require jobTitle
    if (!selectedDate || !selectedTime || !jobTitle.trim() || isConfirming) return;
    
    setIsConfirming(true);
    
    try {
      // Format date for the job
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // Small delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call onConfirm - this will handle job creation and navigation
      // Pass the updated address (use fullAddress if available, otherwise currentAddress)
      const finalAddress = addressData.fullAddress || currentAddress;
      onConfirm(formattedDate, selectedTime, selectedEmployeeId, finalAddress, jobTitle.trim());
    } catch (error) {
      console.error("Error creating job:", error);
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentMonth(new Date());
    setIsConfirming(false);
    setSelectedEmployeeId(employee.id);
    // Reset job title to default
    setJobTitle(defaultJobTitle || "Service Job");
    // Reset accordion to collapsed
    setIsAddressExpanded(false);
    setCurrentAddress(jobAddress || "");
    setAddressData({
      streetAddress: jobAddress || "",
      zipcode: "",
      country: jobAddress ? "United States" : "",
      fullAddress: jobAddress || "",
    });
    onClose();
  };

  const handleAddressChange = (data: AddressData) => {
    setAddressData(data);
    setCurrentAddress(data.fullAddress || data.streetAddress);
  };

  const handleAddressSave = () => {
    // Auto-collapse accordion after saving valid address
    if (isAddressValid) {
      setIsAddressExpanded(false);
    }
  };

  const handleAddressCancel = () => {
    // Revert to original address and collapse
    setCurrentAddress(jobAddress || "");
    setAddressData({
      streetAddress: jobAddress || "",
      zipcode: "",
      country: jobAddress ? "United States" : "",
      fullAddress: jobAddress || "",
    });
    setIsAddressExpanded(false);
  };

  const displayAddress = addressData.fullAddress || currentAddress || jobAddress;

  // Check if address is valid (has street address and either was selected or has zipcode)
  const isAddressValid = !!(addressData.streetAddress && addressData.zipcode && addressData.country);
  
  // For existing addresses passed as prop, consider them valid
  const hasValidAddress = isAddressValid || !!jobAddress;

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Job cannot be created without a valid address, date, time, and job title
  const canConfirm = selectedDate && selectedTime && hasValidAddress && jobTitle.trim();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[calc(100%-40px)] max-w-[380px] mx-auto p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col bg-white rounded-2xl shadow-xl border-0">
        <DialogTitle className="sr-only">Schedule Service</DialogTitle>
        <DialogDescription className="sr-only">
          Select a date and time to schedule the service appointment
        </DialogDescription>
        
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b bg-white sticky top-0 z-10 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Schedule Service</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Job Title - Required field at the top */}
          <div className="mx-4 mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Enter job title"
              className="h-12 rounded-xl border-gray-200 bg-gray-50 text-sm"
            />
            {!jobTitle.trim() && (
              <p className="text-xs text-red-500 mt-1">Job title is required</p>
            )}
          </div>

          {/* Employee Selection - Matches RescheduleJobModal */}
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

          {/* Job Address Accordion */}
          <div className="mx-4 mt-4">
            {/* Accordion Header - Clickable */}
            <button
              type="button"
              onClick={() => setIsAddressExpanded(!isAddressExpanded)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all",
                !hasValidAddress
                  ? "bg-orange-50 border-orange-300"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                    !hasValidAddress ? "bg-orange-100" : "bg-blue-100"
                  )}>
                    <MapPin className={cn(
                      "h-5 w-5",
                      !hasValidAddress ? "text-orange-600" : "text-blue-600"
                    )} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-gray-900">Job Address</h3>
                      <span className="text-red-500 text-xs">*</span>
                    </div>
                    {hasValidAddress ? (
                      <p className="text-xs text-gray-600 truncate max-w-[180px]">
                        {displayAddress}
                      </p>
                    ) : (
                      <p className="text-xs text-orange-600 font-medium">Required to create a job</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasValidAddress && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  <ChevronDown className={cn(
                    "h-5 w-5 text-gray-400 transition-transform",
                    isAddressExpanded && "rotate-180"
                  )} />
                </div>
              </div>
            </button>

            {/* Accordion Content - Expandable */}
            {isAddressExpanded && (
              <div className="mt-2 p-4 bg-white border-2 border-gray-200 rounded-xl">
                <AddressAutocomplete
                  value={addressData}
                  onChange={handleAddressChange}
                  showHeading={false}
                  required={true}
                  className="space-y-3"
                />
                
                {/* Action buttons */}
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
                    disabled={!isAddressValid}
                    className="flex-1 h-9 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {hasValidAddress ? "Update Address" : "Confirm Address"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Calendar Section - with visual de-emphasis when address is missing */}
          <div className={cn(
            "px-5 py-5 transition-opacity",
            !hasValidAddress && "opacity-60"
          )}>
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Schedule Date & Time</h3>
                {!hasValidAddress && (
                  <p className="text-xs text-gray-400">Complete address first</p>
                )}
              </div>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors -ml-1"
                disabled={isSameMonth(currentMonth, new Date())}
              >
                <ChevronLeft className={cn(
                  "h-5 w-5",
                  isSameMonth(currentMonth, new Date()) ? "text-gray-300" : "text-gray-600"
                )} />
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
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const isAvailable = isDateAvailable(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateSelect(day)}
                    disabled={!isAvailable}
                    className={cn(
                      "aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      !isCurrentMonth && "text-gray-300",
                      isCurrentMonth && isAvailable && !isSelected && "text-gray-900 hover:bg-orange-50",
                      isCurrentMonth && !isAvailable && "text-gray-300 cursor-not-allowed",
                      isSelected && "bg-orange-500 text-white hover:bg-orange-600",
                      isTodayDate && !isSelected && isAvailable && "ring-1 ring-orange-500",
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
            <div className="mx-4 mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Available Times for {format(selectedDate, "MMM d, yyyy")}
                </h3>
              </div>
              
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={cn(
                        "py-3 px-3 rounded-xl text-sm font-medium transition-all border",
                        selectedTime === time
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No available time slots for this date.
                </div>
              )}
            </div>
          )}

          {/* Selection Summary */}
          {selectedDate && selectedTime && (
            <div className="mx-4 mb-4 p-3.5 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t bg-white sticky bottom-0 rounded-b-2xl">
          {/* Validation message when CTA is disabled */}
          {(!hasValidAddress || !selectedDate || !selectedTime) && (
            <div className="mb-3 p-2.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                {!hasValidAddress 
                  ? "Enter a valid job address to continue"
                  : !selectedDate
                    ? "Select a date to continue"
                    : "Select a time slot to continue"
                }
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl text-sm font-medium"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className={cn(
                "flex-1 h-12 rounded-xl text-sm font-medium transition-all",
                canConfirm && !isConfirming
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
              onClick={handleConfirm}
              disabled={!canConfirm || isConfirming}
            >
              {isConfirming ? "Creating..." : "Confirm & Create Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleServiceModal;
