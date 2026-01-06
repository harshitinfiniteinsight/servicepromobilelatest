import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, User, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from "date-fns";

interface ScheduleServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  employee: {
    id: string;
    name: string;
    email: string;
  };
  sourceType: "invoice" | "estimate" | "agreement";
  sourceId: string;
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
  // sourceType and sourceId are passed for potential future use (e.g., display in modal)
}: ScheduleServiceModalProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

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
    if (!selectedDate || !selectedTime) return;
    
    setIsConfirming(true);
    
    // Format date for the job
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onConfirm(formattedDate, selectedTime);
    setIsConfirming(false);
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentMonth(new Date());
    onClose();
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const canConfirm = selectedDate && selectedTime;

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
          {/* Employee Info */}
          <div className="mx-4 mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{employee.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="px-5 py-5">
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
              {isConfirming ? "Creating..." : "Confirm & Create Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleServiceModal;
