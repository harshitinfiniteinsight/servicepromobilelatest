import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, X, AlertCircle, Minus, Plus } from "lucide-react";

export interface InvoiceLineItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  refundedAmount?: number;
}

/**
 * Pure helper — lives outside the component so it is never re-created.
 * Returns the maximum number of units that can still be refunded for an item.
 */
function getMaxRefundQty(item: InvoiceLineItem): number {
  const refunded = item.refundedAmount ?? 0;
  if (item.unitPrice > 0) {
    const refundableAmt = Math.max(0, item.total - refunded);
    return Math.max(1, Math.min(item.quantity, Math.round(refundableAmt / item.unitPrice)));
  }
  return Math.max(1, item.quantity);
}

interface ItemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceName: string;
  lineItems: InvoiceLineItem[];
  isLoading?: boolean;
  /** Item IDs that should be pre-checked when the modal opens */
  initialSelectedItemIds?: string[];
  /** Restore previously chosen quantities when navigating back to this modal */
  initialItemQtys?: Record<string, number>;
  onConfirm: (selectedItems: InvoiceLineItem[], totalAmount: number) => void;
}

const ItemSelectionModal = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceName,
  lineItems,
  isLoading = false,
  initialSelectedItemIds = [],
  initialItemQtys,
  onConfirm,
}: ItemSelectionModalProps) => {
  /** Which items are currently checked */
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  /**
   * Per-item refund quantity.
   * Persists even when an item is temporarily unchecked so that re-checking
   * restores the user's previous choice.
   */
  const [itemQtys, setItemQtys] = useState<Record<string, number>>({});

  // ── Derived: items that still have a refundable balance ─────────────────
  const refundableItems = useMemo(
    () => lineItems.filter((item) => item.total > (item.refundedAmount ?? 0)),
    [lineItems],
  );

  // ── Reset state every time the modal (re-)opens ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setCheckedIds(new Set(initialSelectedItemIds));

    const initQtys: Record<string, number> = {};
    lineItems.forEach((item) => {
      if (item.total <= (item.refundedAmount ?? 0)) return; // not refundable
      // Restore previous qty if supplied; otherwise default to full refundable qty
      initQtys[item.itemId] = initialItemQtys?.[item.itemId] ?? getMaxRefundQty(item);
    });
    setItemQtys(initQtys);
    // We intentionally omit initialSelectedItemIds / initialItemQtys / lineItems
    // from the dependency array so that this effect only fires on open/close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Toggle handlers ──────────────────────────────────────────────────────
  const handleItemToggle = (itemId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(refundableItems.map((item) => item.itemId)));
    }
  };

  // ── Stepper handlers ─────────────────────────────────────────────────────
  const handleDecrement = (item: InvoiceLineItem) => {
    const max = getMaxRefundQty(item);
    setItemQtys((prev) => {
      const current = prev[item.itemId] ?? max;
      if (current <= 1) return prev; // guard: min = 1
      return { ...prev, [item.itemId]: current - 1 };
    });
  };

  const handleIncrement = (item: InvoiceLineItem) => {
    const max = getMaxRefundQty(item);
    setItemQtys((prev) => {
      const current = prev[item.itemId] ?? max;
      if (current >= max) return prev; // guard: max = maxRefundQty
      return { ...prev, [item.itemId]: current + 1 };
    });
  };

  // ── Confirm ──────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (selectedItems.length === 0) return;
    const itemsToConfirm: InvoiceLineItem[] = selectedItems.map((item) => {
      const qty = itemQtys[item.itemId] ?? getMaxRefundQty(item);
      return { ...item, quantity: qty, total: qty * item.unitPrice };
    });
    onConfirm(itemsToConfirm, totalRefundAmount);
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const selectedItems = useMemo(
    () => refundableItems.filter((item) => checkedIds.has(item.itemId)),
    [refundableItems, checkedIds],
  );

  /** Live total = Σ (selectedQty × unitPrice) */
  const totalRefundAmount = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        const qty = itemQtys[item.itemId] ?? getMaxRefundQty(item);
        return sum + qty * item.unitPrice;
      }, 0),
    [selectedItems, itemQtys],
  );

  const allSelected =
    refundableItems.length > 0 &&
    refundableItems.every((item) => checkedIds.has(item.itemId));

  const isConfirmDisabled = selectedItems.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[390px] w-[calc(100%-1.5rem)] mx-auto p-0 gap-0 rounded-2xl max-h-[85vh] overflow-hidden !flex !flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">Select Items to Refund</DialogTitle>
        <DialogDescription className="sr-only">
          Select one or more items from the invoice to refund
        </DialogDescription>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center bg-white border-b border-gray-200 px-4 py-3 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">Select Items to Refund</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* ── Scrollable Content ───────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto bg-white pointer-events-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="px-5 py-5 pb-6 space-y-4 pointer-events-auto">
            {/* Invoice Reference */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Invoice</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{invoiceId}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{invoiceName}</p>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600">Loading items...</p>
              </div>
            )}

            {/* Empty */}
            {!isLoading && refundableItems.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-900">No items to refund</p>
                  <p className="text-xs text-amber-700 mt-0.5">All items have been fully refunded.</p>
                </div>
              </div>
            )}

            {/* Items List */}
            {!isLoading && refundableItems.length > 0 && (
              <div className="space-y-2">
                {/* Select All Row */}
                <div className="flex items-center justify-between px-1 pb-1">
                  <label
                    className="flex items-center gap-2 cursor-pointer select-none"
                    onClick={handleSelectAll}
                  >
                    <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                    <span className="text-sm font-medium text-gray-700">
                      {allSelected ? "Deselect All" : "Select All"}
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {selectedItems.length} of {refundableItems.length} selected
                    </span>
                  )}
                </div>

                {refundableItems.map((item) => {
                  const isSelected = checkedIds.has(item.itemId);
                  const maxQty = getMaxRefundQty(item);
                  const qty = itemQtys[item.itemId] ?? maxQty;
                  /** Dynamic line total shown on this card */
                  const lineTotal = qty * item.unitPrice;
                  const refunded = item.refundedAmount ?? 0;
                  /** Single-unit items: hide the stepper entirely */
                  const isSingleUnit = maxQty === 1;

                  return (
                    <div
                      key={item.itemId}
                      className={`p-3 rounded-xl border transition-colors ${
                        isSelected
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* Row 1 — Checkbox · Item name · Dynamic total */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleItemToggle(item.itemId)}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-900 leading-tight">
                              {item.description}
                            </p>
                            {/* Total updates live as qty changes */}
                            <p
                              className={`text-sm font-bold tabular-nums shrink-0 transition-colors ${
                                isSelected ? "text-orange-600" : "text-gray-400"
                              }`}
                            >
                              ${lineTotal.toFixed(2)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ${item.unitPrice.toFixed(2)}&nbsp;/&nbsp;unit
                          </p>
                          {refunded > 0 && (
                            <p className="text-[10px] text-amber-600 mt-0.5">
                              ${refunded.toFixed(2)} already refunded
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 2 — Qty stepper
                          Always rendered for multi-unit items; dimmed + non-interactive when unchecked.
                          Hidden for single-unit items (qty is implicitly 1). */}
                      {!isSingleUnit && (
                        <div
                          className={`mt-2.5 ml-7 flex items-center justify-between transition-opacity duration-150 ${
                            isSelected ? "opacity-100" : "opacity-30 pointer-events-none"
                          }`}
                        >
                          <span className="text-xs text-gray-500">Qty to refund</span>
                          <div className="flex items-center gap-2">
                            {/* Decrement — disabled at min (1) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecrement(item);
                              }}
                              disabled={!isSelected || qty <= 1}
                              className="h-7 w-7 rounded-lg bg-white border border-gray-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95 transition-all"
                            >
                              <Minus className="h-3 w-3 text-gray-700" />
                            </button>

                            <span className="min-w-[28px] text-center text-sm font-semibold text-gray-900 tabular-nums select-none">
                              {qty}
                            </span>

                            {/* Increment — disabled at max (maxRefundQty) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIncrement(item);
                              }}
                              disabled={!isSelected || qty >= maxQty}
                              className="h-7 w-7 rounded-lg bg-white border border-gray-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95 transition-all"
                            >
                              <Plus className="h-3 w-3 text-gray-700" />
                            </button>

                            <span className="text-[11px] text-gray-400 tabular-nums">/ {maxQty}</span>
                          </div>
                        </div>
                      )}

                      {/* Single-unit confirmation label */}
                      {isSingleUnit && isSelected && (
                        <p className="mt-1.5 ml-7 text-xs text-gray-500">Qty: 1</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="bg-white border-t border-gray-200 px-5 py-4 shrink-0 space-y-3">
          {/* Live total — always visible; colour changes based on selection */}
          <div
            className={`p-3 rounded-lg border transition-colors duration-200 ${
              selectedItems.length > 0
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium transition-colors ${
                  selectedItems.length > 0 ? "text-green-900" : "text-gray-400"
                }`}
              >
                Total Refund
              </span>
              <span
                className={`text-lg font-bold tabular-nums transition-colors ${
                  selectedItems.length > 0 ? "text-green-600" : "text-gray-300"
                }`}
              >
                ${totalRefundAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled || isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemSelectionModal;
