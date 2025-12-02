import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import EstimateCard from "@/components/cards/EstimateCard";
import EmptyState from "@/components/cards/EmptyState";
import PaymentModal from "@/components/modals/PaymentModal";
import PreviewEstimateModal from "@/components/modals/PreviewEstimateModal";
import PreviewInvoiceModal from "@/components/modals/PreviewInvoiceModal";
import SendEmailModal from "@/components/modals/SendEmailModal";
import SendSmsModal from "@/components/modals/SendSmsModal";
import ReassignEmployeeModal from "@/components/modals/ReassignEmployeeModal";
import ShareAddressModal from "@/components/modals/ShareAddressModal";
import { mockEstimates, mockCustomers, mockEmployees, mockInvoices } from "@/data/mobileMockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Eye, Mail, MessageSquare, Edit, UserCog, History, RotateCcw, XCircle, Receipt, FilePlus } from "lucide-react";
import { toast } from "sonner";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";

const Estimates = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("activate");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<{ id: string; amount: number } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewEstimate, setPreviewEstimate] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showShareAddressModal, setShowShareAddressModal] = useState(false);
  const [selectedEstimateForAction, setSelectedEstimateForAction] = useState<any>(null);
  const [deactivatedEstimates, setDeactivatedEstimates] = useState<Set<string>>(new Set());
  const [statusFilterValue, setStatusFilterValue] = useState<string>("all");
  const [convertedEstimates, setConvertedEstimates] = useState<Set<string>>(new Set());
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  // Get user role from localStorage
  const userRole = localStorage.getItem("userType") || "merchant";
  const isEmployee = userRole === "employee";

  // Ensure employees always use "activate" filter (no tabs for employees)
  useEffect(() => {
    if (isEmployee) {
      setStatusFilter("activate");
    }
  }, [isEmployee]);
  
  // Load converted estimates from localStorage on mount
  useEffect(() => {
    const converted = JSON.parse(localStorage.getItem("convertedEstimates") || "[]");
    if (converted.length > 0) {
      setConvertedEstimates(new Set(converted));
    }
  }, []);
  
  const filteredEstimates = mockEstimates.map(est => {
    // Check if estimate has been converted
    const isConverted = convertedEstimates.has(est.id);
    // Only update status if it's currently Unpaid and has been converted
    if (isConverted && est.status === "Unpaid") {
      return {
        ...est,
        status: "Converted to Invoice" as const,
      };
    }
    return est;
  }).filter(est => {
    const matchesSearch = est.id.toLowerCase().includes(search.toLowerCase()) ||
                         est.customerName.toLowerCase().includes(search.toLowerCase());
    
    // Filter by status (All / Paid / Unpaid)
    const matchesStatus = statusFilterValue === "all" || est.status === statusFilterValue;
    
    // Filter by tab
    // Activate: Both Paid and Unpaid estimates that are NOT deactivated
    // Deactivated: Only Unpaid estimates that ARE deactivated
    let matchesTab = true;
    const isDeactivated = deactivatedEstimates.has(est.id);
    if (statusFilter === "deactivated") {
      matchesTab = est.status === "Unpaid" && isDeactivated;
    } else {
      // Activate tab: exclude deactivated estimates
      matchesTab = !isDeactivated;
    }
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handlePayNow = (estimateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const estimate = mockEstimates.find(est => est.id === estimateId);
    if (estimate) {
      setSelectedEstimate({ id: estimateId, amount: estimate.amount });
      setShowPaymentModal(true);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    if (selectedEstimate) {
      // Payment processing toast removed - only success toast shown after payment completes
      // No processing toast for cash payments
      // Navigate to payment processing page or handle payment
      // navigate(`/payment/${selectedEstimate.id}?method=${method}`);
    }
  };


  const handleMenuAction = (action: string, estimateId: string) => {
    switch (action) {
      case "preview":
        const estimate = mockEstimates.find(est => est.id === estimateId);
        if (estimate) {
          setPreviewEstimate(estimate);
          setShowPreviewModal(true);
        }
        break;
      case "send-email":
        const emailEstimate = mockEstimates.find(est => est.id === estimateId);
        if (emailEstimate) {
          const customer = mockCustomers.find(c => c.id === emailEstimate.customerId);
          setSelectedEstimateForAction({
            ...emailEstimate,
            customerEmail: customer?.email || "",
            customerPhone: customer?.phone || "",
            customerName: emailEstimate.customerName,
          });
          setShowEmailModal(true);
        }
        break;
      case "send-sms":
        const smsEstimate = mockEstimates.find(est => est.id === estimateId);
        if (smsEstimate) {
          const customer = mockCustomers.find(c => c.id === smsEstimate.customerId);
          setSelectedEstimateForAction({
            ...smsEstimate,
            customerEmail: customer?.email || "",
            customerPhone: customer?.phone || "",
            customerName: smsEstimate.customerName,
          });
          setShowSMSModal(true);
        }
        break;
      case "edit":
        navigate(`/estimates/${estimateId}/edit`);
        break;
      case "share-address":
        const shareEstimate = mockEstimates.find(est => est.id === estimateId);
        if (shareEstimate) {
          const customer = mockCustomers.find(c => c.id === shareEstimate.customerId);
          setSelectedEstimateForAction({
            ...shareEstimate,
            jobAddress: customer?.address || "No address available",
          });
          setShowShareAddressModal(true);
        }
        break;
      case "reassign":
        const reassignEstimate = mockEstimates.find(est => est.id === estimateId);
        if (reassignEstimate) {
          setSelectedEstimateForAction({
            ...reassignEstimate,
            currentEmployeeId: reassignEstimate.customerId, // Using customerId as placeholder for employeeId
          });
          setShowReassignModal(true);
        }
        break;
      case "doc-history":
        const docEstimate = mockEstimates.find(est => est.id === estimateId);
        if (docEstimate) {
          // Navigate to customer profile
          navigate(`/customers/${docEstimate.customerId}`);
        }
        break;
      case "deactivate":
        setDeactivatedEstimates(prev => new Set(prev).add(estimateId));
        toast.success("Estimate deactivated");
        break;
      case "refund":
        toast.success("Processing refund...");
        break;
      case "convert-to-invoice":
        const convertEstimate = mockEstimates.find(est => est.id === estimateId);
        if (convertEstimate) {
          const customer = mockCustomers.find(c => c.id === convertEstimate.customerId);
          // Find employee by name if employeeName exists, otherwise use first employee
          const employee = (convertEstimate as any).employeeName 
            ? mockEmployees.find(emp => emp.name === (convertEstimate as any).employeeName)
            : mockEmployees[0];
          
          // Get job address from estimate or customer address
          const jobAddress = (convertEstimate as any).jobAddress || customer?.address || "";
          
          // Convert estimate items to invoice items format
          // If estimate has items array, use it; otherwise create a single item from amount
          const estimateItems = (convertEstimate as any).items || [];
          const invoiceItems = estimateItems.length > 0
            ? estimateItems.map((item: any, index: number) => ({
                id: item.id || `item-${index}`,
                name: item.name || item.description || "Service Item",
                quantity: item.quantity || 1,
                price: item.price || item.rate || item.amount || 0,
                isCustom: !item.id,
              }))
            : [{
                id: `item-${convertEstimate.id}`,
                name: "Service Item",
                quantity: 1,
                price: convertEstimate.amount,
              }];
          
          navigate("/invoices/new", {
            state: {
              prefill: {
                customerId: convertEstimate.customerId,
                jobAddress: jobAddress,
                employeeId: employee?.id || mockEmployees[0]?.id || "1",
                items: invoiceItems,
                notes: (convertEstimate as any).notes || (convertEstimate as any).memo || "",
                termsAndConditions: (convertEstimate as any).termsAndConditions || (convertEstimate as any).terms || "",
                cancellationPolicy: (convertEstimate as any).cancellationPolicy || "",
                tax: (convertEstimate as any).taxRate || 0,
                discount: (convertEstimate as any).discount ? 
                  (typeof (convertEstimate as any).discount === 'object' ? (convertEstimate as any).discount : null) : null,
                estimateId: estimateId, // Pass estimateId to track conversion
              }
            }
          });
        }
        break;
      case "create-new-estimate":
        const createEstimate = mockEstimates.find(est => est.id === estimateId);
        if (createEstimate) {
          const customer = mockCustomers.find(c => c.id === createEstimate.customerId);
          // Find employee by name if employeeName exists, otherwise use first employee
          const employee = (createEstimate as any).employeeName 
            ? mockEmployees.find(emp => emp.name === (createEstimate as any).employeeName)
            : mockEmployees[0];
          
          navigate("/estimates/new", {
            state: {
              prefill: {
                customerId: createEstimate.customerId,
                jobAddress: (createEstimate as any).jobAddress || customer?.address || "",
                employeeId: employee?.id || mockEmployees[0]?.id || "1",
              }
            }
          });
        }
        break;
      case "view-invoice":
        // Get the invoice ID from the conversion mapping
        const estimateToInvoiceMap = JSON.parse(localStorage.getItem("estimateToInvoiceMap") || "{}");
        const invoiceId = estimateToInvoiceMap[estimateId];
        
        // If no mapping exists, try to find invoice by matching customer and amount
        // This handles cases where estimate was converted but mapping wasn't saved
        let invoice = invoiceId ? mockInvoices.find(inv => inv.id === invoiceId) : null;
        
        // If invoice not found by ID, try to find by matching estimate data
        if (!invoice) {
          const estimate = mockEstimates.find(est => est.id === estimateId);
          if (estimate) {
            // Try to find invoice with same customer and similar amount
            invoice = mockInvoices.find(inv => 
              inv.customerId === estimate.customerId && 
              Math.abs(inv.amount - estimate.amount) < 1
            );
            
            // If still not found, create a temporary invoice from estimate data
            if (!invoice) {
              invoice = {
                id: invoiceId || `INV-EST-${estimateId}`,
                customerId: estimate.customerId,
                customerName: estimate.customerName,
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: estimate.amount,
                status: "Open" as const,
                paymentMethod: "Credit Card",
                type: "single" as const,
              };
            }
          }
        }
        
        if (invoice) {
          setPreviewInvoice(invoice);
          setShowInvoicePreview(true);
        } else {
          toast.error("Invoice not found for this estimate");
        }
        break;
      case "activate":
        setDeactivatedEstimates(prev => {
          const newSet = new Set(prev);
          newSet.delete(estimateId);
          return newSet;
        });
        toast.success("Estimate activated");
        break;
      default:
        break;
    }
  };

  const renderActionButtons = (estimate: typeof mockEstimates[0], type: string) => {
    if (type === "deactivated") {
      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction("preview", estimate.id),
        },
        {
          label: "Activate",
          icon: RotateCcw,
          action: () => handleMenuAction("activate", estimate.id),
        },
      ];
      return <KebabMenu items={items} menuWidth="w-44" />;
    }

    if (estimate.status === "Paid") {
      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction("preview", estimate.id),
        },
        {
          label: "Send Email",
          icon: Mail,
          action: () => handleMenuAction("send-email", estimate.id),
        },
        {
          label: "Send SMS",
          icon: MessageSquare,
          action: () => handleMenuAction("send-sms", estimate.id),
        },
      ];

      // Employees should NOT see sensitive admin actions on paid estimates
      if (!isEmployee) {
        items.push(
          {
            label: "Reassign Employee",
            icon: UserCog,
            action: () => handleMenuAction("reassign", estimate.id),
          },
          {
            label: "Refund",
            icon: RotateCcw,
            action: () => handleMenuAction("refund", estimate.id),
            separator: true,
          }
        );
      }

      // Add "Create New Estimate" option for paid estimates
      items.push({
        label: "Create New Estimate",
        icon: FilePlus,
        action: () => handleMenuAction("create-new-estimate", estimate.id),
        separator: true,
      });

      return <KebabMenu items={items} menuWidth="w-48" />;
    }

    if (estimate.status === "Unpaid") {
      const items: KebabMenuItem[] = [
        {
          label: "Preview",
          icon: Eye,
          action: () => handleMenuAction("preview", estimate.id),
        },
        {
          label: "Send Email",
          icon: Mail,
          action: () => handleMenuAction("send-email", estimate.id),
        },
        {
          label: "Send SMS",
          icon: MessageSquare,
          action: () => handleMenuAction("send-sms", estimate.id),
        },
      ];

      // Employees should NOT see sensitive admin actions on unpaid estimates
      if (!isEmployee) {
        items.push(
          {
            label: "Edit Estimate",
            icon: Edit,
            action: () => handleMenuAction("edit", estimate.id),
            separator: true,
          },
          {
            label: "Customer History",
            icon: History,
            action: () => handleMenuAction("doc-history", estimate.id),
          },
          {
            label: "Reassign Employee",
            icon: UserCog,
            action: () => handleMenuAction("reassign", estimate.id),
          }
        );
        
        // Only show "Convert to Invoice" for Unpaid estimates (not already converted)
        if (estimate.status === "Unpaid") {
          items.push({
            label: "Convert to Invoice",
            icon: Receipt,
            action: () => handleMenuAction("convert-to-invoice", estimate.id),
            separator: true,
          });
        }
        
        items.push({
          label: "Deactivate",
          icon: XCircle,
          action: () => handleMenuAction("deactivate", estimate.id),
        });
      }

      return <KebabMenu items={items} menuWidth="w-56" />;
    }

    // Handle "Converted to Invoice" status - only show Preview Estimate and View Invoice
    if (estimate.status === "Converted to Invoice") {
      const items: KebabMenuItem[] = [
        {
          label: "Preview Estimate",
          icon: Eye,
          action: () => handleMenuAction("preview", estimate.id),
        },
        {
          label: "View Invoice",
          icon: Receipt,
          action: () => handleMenuAction("view-invoice", estimate.id),
        },
      ];

      return <KebabMenu items={items} menuWidth="w-56" />;
    }

    const items: KebabMenuItem[] = [
      {
        label: "Preview",
        icon: Eye,
        action: () => handleMenuAction("preview", estimate.id),
      },
      {
        label: "Send Email",
        icon: Mail,
        action: () => handleMenuAction("send-email", estimate.id),
      },
      {
        label: "Send SMS",
        icon: MessageSquare,
        action: () => handleMenuAction("send-sms", estimate.id),
      },
      {
        label: "Reassign Employee",
        icon: UserCog,
        action: () => handleMenuAction("reassign", estimate.id),
      },
      {
        label: "Refund",
        icon: RotateCcw,
        action: () => handleMenuAction("refund", estimate.id),
        separator: true,
      },
    ];
    return <KebabMenu items={items} menuWidth="w-48" />;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Estimates"
        showBack={true}
        actions={
          <Button size="sm" className="h-8 w-8 p-0" onClick={() => navigate("/estimates/new")}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable px-3 pb-4 space-y-3" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search estimates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm py-2"
            />
          </div>
        </div>

        {/* Status Tabs - Hidden for employees */}
        {!isEmployee ? (
          <Tabs 
            value={statusFilter} 
            onValueChange={setStatusFilter} 
            className="space-y-3"
          >
            <TabsList className="w-full grid grid-cols-2 h-9">
              <TabsTrigger value="activate" className="text-xs py-1.5 px-2">Activate</TabsTrigger>
              <TabsTrigger value="deactivated" className="text-xs py-1.5 px-2">Deactivated</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-1.5">
              {(() => {
                const estimates = filteredEstimates;
                const showFilters = statusFilter !== "deactivated";

                return (
                  <div className="space-y-2.5">
                    {showFilters && (
                      <div className="flex gap-2">
                        <div className="flex-1 min-w-0">
                          <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
                            <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Unpaid">Unpaid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {estimates.length > 0 ? (
                      <div className="space-y-2">
                        {estimates.map(estimate => (
                          <EstimateCard 
                            key={estimate.id}
                            estimate={estimate}
                            onClick={() => navigate(`/estimates/${estimate.id}`)}
                            payButton={
                              statusFilter === "activate" && estimate.status === "Unpaid" ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePayNow(estimate.id, e);
                                  }}
                                >
                                  Pay
                                </Button>
                              ) : undefined
                            }
                            actionButtons={renderActionButtons(estimate, statusFilter)}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                        title="No estimates found"
                        description="Try adjusting your search or filters"
                        actionLabel="Create Estimate"
                        onAction={() => navigate("/estimates/new")}
                      />
                    )}
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        ) : (
          // Employee view: No tabs, just the list with filters
          <div className="space-y-2.5">
            {/* Status Filter */}
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
                  <SelectTrigger className="w-full h-9 text-xs py-2 px-3">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estimates List */}
            {filteredEstimates.length > 0 ? (
              <div className="space-y-2">
                {filteredEstimates.map(estimate => (
                  <EstimateCard 
                    key={estimate.id}
                    estimate={estimate}
                    onClick={() => navigate(`/estimates/${estimate.id}`)}
                    payButton={
                      estimate.status === "Unpaid" ? (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-auto min-h-0 px-2 py-1 text-xs font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl shadow-sm hover:shadow-md transition-all leading-tight"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(estimate.id, e);
                          }}
                        >
                          Pay
                        </Button>
                      ) : undefined
                    }
                    actionButtons={renderActionButtons(estimate, "activate")}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                title="No estimates found"
                description="Try adjusting your search or filters"
                actionLabel="Create Estimate"
                onAction={() => navigate("/estimates/new")}
              />
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedEstimate && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedEstimate(null);
          }}
          amount={selectedEstimate.amount}
          onPaymentMethodSelect={handlePaymentMethodSelect}
        />
      )}

      {/* Preview Estimate Modal */}
      {previewEstimate && (
        <PreviewEstimateModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewEstimate(null);
          }}
          estimate={previewEstimate}
          onAction={(action) => {
            if (action === "pay-now") {
              setShowPreviewModal(false);
              setSelectedEstimate({ id: previewEstimate.id, amount: previewEstimate.amount });
              setShowPaymentModal(true);
            } else if (action === "edit") {
              navigate(`/estimates/${previewEstimate.id}/edit`);
              setShowPreviewModal(false);
            } else {
              handleMenuAction(action, previewEstimate.id);
            }
          }}
        />
      )}

      {/* Send Email Modal */}
      {selectedEstimateForAction && (
        <SendEmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedEstimateForAction(null);
          }}
          customerEmail={selectedEstimateForAction.customerEmail}
          customerName={selectedEstimateForAction.customerName}
        />
      )}

      {/* Send SMS Modal */}
      {selectedEstimateForAction && (
        <SendSmsModal
          isOpen={showSMSModal}
          onClose={() => {
            setShowSMSModal(false);
            setSelectedEstimateForAction(null);
          }}
          customerPhone={selectedEstimateForAction.customerPhone || ""}
          customerCountryCode="+1"
          entityId={selectedEstimateForAction.id}
          entityType="estimate"
          customerName={selectedEstimateForAction.customerName}
        />
      )}

      {/* Reassign Employee Modal */}
      {selectedEstimateForAction && (
        <ReassignEmployeeModal
          isOpen={showReassignModal}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedEstimateForAction(null);
          }}
          currentEmployeeId={selectedEstimateForAction.currentEmployeeId}
          estimateId={selectedEstimateForAction.id}
        />
      )}

      {/* Share Address Modal */}
      {selectedEstimateForAction && (
        <ShareAddressModal
          isOpen={showShareAddressModal}
          onClose={() => {
            setShowShareAddressModal(false);
            setSelectedEstimateForAction(null);
          }}
          jobAddress={selectedEstimateForAction.jobAddress}
          estimateId={selectedEstimateForAction.id}
        />
      )}

      {/* Preview Invoice Modal */}
      {previewInvoice && (
        <PreviewInvoiceModal
          isOpen={showInvoicePreview}
          onClose={() => {
            setShowInvoicePreview(false);
            setPreviewInvoice(null);
          }}
          invoice={previewInvoice}
          onAction={(action) => {
            if (action === "close" || action === "edit") {
              setShowInvoicePreview(false);
              setPreviewInvoice(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default Estimates;
