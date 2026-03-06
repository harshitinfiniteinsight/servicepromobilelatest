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
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionRecord | null;
}

const DetailRow = ({ label, value, isLongText }: { label: string; value: string; isLongText?: boolean }) => (
  <div className={cn("flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-b-0", isLongText && "flex-col")}>
    <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
    <span className={cn("text-sm font-semibold text-gray-900 text-right break-words", isLongText && "text-left w-full mt-1")}>
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

  const highlightedAmount =
    transaction.status === "Refunded"
      ? formatAmount(transaction.refundedAmount ?? transaction.amount)
      : formatAmount(transaction.amount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 m-0 flex h-full max-h-full w-full max-w-full flex-col gap-0 rounded-none p-0 sm:!left-1/2 sm:!top-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[420px] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">Transaction Details</DialogTitle>
        <DialogDescription className="sr-only">
          View complete transaction details for {transaction.id}
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 safe-top">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <h2 className="text-base font-semibold text-gray-900">Transaction Details</h2>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="space-y-4 px-4 py-5 pb-8">
            {/* SUMMARY SECTION */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              {/* Row 1: Amount (left) + Status Badge (right) */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <p
                  className={cn(
                    "text-3xl font-bold",
                    transaction.status === "Refunded" ? "text-red-600" : "text-green-600"
                  )}
                >
                  {highlightedAmount}
                </p>
                <Badge
                  className={cn(
                    "h-7 px-3 text-xs font-semibold flex-shrink-0",
                    transaction.status === "Refunded"
                      ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
                      : "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                  )}
                >
                  {transaction.status}
                </Badge>
              </div>

              {/* Row 2: Transaction ID (below amount on left) */}
              <p className="text-xs text-gray-500 font-medium mb-2">{transaction.id}</p>

              {/* Row 3: Created On */}
              <p className="text-xs text-gray-500">
                Created {formatDate(transaction.date)} at {transaction.time}
              </p>
            </div>

            {/* TRANSACTION DETAILS SECTION */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Transaction Details</h3>
              {transaction.merchantId && <DetailRow label="Merchant ID" value={transaction.merchantId} />}
              <DetailRow label="Transaction ID" value={transaction.id} />
              {transaction.authorizationCode && <DetailRow label="Authorization Code" value={transaction.authorizationCode} />}
              <DetailRow label="Transaction Date" value={formatDate(transaction.date)} />
              {transaction.orderType && <DetailRow label="Order Type" value={transaction.orderType} />}
              <DetailRow label="Invoice / Order ID" value={transaction.referenceId} />
            </div>

            {/* PAYMENT METHOD SECTION */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Method</h3>
              <DetailRow label="Payment Method" value={transaction.paymentMethod} />
              {transaction.paymentMethod === "Card" && (
                <DetailRow label="Card Details" value={getMaskedCard()} />
              )}
            </div>

            {/* CUSTOMER DETAILS SECTION */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Details</h3>
              <DetailRow label="Customer Name" value={transaction.customerName} />
              {transaction.customerEmail && (
                <DetailRow label="Customer Email" value={transaction.customerEmail} isLongText={true} />
              )}
            </div>

            {/* SYSTEM INFO SECTION */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">System Info</h3>
              {transaction.processedBy && <DetailRow label="Processed By" value={transaction.processedBy} />}
              {transaction.transactionStatus && <DetailRow label="Transaction Status" value={transaction.transactionStatus} />}
              {transaction.transactionNotes && (
                <DetailRow label="Transaction Notes" value={transaction.transactionNotes} isLongText={true} />
              )}
            </div>

            {/* REFUND INFO SECTION (if refunded) */}
            {transaction.status === "Refunded" && (transaction.refundedAmount || transaction.refundReason) && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="text-sm font-semibold text-red-900 mb-3">Refund Information</h3>
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
