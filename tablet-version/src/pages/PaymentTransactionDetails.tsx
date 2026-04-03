import { useLocation } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TransactionRecord } from "../components/modals/TransactionDetailsModal";

const DetailRow = ({ label, value, isLongText }: { label: string; value: string; isLongText?: boolean }) => (
  <div className={cn("flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-b-0", isLongText && "flex-col")}>
    <span className="text-[13px] text-gray-500 flex-shrink-0">{label}</span>
    <span className={cn("text-[13px] font-semibold text-gray-900 text-right break-words", isLongText && "text-left w-full mt-0.5 whitespace-pre-wrap")}>
      {value}
    </span>
  </div>
);

const PaymentTransactionDetails = () => {
  const location = useLocation();
  const transaction = (location.state as { transaction?: TransactionRecord } | null)?.transaction || null;

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
    if (!transaction || transaction.paymentMethod !== "Card" || !transaction.cardLast4) return "-";
    const brand = transaction.cardBrand ? `${transaction.cardBrand} •` : "";
    const expiry = transaction.cardExpiry ? ` • Exp ${transaction.cardExpiry}` : "";
    return `${brand} •••• ${transaction.cardLast4}${expiry}`;
  };

  const getLatestRefundDateLabel = () => {
    if (!transaction) return null;

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

  if (!transaction) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-gray-50">
        <TabletHeader title="Transaction Details" showBack={true} />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-gray-500">Transaction details are not available.</p>
        </div>
      </div>
    );
  }

  const highlightedAmount =
    transaction.status === "Refunded"
      ? formatAmount(transaction.refundedAmount ?? transaction.amount)
      : formatAmount(transaction.amount);

  const latestRefundDateLabel = getLatestRefundDateLabel();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <TabletHeader title="Transaction Details" showBack={true} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
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

            <p className="text-[12px] text-gray-500 font-medium mb-0.5">{transaction.id}</p>

            <p className="text-[11px] text-gray-500">
              Created {formatDate(transaction.date)} at {transaction.time}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-[18px] font-semibold text-gray-900 mb-2">Transaction Details</h3>
            {transaction.merchantId && <DetailRow label="Merchant ID" value={transaction.merchantId} />}
            <DetailRow label="Transaction ID" value={transaction.id} />
            {transaction.authorizationCode && <DetailRow label="Authorization Code" value={transaction.authorizationCode} />}
            <DetailRow label="Transaction Date" value={formatDate(transaction.date)} />
            {transaction.orderType && <DetailRow label="Order Type" value={transaction.orderType} />}
            <DetailRow label="Invoice / Order ID" value={transaction.referenceId} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-[18px] font-semibold text-gray-900 mb-2">Payment Method</h3>
            <DetailRow label="Payment Method" value={transaction.paymentMethod} />
            {transaction.paymentMethod === "Card" && (
              <DetailRow label="Card Details" value={getMaskedCard()} />
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-[18px] font-semibold text-gray-900 mb-2">Customer Details</h3>
            <DetailRow label="Customer Name" value={transaction.customerName} />
            {transaction.customerEmail && (
              <DetailRow label="Customer Email" value={transaction.customerEmail} isLongText={true} />
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-[18px] font-semibold text-gray-900 mb-2">System Info</h3>
            {transaction.processedBy && <DetailRow label="Processed By" value={transaction.processedBy} />}
            {transaction.transactionStatus && <DetailRow label="Transaction Status" value={transaction.transactionStatus} />}
            {transaction.transactionNotes && (
              <DetailRow label="Transaction Notes" value={transaction.transactionNotes} isLongText={true} />
            )}
          </div>

          {transaction.status === "Refunded" && (transaction.refundedAmount || transaction.refundReason) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-[18px] font-semibold text-red-900 mb-2">Refund Information</h3>
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
    </div>
  );
};

export default PaymentTransactionDetails;
