import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Mail, MessageSquare, UserCog, Edit } from "lucide-react";
import { format } from "date-fns";
import { mockCustomers } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";

interface InvoiceItem {
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

interface PreviewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    customerId: string;
    customerName: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: string;
    paymentMethod: string;
    items?: InvoiceItem[];
  };
  onAction?: (action: string) => void;
}

const PreviewInvoiceModal = ({ isOpen, onClose, invoice, onAction }: PreviewInvoiceModalProps) => {
  const customer = useMemo(() => mockCustomers.find(c => c.id === invoice.customerId), [invoice.customerId]);

  const invoiceDate = invoice.issueDate ? format(new Date(invoice.issueDate), "MM/dd/yyyy") : "09/12/2024";
  const dueDate = invoice.dueDate ? format(new Date(invoice.dueDate), "MM/dd/yyyy") : "09/12/2024";
  const terms = "Due On Receipt";

  const items: InvoiceItem[] = invoice.items || [
    {
      serviceDate: "09/12/2024",
      productService: "Ceiling fan installation",
      sku: "N/A",
      description: "Ceiling fan installation",
      qty: 1,
      rate: 500,
      discount: 0,
      subTotal: 500,
      tax: 0,
    },
    {
      serviceDate: "09/12/2024",
      productService: "Ceiling fan unit",
      sku: "N/A",
      description: "Ceiling fan unit",
      qty: 1,
      rate: 180,
      discount: 0,
      subTotal: 180,
      tax: 0,
    },
  ];

  const itemTotal = items.reduce((sum, item) => sum + item.subTotal, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.subTotal * item.discount / 100), 0);
  const subtotalAfterDiscount = itemTotal - totalDiscount;
  const totalTax = items.reduce((sum, item) => sum + item.tax, 0);
  const invoiceTotal = subtotalAfterDiscount + totalTax;
  const balanceDue = invoice.status === "Paid" ? 0 : invoiceTotal;

  const handleAction = (action: string) => {
    onAction?.(action);
    if (action === "close") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 m-0 flex h-full max-h-full w-full max-w-full flex-col gap-0 rounded-none p-0 sm:!left-1/2 sm:!top-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[720px] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">Preview Invoice</DialogTitle>
        <DialogDescription className="sr-only">Preview invoice {invoice.id}</DialogDescription>

        <div className="bg-orange-500 px-3 py-3 flex items-center justify-between safe-top">
          <h2 className="text-base font-semibold text-white">Preview Invoice</h2>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("print")}
              className="text-white hover:bg-orange-600 h-8 px-2"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Print</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-orange-600 h-9 w-9 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto w-full max-w-[900px] px-3 py-3">
            <div className="rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-orange-500 text-white px-4 py-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide opacity-80">Invoice No.</p>
                  <p className="text-base font-semibold">{invoice.id}</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide opacity-80">Invoice Date</p>
                    <p className="font-semibold text-sm">{invoiceDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide opacity-80">Terms</p>
                    <p className="font-semibold text-sm">{terms}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide opacity-80">Due Date</p>
                    <p className="font-semibold text-sm">{dueDate}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 py-3 bg-[#F5F8FF] border-b border-[#E0E7FF]">
                <div>
                  <p className="text-[10px] font-semibold text-[#0E1E3E] uppercase mb-1.5">Bill To</p>
                  <div className="space-y-0.5 text-xs text-[#1D3A6B]">
                    <p className="font-semibold">{customer?.name || invoice.customerName}</p>
                    <p>{customer?.email || "info@email.com"}</p>
                    <p>{customer?.address || "789 Pine Rd, Cambridge, MA 02140"}</p>
                    <p>{customer?.phone || "(555) 345-6789"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#0E1E3E] uppercase mb-1.5">Ship To</p>
                  <div className="space-y-0.5 text-xs text-[#1D3A6B]">
                    <p className="font-semibold">{customer?.name || invoice.customerName}</p>
                    <p>{customer?.email || "info@email.com"}</p>
                    <p>{customer?.address || "456 Oak Ave, Brooklyn, NY 11201"}</p>
                    <p>{customer?.phone || "(555) 345-6789"}</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 space-y-3 bg-white">
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-xs border border-[#E0E7FF] table-auto">
                    <thead>
                      <tr className="bg-orange-500 text-white">
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-left font-semibold whitespace-nowrap">Date</th>
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-left font-semibold min-w-[80px]">Product/Service</th>
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-left font-semibold hidden sm:table-cell">SKU</th>
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-left font-semibold min-w-[100px]">Description</th>
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-center font-semibold whitespace-nowrap">QTY</th>
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right font-semibold whitespace-nowrap">Rate</th>
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right font-semibold hidden md:table-cell whitespace-nowrap">Discount</th>
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right font-semibold whitespace-nowrap">Sub Total</th>
                        <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right font-semibold whitespace-nowrap">Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b border-[#E0E7FF] hover:bg-gray-50/50">
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap">{item.serviceDate}</td>
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 font-medium">{item.productService}</td>
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 hidden sm:table-cell">{item.sku}</td>
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-[10px] sm:text-xs break-words">{item.description}</td>
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-center whitespace-nowrap">{item.qty}</td>
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right whitespace-nowrap">${item.rate.toFixed(2)}</td>
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right hidden md:table-cell whitespace-nowrap">{item.discount.toFixed(2)}%</td>
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right font-medium whitespace-nowrap text-[#FF8A3C]">${item.subTotal.toFixed(2)}</td>
                          <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right whitespace-nowrap">${item.tax.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="rounded-lg bg-[#F8FBFF] border border-[#E0E7FF] px-3 py-3 space-y-1.5 text-xs text-[#0E1E3E] w-full sm:w-auto sm:min-w-[280px]">
                    <div className="flex justify-between items-center">
                      <span className="text-left">Item Total</span>
                      <span className="font-medium text-right">${itemTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-left">Sub Total after Discount</span>
                      <span className="font-medium text-right">${subtotalAfterDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-left">Taxes</span>
                      <span className="font-medium text-right">${totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#E0E7FF] pt-1.5 mt-1.5">
                      <span className="font-semibold text-sm text-left">Invoice Total</span>
                      <span className="font-semibold text-sm text-right">${invoiceTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-left">Invoice Balance due</span>
                      <span className="font-medium text-right">${balanceDue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-left">Total Balance due</span>
                      <span className="font-medium text-right">${balanceDue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                  {invoice.status !== "Paid" ? (
                    <Button
                      onClick={() => handleAction("pay-now")}
                      className="bg-[#FF8A3C] hover:bg-[#ff7a1f] text-white font-semibold px-4 py-2 h-9 rounded-full text-sm"
                    >
                      Pay Now
                    </Button>
                  ) : (
                    <div className="border-2 border-green-500 text-green-600 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 bg-green-50">
                      <span className="text-xs font-semibold">Paid</span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-md border-2 uppercase tracking-[2px] text-xs font-semibold inline-flex items-center",
                      invoice.status === "Paid"
                        ? "border-green-500 text-green-600 bg-green-50"
                        : "border-red-500 text-red-500 bg-red-50"
                    )}
                  >
                    {invoice.status === "Open" ? "Unpaid" : invoice.status}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#1D3A6B] pt-2 border-t border-gray-200">
                  <p>
                    <span className="font-semibold text-[#0E1E3E]">Message on Invoice:</span> –
                  </p>
                  <p>
                    <span className="font-semibold text-[#0E1E3E]">Terms & Conditions:</span>{" "}
                    <span className="text-orange-500">from global settings</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#0E1E3E]">Cancellation & Refund Policy:</span> –
                  </p>
                  <p className="pt-1.5 font-semibold text-sm text-[#0E1E3E]">Thank You For Your Business!</p>
                  <p className="text-[10px]">
                    If below 'Pay Now' button didn't work, just copy and paste this URL into your web browser's address bar to complete payment:
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
      </DialogContent>
    </Dialog>
  );
};

export default PreviewInvoiceModal;

