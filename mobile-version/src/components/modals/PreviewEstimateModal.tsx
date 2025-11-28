import { X, Printer, Edit, Mail, MessageSquare, UserCog, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mockCustomers } from "@/data/mobileMockData";
import { format } from "date-fns";

interface EstimateItem {
  serviceDate: string;
  productService: string;
  sku: string;
  description: string;
  qty: number;
  rate: number;
  discount: number;
  subTotal: number;
  tax: number;
}

interface PreviewEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: {
    id: string;
    customerId: string;
    customerName: string;
    date: string;
    amount: number;
    status: string;
    terms?: string;
    validUntil?: string;
    items?: EstimateItem[];
    billToAddress?: string;
    shipToAddress?: string;
    messageOnStatement?: string;
    messageOnEstimate?: string;
    termsAndConditions?: string;
    cancellationPolicy?: string;
  };
  onAction?: (action: string) => void;
}

const PreviewEstimateModal = ({ isOpen, onClose, estimate, onAction }: PreviewEstimateModalProps) => {
  const customer = mockCustomers.find(c => c.id === estimate.customerId);
  
  // Default data if not provided
  const estimateDate = estimate.date ? format(new Date(estimate.date), "MM/dd/yyyy") : "10/20/2024";
  const validUntil = estimate.validUntil ? format(new Date(estimate.validUntil), "MM/dd/yyyy") : "11/15/2024";
  const terms = estimate.terms || "Due On Receipt";
  
  // Default items if not provided
  const items: EstimateItem[] = estimate.items || [
    {
      serviceDate: "10/20/2024",
      productService: "Cabinet installation",
      sku: "N/A",
      description: "Cabinet installation",
      qty: 1,
      rate: 4000.00,
      discount: 0.00,
      subTotal: 4000.00,
      tax: 0.00,
    },
    {
      serviceDate: "10/20/2024",
      productService: "Countertop installation",
      sku: "N/A",
      description: "Countertop installation",
      qty: 1,
      rate: 3000.00,
      discount: 0.00,
      subTotal: 3000.00,
      tax: 0.00,
    },
    {
      serviceDate: "10/20/2024",
      productService: "Plumbing work",
      sku: "N/A",
      description: "Plumbing work",
      qty: 1,
      rate: 1500.00,
      discount: 0.00,
      subTotal: 1500.00,
      tax: 0.00,
    },
  ];

  const billToAddress = estimate.billToAddress || customer?.address || "456 Oak Ave, Boston, MA 02109";
  const shipToAddress = estimate.shipToAddress || "456 Oak Ave, Brooklyn, NY 11201";
  const customerEmail = customer?.email || "mike.w@email.com";
  const customerPhone = customer?.phone || "+1 (555) 234-5678";
  const customerName = estimate.customerName || "Mike Williams";

  const itemTotal = items.reduce((sum, item) => sum + item.subTotal, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.subTotal * item.discount / 100), 0);
  const subtotalAfterDiscount = itemTotal - totalDiscount;
  const totalTax = items.reduce((sum, item) => sum + item.tax, 0);
  const estimateTotal = subtotalAfterDiscount + totalTax;
  const estimateBalance = estimateTotal;
  const totalBalance = estimateTotal;

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
    if (action === "close") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 max-w-full w-full h-full max-h-full p-0 gap-0 rounded-none m-0 flex flex-col sm:!left-[50%] sm:!top-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:!inset-auto [&>button]:hidden">
        <DialogTitle className="sr-only">Preview Estimate</DialogTitle>
        <DialogDescription className="sr-only">
          Preview estimate {estimate.id}
        </DialogDescription>
        
        {/* Orange Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between safe-top">
          <h2 className="text-lg font-bold text-white">Preview Estimate</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("print")}
              className="text-white hover:bg-orange-600 h-9 px-3"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              <span className="text-sm">Printer</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-orange-600 h-9 w-9 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-4 space-y-4">
            {/* Estimate Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Estimate No.</p>
                <p className="text-sm font-semibold">{estimate.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Estimate Date</p>
                <p className="text-sm font-semibold">{estimateDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Terms</p>
                <p className="text-sm font-semibold">{terms}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Valid Until</p>
                <p className="text-sm font-semibold">{validUntil}</p>
              </div>
            </div>

            {/* Bill To / Ship To */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Bill To</p>
                <div className="text-xs space-y-1">
                  <p className="font-medium">{customerName}</p>
                  <p className="text-gray-600">{customerEmail}</p>
                  <p className="text-gray-600">{billToAddress}</p>
                  <p className="text-gray-600">{customerPhone}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Ship To</p>
                <div className="text-xs space-y-1">
                  <p className="font-medium">{customerName}</p>
                  <p className="text-gray-600">{customerEmail}</p>
                  <p className="text-gray-600">{shipToAddress}</p>
                  <p className="text-gray-600">{customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Service Items Table */}
            <div className="pt-2 border-t space-y-4">
              <div className="space-y-3 sm:hidden">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.productService}</p>
                        <p className="text-[11px] text-gray-500">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-orange-500">${item.subTotal.toFixed(2)}</p>
                        <p className="text-[11px] text-gray-500">Subtotal</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-[11px] text-gray-600">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="font-medium text-gray-800">Service Date</p>
                          <p>{item.serviceDate}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">SKU</p>
                          <p>{item.sku}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Quantity</p>
                          <p>{item.qty}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="font-medium text-gray-800">Rate</p>
                          <p>${item.rate.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Discount</p>
                          <p>{item.discount.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Tax</p>
                          <p>${item.tax.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-orange-500 text-white">
                      <th className="px-2 py-2 text-left font-semibold">Service Date</th>
                      <th className="px-2 py-2 text-left font-semibold">Product/Service</th>
                      <th className="px-2 py-2 text-left font-semibold">SKU</th>
                      <th className="px-2 py-2 text-left font-semibold">Description</th>
                      <th className="px-2 py-2 text-center font-semibold">QTY</th>
                      <th className="px-2 py-2 text-right font-semibold">Rate</th>
                      <th className="px-2 py-2 text-right font-semibold">Discount</th>
                      <th className="px-2 py-2 text-right font-semibold">Sub Total</th>
                      <th className="px-2 py-2 text-right font-semibold">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-2 py-2">{item.serviceDate}</td>
                        <td className="px-2 py-2">{item.productService}</td>
                        <td className="px-2 py-2">{item.sku}</td>
                        <td className="px-2 py-2">{item.description}</td>
                        <td className="px-2 py-2 text-center">{item.qty}</td>
                        <td className="px-2 py-2 text-right">${item.rate.toFixed(2)}</td>
                        <td className="px-2 py-2 text-right">{item.discount.toFixed(2)}%</td>
                        <td className="px-2 py-2 text-right">${item.subTotal.toFixed(2)}</td>
                        <td className="px-2 py-2 text-right">${item.tax.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Messages */}
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-start gap-2">
                <p className="text-xs text-gray-600 min-w-[140px]">Message on Statement:</p>
                <p className="text-xs text-gray-900">-</p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-xs text-gray-600 min-w-[140px]">Message on Estimate:</p>
                <p className="text-xs text-gray-900">-</p>
              </div>
            </div>

            {/* Summary of Charges */}
            <div className="pt-2 border-t">
              <div className="flex flex-col items-end space-y-1 text-xs">
                <div className="flex justify-between w-full max-w-[200px]">
                  <span className="text-gray-600">Item Total:</span>
                  <span className="font-medium">${itemTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px]">
                  <span className="text-gray-600">Sub Total after Discount:</span>
                  <span className="font-medium">${subtotalAfterDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px]">
                  <span className="text-gray-600">Taxes:</span>
                  <span className="font-medium">${totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px] pt-2 border-t">
                  <span className="text-base font-bold">Estimate Total:</span>
                  <span className="text-base font-bold">${estimateTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px]">
                  <span className="text-gray-600">Estimate Balance due:</span>
                  <span className="font-medium">${estimateBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px]">
                  <span className="text-gray-600">Total Balance due:</span>
                  <span className="font-medium">${totalBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pay Now Button and Status Stamp */}
            <div className="pt-4 flex items-center justify-between gap-4">
              {estimate.status === "Unpaid" && (
                <>
                  <Button
                    onClick={() => handleAction("pay-now")}
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                  >
                    Pay Now
                  </Button>
                  <div className="relative">
                    <div className="border-2 border-dashed border-red-500 bg-red-500 text-white px-4 py-2 transform rotate-[-5deg]">
                      <p className="text-sm font-bold whitespace-nowrap">Unpaid</p>
                    </div>
                  </div>
                </>
              )}
              {estimate.status === "Converted to Invoice" && (
                <div className="relative w-full flex justify-center">
                  <div className="border-2 border-dashed border-primary bg-primary text-white px-4 py-2 transform rotate-[-5deg]">
                    <p className="text-sm font-bold whitespace-nowrap">Converted to Invoice</p>
                  </div>
                </div>
              )}
            </div>

            {/* Policies */}
            <div className="pt-4 border-t space-y-2 text-xs">
              <div>
                <span className="text-gray-600">Terms & Conditions:</span>
                <span className="text-blue-600 ml-1">from global settings</span>
              </div>
              <div>
                <span className="text-gray-600">Cancellation & Refund Policy:</span>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-gray-900">Thank You For Your Business!</p>
              </div>
              <div className="pt-2 text-gray-600">
                <p>If below 'Pay Now' button didn't work, just copy and paste this URL into your web browser's address bar to complete payment:</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar - Sticky Footer - Only show for non-converted estimates */}
        {estimate.status !== "Converted to Invoice" && (
          <div className="bg-orange-500 safe-bottom">
            <div className="px-3 pt-3 pb-4">
              <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction("send-email")}
                  className="text-white hover:bg-orange-600 h-9 px-2 sm:px-3 py-2 flex-1 min-w-0 justify-center text-xs rounded-lg"
                >
                  <Mail className="h-3.5 w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap text-[10px] sm:text-xs">Send Email</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction("send-sms")}
                  className="text-white hover:bg-orange-600 h-9 px-2 sm:px-3 py-2 flex-1 min-w-0 justify-center text-xs rounded-lg"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap text-[10px] sm:text-xs">Send SMS</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction("reassign")}
                  className="text-white hover:bg-orange-600 h-9 px-2 sm:px-3 py-2 flex-1 min-w-0 justify-center text-xs rounded-lg"
                >
                  <UserCog className="h-3.5 w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap text-[10px] sm:text-xs">Reassign</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreviewEstimateModal;

