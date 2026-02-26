import { useState, useEffect, useMemo } from "react";
import { X, Search, FileText, Receipt, FileCheck, Calendar, User, CheckCircle, Link, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  assignToJob, 
  getJobForDocument,
  type DocumentType 
} from "@/services/jobAssignmentService";
import { mockInvoices, mockEstimates, mockAgreements } from "@/data/mobileMockData";

interface AssociateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  customerId?: string;
  onDocumentAssociated?: (documentType: DocumentType, documentId: string) => void;
  initialTab?: "invoice" | "estimate" | "agreement";
  jobSourceType?: "invoice" | "estimate" | "agreement" | "none";
}

type DocumentTab = "invoice" | "estimate" | "agreement";

interface DocumentItem {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  status: string;
  type?: string;
}

const statusColors: Record<string, string> = {
  "Open": "bg-blue-100 text-blue-700",
  "Paid": "bg-green-100 text-green-700",
  "Overdue": "bg-red-100 text-red-700",
  "Deactivated": "bg-gray-100 text-gray-700",
  "Unpaid": "bg-yellow-100 text-yellow-700",
  "Converted to Invoice": "bg-green-100 text-green-700",
  "Active": "bg-green-100 text-green-700",
};

const tabConfig: { key: DocumentTab; label: string; icon: React.ElementType }[] = [
  { key: "invoice", label: "Invoices", icon: Receipt },
  { key: "estimate", label: "Estimates", icon: FileText },
  { key: "agreement", label: "Agreements", icon: FileCheck },
];

const AssociateInvoiceModal = ({
  isOpen,
  onClose,
  jobId,
  customerId,
  onDocumentAssociated,
  initialTab = "invoice",
  jobSourceType,
}: AssociateInvoiceModalProps) => {
  const isSourceTypeRestricted = jobSourceType && jobSourceType !== "none";
  const restrictedSourceType = isSourceTypeRestricted ? jobSourceType : undefined;
  const [activeTab, setActiveTab] = useState<DocumentTab>("invoice");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isAssociating, setIsAssociating] = useState(false);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultTab = restrictedSourceType || initialTab || "invoice";
      setActiveTab(defaultTab as DocumentTab);
      setSearchQuery("");
      setSelectedDocumentId(null);
      setShowAllCustomers(false);
    }
  }, [isOpen, initialTab, restrictedSourceType]);

  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(
        new CustomEvent("analytics", {
          detail: {
            event: "associate_from_job_clicked",
            jobId,
          },
        })
      );
    }
  }, [isOpen, jobId]);

  const documents = useMemo((): DocumentItem[] => {
    let rawDocs: any[] = [];

    switch (activeTab) {
      case "invoice":
        rawDocs = mockInvoices.map(inv => ({
          id: inv.id,
          customerId: inv.customerId,
          customerName: inv.customerName,
          date: inv.issueDate,
          amount: inv.amount,
          status: inv.status,
          type: inv.type,
        }));
        break;
      case "estimate":
        rawDocs = mockEstimates.map(est => ({
          id: est.id,
          customerId: est.customerId,
          customerName: est.customerName,
          date: est.date,
          amount: est.amount,
          status: est.status,
        }));
        break;
      case "agreement":
        rawDocs = mockAgreements.map(agr => ({
          id: agr.id,
          customerId: agr.customerId,
          customerName: agr.customerName,
          date: agr.startDate,
          amount: agr.monthlyAmount,
          status: agr.status,
          type: agr.type,
        }));
        break;
    }

    return rawDocs;
  }, [activeTab]);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (!showAllCustomers && customerId) {
      result = result.filter(doc => doc.customerId === customerId);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.id.toLowerCase().includes(query) ||
          doc.customerName?.toLowerCase().includes(query)
      );
    }

    result = [...result].sort((a, b) => {
      if (customerId) {
        const aMatch = a.customerId === customerId ? 1 : 0;
        const bMatch = b.customerId === customerId ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }

      const aDate = new Date(a.date || "2000-01-01").getTime();
      const bDate = new Date(b.date || "2000-01-01").getTime();
      return bDate - aDate;
    });

    return result;
  }, [documents, searchQuery, customerId, showAllCustomers]);

  const getDocumentLinkStatus = (documentId: string): { isLinkedToThisJob: boolean; linkedToOtherJob: string | null } => {
    const linkedJobId = getJobForDocument(activeTab, documentId);
    if (!linkedJobId) {
      return { isLinkedToThisJob: false, linkedToOtherJob: null };
    }
    if (linkedJobId === jobId) {
      return { isLinkedToThisJob: true, linkedToOtherJob: null };
    }
    return { isLinkedToThisJob: false, linkedToOtherJob: linkedJobId };
  };

  const handleAssociate = async () => {
    if (!selectedDocumentId) {
      toast.error("Please select a document");
      return;
    }

    setIsAssociating(true);

    try {
      const result = assignToJob(activeTab, selectedDocumentId, jobId);

      if (result.success) {
        toast.success(`${getTabLabel()} associated successfully`);
        
        window.dispatchEvent(
          new CustomEvent("analytics", {
            detail: {
              event: "associate_from_job_success",
              jobId,
              documentType: activeTab,
              documentId: selectedDocumentId,
            },
          })
        );

        onDocumentAssociated?.(activeTab, selectedDocumentId);
        onClose();
      } else {
        toast.error(result.error || "Failed to associate document");
        
        window.dispatchEvent(
          new CustomEvent("analytics", {
            detail: {
              event: "associate_from_job_failed",
              jobId,
              documentType: activeTab,
              documentId: selectedDocumentId,
              error: result.error,
            },
          })
        );
      }
    } catch (error) {
      toast.error("An error occurred while associating document");
      console.error("Associate document error:", error);
    } finally {
      setIsAssociating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case "invoice":
        return "Invoice";
      case "estimate":
        return "Estimate";
      case "agreement":
        return "Agreement";
      default:
        return "Document";
    }
  };

  const getModalTitle = () => {
    switch (jobSourceType) {
      case "invoice":
        return "Associate Invoice";
      case "estimate":
        return "Associate Estimate";
      case "agreement":
        return "Associate Agreement";
      default:
        return "Associate Document";
    }
  };

  const allowedTabs = useMemo(() => {
    if (!isSourceTypeRestricted) {
      return tabConfig;
    }
    return tabConfig.filter(tab => tab.key === restrictedSourceType);
  }, [isSourceTypeRestricted, restrictedSourceType]);

  const sameCustomerCount = useMemo(() => {
    if (!customerId) return 0;
    return documents.filter(doc => doc.customerId === customerId).length;
  }, [documents, customerId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tablet:max-w-3xl tablet:w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl tablet:max-h-[80vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Associate Document to Job</DialogTitle>
        <DialogDescription className="sr-only">
          Select a document to associate with Job {jobId}
        </DialogDescription>

        {/* ===== TABLET LAYOUT ===== */}
        <div className="tablet:flex tablet:flex-col tablet:h-full hidden">
          {/* Fixed Header - Tablet design matching mobile header */}
          <div className="bg-primary text-white px-8 py-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Link className="h-6 w-6 text-white" />
              <h2 className="text-2xl font-bold text-white">{getModalTitle()}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col bg-background">
            {/* Fixed: Job Context Banner */}
            <div className="px-8 pt-6 pb-4 flex-shrink-0">
              <div className="bg-muted border border-border rounded-lg p-4">
                <p className="text-foreground font-semibold text-lg">Associating to: <span className="font-mono text-muted-foreground">{jobId}</span></p>
              </div>
            </div>

            {/* Fixed: Filter Section - Horizontal Layout */}
            <div className="px-8 pb-6 flex-shrink-0">
              <div className="bg-card rounded-lg border border-border p-4 space-y-4">
                {/* Checkbox and Search in one row */}
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Customer Filter */}
                  {customerId && (
                    <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={showAllCustomers}
                        onChange={(e) => setShowAllCustomers(e.target.checked)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground font-medium">
                        Show all customers <span className="text-muted-foreground">({sameCustomerCount} same customer)</span>
                      </span>
                    </label>
                  )}

                  {/* Right: Search Input */}
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder={`Search ${getTabLabel().toLowerCase()}s...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Type Tabs - Only show if multiple types allowed */}
                {allowedTabs.length > 1 && (
                  <div className="flex gap-2">
                    {allowedTabs.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveTab(key);
                          setSelectedDocumentId(null);
                          setSearchQuery("");
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                          activeTab === key
                            ? "bg-primary text-primary-foreground border border-primary"
                            : "bg-muted text-foreground border border-border hover:border-input"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable: Invoice List - Single Column Layout */}
            <div className={cn(
              "px-8 pb-8 flex-1 flex flex-col min-h-0",
              filteredDocuments.length > 5 ? "overflow-y-auto" : "overflow-hidden"
            )}>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-lg border border-border">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground font-semibold text-lg mb-2">No {getTabLabel().toLowerCase()}s found</p>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search"
                      : showAllCustomers
                      ? `No ${getTabLabel().toLowerCase()}s available`
                      : "Try enabling 'Show all customers'"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredDocuments.map((doc) => {
                    const isSelected = selectedDocumentId === doc.id;
                    const linkStatus = getDocumentLinkStatus(doc.id);
                    const isDisabled = linkStatus.isLinkedToThisJob;

                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedDocumentId(isSelected ? null : doc.id);
                          }
                        }}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : isDisabled
                            ? "border-border bg-muted/30 cursor-not-allowed opacity-60"
                            : linkStatus.linkedToOtherJob
                            ? "border-border bg-warning/5 hover:border-warning/50"
                            : "border-border hover:border-input bg-card"
                        )}
                      >
                          {/* Top Row: Invoice # + Status | Amount */}
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-lg text-foreground">{doc.id}</span>
                              <Badge
                                className={cn(
                                  "text-xs px-2 py-1",
                                  statusColors[doc.status] || "bg-muted text-foreground"
                                )}
                              >
                                {doc.status}
                              </Badge>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold text-foreground">
                                {formatAmount(doc.amount)}
                              </p>
                            </div>
                          </div>

                          {/* Bottom Row: Customer + Date + Badges */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <span className="text-sm text-foreground truncate">{doc.customerName}</span>
                              {customerId && doc.customerId === customerId && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 flex-shrink-0">
                                  Same
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-muted-foreground">{formatDate(doc.date)}</span>
                              {isDisabled && (
                                <Badge className="text-xs px-2 py-0.5 bg-success/20 text-success">
                                  Linked
                                </Badge>
                              )}
                              {linkStatus.linkedToOtherJob && (
                                <Badge className="text-xs px-2 py-0.5 bg-warning/20 text-warning">
                                  {linkStatus.linkedToOtherJob}
                                </Badge>
                              )}
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* Fixed Footer - Standard app buttons */}
            <div className="px-8 py-4 border-t border-border bg-card flex gap-3 justify-end flex-shrink-0">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 h-11 text-base font-medium"
                disabled={isAssociating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssociate}
                className="px-8 h-11 text-base font-medium"
                disabled={!selectedDocumentId || isAssociating}
              >
                {isAssociating ? "Associating..." : "Associate"}
              </Button>
            </div>
          </div>
        </div>

        {/* ===== MOBILE LAYOUT (fallback - hidden on tablet) ===== */}
        <div className="tablet:hidden">
          {/* Header with orange background */}
          <div className="bg-orange-500 text-white px-4 py-4 flex items-center justify-between safe-top">
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              <h2 className="text-lg sm:text-xl font-bold text-white">{getModalTitle()}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-orange-600 h-9 w-9 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="bg-white flex flex-col overflow-hidden safe-bottom">
            {/* Job Context */}
            <div className="px-4 pt-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium">Associating to: {jobId}</p>
              </div>
            </div>

            {/* Document Type Tabs - Only show if multiple types allowed */}
            {allowedTabs.length > 1 && (
              <div className="px-4 pt-4">
                <div className="flex rounded-lg bg-gray-100 p-1">
                  {allowedTabs.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveTab(key);
                        setSelectedDocumentId(null);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all",
                        activeTab === key
                          ? "bg-white text-orange-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Filter Toggle */}
            {customerId && (
              <div className="px-4 pt-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllCustomers}
                    onChange={(e) => setShowAllCustomers(e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span>
                    Show all customers{" "}
                    <span className="text-gray-400">
                      ({sameCustomerCount} same customer)
                    </span>
                  </span>
                </label>
              </div>
            )}

            {/* Search */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${getTabLabel().toLowerCase()}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Documents List */}
            <ScrollArea className="flex-1 max-h-[40vh]">
              <div className="px-4 pb-4 space-y-2">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground font-medium">No {getTabLabel().toLowerCase()}s found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery
                        ? "Try adjusting your search"
                        : showAllCustomers
                        ? `No ${getTabLabel().toLowerCase()}s available`
                        : "Try enabling 'Show all customers'"}
                    </p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => {
                    const isSelected = selectedDocumentId === doc.id;
                    const linkStatus = getDocumentLinkStatus(doc.id);
                    const isDisabled = linkStatus.isLinkedToThisJob;

                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedDocumentId(isSelected ? null : doc.id);
                          }
                        }}
                        className={cn(
                          "p-3 rounded-lg border-2 cursor-pointer transition-all",
                          isSelected
                            ? "border-orange-500 bg-orange-50"
                            : isDisabled
                            ? "border-green-300 bg-green-50 cursor-not-allowed"
                            : linkStatus.linkedToOtherJob
                            ? "border-yellow-300 bg-yellow-50 hover:border-yellow-400"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {/* Row 1: Document ID + Status + Selected indicator */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{doc.id}</span>
                            <Badge
                              className={cn(
                                "text-[10px] px-1.5 py-0 h-4 leading-4",
                                statusColors[doc.status] || "bg-gray-100 text-gray-700"
                              )}
                            >
                              {doc.status}
                            </Badge>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-orange-500" />
                          )}
                          {isDisabled && (
                            <Badge className="text-[10px] px-1.5 py-0 h-4 leading-4 bg-green-100 text-green-700">
                              Linked
                            </Badge>
                          )}
                          {linkStatus.linkedToOtherJob && (
                            <Badge className="text-[10px] px-1.5 py-0 h-4 leading-4 bg-yellow-100 text-yellow-700">
                              {linkStatus.linkedToOtherJob}
                            </Badge>
                          )}
                        </div>

                        {/* Row 2: Customer + Amount */}
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-1 truncate text-sm">
                            <User className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate">{doc.customerName}</span>
                            {customerId && doc.customerId === customerId && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-3.5 leading-3.5 ml-1"
                              >
                                Same Customer
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 text-sm font-medium text-gray-900">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>{formatAmount(doc.amount).replace("$", "")}</span>
                          </div>
                        </div>

                        {/* Row 3: Date */}
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{formatDate(doc.date)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="px-4 py-4 border-t bg-white flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11"
                disabled={isAssociating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssociate}
                className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!selectedDocumentId || isAssociating}
              >
                {isAssociating ? "Associating..." : "Associate"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssociateInvoiceModal;
