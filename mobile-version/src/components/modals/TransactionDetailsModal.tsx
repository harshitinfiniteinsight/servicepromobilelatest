import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransactionStatus = "Paid" | "Received" | "Refunded";

export interface TransactionRecord {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail?: string;
  customerId: string;
  jobId: string | null;
  referenceId: string;
  referenceType: "Invoice" | "Estimate" | "Agreement";
  amount: number;
  status: TransactionStatus;
  paymentMethod: "Card" | "Check" | "Cash" | "Bank Transfer";
  cardLast4?: string;
  cardExpiry?: string;
  cardBrand?: "VISA" | "Mastercard" | "Amex" | "Discover";
  transactionNumber: string;
  merchantId?: string;
  authorizationCode?: string;
  orderType?: string;
  processedBy?: string;
  transactionStatus?: string;
  transactionNotes?: string;
  totalAmount?: number;
  refundedAmount?: number;
  refundReason?: string;
  refundDate?: string;
  refundedAt?: string;
  createdAt?: string;
  refunds?: Array<{
    refundDate?: string;
    refundedAt?: string;
    createdAt?: string;
  }>;
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionRecord | null;
}

const DetailRow = ({ label, value, isLongText }: { label: string; value: string; isLongText?: boolean }) => (
  <div className={cn("flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-b-0", isLongText && "flex-col")}>
    <span className="text-[13px] text-gray-500 flex-shrink-0">{label}</span>
    <span className={cn("text-[13px] font-semibold text-gray-900 text-right break-words", isLongText && "text-left w-full mt-0.5")}>
      {value}
    </span>
  </div>
);

const TransactionDetailsModal = ({ isOpen, onClose, transaction }: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMaskedCard = () => {
    if (transaction.paymentMethod !== "Card" || !transaction.cardLast4) return "-";
    const brand = transaction.cardBrand ? `${transaction.cardBrand} •` : "";
    const expiry = transaction.cardExpiry ? ` • Exp ${transaction.cardExpiry}` : "";
    return `${brand} •••• ${transaction.cardLast4}${expiry}`;
  };

  const getLatestRefundDateLabel = () => {
    const candidates: string[] = [];

    if (transaction.refundDate) candidates.push(transaction.refundDate);
    if (transaction.refundedAt) candidates.push(transaction.refundedAt);
    if (transaction.createdAt) candidates.push(transaction.createdAt);

    if (Array.isArray(transaction.refunds)) {
      transaction.refunds.forEach((refund) => {
        if (refund.refundDate) candidates.push(refund.refundDate);
        if (refund.refundedAt) candidates.push(refund.refundedAt);
        if (refund.createdAt) candidates.push(refund.createdAt);
      });
    }

    // Fallback to transaction date+time for refunded records if explicit refund timestamp is absent
    if (candidates.length === 0 && transaction.status === "Refunded" && transaction.date) {
      const fallback = `${transaction.date}${transaction.time ? ` ${transaction.time}` : ""}`;
      const parsedFallback = new Date(fallback);
      if (!isNaN(parsedFallback.getTime())) {
        return parsedFallback.toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).replace(",", " •");
      }
      return null;
    }

    const validDates = candidates
      .map((value) => new Date(value))
      .filter((d) => !isNaN(d.getTime()));

    if (validDates.length === 0) return null;

    const latest = validDates.sort((a, b) => b.getTime() - a.getTime())[0];
    return latest
      .toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " •");
  };

  const highlightedAmount =
    transaction.status === "Refunded"
      ? formatAmount(transaction.refundedAmount ?? transaction.amount)
      : formatAmount(transaction.amount);

  const latestRefundDateLabel = getLatestRefundDateLabel();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 m-0 flex h-full max-h-full w-full max-w-full flex-col gap-0 rounded-none p-0 sm:!left-1/2 sm:!top-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[420px] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">Transaction Details</DialogTitle>
        <DialogDescription className="sr-only">
          View complete transaction details for {transaction.id}
        </DialogDescription>

        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3.5 py-2.5 safe-top">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <h2 className="text-[15px] font-semibold text-gray-900">Transaction Details</h2>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="space-y-3 px-3.5 py-3.5 pb-5">
            {/* SUMMARY SECTION */}
            <div className="rounded-lg border border-gray-200 bg-white p-3.5">
              {/* Row 1: Amount (left) + Status Badge (right) */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <p
                  className={cn(
                    "text-[2.25rem] leading-none font-bold",
                    transaction.status === "Refunded" ? "text-red-600" : "text-green-600"
                  )}
                >
                  {highlightedAmount}
                </p>
                <Badge
                  className={cn(
                    "h-6 px-2.5 text-[11px] font-semibold flex-shrink-0",
                    transaction.status === "Refunded"
                      ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
                      : "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                  )}
                >
                  {transaction.status}
                </Badge>
              </div>

              {/* Row 2: Transaction ID (below amount on left) */}
              <p className="text-[12px] text-gray-500 font-medium mb-0.5">{transaction.id}</p>

              {/* Row 3: Created On */}
              <p className="text-[11px] text-gray-500">
                Created {formatDate(transaction.date)} at {transaction.time}
              </p>
            </div>

            {/* TRANSACTION DETAILS SECTION */}
            <div className="rounded-lg border border-gray-200 bg-white p-3.5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-2">Transaction Details</h3>
              {transaction.merchantId && <DetailRow label="Merchant ID" value={transaction.merchantId} />}
              <DetailRow label="Transaction ID" value={transaction.id} />
              {transaction.authorizationCode && <DetailRow label="Authorization Code" value={transaction.authorizationCode} />}
              <DetailRow label="Transaction Date" value={formatDate(transaction.date)} />
              {transaction.orderType && <DetailRow label="Order Type" value={transaction.orderType} />}
              <DetailRow label="Invoice / Order ID" value={transaction.referenceId} />
            </div>

            {/* PAYMENT METHOD SECTION */}
            <div className="rounded-lg border border-gray-200 bg-white p-3.5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-2">Payment Method</h3>
              <DetailRow label="Payment Method" value={transaction.paymentMethod} />
              {transaction.paymentMethod === "Card" && (
                <DetailRow label="Card Details" value={getMaskedCard()} />
              )}
            </div>

            {/* CUSTOMER DETAILS SECTION */}
            <div className="rounded-lg border border-gray-200 bg-white p-3.5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-2">Customer Details</h3>
              <DetailRow label="Customer Name" value={transaction.customerName} />
              {transaction.customerEmail && (
                <DetailRow label="Customer Email" value={transaction.customerEmail} isLongText={true} />
              )}
            </div>

            {/* SYSTEM INFO SECTION */}
            <div className="rounded-lg border border-gray-200 bg-white p-3.5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-2">System Info</h3>
              {transaction.processedBy && <DetailRow label="Processed By" value={transaction.processedBy} />}
              {transaction.transactionStatus && <DetailRow label="Transaction Status" value={transaction.transactionStatus} />}
              {transaction.transactionNotes && (
                <DetailRow label="Transaction Notes" value={transaction.transactionNotes} isLongText={true} />
              )}
            </div>

            {/* REFUND INFO SECTION (if refunded) */}
            {transaction.status === "Refunded" && (transaction.refundedAmount || transaction.refundReason) && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3.5">
                <h3 className="text-[15px] font-semibold text-red-900 mb-2">Refund Information</h3>
                {transaction.totalAmount !== undefined && (
                  <DetailRow 
                    label="Original Amount" 
                    value={formatAmount(transaction.totalAmount)} 
                  />
                )}
                {transaction.refundedAmount !== undefined && (
                  <DetailRow 
                    label="Refunded Amount" 
                    value={formatAmount(transaction.refundedAmount)} 
                  />
                )}
                {transaction.totalAmount !== undefined && transaction.refundedAmount !== undefined && 
                  transaction.refundedAmount < transaction.totalAmount && (
                  <DetailRow 
                    label="Remaining Balance" 
                    value={formatAmount(transaction.totalAmount - transaction.refundedAmount)} 
                  />
                )}
                {latestRefundDateLabel && (
                  <DetailRow
                    label="Refund Date"
                    value={latestRefundDateLabel}
                  />
                )}
                {transaction.refundReason && (
                  <DetailRow 
                    label="Reason" 
                    value={transaction.refundReason} 
                    isLongText={true}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
