import { useState } from "react";
import { ChevronLeft, Info, Search, Filter, Download, FileText, Mail, FileSpreadsheet, CalendarRange, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { SendEmailModal } from "@/components/modals/SendEmailModal";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInDays, startOfToday, startOfMonth, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data for Estimate Report
const estimateData = [
  { date: "10/01/2025", orderId: "5707664952982", customerName: "gabe saz", employeeName: "Harry Potter", amount: "$13.50", status: "Open" },
  { date: "09/17/2025", orderId: "1571514281876", customerName: "vishal patel", employeeName: "bruce wayne", amount: "$12.06", status: "Paid" },
  { date: "09/17/2025", orderId: "1496912420351", customerName: "vishal patel", employeeName: "bruce wayne", amount: "$12.06", status: "Paid" },
  { date: "08/28/2025", orderId: "8741678877441", customerName: "vishal patel", employeeName: "bruce wayne", amount: "$316.66", status: "Paid" },
  { date: "08/27/2025", orderId: "3484048724010", customerName: "vishal patel", employeeName: "bruce wayne", amount: "$20.00", status: "Paid" },
  { date: "08/26/2025", orderId: "2243242736713", customerName: "vishal patel", employeeName: "bruce wayne", amount: "$24.12", status: "Open" },
  { date: "08/26/2025", orderId: "3078458785481", customerName: "vishal patel", employeeName: "bruce wayne", amount: "$24.12", status: "Open" },
  { date: "08/26/2025", orderId: "9265704801596", customerName: "vishal patel", employeeName: "bruce wayne", amount: "$240.04", status: "Open" },
  { date: "08/26/2025", orderId: "2218219726143", customerName: "vishal patel", employeeName: "bruce wayne", amount: "$14.12", status: "Open" },
];

const EstimateReport = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [days, setDays] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  
  // Initialize date range to current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: startOfMonth, to: endOfMonth };
  };
  
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(getCurrentMonthRange());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(startOfToday()));
  const [tempDateRange, setTempDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(getCurrentMonthRange());
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setDays("all");
    setEmployee("all");
    setDateRange(getCurrentMonthRange());
  };

  const handleDownloadPDF = () => {
    // Create PDF content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Estimate Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Service Pro911 - Estimate Report</h1>
          <p>Date Range: ${dateRange.from && dateRange.to 
            ? `${format(dateRange.from, "MM/dd/yyyy")} TO ${format(dateRange.to, "MM/dd/yyyy")}`
            : "08/01/2025 TO 10/27/2025"}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>OrderID</th>
                <th>Customer Name</th>
                <th>Employee Name</th>
                <th>Order Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${estimateData.map(estimate => `
                <tr>
                  <td>${estimate.date}</td>
                  <td>${estimate.orderId}</td>
                  <td>${estimate.customerName}</td>
                  <td>${estimate.employeeName}</td>
                  <td>${estimate.amount}</td>
                  <td>${estimate.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    toast.success("PDF download initiated");
  };

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Date', 'OrderID', 'Customer Name', 'Employee Name', 'Order Amount', 'Status'];
    const csvRows = [
      headers.join(','),
      ...estimateData.map(estimate => [
        estimate.date,
        estimate.orderId,
        `"${estimate.customerName}"`,
        `"${estimate.employeeName}"`,
        estimate.amount,
        estimate.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `estimate-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV file downloaded successfully");
  };

  const handleSendEmail = () => {
    setEmailModalOpen(true);
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

  const calculateDuration = () => {
    if (tempDateRange.from && tempDateRange.to) {
      const days = differenceInDays(tempDateRange.to, tempDateRange.from) + 1;
      return days;
    }
    return 0;
  };

  const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range) {
      setTempDateRange({ from: undefined, to: undefined });
      return;
    }
    setTempDateRange(range);
  };

  const handleApplyDateRange = () => {
    setDateRange(tempDateRange);
    setPopoverOpen(false);
  };

  const handleClearDateRange = () => {
    setTempDateRange({ from: undefined, to: undefined });
    setDateRange({ from: undefined, to: undefined });
  };

  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    if (open) {
      // Initialize tempDateRange with current dateRange when popover opens
      setTempDateRange(dateRange);
      // Set current month to start date if available, otherwise today
      if (dateRange.from) {
        setCurrentMonth(startOfMonth(dateRange.from));
      } else {
        setCurrentMonth(startOfMonth(startOfToday()));
      }
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/reports")}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Service Pro911 - Estimate Reports</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Info className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Date : {dateRange.from && dateRange.to 
              ? `${format(dateRange.from, "MM/dd/yyyy")} TO ${format(dateRange.to, "MM/dd/yyyy")}`
              : "08/01/2025 TO 10/27/2025"}
          </p>
          <div className="flex-1 max-w-2xl mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-4 flex-wrap">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Date Range</Label>
            <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal gap-2 h-10">
                  <CalendarRange className="h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 rounded-2xl overflow-hidden bg-white" align="start">
                <style>{`
                  .estimate-report-calendar {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    overflow-x: hidden;
                  }
                  .estimate-report-calendar .rdp {
                    margin: 0;
                    padding: 0;
                  }
                  .estimate-report-calendar .rdp-months {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                  }
                  .estimate-report-calendar .rdp-month {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                  }
                  .estimate-report-calendar .rdp-caption {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    margin-bottom: 1rem;
                    padding: 0;
                    min-height: 44px;
                  }
                  .estimate-report-calendar .rdp-caption_label {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #111827;
                    text-align: center;
                    margin: 0;
                    padding: 0;
                  }
                  .estimate-report-calendar table {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    border-collapse: collapse;
                    table-layout: fixed;
                  }
                  .estimate-report-calendar thead,
                  .estimate-report-calendar tbody {
                    display: block;
                    width: 100%;
                  }
                  .estimate-report-calendar thead tr,
                  .estimate-report-calendar tbody tr {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    width: 100%;
                    gap: 4px;
                    margin-bottom: 4px;
                    margin-top: 0;
                    padding: 0;
                  }
                  .estimate-report-calendar thead th,
                  .estimate-report-calendar tbody td {
                    display: flex;
                    width: 100%;
                    max-width: 100%;
                    justify-content: center;
                    align-items: center;
                    padding: 0;
                    margin: 0;
                  }
                  .estimate-report-calendar thead th {
                    height: 32px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #4b5563;
                  }
                  .estimate-report-calendar tbody td {
                    min-height: 44px;
                    height: 44px;
                  }
                  .estimate-report-calendar .rdp-day {
                    width: 100%;
                    max-width: 44px;
                    height: 44px;
                    margin: 0 auto;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9999px;
                    font-size: 0.875rem;
                    font-weight: 400;
                    transition: all 0.2s;
                    cursor: pointer;
                  }
                  .estimate-report-calendar .rdp-day:hover {
                    background: #fff7ed;
                    color: #9a3412;
                  }
                  .estimate-report-calendar .rdp-day_selected {
                    background: #f97316;
                    color: white;
                    font-weight: 600;
                  }
                  .estimate-report-calendar .rdp-day_range_start,
                  .estimate-report-calendar .rdp-day_range_end {
                    background: #f97316;
                    color: white;
                    font-weight: 600;
                  }
                  .estimate-report-calendar .rdp-day_range_middle {
                    background: #ffedd5;
                    color: #9a3412;
                    border-radius: 0;
                  }
                  .estimate-report-calendar .rdp-day_today {
                    background: #fff7ed;
                    color: #9a3412;
                    font-weight: 600;
                    border: 2px solid #fdba74;
                  }
                  .estimate-report-calendar .rdp-day_outside {
                    color: #9ca3af;
                    opacity: 0.5;
                  }
                  .estimate-report-calendar .rdp-day_disabled {
                    color: #d1d5db;
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                  .estimate-report-calendar .rdp-day_hidden {
                    visibility: hidden;
                  }
                `}</style>
                {/* Header */}
                <div className="px-4 pt-4 pb-3 bg-orange-500 rounded-t-2xl relative">
                  <div className="text-base font-semibold text-white text-center">Select Date Range</div>
                </div>

                {/* Date Display Section */}
                <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                  <div className="flex items-center justify-center gap-4">
                    {/* Start Date */}
                    <div className="text-center">
                      <div className="text-xs text-orange-600 font-medium mb-1 uppercase tracking-wide">
                        Start Date
                      </div>
                      {tempDateRange.from ? (
                        <div className="space-y-0.5">
                          <div className="text-lg font-bold text-orange-900">
                            {format(tempDateRange.from, "d")}
                          </div>
                          <div className="text-xs font-medium text-orange-700">
                            {format(tempDateRange.from, "MMMM yyyy")}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">Select start date</div>
                      )}
                    </div>

                    {/* Dash Separator */}
                    {tempDateRange.from && (
                      <div className="text-orange-400 text-xl font-bold">–</div>
                    )}

                    {/* End Date */}
                    <div className="text-center">
                      <div className="text-xs text-orange-600 font-medium mb-1 uppercase tracking-wide">
                        End Date
                      </div>
                      {tempDateRange.to ? (
                        <div className="space-y-0.5">
                          <div className="text-lg font-bold text-orange-900">
                            {format(tempDateRange.to, "d")}
                          </div>
                          <div className="text-xs font-medium text-orange-700">
                            {format(tempDateRange.to, "MMMM yyyy")}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">Select end date</div>
                      )}
                    </div>

                    {/* Duration */}
                    {tempDateRange.from && tempDateRange.to && (
                      <div className="ml-4 pl-4 border-l border-orange-200">
                        <div className="text-xs text-orange-600 font-medium mb-1">Duration</div>
                        <div className="text-base font-bold text-orange-900">
                          {calculateDuration()} {calculateDuration() === 1 ? "Day" : "Days"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calendar Section */}
                <div className="p-4 bg-white">
                  {/* Custom Month Navigation */}
                  <div className="flex items-center justify-center mb-4 relative min-h-[44px]">
                    <button
                      type="button"
                      onClick={handlePreviousMonth}
                      className="h-10 w-10 p-0 hover:bg-orange-100 rounded-md flex items-center justify-center touch-target active:bg-orange-200 flex-shrink-0 border border-gray-200 bg-white absolute left-0"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <div className="text-base font-semibold text-gray-900 text-center px-12">
                      {format(currentMonth, "MMMM yyyy")}
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="h-10 w-10 p-0 hover:bg-orange-100 rounded-md flex items-center justify-center touch-target active:bg-orange-200 flex-shrink-0 border border-gray-200 bg-white absolute right-0"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>

                  <div className="estimate-report-calendar">
                    <Calendar
                      mode="range"
                      selected={tempDateRange}
                      month={currentMonth}
                      onMonthChange={handleMonthChange}
                      defaultMonth={currentMonth}
                      onSelect={handleDateRangeSelect}
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
                        row: "grid grid-cols-7 w-full mb-1 gap-1",
                        cell: "h-[44px] text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-range-start)]:rounded-l-full [&:has([aria-selected].day-range-middle)]:bg-orange-100",
                        day: "h-[44px] w-full p-0 font-normal rounded-full hover:bg-orange-50 hover:text-orange-900 focus:bg-orange-50 focus:text-orange-900 transition-colors touch-target active:scale-95 flex items-center justify-center mx-auto max-w-[44px] min-w-[36px]",
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

                {/* Footer Actions */}
                <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClearDateRange}
                    className="h-10 px-6 rounded-lg border-gray-300 text-sm font-medium"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleApplyDateRange}
                    className={cn(
                      "h-10 px-6 rounded-lg text-sm font-medium",
                      tempDateRange.from && tempDateRange.to
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                    disabled={!tempDateRange.from || !tempDateRange.to}
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Days</Label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Employee</Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="bruce">bruce wayne</SelectItem>
                <SelectItem value="harry">Harry Potter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground opacity-0">Actions</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="gap-2 h-10"
              >
                Clear Filter
                <Filter className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Download as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadCSV} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Download as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSendEmail}
                className="h-10 w-10"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Estimate Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">OrderID</TableHead>
                <TableHead className="font-semibold">Customer Name</TableHead>
                <TableHead className="font-semibold">Employee Name</TableHead>
                <TableHead className="font-semibold">Order Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimateData.map((estimate, index) => (
                <TableRow key={index}>
                  <TableCell className="text-muted-foreground">{estimate.date}</TableCell>
                  <TableCell className="text-muted-foreground">{estimate.orderId}</TableCell>
                  <TableCell className="text-primary font-medium">{estimate.customerName}</TableCell>
                  <TableCell className="text-primary font-medium">{estimate.employeeName}</TableCell>
                  <TableCell className="text-primary font-semibold">{estimate.amount}</TableCell>
                  <TableCell>
                    <span className={estimate.status === "Paid" ? "text-success font-semibold" : "text-info font-semibold"}>
                      {estimate.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <SendEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        customerEmail=""
      />
    </div>
  );
};

export default EstimateReport;
