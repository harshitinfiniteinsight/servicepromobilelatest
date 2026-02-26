import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { format, differenceInDays, startOfToday, startOfMonth, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRange?: { from: Date | undefined; to: Date | undefined };
  onConfirm: (range: { from: Date | undefined; to: Date | undefined }) => void;
  resetToToday?: boolean; // When true, always reset to today when opened (for Jobs dashboard)
}

const DateRangePickerModal = ({
  open,
  onOpenChange,
  initialRange,
  onConfirm,
  resetToToday = false,
}: DateRangePickerModalProps) => {
  const today = startOfToday();
  const [selectedRange, setSelectedRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(today));

  // Initialize when modal opens
  useEffect(() => {
    if (open) {
      if (resetToToday) {
        // Always reset to today when opened from Jobs dashboard
        setSelectedRange({ from: today, to: undefined });
        setCurrentMonth(startOfMonth(today));
      } else if (initialRange && initialRange.from) {
        // Use provided initial range
        setSelectedRange(initialRange);
        // Set current month to start date if available
        if (initialRange.from) {
          setCurrentMonth(startOfMonth(initialRange.from));
        }
      } else {
        // Auto-select today's date as start date when modal opens
        setSelectedRange({ from: today, to: undefined });
        setCurrentMonth(startOfMonth(today));
      }
    }
  }, [open, initialRange, today, resetToToday]);

  const handleConfirm = () => {
    if (selectedRange.from && selectedRange.to) {
      onConfirm(selectedRange);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleClear = () => {
    // Reset dates but keep the current month displayed
    setSelectedRange({ from: undefined, to: undefined });
    // Don't change currentMonth - keep it as is
  };

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => startOfMonth(subMonths(prev, 1)));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => startOfMonth(addMonths(prev, 1)));
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(startOfMonth(date));
  };

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range) {
      setSelectedRange({ from: undefined, to: undefined });
      return;
    }

    // react-day-picker handles range selection logic:
    // - First click sets start date
    // - Second click sets end date (if later) or resets to new start (if earlier)
    // We just need to update our state with the range
    setSelectedRange(range);
  };

  const calculateDuration = () => {
    if (selectedRange.from && selectedRange.to) {
      const days = differenceInDays(selectedRange.to, selectedRange.from) + 1;
      return days;
    }
    return 0;
  };

  const isApplyButtonEnabled = selectedRange.from && selectedRange.to;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] sm:max-w-md w-full max-h-[85vh] p-0 gap-0 rounded-2xl overflow-hidden bg-white [&>button]:hidden flex flex-col mx-auto">
        <DialogDescription className="sr-only">
          Select date range for schedule
        </DialogDescription>

        {/* Header - Fixed */}
        <DialogHeader className="px-3 pt-3 pb-2 bg-orange-500 rounded-t-2xl relative flex-shrink-0">
          <DialogTitle className="text-sm font-semibold text-white text-center">
            Select Date Range
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-orange-600 text-white absolute right-3 top-3 z-10"
            onClick={handleCancel}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </DialogHeader>

        {/* Content Area - Scrollable */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
          {/* Date Display Section - Fixed */}
          <div className="px-3 py-2 bg-orange-50 border-b border-orange-100 flex-shrink-0">
            <div className="flex items-center justify-center gap-2.5">
              {/* Start Date */}
              <div className="text-center">
                <div className="text-[10px] text-orange-600 font-medium mb-0.5 uppercase tracking-wide">
                  Start Date
                </div>
                {selectedRange.from ? (
                  <div className="space-y-0">
                    <div className="text-base font-bold text-orange-900">
                      {format(selectedRange.from, "d")}
                    </div>
                    <div className="text-[10px] font-medium text-orange-700">
                      {format(selectedRange.from, "MMM yyyy")}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-[10px]">Select start date</div>
                )}
              </div>

              {/* Dash Separator */}
              {selectedRange.from && (
                <div className="text-orange-400 text-lg font-bold">–</div>
              )}

              {/* End Date */}
              <div className="text-center">
                <div className="text-[10px] text-orange-600 font-medium mb-0.5 uppercase tracking-wide">
                  End Date
                </div>
                {selectedRange.to ? (
                  <div className="space-y-0">
                    <div className="text-base font-bold text-orange-900">
                      {format(selectedRange.to, "d")}
                    </div>
                    <div className="text-[10px] font-medium text-orange-700">
                      {format(selectedRange.to, "MMM yyyy")}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-[10px]">Select end date</div>
                )}
              </div>

              {/* Duration */}
              {selectedRange.from && selectedRange.to && (
                <div className="ml-2 pl-2 border-l border-orange-200">
                  <div className="text-[10px] text-orange-600 font-medium mb-0.5">Duration</div>
                  <div className="text-sm font-bold text-orange-900">
                    {calculateDuration()} {calculateDuration() === 1 ? "Day" : "Days"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Section - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3 bg-white">
            <style>{`
              .date-range-calendar {
                width: 100%;
                max-width: 100%;
                margin: 0 auto;
                overflow-x: hidden;
              }
              .date-range-calendar .rdp {
                margin: 0;
                padding: 0;
              }
              .date-range-calendar .rdp-months {
                display: flex;
                flex-direction: column;
                width: 100%;
              }
              .date-range-calendar .rdp-month {
                width: 100%;
                margin: 0;
                padding: 0;
              }
              .date-range-calendar .rdp-caption {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                margin-bottom: 1rem;
                padding: 0;
                min-height: 44px;
              }
              .date-range-calendar .rdp-caption_label {
                font-size: 1rem;
                font-weight: 600;
                color: #111827;
                text-align: center;
                margin: 0;
                padding: 0;
              }
              .date-range-calendar .rdp-nav {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                pointer-events: none;
                padding: 0 0.5rem;
              }
              .date-range-calendar .rdp-button_previous,
              .date-range-calendar .rdp-button_next {
                pointer-events: auto;
                height: 40px;
                width: 40px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #e5e7eb;
                background: white;
                border-radius: 0.375rem;
                cursor: pointer;
                transition: all 0.2s;
              }
              .date-range-calendar .rdp-button_previous:hover,
              .date-range-calendar .rdp-button_next:hover {
                background: #fff7ed;
              }
              .date-range-calendar .rdp-button_previous:active,
              .date-range-calendar .rdp-button_next:active {
                background: #ffedd5;
              }
              .date-range-calendar table {
                width: 100%;
                max-width: 100%;
                margin: 0 auto;
                border-collapse: collapse;
                table-layout: fixed;
              }
              .date-range-calendar thead,
              .date-range-calendar tbody {
                display: block;
                width: 100%;
              }
              .date-range-calendar thead tr,
              .date-range-calendar tbody tr {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                width: 100%;
                gap: 4px;
                margin-bottom: 4px;
                margin-top: 0;
                padding: 0;
              }
              .date-range-calendar thead th,
              .date-range-calendar tbody td {
                display: flex;
                width: 100%;
                max-width: 100%;
                justify-content: center;
                align-items: center;
                padding: 0;
                margin: 0;
              }
              .date-range-calendar thead th {
                height: 32px;
                font-size: 0.75rem;
                font-weight: 500;
                color: #4b5563;
              }
              .date-range-calendar tbody td {
                min-height: 40px;
                height: 40px;
              }
              .date-range-calendar .rdp-day {
                width: 100%;
                max-width: 40px;
                height: 40px;
                margin: 0 auto;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 9999px;
                font-size: 0.8125rem;
                font-weight: 400;
                transition: all 0.2s;
                cursor: pointer;
              }
              .date-range-calendar .rdp-day:hover {
                background: #fff7ed;
                color: #9a3412;
              }
              .date-range-calendar .rdp-day_selected {
                background: #f97316;
                color: white;
                font-weight: 600;
              }
              .date-range-calendar .rdp-day_range_start,
              .date-range-calendar .rdp-day_range_end {
                background: #f97316;
                color: white;
                font-weight: 600;
              }
              .date-range-calendar .rdp-day_range_middle {
                background: #ffedd5;
                color: #9a3412;
                border-radius: 0;
              }
              .date-range-calendar .rdp-day_today {
                background: #fff7ed;
                color: #9a3412;
                font-weight: 600;
                border: 2px solid #fdba74;
              }
              .date-range-calendar .rdp-day_outside {
                color: #9ca3af;
                opacity: 0.5;
              }
              .date-range-calendar .rdp-day_disabled {
                color: #d1d5db;
                opacity: 0.5;
                cursor: not-allowed;
              }
              .date-range-calendar .rdp-day_hidden {
                visibility: hidden;
              }
            `}</style>
            <div className="date-range-calendar">
              {/* Custom Month Navigation */}
              <div className="flex items-center justify-center mb-3 relative min-h-[40px]">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="h-9 w-9 p-0 hover:bg-orange-100 rounded-md flex items-center justify-center touch-target active:bg-orange-200 flex-shrink-0 border border-gray-200 bg-white absolute left-0"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700" />
                </button>
                <div className="text-sm font-semibold text-gray-900 text-center px-10">
                  {format(currentMonth, "MMMM yyyy")}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="h-9 w-9 p-0 hover:bg-orange-100 rounded-md flex items-center justify-center touch-target active:bg-orange-200 flex-shrink-0 border border-gray-200 bg-white absolute right-0"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                </button>
              </div>

              <Calendar
                mode="range"
                selected={selectedRange}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                defaultMonth={currentMonth}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                className="w-full"
                showOutsideDays={false}
                classNames={{
                  months: "flex flex-col w-full",
                  month: "space-y-0 w-full",
                  caption: "hidden",
                  caption_label: "hidden",
                  nav: "hidden",
                  nav_button: "hidden",
                  nav_button_previous: "hidden",
                  nav_button_next: "hidden",
                  table: "w-full border-collapse mx-auto",
                  head_row: "grid grid-cols-7 mb-2 w-full gap-1",
                  head_cell: "text-gray-600 font-medium text-xs flex items-center justify-center py-2 text-center",
                  row: "grid grid-cols-7 w-full mb-1 gap-0.5",
                  cell: "h-[40px] text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-range-start)]:rounded-l-full [&:has([aria-selected].day-range-middle)]:bg-orange-100",
                  day: "h-[40px] w-full p-0 font-normal rounded-full hover:bg-orange-50 hover:text-orange-900 focus:bg-orange-50 focus:text-orange-900 transition-colors touch-target active:scale-95 flex items-center justify-center mx-auto max-w-[40px] min-w-[32px]",
                  day_range_start: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white rounded-full font-semibold",
                  day_range_end: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white rounded-full font-semibold",
                  day_selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white rounded-full font-semibold",
                  day_range_middle: "bg-orange-100 text-orange-900 hover:bg-orange-200 rounded-none aria-selected:bg-orange-100",
                  day_today: "bg-orange-50 text-orange-900 font-semibold border-2 border-orange-300",
                  day_outside: "text-gray-400 opacity-50",
                  day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
                  day_hidden: "invisible",
                }}
                components={{
                  IconLeft: () => null,
                  IconRight: () => null,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="px-3 py-2.5 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClear}
            className="h-9 px-4 rounded-lg border-gray-300 text-xs font-medium flex-1 max-w-[45%]"
          >
            Clear
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isApplyButtonEnabled}
            className={cn(
              "h-9 px-4 rounded-lg text-xs font-medium flex-1 max-w-[45%]",
              isApplyButtonEnabled
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateRangePickerModal;
