import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { SendEmailModal } from "@/components/modals/SendEmailModal";
import { SendSMSModal } from "@/components/modals/SendSMSModal";
import { InvoicePaymentModal } from "@/components/modals/InvoicePaymentModal";
import { LinkModulesModal } from "@/components/modals/LinkModulesModal";
import { PreviewInvoiceModal } from "@/components/modals/PreviewInvoiceModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Mail, MessageSquare, Edit, UserCog, FileText, CreditCard, Banknote, MoreVertical, Trash2, Check, X, CheckCircle2, Bell, Settings, FileCheck, RotateCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { mockInvoices, mockEmployees } from "@/data/mockData";
import { toast } from "sonner";

const Invoices = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("single");
  const [startDate, setStartDate] = useState("2024-08-01");
  const [endDate, setEndDate] = useState("2024-10-27");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [selectedInvoiceForContact, setSelectedInvoiceForContact] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTargetModule, setLinkTargetModule] = useState<"estimate" | "agreement">("estimate");
  const [selectedInvoiceForLink, setSelectedInvoiceForLink] = useState<any>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<any>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedInvoiceForReassign, setSelectedInvoiceForReassign] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const filterInvoices = (type: "single" | "recurring" | "deactivated") => {
    return mockInvoices.filter((invoice) => {
      const matchesSearch = invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (type === "deactivated") {
        const invoiceDate = new Date(invoice.issueDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const matchesDateRange = invoiceDate >= start && invoiceDate <= end;
        
        return invoice.deactivated && matchesSearch && matchesDateRange;
      }
      
      const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase();
      
      const invoiceDate = new Date(invoice.issueDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const matchesDateRange = invoiceDate >= start && invoiceDate <= end;
      
      return !invoice.deactivated && invoice.invoiceType === type && matchesSearch && matchesStatus && matchesDateRange;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-success/10 text-success border-success/20";
      case "Open":
        return "bg-warning/10 text-warning border-warning/20";
      case "Overdue":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleDeactivate = (invoice: any) => {
    if (invoice.status !== "Open") {
      toast.error("Only Open invoices can be deactivated");
      return;
    }
    toast.success(`Invoice ${invoice.id} has been deactivated`);
  };

  const handleActivate = (invoice: any) => {
    toast.success(`Invoice ${invoice.id} has been reactivated`);
  };

  const handleSendEmail = (invoice: any) => {
    setSelectedInvoiceForContact(invoice);
    setEmailModalOpen(true);
  };

  const handleSendSMS = (invoice: any) => {
    setSelectedInvoiceForContact(invoice);
    setSmsModalOpen(true);
  };

  const handlePayNow = (invoice: any) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentModalOpen(true);
  };

  const handleLinkModule = (invoice: any, targetModule: "estimate" | "agreement") => {
    setSelectedInvoiceForLink(invoice);
    setLinkTargetModule(targetModule);
    setLinkModalOpen(true);
  };

  const handleDocHistory = (invoice: any) => {
    // Navigate to customer details page
    navigate(`/customers/${invoice.customerId}`);
  };

  const handleReassignEmployee = (invoice: any) => {
    setSelectedInvoiceForReassign(invoice);
    // Find employee ID by matching employee name
    const currentEmployee = mockEmployees.find(emp => emp.name === invoice.employeeName);
    setSelectedEmployee(currentEmployee?.id || "");
    setReassignModalOpen(true);
  };

  const handleReassignSubmit = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    toast.success(`Invoice ${selectedInvoiceForReassign?.id} has been reassigned to the selected employee.`);
    setReassignModalOpen(false);
    setSelectedEmployee("");
    setSelectedInvoiceForReassign(null);
  };

  const renderSingleInvoiceTable = (invoices: any[]) => (
    <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">OrderID</TableHead>
            <TableHead className="font-semibold">Customer Name</TableHead>
            <TableHead className="font-semibold">Employee Name</TableHead>
            <TableHead className="font-semibold">Order Amount</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Refund</TableHead>
            <TableHead className="font-semibold">Sync</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-primary font-mono text-sm">
                  {invoice.orderId}
                </TableCell>
                <TableCell className="text-info font-medium">
                  {invoice.customerName}
                </TableCell>
                <TableCell className="text-info">
                  {invoice.employeeName}
                </TableCell>
                <TableCell className="font-semibold text-success">
                  ${invoice.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(invoice.status)} variant="outline">
                    {invoice.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={invoice.refund === "Yes" ? "text-destructive" : "text-muted-foreground"}>
                    {invoice.refund}
                  </span>
                </TableCell>
                <TableCell>
                  {invoice.sync ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 touch-target">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => {
                          setSelectedInvoiceForPreview(invoice);
                          setPreviewModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Preview invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => handleSendEmail(invoice)}>
                        <Mail className="h-4 w-4" />
                        Send email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => handleSendSMS(invoice)}>
                        <MessageSquare className="h-4 w-4" />
                        Send sms
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLinkModule(invoice, "estimate")} className="gap-2">
                        <FileText className="h-4 w-4" />
                        Link Estimate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLinkModule(invoice, "agreement")} className="gap-2">
                        <FileCheck className="h-4 w-4" />
                        Link Agreement
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="gap-2"
                        disabled={invoice.status === "Paid"}
                        onClick={() => {
                          if (invoice.status !== "Paid") {
                            navigate(`/invoices/${invoice.id}/edit`);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Invoice {invoice.status === "Paid" && "(Disabled)"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => handleReassignEmployee(invoice)}
                      >
                        <UserCog className="h-4 w-4" />
                        Reassign Employee
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {invoice.status === "Open" && (
                        <>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => handleDocHistory(invoice)}
                          >
                            <FileText className="h-4 w-4" />
                            Customer History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handlePayNow(invoice)}>
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Banknote className="h-4 w-4" />
                            Pay Cash
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDeactivate(invoice)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </>
                      )}
                      {invoice.status === "Paid" && (
                        <DropdownMenuItem className="gap-2 text-warning focus:text-warning">
                          <RotateCcw className="h-4 w-4" />
                          Refund
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderRecurringInvoiceTable = (invoices: any[]) => (
    <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Job ID</TableHead>
            <TableHead className="font-semibold">Customer Name</TableHead>
            <TableHead className="font-semibold">Occurrence</TableHead>
            <TableHead className="font-semibold">Order Amount</TableHead>
            <TableHead className="font-semibold">Days</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No recurring invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-primary font-mono text-sm">
                  {invoice.jobId}
                </TableCell>
                <TableCell className="text-info font-medium">
                  {invoice.customerName}
                </TableCell>
                <TableCell className="font-medium">
                  {new Date(invoice.recurringEndDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-semibold text-success">
                  ${invoice.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                    {invoice.recurringInterval}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(invoice.status)} variant="outline">
                    {invoice.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 touch-target">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => {
                          setSelectedInvoiceForPreview(invoice);
                          setPreviewModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Preview invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => handleSendEmail(invoice)}>
                        <Mail className="h-4 w-4" />
                        Send email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => handleSendSMS(invoice)}>
                        <MessageSquare className="h-4 w-4" />
                        Send sms
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLinkModule(invoice, "estimate")} className="gap-2">
                        <FileText className="h-4 w-4" />
                        Link Estimate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLinkModule(invoice, "agreement")} className="gap-2">
                        <FileCheck className="h-4 w-4" />
                        Link Agreement
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="gap-2"
                        disabled={invoice.status === "Paid"}
                        onClick={() => {
                          if (invoice.status !== "Paid") {
                            navigate(`/invoices/${invoice.id}/edit`);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Invoice {invoice.status === "Paid" && "(Disabled)"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => handleReassignEmployee(invoice)}
                      >
                        <UserCog className="h-4 w-4" />
                        Reassign Employee
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {invoice.status === "Open" && (
                        <>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => handleDocHistory(invoice)}
                          >
                            <FileText className="h-4 w-4" />
                            Customer History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handlePayNow(invoice)}>
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Banknote className="h-4 w-4" />
                            Pay Cash
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDeactivate(invoice)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderDeactivatedInvoiceTable = (invoices: any[]) => (
    <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">OrderID</TableHead>
            <TableHead className="font-semibold">Customer Name</TableHead>
            <TableHead className="font-semibold">Employee Name</TableHead>
            <TableHead className="font-semibold">Order Amount</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Refund</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No deactivated invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors opacity-75">
                <TableCell className="font-medium">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-primary font-mono text-sm">
                  {invoice.orderId}
                </TableCell>
                <TableCell className="text-info font-medium">
                  {invoice.customerName}
                </TableCell>
                <TableCell className="text-info">
                  {invoice.employeeName}
                </TableCell>
                <TableCell className="font-semibold text-success">
                  ${invoice.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(invoice.status)} variant="outline">
                    {invoice.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={invoice.refund === "Yes" ? "text-destructive" : "text-muted-foreground"}>
                    {invoice.refund}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 touch-target">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => {
                          setSelectedInvoiceForPreview(invoice);
                          setPreviewModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Preview invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLinkModule(invoice, "estimate")} className="gap-2">
                        <FileText className="h-4 w-4" />
                        Link Estimate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLinkModule(invoice, "agreement")} className="gap-2">
                        <FileCheck className="h-4 w-4" />
                        Link Agreement
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="gap-2 text-success focus:text-success"
                        onClick={() => handleActivate(invoice)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Activate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex-1">
      <AppHeader searchPlaceholder="Search invoices..." onSearchChange={setSearchQuery} />

      <main className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Service Pro911 - Invoices</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage billing and payments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate("/invoices/due-alert")} 
              className="gap-2 touch-target w-full sm:w-auto"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Invoice Due Alert</span>
              <span className="sm:hidden">Due Alert</span>
            </Button>
            <Button onClick={() => navigate("/invoices/new")} className="gap-2 touch-target w-full sm:w-auto">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              New Invoice
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:max-w-[180px] touch-target"
              />
              <span className="text-muted-foreground text-center sm:text-left hidden sm:inline">TO</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:max-w-[180px] touch-target"
              />
            </div>
          </div>
          {activeTab !== "deactivated" && (
            <div className="w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] touch-target">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-3 h-auto">
            <TabsTrigger value="single" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Single</TabsTrigger>
            <TabsTrigger value="recurring" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Recurring</TabsTrigger>
            <TabsTrigger value="deactivated" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Deactivated</TabsTrigger>
          </TabsList>

          <TabsContent value="recurring" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Date: {new Date(startDate).toLocaleDateString()} TO {new Date(endDate).toLocaleDateString()}
            </div>
            {renderRecurringInvoiceTable(filterInvoices("recurring"))}
          </TabsContent>

          <TabsContent value="single" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Date: {new Date(startDate).toLocaleDateString()} TO {new Date(endDate).toLocaleDateString()}
            </div>
            {renderSingleInvoiceTable(filterInvoices("single"))}
          </TabsContent>

          <TabsContent value="deactivated" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Date: {new Date(startDate).toLocaleDateString()} TO {new Date(endDate).toLocaleDateString()}
            </div>
            {renderDeactivatedInvoiceTable(filterInvoices("deactivated"))}
          </TabsContent>
        </Tabs>

        <SendEmailModal
          open={emailModalOpen}
          onOpenChange={setEmailModalOpen}
          customerEmail=""
        />

        <SendSMSModal
          open={smsModalOpen}
          onOpenChange={setSmsModalOpen}
          customerName={selectedInvoiceForContact?.customerName || ""}
          phoneNumber=""
        />

        <InvoicePaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          invoice={selectedInvoiceForPayment}
        />

        <PreviewInvoiceModal
          open={previewModalOpen}
          onOpenChange={(open) => {
            setPreviewModalOpen(open);
            if (!open) setSelectedInvoiceForPreview(null);
          }}
          invoice={selectedInvoiceForPreview}
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
              <Button variant="outline" onClick={() => {
                setReassignModalOpen(false);
                setSelectedEmployee("");
                setSelectedInvoiceForReassign(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleReassignSubmit}>Reassign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Invoices;
