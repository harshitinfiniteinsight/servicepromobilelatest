import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  ChevronLeft,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type InvoicePayMethodId = "tap-to-pay" | "enter-card" | "ach" | "cash";
type Step = "select_method" | "enter_details";

export interface InvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Label shown in the header, e.g. "Invoice" or "Agreement" */
  entityLabel?: string;
  totalAmount: number;
  /** Already-paid amount; defaults to 0 */
  paidAmount?: number;
  onPaymentComplete: (method: string, amount: number) => void;
}

// ─── Financial Summary ────────────────────────────────────────────────────────
const FinancialSummary = ({
  total,
  paid,
  balance,
}: {
  total: number;
  paid: number;
  balance: number;
}) => (
  <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-1.5 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Total Amount</span>
      <span className="font-medium">${total.toFixed(2)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Amount Paid</span>
      <span className="font-medium text-green-600">${paid.toFixed(2)}</span>
    </div>
    <div className="flex justify-between border-t pt-1.5">
      <span className="font-semibold">Balance Due</span>
      <span className="font-bold text-orange-600">${balance.toFixed(2)}</span>
    </div>
  </div>
);

// ─── Payment methods ──────────────────────────────────────────────────────────
const METHODS: { id: InvoicePayMethodId; label: string; icon: React.ElementType }[] = [
  { id: "tap-to-pay",  label: "Tap to Pay",           icon: Smartphone  },
  { id: "enter-card",  label: "Enter Card Details",    icon: CreditCard  },
  { id: "ach",         label: "ACH / Bank Transfer",   icon: Building2   },
  { id: "cash",        label: "Cash",                  icon: Banknote    },
];

const METHOD_SETUP_LABELS: Record<Exclude<InvoicePayMethodId, "cash">, string> = {
  "tap-to-pay": "Setup Tap to Pay",
  "enter-card": "Setup Card",
  "ach": "Setup ACH",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function InvoicePaymentModal({
  isOpen,
  onClose,
  entityLabel = "Invoice",
  totalAmount,
  paidAmount = 0,
  onPaymentComplete,
}: InvoicePaymentModalProps) {
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  const [step, setStep]               = useState<Step>("select_method");
  const [selectedMethod, setMethod]   = useState<InvoicePayMethodId | null>(null);
  const [amount, setAmount]           = useState(balanceDue.toFixed(2));
  const [processing, setProcessing]   = useState(false);

  // Card fields
  const [cardNumber, setCardNumber]   = useState("");
  const [cardName, setCardName]       = useState("");
  const [expiry, setExpiry]           = useState("");
  const [cvv, setCvv]                 = useState("");
  const [zip, setZip]                 = useState("");
  const [cardAuth, setCardAuth]       = useState(false);

  // ACH fields
  const [routing, setRouting]         = useState("");
  const [account, setAccount]         = useState("");
  const [accountName, setAccountName] = useState("");
  const [achZip, setAchZip]           = useState("");
  const [achAuth, setAchAuth]         = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep("select_method");
    setMethod(null);
    setAmount(balanceDue.toFixed(2));
    setProcessing(false);
    setCardNumber(""); setCardName(""); setExpiry(""); setCvv(""); setZip(""); setCardAuth(false);
    setRouting(""); setAccount(""); setAccountName(""); setAchZip(""); setAchAuth(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSelectMethod = (method: InvoicePayMethodId) => {
    setMethod(method);
    setAmount(balanceDue.toFixed(2));
    setStep("enter_details");
  };

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const parsedAmount = parseFloat(amount) || 0;
  const isCash = selectedMethod === "cash";
  const changeDue = isCash ? Math.max(0, parsedAmount - balanceDue) : 0;
  const amountValid = parsedAmount > 0 && (isCash ? true : parsedAmount <= balanceDue);

  const canSubmit = (() => {
    if (!amountValid) return false;
    if (selectedMethod === "enter-card")
      return (
        cardNumber.replace(/\s/g, "").length >= 13 &&
        cardName.trim().length > 0 &&
        expiry.length >= 4 &&
        cvv.length >= 3 &&
        zip.length >= 5 &&
        cardAuth
      );
    if (selectedMethod === "ach")
      return (
        routing.length === 9 &&
        account.length >= 4 &&
        accountName.trim().length > 0 &&
        achZip.length >= 5 &&
        achAuth
      );
    return true; // cash / tap-to-pay
  })();

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedMethod || !canSubmit) return;
    if (selectedMethod === "enter-card" || selectedMethod === "ach") {
      setProcessing(true);
      await new Promise((res) => setTimeout(res, 1400));
      setProcessing(false);
    }
    const appliedAmount = isCash ? Math.min(parsedAmount, balanceDue) : parsedAmount;
    onPaymentComplete(selectedMethod, appliedAmount);
    reset();
    onClose();
  };

  const methodLabel = METHODS.find((m) => m.id === selectedMethod)?.label ?? "";
  const accessibleTitle = step === "select_method" ? `Pay ${entityLabel}` : `${methodLabel} payment details`;
  const accessibleDescription = `Total amount is $${totalAmount.toFixed(2)}, amount paid is $${paidAmount.toFixed(2)}, and balance due is $${balanceDue.toFixed(2)}.`;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="p-0 gap-0 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogTitle className="sr-only">{accessibleTitle}</DialogTitle>
        <DialogDescription className="sr-only">{accessibleDescription}</DialogDescription>
        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
          {step === "enter_details" && (
            <button
              className="text-white/80 hover:text-white mr-1"
              onClick={() => setStep("select_method")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="text-white font-semibold text-base flex-1">
            {step === "select_method" ? `Pay ${entityLabel}` : methodLabel}
          </h2>
          <button
            className="text-white/80 hover:text-white text-2xl leading-none pb-1"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* ── Step 1: method selection ── */}
          {step === "select_method" && (
            <>
              <div className="flex flex-col items-center space-y-2 px-6 pt-1">
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <CreditCard className="h-7 w-7 text-orange-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {paidAmount > 0 ? "Balance Due" : "Total Amount"}
                  </p>
                  <p className="text-4xl font-bold text-gray-900">${balanceDue.toFixed(2)}</p>
                  {paidAmount > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Total ${totalAmount.toFixed(2)} • Paid ${paidAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 w-full">
                <h3 className="text-xl font-bold text-gray-900 text-center">Payment Options</h3>
                <div className="w-full px-3 pb-2 box-border">
                  <div className="grid grid-cols-2 gap-4 w-full box-border">
                    {METHODS.map(({ id, label, icon: Icon }) => {
                      const isCash = id === "cash";
                      const setupLabel = !isCash
                        ? METHOD_SETUP_LABELS[id as Exclude<InvoicePayMethodId, "cash">]
                        : undefined;

                      return (
                        <div
                          key={id}
                          className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-xl transition-all min-h-[102px] hover:border-orange-500 hover:bg-orange-50 active:scale-95 cursor-pointer"
                          onClick={() => handleSelectMethod(id)}
                        >
                          <Icon className={`h-7 w-7 mb-2 ${isCash ? "text-orange-500" : "text-gray-400"}`} />
                          <span className={`text-sm font-medium text-center leading-tight whitespace-pre-line ${isCash ? "text-gray-900" : "text-gray-500"}`}>
                            {id === "enter-card" ? "Enter Card\nManually" : isCash ? "Pay by Cash" : label}
                          </span>
                          {!isCash && setupLabel && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMethod(id);
                              }}
                              className="mt-1 text-xs text-orange-500 underline font-medium hover:text-orange-600 active:scale-95"
                            >
                              {setupLabel}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: amount + method-specific fields ── */}
          {step === "enter_details" && selectedMethod && (
            <div className="space-y-4">
              <FinancialSummary total={totalAmount} paid={paidAmount} balance={balanceDue} />
              {/* Amount input */}
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount" className="text-sm font-medium">
                  Payment Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="pay-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={isCash ? undefined : balanceDue}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
                {isCash && (
                  <p className="text-xs text-muted-foreground">
                    Collect cash and return change if applicable
                  </p>
                )}
                {!isCash && parsedAmount > balanceDue && (
                  <p className="text-xs text-red-500">
                    Amount cannot exceed remaining balance
                  </p>
                )}
                {isCash && changeDue > 0 && (
                  <div className="rounded-xl border-2 border-green-300 bg-green-50 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700">
                      Change Due
                    </p>
                    <p className="mt-1 text-2xl font-bold text-green-700">
                      ${changeDue.toFixed(2)}
                    </p>
                  </div>
                )}
                {parsedAmount > 0 && parsedAmount < balanceDue && (
                  <p className="text-xs text-amber-600">
                    Partial payment — ${(balanceDue - parsedAmount).toFixed(2)} will remain outstanding
                  </p>
                )}
              </div>

              {/* Card fields */}
              {selectedMethod === "enter-card" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Card Number</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Name on Card</Label>
                    <Input
                      placeholder="Full Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1.5">
                      <Label className="text-sm">Expiry</Label>
                      <Input
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="col-span-1 space-y-1.5">
                      <Label className="text-sm">CVV</Label>
                      <Input
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="col-span-1 space-y-1.5">
                      <Label className="text-sm">ZIP</Label>
                      <Input
                        placeholder="12345"
                        value={zip}
                        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <Checkbox
                      id="card-auth"
                      checked={cardAuth}
                      onCheckedChange={(v) => setCardAuth(Boolean(v))}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="card-auth"
                      className="text-xs text-muted-foreground leading-tight cursor-pointer"
                    >
                      I authorize this card to be charged for the amount above
                    </Label>
                  </div>
                </div>
              )}

              {/* ACH fields */}
              {selectedMethod === "ach" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Routing Number</Label>
                    <Input
                      placeholder="9-digit routing number"
                      value={routing}
                      onChange={(e) => setRouting(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Account Number</Label>
                    <Input
                      placeholder="Account number"
                      value={account}
                      onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 17))}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Account Holder Name</Label>
                    <Input
                      placeholder="Full name on account"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">ZIP Code</Label>
                    <Input
                      placeholder="12345"
                      value={achZip}
                      onChange={(e) => setAchZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <Checkbox
                      id="ach-auth"
                      checked={achAuth}
                      onCheckedChange={(v) => setAchAuth(Boolean(v))}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="ach-auth"
                      className="text-xs text-muted-foreground leading-tight cursor-pointer"
                    >
                      I authorize this bank account to be debited for the amount above
                    </Label>
                  </div>
                </div>
              )}

              {/* Tap to Pay info box */}
              {selectedMethod === "tap-to-pay" && (
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-3">
                  <Smartphone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Ask the customer to tap their card or device on your phone. The amount of{" "}
                    <strong>${parsedAmount > 0 ? parsedAmount.toFixed(2) : "—"}</strong> will be
                    charged.
                  </p>
                </div>
              )}

              {/* Confirm button */}
              <Button
                className="w-full h-11 text-sm font-semibold rounded-xl"
                disabled={!canSubmit || processing}
                onClick={handleSubmit}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </span>
                ) : (
                  "Collect Payment"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
