import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, User, Briefcase, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { mockEmployees } from "@/data/mobileMockData";

interface ScheduleJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (jobData: {
    title: string;
    employeeId: string;
    address: string;
    date: string;
    time: string;
  }) => void;
  sourceType: "invoice" | "estimate" | "agreement";
  sourceId: string;
}

// TODO: Re-enable mock address suggestions once API is integrated

// Generate available time slots for a given date
const generateTimeSlots = (date: Date): string[] => {
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

// Check if a date is available - only block past dates
const isDateAvailable = (date: Date): boolean => {
  const today = startOfDay(new Date());
  return !isBefore(date, today);
};

/**
 * ScheduleJobModal - Create a new job from invoice/estimate/agreement
 * 
 * This modal opens when user clicks "Convert to Job" from sales documents.
 * All fields are blank - user must manually enter all information.
 */
const ScheduleJobModal = ({
  isOpen,
  onClose,
  onConfirm,
  sourceType,
}: ScheduleJobModalProps) => {
  // Get available technicians
  const availableTechnicians = useMemo(() => {
    return mockEmployees.filter(emp => 
      ["Senior Technician", "Technician", "Electrician", "Apprentice"].includes(emp.role)
    );
  }, []);

  // State - All empty/unselected by default
  const [jobTitle, setJobTitle] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // TODO: Re-enable address autocomplete validation once API is integrated
  // Address state - Manual entry mode for prototype
  const [showAddressSection, setShowAddressSection] = useState(true);
  const [streetAddress, setStreetAddress] = useState("");
  const [country, setCountry] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setJobTitle("");
      setSelectedEmployeeId("");
      setCurrentMonth(startOfMonth(new Date()));
      setSelectedDate(null);
      setSelectedTime(null);
      setIsConfirming(false);
      setShowAddressSection(true);
      setStreetAddress("");
      setCountry("");
      setZipcode("");
      setAddressConfirmed(false);
    }
  }, [isOpen]);

  // TODO: Re-enable debounced search and filtering once address API is integrated

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

  // Check if form is valid for submission
  const canConfirm = useMemo(() => {
    return !!(
      jobTitle.trim() &&
      selectedEmployeeId &&
      addressConfirmed &&
      selectedDate &&
      selectedTime
    );
  }, [jobTitle, selectedEmployeeId, addressConfirmed, selectedDate, selectedTime]);

  // TODO: Re-enable address autocomplete handlers once API is integrated
  // Address handlers - Manual entry mode for prototype
  const handleConfirmAddress = () => {
    // Simple validation: all fields must be filled
    if (streetAddress.trim() && country.trim() && zipcode.trim()) {
      setAddressConfirmed(true);
      setShowAddressSection(false);
    }
  };

  const handleCancelAddress = () => {
    setStreetAddress("");
    setCountry("");
    setZipcode("");
    setAddressConfirmed(false);
  };

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
    if (!canConfirm || isConfirming) return;
    
    setIsConfirming(true);
    
    try {
      const formattedDate = format(selectedDate!, "yyyy-MM-dd");
      // TODO: Re-format address structure once API integration is complete
      const finalAddress = `${streetAddress}, ${country} ${zipcode}`;
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onConfirm({
        title: jobTitle.trim(),
        employeeId: selectedEmployeeId,
        address: finalAddress,
        date: formattedDate,
        time: selectedTime!,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (isConfirming) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="max-w-[820px] max-h-[85vh] p-0 gap-0 rounded-2xl overflow-hidden flex flex-col"
        onInteractOutside={(e) => isConfirming && e.preventDefault()}
      >
        {/* Orange Header */}
        <div className="bg-primary px-5 md:px-6 py-4 flex items-center gap-3 shrink-0">
          <Briefcase className="h-5 w-5 text-white" />
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base md:text-lg font-semibold text-white">
              Schedule Service
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-white/90 mt-0.5">
              Create a new job from {sourceType}
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 space-y-6">
          {/* Job Title */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-900">
                Job Title <span className="text-red-500">*</span>
              </h4>
            </div>
            <Input
              placeholder="Enter job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="h-11 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {/* Assign Employee */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-900">
                Assign Employee <span className="text-red-500">*</span>
              </h4>
            </div>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="h-11 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {availableTechnicians.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{emp.name}</span>
                      <span className="text-xs text-gray-500">• {emp.role}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Address - Collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowAddressSection(!showAddressSection)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors group",
                addressConfirmed 
                  ? "border-green-300 bg-green-50" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                <MapPin className={cn(
                  "h-4 w-4",
                  addressConfirmed ? "text-green-600" : "text-gray-500"
                )} />
                <h4 className="text-sm font-semibold text-gray-900">
                  Job Address <span className="text-red-500">*</span>
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {!addressConfirmed && !showAddressSection && (
                  <span className="text-xs text-gray-500">Required to create a job</span>
                )}
                {showAddressSection ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                )}
              </div>
            </button>
            
            {showAddressSection && (
              <div className="mt-3 border rounded-xl p-4 space-y-4 bg-gray-50">
                {/* TODO: Re-enable address autocomplete once API is integrated */}
                {/* Manual Entry Mode for Prototype */}
                
                {/* Street Address - Manual Entry */}
                <div>
                  <Label htmlFor="street-address" className="text-sm font-medium">
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="street-address"
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Enter street address"
                    className="mt-2 h-11 bg-white"
                  />
                </div>

                {/* Country - Manual Entry */}
                <div>
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter country"
                    className="mt-2 h-11 bg-white"
                  />
                </div>

                {/* Zipcode - Manual Entry */}
                <div>
                  <Label htmlFor="zipcode" className="text-sm font-medium">
                    Zipcode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zipcode"
                    type="text"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    placeholder="Enter zipcode"
                    className="mt-2 h-11 bg-white"
                  />
                </div>

                {/* Address Confirmation Buttons */}
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-4 rounded-xl"
                    onClick={handleCancelAddress}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleConfirmAddress}
                    disabled={!streetAddress.trim() || !country.trim() || !zipcode.trim()}
                  >
                    Confirm Address
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Date */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-900">
                Schedule Date <span className="text-red-500">*</span>
              </h4>
            </div>
            
            {/* Calendar */}
            <div className="border rounded-xl p-4 bg-white">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h3 className="text-base font-semibold text-gray-900">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
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

                  return (
                    <button
                      key={day.toString()}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      disabled={!isAvailable}
                      className={cn(
                        "aspect-square rounded-lg text-sm font-medium transition-all",
                        "hover:bg-gray-100 disabled:hover:bg-transparent",
                        isSelected && "bg-orange-500 text-white hover:bg-orange-600",
                        !isSelected && isTodayDate && "bg-orange-50 text-orange-600",
                        !isSelected && !isTodayDate && isAvailable && "text-gray-900",
                        !isAvailable && "text-gray-300 cursor-not-allowed"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scheduled Time */}
          {selectedDate && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Scheduled Time <span className="text-red-500">*</span>
                </h4>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Select a time slot for {format(selectedDate, "MMMM d, yyyy")}
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSelect(time)}
                      className={cn(
                        "h-14 rounded-xl text-sm font-medium transition-all",
                        "hover:border-orange-300",
                        isSelected
                          ? "bg-orange-500 text-white border-2 border-orange-500"
                          : "bg-white text-gray-900 border-2 border-gray-200"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!selectedDate && (
            <div className="border rounded-xl p-4 bg-gray-50">
              <p className="text-sm text-gray-500 text-center">
                Select a date to view available time slots
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 md:px-6 py-4 border-t bg-white sticky bottom-0 rounded-b-2xl shrink-0">
          <div className="flex gap-3 md:justify-end">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl text-sm font-medium md:flex-none md:h-10 md:px-6"
              onClick={handleClose}
              disabled={isConfirming}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium md:flex-none md:h-10 md:px-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
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

export default ScheduleJobModal;
