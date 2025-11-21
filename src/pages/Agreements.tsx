import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, FileText, Calendar as CalendarIcon, Eye, Mail, MessageSquare, Edit, DollarSign, Wallet, CalendarRange, Percent, X, ChevronLeft, ChevronRight } from "lucide-react";
import { mockAgreements } from "@/data/mockData";
import { SendEmailModal } from "@/components/modals/SendEmailModal";
import { SendSMSModal } from "@/components/modals/SendSMSModal";
import { PayCashModal } from "@/components/modals/PayCashModal";
import { LinkModulesModal } from "@/components/modals/LinkModulesModal";
import { AgreementSignModal } from "@/components/modals/AgreementSignModal";
import { InvoicePaymentModal } from "@/components/modals/InvoicePaymentModal";
import { AgreementPaymentModal } from "@/components/modals/AgreementPaymentModal";
import { PreviewAgreementModal } from "@/components/modals/PreviewAgreementModal";
import { format, differenceInDays, startOfToday, startOfMonth, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

const Agreements = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
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
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [sendSMSOpen, setSendSMSOpen] = useState(false);
  const [payCashOpen, setPayCashOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);
  const [agreements, setAgreements] = useState(mockAgreements);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTargetModule, setLinkTargetModule] = useState<"estimate" | "invoice">("estimate");
  const [selectedAgreementForLink, setSelectedAgreementForLink] = useState<any>(null);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [selectedAgreementForSign, setSelectedAgreementForSign] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAgreementForPayment, setSelectedAgreementForPayment] = useState<any>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAgreementForPreview, setSelectedAgreementForPreview] = useState<any>(null);

  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch = agreement.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || agreement.status === activeTab;
    
    const agreementDate = new Date(agreement.startDate);
    const matchesDateRange = 
      (!dateRange.from || agreementDate >= dateRange.from) &&
      (!dateRange.to || agreementDate <= dateRange.to);
    
    return matchesSearch && matchesTab && matchesDateRange;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-success/10 text-success border-success/20";
      case "Open":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSendEmail = (agreement: any) => {
    setSelectedAgreement(agreement);
    setSendEmailOpen(true);
  };

  const handleSendSMS = (agreement: any) => {
    setSelectedAgreement(agreement);
    setSendSMSOpen(true);
  };

  const handlePayCash = (agreement: any) => {
    setSelectedAgreement(agreement);
    setPayCashOpen(true);
  };

  const handleUpdateAgreement = (agreement: any) => {
    navigate(`/agreements/${agreement.id}/edit`);
  };

  const handlePaymentComplete = () => {
    if (selectedAgreement) {
      setAgreements(prevAgreements =>
        prevAgreements.map(agreement =>
          agreement.id === selectedAgreement.id
            ? { ...agreement, status: "Paid" }
            : agreement
        ) as typeof mockAgreements
      );
    }
  };

  const handleLinkModule = (agreement: any, targetModule: "estimate" | "invoice") => {
    setSelectedAgreementForLink(agreement);
    setLinkTargetModule(targetModule);
    setLinkModalOpen(true);
  };

  const handlePayNow = (agreement: any) => {
    setSelectedAgreementForSign(agreement);
    setSelectedAgreementForPayment(agreement);
    setSignModalOpen(true);
  };

  const handleSignComplete = () => {
    setPaymentModalOpen(true);
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
    <div className="flex-1">
      <AppHeader searchPlaceholder="Search agreements..." onSearchChange={setSearchQuery} />

      <main className="px-6 py-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agreements</h1>
            <p className="text-muted-foreground">Manage service contracts and agreements</p>
          </div>
          <div className="flex gap-3">
            <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarRange className="h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    "Date Range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 rounded-2xl overflow-hidden bg-white" align="end">
                <style>{`
                  .agreement-date-range-calendar {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    overflow-x: hidden;
                  }
                  .agreement-date-range-calendar .rdp {
                    margin: 0;
                    padding: 0;
                  }
                  .agreement-date-range-calendar .rdp-months {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                  }
                  .agreement-date-range-calendar .rdp-month {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                  }
                  .agreement-date-range-calendar .rdp-caption {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    margin-bottom: 1rem;
                    padding: 0;
                    min-height: 44px;
                  }
                  .agreement-date-range-calendar .rdp-caption_label {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #111827;
                    text-align: center;
                    margin: 0;
                    padding: 0;
                  }
                  .agreement-date-range-calendar table {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    border-collapse: collapse;
                    table-layout: fixed;
                  }
                  .agreement-date-range-calendar thead,
                  .agreement-date-range-calendar tbody {
                    display: block;
                    width: 100%;
                  }
                  .agreement-date-range-calendar thead tr,
                  .agreement-date-range-calendar tbody tr {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    width: 100%;
                    gap: 4px;
                    margin-bottom: 4px;
                    margin-top: 0;
                    padding: 0;
                  }
                  .agreement-date-range-calendar thead th,
                  .agreement-date-range-calendar tbody td {
                    display: flex;
                    width: 100%;
                    max-width: 100%;
                    justify-content: center;
                    align-items: center;
                    padding: 0;
                    margin: 0;
                  }
                  .agreement-date-range-calendar thead th {
                    height: 32px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #4b5563;
                  }
                  .agreement-date-range-calendar tbody td {
                    min-height: 44px;
                    height: 44px;
                  }
                  .agreement-date-range-calendar .rdp-day {
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
                  .agreement-date-range-calendar .rdp-day:hover {
                    background: #fff7ed;
                    color: #9a3412;
                  }
                  .agreement-date-range-calendar .rdp-day_selected {
                    background: #f97316;
                    color: white;
                    font-weight: 600;
                  }
                  .agreement-date-range-calendar .rdp-day_range_start,
                  .agreement-date-range-calendar .rdp-day_range_end {
                    background: #f97316;
                    color: white;
                    font-weight: 600;
                  }
                  .agreement-date-range-calendar .rdp-day_range_middle {
                    background: #ffedd5;
                    color: #9a3412;
                    border-radius: 0;
                  }
                  .agreement-date-range-calendar .rdp-day_today {
                    background: #fff7ed;
                    color: #9a3412;
                    font-weight: 600;
                    border: 2px solid #fdba74;
                  }
                  .agreement-date-range-calendar .rdp-day_outside {
                    color: #9ca3af;
                    opacity: 0.5;
                  }
                  .agreement-date-range-calendar .rdp-day_disabled {
                    color: #d1d5db;
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                  .agreement-date-range-calendar .rdp-day_hidden {
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

                  <div className="agreement-date-range-calendar">
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
                    onClick={() => {
                      handleApplyDateRange();
                      setPopoverOpen(false);
                    }}
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
            <Button 
              variant="outline" 
              onClick={() => navigate("/agreements/minimum-deposit")} 
              className="gap-2"
            >
              <Percent className="h-5 w-5" />
              Minimum Deposit
            </Button>
            <Button className="gap-2" onClick={() => navigate("/agreements/new")}>
              <Plus className="h-5 w-5" />
              New Agreement
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Paid">Paid</TabsTrigger>
            <TabsTrigger value="Open">Open</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">

            <div className="grid gap-4">
              {filteredAgreements.map((agreement) => (
                <Card key={agreement.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4 bg-gradient-to-r from-card to-success/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{agreement.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {agreement.id} • {agreement.customerName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="border-border">{agreement.type}</Badge>
                        <Badge className={getStatusColor(agreement.status)} variant="outline">{agreement.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          Start Date
                        </p>
                        <p className="font-medium mt-1">{new Date(agreement.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          End Date
                        </p>
                        <p className="font-medium mt-1">{new Date(agreement.endDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                        <p className="text-primary text-xs">Annual Value</p>
                        <p className="text-2xl font-bold text-primary">${agreement.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 bg-muted/10 -mx-6 px-6 py-3 rounded-b-lg">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notes:
                      </p>
                      <div className="bg-card p-4 rounded-lg border border-border/50 text-sm">
                        {agreement.terms}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary"
                        onClick={() => {
                          setSelectedAgreementForPreview(agreement);
                          setPreviewModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Preview Agreement
                      </Button>
                      
                      {agreement.status === "Open" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleSendEmail(agreement)}
                          >
                            <Mail className="h-4 w-4" />
                            Send Email
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleSendSMS(agreement)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Send SMS
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleUpdateAgreement(agreement)}
                          >
                            <Edit className="h-4 w-4" />
                            Update Agreement
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleLinkModule(agreement, "estimate")}
                          >
                            <FileText className="h-4 w-4" />
                            Link Estimate
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleLinkModule(agreement, "invoice")}
                          >
                            <DollarSign className="h-4 w-4" />
                            Link Invoice
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handlePayNow(agreement)}
                          >
                            <DollarSign className="h-4 w-4" />
                            Pay Now
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handlePayCash(agreement)}
                          >
                            <Wallet className="h-4 w-4" />
                            Pay Cash
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <SendEmailModal
        open={sendEmailOpen}
        onOpenChange={setSendEmailOpen}
        customerEmail={selectedAgreement?.customerEmail || ""}
      />
      <SendSMSModal
        open={sendSMSOpen}
        onOpenChange={setSendSMSOpen}
        customerName={selectedAgreement?.customerName || ""}
        phoneNumber={selectedAgreement?.customerPhone || ""}
      />
      <PayCashModal
        open={payCashOpen}
        onOpenChange={setPayCashOpen}
        orderAmount={selectedAgreement?.amount || 0}
        orderId={selectedAgreement?.id || ""}
        onPaymentComplete={handlePaymentComplete}
      />
      <LinkModulesModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        sourceModule="agreement"
        sourceId={selectedAgreementForLink?.id || ""}
        sourceName={selectedAgreementForLink?.title || ""}
        targetModule={linkTargetModule}
      />
      <AgreementSignModal
        open={signModalOpen}
        onOpenChange={setSignModalOpen}
        agreementId={selectedAgreementForSign?.id || ""}
        onSignComplete={handleSignComplete}
      />
      <PreviewAgreementModal
        open={previewModalOpen}
        onOpenChange={(open) => {
          setPreviewModalOpen(open);
          if (!open) setSelectedAgreementForPreview(null);
        }}
        agreement={selectedAgreementForPreview}
        onPayNow={(agreement) => {
          setSelectedAgreementForPayment(agreement);
          setPaymentModalOpen(true);
        }}
        onUpdate={(agreement) => {
          navigate(`/agreements/${agreement.id}/edit`);
        }}
      />
      <AgreementPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        agreement={selectedAgreementForPayment}
      />
    </div>
  );
};

export default Agreements;
