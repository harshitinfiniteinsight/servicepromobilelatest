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

interface AssociateDocumentsModalProps {
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
  jobId?: string;
  job_id?: string;
}

const statusColors: Record<string, string> = {
  // Invoice statuses
  "Open": "bg-blue-100 text-blue-700",
  "Paid": "bg-green-100 text-green-700",
  "Overdue": "bg-red-100 text-red-700",
  "Deactivated": "bg-gray-100 text-gray-700",
  // Estimate statuses
  "Unpaid": "bg-yellow-100 text-yellow-700",
  "Converted to Invoice": "bg-green-100 text-green-700",
  // Agreement statuses
  "Active": "bg-green-100 text-green-700",
};

const tabConfig: { key: DocumentTab; label: string; icon: React.ElementType }[] = [
  { key: "invoice", label: "Invoice", icon: Receipt },
  { key: "estimate", label: "Estimate", icon: FileText },
  { key: "agreement", label: "Agreement", icon: FileCheck },
];

const AssociateDocumentsModal = ({
  isOpen,
  onClose,
  jobId,
  customerId,
  onDocumentAssociated,
  initialTab,
}: AssociateDocumentsModalProps) => {
  const [activeTab, setActiveTab] = useState<DocumentTab>("invoice");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isAssociating, setIsAssociating] = useState(false);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Default to invoice when no initial tab is provided
      setActiveTab((initialTab || "invoice") as DocumentTab);
      setSearchQuery("");
      setSelectedDocumentId(null);
      setShowAllCustomers(false);
    }
  }, [isOpen, initialTab]);

  // Track analytics on open
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

  // Get documents for the active tab
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
          jobId: inv.jobId,
          job_id: (inv as any).job_id,
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
          jobId: (est as any).jobId,
          job_id: (est as any).job_id,
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
          jobId: (agr as any).jobId,
          job_id: (agr as any).job_id,
        }));
        break;
    }

    return rawDocs;
  }, [activeTab]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Show only records that are not linked to any job
    result = result.filter((doc) => {
      const linkedJobId = getJobForDocument(activeTab, doc.id);
      const legacyLinkedJobId = doc.jobId || doc.job_id;
      return !linkedJobId && !legacyLinkedJobId;
    });

    // Filter by customer if not showing all
    if (!showAllCustomers && customerId) {
      result = result.filter(doc => doc.customerId === customerId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.id.toLowerCase().includes(query) ||
          doc.customerName?.toLowerCase().includes(query)
      );
    }

    // Sort: same customer first, then by date (most recent first)
    result = [...result].sort((a, b) => {
      // Same customer first
      if (customerId) {
        const aMatch = a.customerId === customerId ? 1 : 0;
        const bMatch = b.customerId === customerId ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }

      // Then by date (most recent first)
      const aDate = new Date(a.date || "2000-01-01").getTime();
      const bDate = new Date(b.date || "2000-01-01").getTime();
      return bDate - aDate;
    });

    return result;
  }, [documents, searchQuery, customerId, showAllCustomers]);

  // Check documents that are already linked
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
        
        // Analytics event
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
        
        // Analytics event
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

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "invoice":
        return "Search invoices...";
      case "estimate":
        return "Search estimates...";
      case "agreement":
        return "Search agreements...";
      default:
        return "Search...";
    }
  };

  // Get modal title based on job source type
  const getModalTitle = () => {
    // Always display "Link to Job" regardless of entity type (invoice/estimate/agreement)
    return "Link to Job";
  };

  const sameCustomerCount = useMemo(() => {
    if (!customerId) return 0;
    return documents.filter(doc => doc.customerId === customerId).length;
  }, [documents, customerId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Associate Document to Job</DialogTitle>
        <DialogDescription className="sr-only">
          Select a document to associate with Job {jobId}
        </DialogDescription>

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
              <p className="font-medium">Job ID: {jobId}</p>
            </div>
          </div>

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

          {/* Entity Selector + Search */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-[42%]">
                <select
                  value={activeTab}
                  onChange={(e) => {
                    setActiveTab(e.target.value as DocumentTab);
                    setSelectedDocumentId(null);
                  }}
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {tabConfig.map((tab) => (
                    <option key={tab.key} value={tab.key}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
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
                      ? `No unlinked ${getTabLabel().toLowerCase()}s available`
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
              {isAssociating ? "Associating..." : "Link to Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssociateDocumentsModal;
