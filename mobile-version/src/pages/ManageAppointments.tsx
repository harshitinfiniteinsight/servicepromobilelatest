import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockAppointments } from "@/data/mobileMockData";
import {
  Plus,
  Calendar,
  Clock,
  User,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Share2,
  Ban,
  Circle,
  Send,
  BookmarkCheck,
  Trash2,
  UserPlus,
  Download,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import ShareAppointmentModal from "@/components/modals/ShareAppointmentModal";
import AppointmentDetailsModal from "@/components/modals/AppointmentDetailsModal";
import AddNoteModal from "@/components/modals/AddNoteModal";
import { mockEmployees } from "@/data/mobileMockData";

const ManageAppointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [focusedMonth, setFocusedMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return startOfWeek;
  });
  // Get user role and employee ID
  const userRole = localStorage.getItem("userType") || "merchant";
  const isEmployee = userRole === "employee";
  const currentEmployeeId = localStorage.getItem("currentEmployeeId") || "1";

  // For employees, always filter by their own ID; for merchants, allow selection
  const [selectedEmployee, setSelectedEmployee] = useState<string>(() => {
    return isEmployee ? currentEmployeeId : "all";
  });
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => {
    const today = new Date();
    return today.getMonth();
  });

  // Ensure employees always see only their own appointments
  useEffect(() => {
    if (isEmployee) {
      setSelectedEmployee(currentEmployeeId);
    }
  }, [isEmployee, currentEmployeeId]);

  // Generate months for selector (current month ± 6 months)
  const monthOptions = useMemo(() => {
    const today = new Date();
    const months = [];
    for (let i = -6; i <= 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        index: date.getMonth(),
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        fullName: date.toLocaleDateString('en-US', { month: 'long' }),
        year: date.getFullYear(),
        date: date,
      });
    }
    return months;
  }, []);

  // Sync selectedMonthIndex with focusedMonth when it changes via navigation
  useEffect(() => {
    const currentMonthIndex = focusedMonth.getMonth();
    const currentYear = focusedMonth.getFullYear();
    const matchingMonth = monthOptions.find(
      m => m.index === currentMonthIndex && m.year === currentYear
    );
    if (matchingMonth && selectedMonthIndex !== currentMonthIndex) {
      setSelectedMonthIndex(currentMonthIndex);
    }
  }, [focusedMonth, monthOptions]);
  
  // Get view from URL params or default to calendar
  const viewFromUrl = searchParams.get("view") as "calendar" | "list" | null;
  const [viewMode, setViewMode] = useState<"calendar" | "list">(viewFromUrl || "calendar");
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week" | "day">("week");

  // Initialize URL param if not present
  useEffect(() => {
    if (!viewFromUrl) {
      setSearchParams({ view: viewMode }, { replace: true });
    }
  }, [viewFromUrl, viewMode, setSearchParams]);

  // Sync view mode with URL params
  useEffect(() => {
    if (viewFromUrl && viewFromUrl !== viewMode) {
      setViewMode(viewFromUrl);
    }
  }, [viewFromUrl, viewMode]);

  // Update URL when view mode changes
  const handleViewModeChange = (value: "calendar" | "list") => {
    setViewMode(value);
    setSearchParams({ view: value });
    // Clear date filter when manually switching to list view
    if (value === "list") {
      setFilterListByDate(false);
    }
  };
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [singleAppointmentToShare, setSingleAppointmentToShare] = useState<typeof mockAppointments[0] | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof mockAppointments[0] | null>(null);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [selectedAppointmentForNote, setSelectedAppointmentForNote] = useState<string | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState<Record<string, Array<{ id: string; text: string; createdBy: string; createdAt: string }>>>({});
  const [filterListByDate, setFilterListByDate] = useState<boolean>(false);
  
  // Filter appointments by employee if needed
  const filteredAppointments = useMemo(() => {
    if (isEmployee) {
      return mockAppointments.filter(apt => apt.technicianId === currentEmployeeId);
    }
    if (selectedEmployee !== "all") {
      return mockAppointments.filter(apt => apt.technicianId === selectedEmployee);
    }
    return mockAppointments;
  }, [isEmployee, currentEmployeeId, selectedEmployee]);

  // Get appointments for selected date
  const dayAppointments = filteredAppointments.filter(apt => apt.date === selectedDate);
  
  const appointmentsByDate = useMemo(() => {
    return filteredAppointments.reduce<Record<string, typeof mockAppointments>>((acc, appointment) => {
      acc[appointment.date] = acc[appointment.date] ? [...acc[appointment.date], appointment] : [appointment];
      return acc;
    }, {});
  }, [filteredAppointments]);

  const activeAppointmentIds = useMemo(
    () => filteredAppointments.filter(apt => apt.status.toLowerCase() === "confirmed").map(apt => apt.id),
    [filteredAppointments]
  );

  const calendarDays = useMemo(() => {
    return generateCalendarDays(focusedMonth, todayISO);
  }, [focusedMonth, todayISO]);

  const sortedAppointments = useMemo(() => {
    const baseFiltered = viewMode === "list" && filterListByDate && selectedDate 
      ? filteredAppointments.filter(apt => apt.date === selectedDate)
      : filteredAppointments;
    
    return [...baseFiltered].sort((a, b) => {
    if (a.date === b.date) {
      return new Date(`1970-01-01T${convertTo24Hour(a.time)}`).getTime() - new Date(`1970-01-01T${convertTo24Hour(b.time)}`).getTime();
    }
    return a.date.localeCompare(b.date);
  });
  }, [filteredAppointments, viewMode, filterListByDate, selectedDate]);

  function getTimeRange(startTime: string, duration?: string) {
    if (!duration) {
      return startTime;
    }

    const startDate = parseTime(startTime);
    if (!startDate) {
      return startTime;
    }

    const minutesToAdd = parseDurationToMinutes(duration);
    if (minutesToAdd === 0) {
      return startTime;
    }

    const endDate = new Date(startDate.getTime() + minutesToAdd * 60000);
    return `${startTime} - ${formatTo12Hour(endDate)}`;
  }

  function convertTo24Hour(time: string) {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  function parseTime(time: string) {
    try {
      const normalized = convertTo24Hour(time);
      return new Date(`1970-01-01T${normalized}:00`);
    } catch (error) {
      return null;
    }
  }

  function parseDurationToMinutes(duration: string) {
    const match = duration.toLowerCase().match(/(\d+(\.\d+)?)\s*(hour|hr|hrs|minute|min|day)/);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[3];

    if (unit.startsWith("hour") || unit.startsWith("hr")) {
      return Math.round(value * 60);
    }

    if (unit.startsWith("min")) {
      return Math.round(value);
    }

    if (unit.startsWith("day")) {
      return Math.round(value * 24 * 60);
    }

    return 0;
  }

  function formatTo12Hour(date: Date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const suffix = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  }

  function handleSelectDate(dateISO: string) {
    setSelectedDate(dateISO);
    const newFocus = new Date(dateISO);
    newFocus.setDate(1);
    setFocusedMonth(newFocus);
  }

  function handleDayClick(dateISO: string) {
    setSelectedDate(dateISO);
    // Switch to day view when clicking a day in month view
    if (calendarViewMode === "month") {
      setCalendarViewMode("day");
    }
  }

  function handleMonthChange(direction: "prev" | "next") {
    const newMonth = new Date(focusedMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setFocusedMonth(newMonth);
    handleSelectDate(toISODate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1)));
  }

  function handleWeekChange(direction: "prev" | "next") {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  }

  // Generate week days (7 days starting from currentWeekStart)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + index);
      return {
        date,
        iso: toISODate(date),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayNumber: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };
    });
  }, [currentWeekStart]);

  // Generate hours (12 AM to 11 PM)
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, index) => {
      const hour = index;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      return {
        hour,
        displayHour,
        ampm,
        label: `${displayHour} ${ampm}`,
      };
    });
  }, []);

  // Get appointments for the week, filtered by employee
  const weekAppointments = useMemo(() => {
    const weekDates = weekDays.map(day => day.iso);
    return filteredAppointments.filter(apt => weekDates.includes(apt.date));
  }, [weekDays, filteredAppointments]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Appointments"
        showBack={true}
        actions={
          <Button size="sm" onClick={() => navigate(`/appointments/new?fromView=${viewMode}`)}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top) + 0.5rem)' }}>
        <Tabs value={viewMode} onValueChange={(value) => handleViewModeChange(value as "calendar" | "list")} className="flex flex-col h-full">
          <div className="px-3 pt-2 pb-1.5">
            <TabsList className="grid grid-cols-2 w-full bg-muted/40 h-9">
              <TabsTrigger value="calendar" className="text-xs">Calendar View</TabsTrigger>
              <TabsTrigger value="list" className="text-xs">List View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calendar" className="flex-1 outline-none data-[state=inactive]:hidden flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Week View Specific Header */}
              {calendarViewMode === "week" && !isEmployee && (
                <div className="px-3 pt-2 pb-1.5 space-y-1.5 border-b border-gray-200">
                  {/* Employee Filter - Hidden for employees */}
                  <div>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger className="h-8 rounded-lg border-gray-200 text-xs w-full">
                        <SelectValue placeholder="All Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {mockEmployees
                          .filter(emp => emp.status === "Active")
                          .map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Month / Week / Day Buttons - Show for all calendar views */}
              <div className="px-3 pt-2 pb-1.5">
                  <div className="flex items-center justify-center gap-2 py-1">
                    <Button
                      variant={calendarViewMode === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarViewMode("month")}
                      className={cn(
                        "rounded-full h-9 px-4 text-sm font-medium transition-colors flex-1 max-w-[100px]",
                        calendarViewMode === "month"
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      )}
                    >
                      Month
                    </Button>
                    <Button
                      variant={calendarViewMode === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarViewMode("week")}
                      className={cn(
                        "rounded-full h-9 px-4 text-sm font-medium transition-colors flex-1 max-w-[100px]",
                        calendarViewMode === "week"
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      )}
                    >
                      Week
                    </Button>
                    <Button
                      variant={calendarViewMode === "day" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarViewMode("day")}
                      className={cn(
                        "rounded-full h-9 px-4 text-sm font-medium transition-colors flex-1 max-w-[100px]",
                        calendarViewMode === "day"
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      )}
                    >
                      Day
                    </Button>
                  </div>
                </div>

              {/* Month View */}
              {calendarViewMode === "month" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Month Selector Row - Horizontally Scrollable */}
                  <div className="px-3 py-2.5 border-b border-gray-200 bg-white">
                    <div className="overflow-x-auto no-scrollbar -mx-3 px-3">
                      <div className="flex items-center gap-2 min-w-max pb-1">
                        {monthOptions.map((month) => {
                          const isSelected = month.index === focusedMonth.getMonth() && 
                                           month.year === focusedMonth.getFullYear();
                          return (
                            <button
                              key={`${month.year}-${month.index}`}
                              onClick={() => {
                                setFocusedMonth(month.date);
                                setSelectedMonthIndex(month.index);
                              }}
                              className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
                                isSelected
                                  ? "bg-orange-500 text-white shadow-sm hover:bg-orange-600"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              {month.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Bar */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-white">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full border-gray-300 hover:bg-gray-100" 
                      onClick={() => handleMonthChange("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {focusedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full border-gray-300 hover:bg-gray-100" 
                      onClick={() => handleMonthChange("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 sticky top-0 z-10">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="text-center py-2.5 text-xs font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid - Google Calendar Style */}
                  <div className="flex-1 overflow-y-auto bg-white">
                    <div className="grid grid-cols-7 border-l border-t border-gray-200">
                      {calendarDays.map(({ date, iso, isCurrentMonth, isToday }) => {
                        const isSelected = iso === selectedDate;
                        const appointments = appointmentsByDate[iso] ?? [];
                        const sortedAppointments = [...appointments].sort((a, b) => {
                          const timeA = convertTo24Hour(a.time);
                          const timeB = convertTo24Hour(b.time);
                          return timeA.localeCompare(timeB);
                        });
                        
                        // Limit visible appointments (show max 3, then "+X more")
                        const maxVisible = 3;
                        const visibleAppointments = sortedAppointments.slice(0, maxVisible);
                        const remainingCount = sortedAppointments.length - maxVisible;

                        return (
                          <div
                            key={iso}
                            onClick={() => handleDayClick(iso)}
                            className={cn(
                              "min-h-[80px] sm:min-h-[100px] border-r border-b border-gray-200 bg-white p-1.5 transition-all cursor-pointer relative flex flex-col",
                              "hover:bg-gray-50/50 active:bg-gray-100",
                              isToday && "bg-blue-50/40",
                              isSelected && "ring-2 ring-orange-500/50 ring-inset bg-orange-50/30",
                              !isCurrentMonth && "bg-gray-50/30"
                            )}
                          >
                            {/* Date Number */}
                            <span
                              className={cn(
                                "text-xs sm:text-sm font-semibold mb-1 px-1 leading-none self-start",
                                isToday && "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm",
                                isSelected && !isToday && "text-orange-600 font-bold",
                                !isCurrentMonth && "text-gray-400 font-normal"
                              )}
                            >
                              {date.getDate()}
                            </span>

                            {/* Appointment Chips - Google Calendar Style */}
                            <div className="flex flex-col gap-1 w-full flex-1 min-h-0 overflow-hidden mt-0.5">
                              {visibleAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAppointment(appointment);
                                    setDetailsModalOpen(true);
                                  }}
                                  className={cn(
                                    "text-[10px] px-2 py-1 rounded-md text-white truncate cursor-pointer",
                                    "hover:opacity-90 transition-all duration-150 w-full text-left font-medium",
                                    "shadow-sm hover:shadow",
                                    appointment.status.toLowerCase() === "confirmed" 
                                      ? "bg-blue-500 hover:bg-blue-600"
                                      : "bg-orange-500 hover:bg-orange-600"
                                  )}
                                  title={`${appointment.time} - ${appointment.service}`}
                                >
                                  <span className="truncate block">{appointment.service}</span>
                                </div>
                              ))}
                              
                              {/* "+X more" indicator */}
                              {remainingCount > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDate(iso);
                                    setCalendarViewMode("day");
                                  }}
                                  className="text-[10px] font-semibold text-gray-600 px-1 py-0.5 cursor-pointer hover:text-orange-600 transition-colors text-left w-full"
                                >
                                  +{remainingCount} more
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Week View */}
              {calendarViewMode === "week" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Combined Navigation and Date Range */}
                  <div className="px-3 py-1 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-full" 
                        onClick={() => handleWeekChange("prev")}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                      <div className="text-center flex-1 px-2">
                        <p className="text-xs font-semibold text-gray-700">
                          {weekDays[0].month}/{weekDays[0].dayNumber}/{weekDays[0].year} – {weekDays[6].month}/{weekDays[6].dayNumber}/{weekDays[6].year}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-full" 
                        onClick={() => handleWeekChange("next")}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* 7-Day Header - Sticky */}
                  <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
                    <div className="grid grid-cols-7 bg-gray-50">
                      {weekDays.map((day) => (
                        <div
                          key={day.iso}
                          className="bg-white py-1 px-0.5 text-center border-r border-gray-200 last:border-r-0"
                        >
                          <div className="text-[10px] font-semibold text-gray-600 leading-tight">{day.dayName}</div>
                          <div className="text-[10px] font-bold text-gray-900 leading-tight mt-0.5">
                            {day.month}/{day.dayNumber}/{day.year.toString().slice(-2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hourly Grid - Scrollable */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="border-l border-b border-gray-200 bg-gray-100">
                      {hours.map((hour, hourIndex) => (
                        <div key={hourIndex} className="grid grid-cols-8">
                          {/* Time Label Column */}
                          <div className={cn(
                            "px-1.5 py-1 text-[10px] font-medium text-gray-600 border-r border-gray-200 flex items-center justify-end",
                            hourIndex % 2 === 0 ? "bg-blue-50/30" : "bg-white"
                          )}>
                            {hour.label}
                          </div>
                          
                          {/* Day Columns (7 columns) */}
                          {weekDays.map((day, dayIndex) => {
                            const dayAppointments = weekAppointments.filter(apt => {
                              if (apt.date !== day.iso) return false;
                              const aptHour = parseInt(convertTo24Hour(apt.time).split(':')[0]);
                              return aptHour === hour.hour;
                            });

                            return (
                              <div
                                key={`${day.iso}-${hourIndex}`}
                                className={cn(
                                  "min-h-[40px] border-r border-b border-gray-200 relative",
                                  hourIndex % 2 === 0 ? "bg-blue-50/30" : "bg-white",
                                  dayIndex === 6 && "border-r-0"
                                )}
                              >
                                {dayAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setDetailsModalOpen(true);
                                    }}
                                    className={cn(
                                      "absolute left-0 right-0 mx-0.5 px-1 py-0.5 rounded text-[9px] font-medium cursor-pointer hover:opacity-80 transition-opacity z-10",
                                      appointment.status.toLowerCase() === "confirmed" 
                                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                                        : "bg-orange-100 text-orange-700 border border-orange-200"
                                    )}
                                    style={{
                                      top: '1px',
                                      height: 'calc(100% - 2px)',
                                    }}
                                  >
                                    <div className="truncate font-semibold leading-tight">{appointment.service}</div>
                                    <div className="truncate text-[8px] leading-tight">{appointment.time}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Day View */}
              {calendarViewMode === "day" && (
                <div className="flex-1 flex flex-col overflow-hidden relative">
                  {/* Day View Header */}
                  <div className={`px-3 pt-2 pb-1.5 space-y-1.5 border-b border-gray-200 bg-white ${isEmployee ? 'pb-1.5' : ''}`}>
                    {/* Employee Filter - Hidden for employees */}
                    {!isEmployee && (
                      <div>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                          <SelectTrigger className="h-8 rounded-lg border-gray-200 text-xs w-full">
                            <SelectValue placeholder="All Employees" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Employees</SelectItem>
                            {mockEmployees
                              .filter(emp => emp.status === "Active")
                              .map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Date Navigation Bar */}
                    <div className="flex items-center justify-between py-1.5 border-t border-gray-200 pt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-gray-300 hover:bg-gray-100" 
                        onClick={() => {
                      const prevDay = new Date(selectedDate);
                      prevDay.setDate(prevDay.getDate() - 1);
                      handleSelectDate(toISODate(prevDay));
                        }}
                      >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                      <div className="text-center flex-1">
                        <p className="text-sm font-semibold text-gray-900 uppercase">
                          {(() => {
                            const date = new Date(selectedDate);
                            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const year = date.getFullYear();
                            return `${weekday} ${month}/${day}/${year}`;
                          })()}
                      </p>
                    </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-gray-300 hover:bg-gray-100" 
                        onClick={() => {
                      const nextDay = new Date(selectedDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      handleSelectDate(toISODate(nextDay));
                        }}
                      >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
            </div>

                  {/* Timeline Grid */}
                  <div className="flex-1 overflow-y-auto relative">
                    {/* Day Navigation Arrows - Overlay */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-gray-300 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
                        onClick={() => {
                          const prevDay = new Date(selectedDate);
                          prevDay.setDate(prevDay.getDate() - 1);
                          handleSelectDate(toISODate(prevDay));
                        }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
              </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-gray-300 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
                        onClick={() => {
                          const nextDay = new Date(selectedDate);
                          nextDay.setDate(nextDay.getDate() + 1);
                          handleSelectDate(toISODate(nextDay));
                        }}
                      >
                        <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                    {/* Timeline Container */}
                    <div className="relative">
                      {/* Get appointments for selected date (already filtered by employee if needed) */}
                      {(() => {
                        const dayAppointmentsFiltered = dayAppointments;

                        // Calculate appointment positions
                        const appointmentPositions = dayAppointmentsFiltered.map(apt => {
                          const startTime = parseTime(apt.time);
                          if (!startTime) return null;
                          
                          const startHour = startTime.getHours();
                          const startMinute = startTime.getMinutes();
                          const startPosition = (startHour * 60 + startMinute) / 60; // Position in hours
                          
                          const durationMinutes = parseDurationToMinutes(apt.duration || "1 hour");
                          const heightHours = durationMinutes / 60;
                          
                          return {
                            appointment: apt,
                            top: startPosition * 60, // Convert to pixels (60px per hour)
                            height: heightHours * 60, // Convert to pixels
                            startTime24: convertTo24Hour(apt.time),
                          };
                        }).filter(Boolean) as Array<{
                          appointment: typeof dayAppointmentsFiltered[0];
                          top: number;
                          height: number;
                          startTime24: string;
                        }>;

                        return (
                          <div className="grid grid-cols-[60px_1fr] border-l border-t border-gray-200">
                            {/* Hour Labels Column */}
                            <div className="border-r border-gray-200">
                              {hours.map((hour, hourIndex) => (
                                <div
                                  key={hourIndex}
                                  className={cn(
                                    "h-[60px] border-b border-gray-200 px-2 flex items-start justify-end pt-1 text-[10px] font-medium text-gray-600",
                                    hourIndex % 2 === 0 ? "bg-blue-50/30" : "bg-white"
                                  )}
                                >
                                  {hour.label}
                                </div>
                              ))}
                            </div>

                            {/* Day Schedule Column */}
                            <div className="relative">
                              {/* Hour Rows */}
                              {hours.map((hour, hourIndex) => (
                                <div
                                  key={hourIndex}
                                  className={cn(
                                    "h-[60px] border-b border-r border-gray-200 relative",
                                    hourIndex % 2 === 0 ? "bg-blue-50/30" : "bg-white"
                                  )}
                                />
                              ))}

                              {/* Appointments Overlay */}
                              <div className="absolute inset-0 pointer-events-none">
                                {appointmentPositions.map(({ appointment, top, height, startTime24 }) => (
                                  <div
                                    key={appointment.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAppointment(appointment);
                                      setDetailsModalOpen(true);
                                    }}
                                    className={cn(
                                      "absolute left-1 right-1 mx-1 px-2 py-1 rounded-md cursor-pointer pointer-events-auto",
                                      "shadow-sm hover:shadow-md transition-all border",
                                      appointment.status.toLowerCase() === "confirmed"
                                        ? "bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200"
                                        : "bg-orange-100 text-orange-900 border-orange-200 hover:bg-orange-200"
                                    )}
                                    style={{
                                      top: `${top}px`,
                                      height: `${Math.max(height, 30)}px`,
                                      minHeight: '30px',
                                    }}
                                  >
                                    <div className="text-[10px] font-semibold truncate leading-tight">
                                      {appointment.service}
                                    </div>
                                    <div className="text-[9px] text-gray-600 mt-0.5">
                                      {startTime24}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="list" className="flex-1 outline-none data-[state=inactive]:hidden">
            <div className="px-4 py-4 space-y-5">
              {/* Date Filter Indicator */}
              {filterListByDate && selectedDate && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">
                      Showing appointments for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterListByDate(false);
                    }}
                    className="h-7 px-2 text-xs text-orange-700 hover:text-orange-900 hover:bg-orange-100"
                  >
                    Show All
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2">
                <button
                  type="button"
                  onClick={() => {
                    const allActiveSelected = activeAppointmentIds.every(id => selectedAppointments.includes(id));
                    setSelectedAppointments(allActiveSelected ? [] : activeAppointmentIds);
                  }}
                  className="flex items-center gap-2"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-md border",
                      activeAppointmentIds.every(id => selectedAppointments.includes(id))
                        ? "border-primary bg-primary text-white"
                        : "border-primary bg-white text-transparent"
                    )}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span className="text-xs font-semibold text-primary tracking-wide uppercase">Select All Active</span>
                </button>
                {selectedAppointments.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-primary/90"
                    onClick={() => setShareModalOpen(true)}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share Appointments ({selectedAppointments.length})
                  </Button>
                )}
              </div>

              {sortedAppointments.map(appointment => {
                const appointmentDate = new Date(appointment.date);
                const timeRange = getTimeRange(appointment.time, appointment.duration);
                const isActive = appointment.status.toLowerCase() === "confirmed";
                const isSelected = selectedAppointments.includes(appointment.id);
                return (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm space-y-2.5"
                  >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAppointments(prev =>
                                prev.includes(appointment.id)
                                  ? prev.filter(id => id !== appointment.id)
                                  : [...prev, appointment.id]
                              );
                            }}
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-md border transition-colors",
                              isSelected ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-transparent"
                            )}
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                          </button>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-gray-900">{appointment.service}</h3>
                              <Badge className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                              )}>
                                {isActive ? "Activated" : "Deactivated"}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p>Customer: <span className="text-gray-900 font-medium">{appointment.customerName}</span></p>
                              <p>Employee: <span className="text-gray-900 font-medium">{appointment.technicianName}</span></p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-1.5">
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-purple-700">
                                  {appointmentDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-orange-600">
                                  {timeRange}
                                </span>
                              </div>
                              {(() => {
                                const items: KebabMenuItem[] = [
                                  {
                                    label: "Edit",
                                    icon: Edit3,
                                    action: () => navigate(`/appointments/${appointment.id}/edit?fromView=${viewMode}`),
                                  },
                                  {
                                    label: "Add Note",
                                    icon: FileText,
                                    action: () => {
                                      setSelectedAppointmentForNote(appointment.id);
                                      setAddNoteModalOpen(true);
                                    },
                                  },
                                ];
                                
                                if (isActive) {
                                  items.push(
                                    {
                                      label: "Share",
                                      icon: Share2,
                                      action: () => {
                                        setSingleAppointmentToShare(appointment);
                                        setShareModalOpen(true);
                                      },
                                    },
                                    {
                                      label: "Deactivate",
                                      icon: Ban,
                                      action: () => {},
                                      variant: "destructive",
                                    }
                                  );
                                } else {
                                  items.push({
                                    label: "Activate",
                                    icon: BookmarkCheck,
                                    action: () => {},
                                  });
                                }
                                
                                return <KebabMenu items={items} menuWidth="w-44" />;
                              })()}
                            </div>
                          </div>
                        </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ShareAppointmentModal
        open={shareModalOpen}
        selectedCount={singleAppointmentToShare ? 1 : selectedAppointments.length}
        appointmentName={singleAppointmentToShare?.service}
        onClose={() => {
          setShareModalOpen(false);
          setSingleAppointmentToShare(null);
        }}
        onShare={({ via, audience }) => {
          const appointmentsToShare = singleAppointmentToShare 
            ? [singleAppointmentToShare.id] 
            : selectedAppointments;
          
          console.info("Sharing appointments", {
            appointments: appointmentsToShare,
            via,
            audience,
          });
          
          setSingleAppointmentToShare(null);
        }}
      />

      <AppointmentDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSave={(updatedAppointment) => {
          console.info("Saving appointment", updatedAppointment);
          // Handle save logic here
        }}
        onEdit={(appointmentId) => {
          navigate(`/appointments/${appointmentId}/edit?fromView=${viewMode}`);
        }}
        onCreateEstimate={() => {
          console.info("Create estimate for appointment", selectedAppointment?.id);
          navigate(`/estimates/new?appointmentId=${selectedAppointment?.id}`);
        }}
        onCreateInvoice={() => {
          console.info("Create invoice for appointment", selectedAppointment?.id);
          navigate(`/invoices/new?appointmentId=${selectedAppointment?.id}`);
        }}
        onViewCustomer={() => {
          console.info("View customer", selectedAppointment?.customerId);
          navigate(`/customers/${selectedAppointment?.customerId}`);
        }}
      />

      <AddNoteModal
        open={addNoteModalOpen}
        onClose={() => {
          setAddNoteModalOpen(false);
          setSelectedAppointmentForNote(null);
        }}
        appointmentId={selectedAppointmentForNote}
        existingNotes={selectedAppointmentForNote ? (appointmentNotes[selectedAppointmentForNote] || []) : []}
        onAddNote={(appointmentId, noteText) => {
          const now = new Date();
          const formattedDate = now.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          });
          const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          
          const newNote = {
            id: Date.now().toString(),
            text: noteText,
            createdBy: "Current User", // Replace with actual user from auth context
            createdAt: `${formattedDate} ${formattedTime}`,
          };
          
          setAppointmentNotes(prev => ({
            ...prev,
            [appointmentId]: [...(prev[appointmentId] || []), newNote],
          }));
          
          console.info("Note added to appointment", appointmentId, noteText);
        }}
      />
    </div>
  );
};

export default ManageAppointments;

function toISODate(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - offset).toISOString();
  return localISOTime.split("T")[0];
}

function generateCalendarDays(monthDate: Date, todayISO: string) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();
  const calendarStart = new Date(firstDayOfMonth);
  calendarStart.setDate(firstDayOfMonth.getDate() - startDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const iso = toISODate(date);

    return {
      date,
      iso,
      isCurrentMonth: date.getMonth() === month,
      isToday: iso === todayISO,
    };
  });
}

