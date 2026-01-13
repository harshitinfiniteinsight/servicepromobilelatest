import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Mail, MessageSquare, DollarSign, Banknote, MapPin, UserCog, FileText, XCircle, MoreVertical, RotateCcw, Edit, History, CalendarRange, RefreshCw, X, ChevronLeft, ChevronRight } from "lucide-react";
import { mockEstimates, mockEmployees } from "@/data/mockData";
import { SendEmailModal } from "@/components/modals/SendEmailModal";
import { SendSMSModal } from "@/components/modals/SendSMSModal";
import { ShareAddressModal } from "@/components/modals/ShareAddressModal";
import { PayCashModal } from "@/components/modals/PayCashModal";
import { InvoicePaymentModal } from "@/components/modals/InvoicePaymentModal";
import { PreviewEstimateModal } from "@/components/modals/PreviewEstimateModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, startOfToday, startOfMonth, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

const Estimates = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(startOfToday()));
  const [tempDateRange, setTempDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Apply date range from navigation state
  useEffect(() => {
    if (location.state?.dateRange) {
      setDateRange(location.state.dateRange);
      // Clear the state to prevent re-applying on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [shareAddressModalOpen, setShareAddressModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [payCashModalOpen, setPayCashModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedEstimateForPayment, setSelectedEstimateForPayment] = useState<any>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedEstimateForPreview, setSelectedEstimateForPreview] = useState<any>(null);
  const { toast } = useToast();

  const filteredEstimates = mockEstimates.filter((estimate) => {
    const matchesActive = activeTab === "active" 
      ? estimate.isActive 
      : !estimate.isActive;
    
    const matchesSearch = 
      estimate.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Don't apply status filter for deactivated tab
    const matchesStatus = activeTab === "deactivated" 
      ? true
      : (statusFilter === "all" || 
         (statusFilter === "paid" && estimate.status === "Paid") ||
         (statusFilter === "open" && estimate.status === "Open"));
    
    const estimateDate = new Date(estimate.createdDate);
    const matchesDateRange = 
      (!dateRange.from || estimateDate >= dateRange.from) &&
      (!dateRange.to || estimateDate <= dateRange.to);
    
    return matchesActive && matchesSearch && matchesStatus && matchesDateRange;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-success/10 text-success border-success/20";
      case "Open":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSendEmail = (estimate: any) => {
    setSelectedEstimate(estimate);
    setEmailModalOpen(true);
  };

  const handleSendSMS = (estimate: any) => {
    setSelectedEstimate(estimate);
    setSmsModalOpen(true);
  };

  const handleReassign = (estimate: any) => {
    setSelectedEstimate(estimate);
    setReassignModalOpen(true);
  };

  const handleReassignSubmit = () => {
    toast({
      title: "Employee Reassigned",
      description: `Estimate ${selectedEstimate?.id} has been reassigned.`,
    });
    setReassignModalOpen(false);
    setSelectedEmployee("");
  };

  const handlePayEstimate = (estimate: any) => {
    setSelectedEstimateForPayment(estimate);
    setPaymentModalOpen(true);
  };

  const handlePayCash = (estimate: any) => {
    setSelectedEstimate(estimate);
    setPayCashModalOpen(true);
  };

  const handleShareAddress = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShareAddressModalOpen(true);
  };

  const handlePreview = (estimate: any) => {
    setSelectedEstimateForPreview(estimate);
    setPreviewModalOpen(true);
  };

  const handleEditEstimate = (estimate: any) => {
    navigate(`/estimates/${estimate.id}/edit`);
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

  const handleDeactivate = (estimate: any) => {
    if (estimate.status !== "Open") {
      toast({
        title: "Cannot Deactivate",
        description: "Only open estimates can be deactivated.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Estimate Deactivated",
      description: `${estimate.id} has been deactivated.`,
    });
  };

  const handleActivate = (estimate: any) => {
    toast({
      title: "Estimate Activated",
      description: `${estimate.id} has been reactivated.`,
    });
  };

  const handleRefund = (estimate: any) => {
    toast({
      title: "Refund Processing",
      description: `Processing refund for ${estimate.id}`,
    });
  };

  const handleDocHistory = (estimate: any) => {
    // Navigate to customer details page
    navigate(`/customers/${estimate.customerId || '1'}`);
  };

  return (
    <div className="flex-1">
      <AppHeader searchPlaceholder="Search estimates..." onSearchChange={setSearchQuery} />

      <main className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Estimates</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage service estimates and proposals</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {activeTab !== "deactivated" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] touch-target">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 touch-target w-full sm:w-auto">
                  <CalendarRange className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Date Range"
                    )}
                  </span>
                  <span className="sm:hidden">
                    {dateRange.from ? format(dateRange.from, "MMM dd") : "Date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 rounded-2xl overflow-hidden bg-white" align="start">
                <style>{`
                  .estimates-calendar {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    overflow-x: hidden;
                  }
                  .estimates-calendar .rdp {
                    margin: 0;
                    padding: 0;
                  }
                  .estimates-calendar .rdp-months {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                  }
                  .estimates-calendar .rdp-month {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                  }
                  .estimates-calendar .rdp-caption {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    margin-bottom: 1rem;
                    padding: 0;
                    min-height: 44px;
                  }
                  .estimates-calendar .rdp-caption_label {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #111827;
                    text-align: center;
                    margin: 0;
                    padding: 0;
                  }
                  .estimates-calendar table {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    border-collapse: collapse;
                    table-layout: fixed;
                  }
                  .estimates-calendar thead,
                  .estimates-calendar tbody {
                    display: block;
                    width: 100%;
                  }
                  .estimates-calendar thead tr,
                  .estimates-calendar tbody tr {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    width: 100%;
                    gap: 4px;
                    margin-bottom: 4px;
                    margin-top: 0;
                    padding: 0;
                  }
                  .estimates-calendar thead th,
                  .estimates-calendar tbody td {
                    display: flex;
                    width: 100%;
                    max-width: 100%;
                    justify-content: center;
                    align-items: center;
                    padding: 0;
                    margin: 0;
                  }
                  .estimates-calendar thead th {
                    height: 32px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #4b5563;
                  }
                  .estimates-calendar tbody td {
                    min-height: 44px;
                    height: 44px;
                  }
                  .estimates-calendar .rdp-day {
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
                  .estimates-calendar .rdp-day:hover {
                    background: #fff7ed;
                    color: #9a3412;
                  }
                  .estimates-calendar .rdp-day_selected {
                    background: #f97316;
                    color: white;
                    font-weight: 600;
                  }
                  .estimates-calendar .rdp-day_range_start,
                  .estimates-calendar .rdp-day_range_end {
                    background: #f97316;
                    color: white;
                    font-weight: 600;
                  }
                  .estimates-calendar .rdp-day_range_middle {
                    background: #ffedd5;
                    color: #9a3412;
                    border-radius: 0;
                  }
                  .estimates-calendar .rdp-day_today {
                    background: #fff7ed;
                    color: #9a3412;
                    font-weight: 600;
                    border: 2px solid #fdba74;
                  }
                  .estimates-calendar .rdp-day_outside {
                    color: #9ca3af;
                    opacity: 0.5;
                  }
                  .estimates-calendar .rdp-day_disabled {
                    color: #d1d5db;
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                  .estimates-calendar .rdp-day_hidden {
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

                  <div className="estimates-calendar">
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
            <Button onClick={() => navigate("/estimates/new")} className="gap-2 touch-target w-full sm:w-auto">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              New Estimate
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockEstimates.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {mockEstimates.filter((estimate) => estimate.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {mockEstimates.filter((estimate) => estimate.status === "Open").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="deactivated">Deactivated</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {filteredEstimates.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No active estimates found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredEstimates.map((estimate) => (
                  <Card key={estimate.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Created Date</p>
                          <p className="font-medium">{estimate.createdDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Job ID</p>
                          <p className="font-medium">{estimate.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Customer Name</p>
                          <p className="font-medium">{estimate.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Employee Name</p>
                          <p className="font-medium">{estimate.employeeName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-medium text-lg">${estimate.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sync</p>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={getStatusColor(estimate.status)} variant="outline">
                            {estimate.status.toUpperCase()}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 z-50 bg-popover">
                              <DropdownMenuItem onClick={() => handlePreview(estimate)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview Estimate
                              </DropdownMenuItem>
                              
                              {estimate.status === "Open" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleSendEmail(estimate)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendSMS(estimate)}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Send SMS
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditEstimate(estimate)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Estimate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePayEstimate(estimate)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Pay Estimate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePayCash(estimate)}>
                                    <Banknote className="mr-2 h-4 w-4" />
                                    Pay Cash
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleShareAddress(estimate)}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Share Job Address
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReassign(estimate)}>
                                    <UserCog className="mr-2 h-4 w-4" />
                                    Reassign Employee
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDocHistory(estimate)}>
                                    <History className="mr-2 h-4 w-4" />
                                    Customer History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeactivate(estimate)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {estimate.status === "Paid" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleDocHistory(estimate)}>
                                    <History className="mr-2 h-4 w-4" />
                                    Customer History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRefund(estimate)}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Refund
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="deactivated" className="space-y-4">
            {filteredEstimates.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No deactivated estimates found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredEstimates.map((estimate) => (
                  <Card key={estimate.id} className="shadow-sm hover:shadow-md transition-shadow opacity-75">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Created Date</p>
                          <p className="font-medium">{estimate.createdDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Job ID</p>
                          <p className="font-medium">{estimate.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Customer Name</p>
                          <p className="font-medium">{estimate.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Employee Name</p>
                          <p className="font-medium">{estimate.employeeName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-medium text-lg">${estimate.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sync</p>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivate(estimate)}
                          >
                            Activate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <SendEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        customerEmail={selectedEstimate?.customerEmail || ""}
      />

      <SendSMSModal
        open={smsModalOpen}
        onOpenChange={setSmsModalOpen}
        customerName={selectedEstimate?.customerName || ""}
        phoneNumber={selectedEstimate?.customerPhone || ""}
      />

      <ShareAddressModal
        open={shareAddressModalOpen}
        onOpenChange={setShareAddressModalOpen}
        jobAddress={selectedEstimate?.address || "123 Main Street, City, State"}
        jobId={selectedEstimate?.id || ""}
      />

      <PayCashModal
        open={payCashModalOpen}
        onOpenChange={setPayCashModalOpen}
        orderAmount={selectedEstimate?.amount || 0}
        orderId={selectedEstimate?.id || ""}
      />


      <InvoicePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        invoice={selectedEstimateForPayment}
      />

      <PreviewEstimateModal
        open={previewModalOpen}
        onOpenChange={(open) => {
          setPreviewModalOpen(open);
          if (!open) setSelectedEstimateForPreview(null);
        }}
        estimate={selectedEstimateForPreview}
        onEdit={(estimate) => {
          navigate(`/estimates/${estimate.id}/edit`);
        }}
        onPayNow={(estimate) => {
          setSelectedEstimateForPayment(estimate);
          setPaymentModalOpen(true);
        }}
      />

      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select New Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  {mockEmployees
                    .filter((emp) => emp.status === "Active")
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReassignSubmit}>Reassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estimates;
