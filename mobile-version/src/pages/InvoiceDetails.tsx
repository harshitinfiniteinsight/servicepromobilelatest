import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { mockInvoices, mockCustomers } from "@/data/mobileMockData";
import { Calendar, CreditCard, User, Mail, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { getAllInvoices } from "@/services/invoiceService";

const InvoiceDetails = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const storedInvoices = await getAllInvoices();
        const foundStored = storedInvoices.find(i => i.id === id);

        if (foundStored) {
          setInvoice(foundStored);
        } else {
          const foundMock = mockInvoices.find(i => i.id === id);
          setInvoice(foundMock || null);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Invoice not found</p>
      </div>
    );
  }

  const customer = mockCustomers.find(c => c.id === invoice.customerId) || {
    id: invoice.customerId,
    name: invoice.customerName,
    email: invoice.customerEmail || "",
    phone: invoice.customerPhone || "",
    address: "", // Fallback
  };

  // Mock invoice items if not present
  const invoiceItems = invoice.items || [
    { name: "HVAC Installation", quantity: 1, price: 300, total: 300 },
    { name: "Labor", quantity: 3, price: 50, total: 150 },
  ];

  const subtotal = invoice.subtotal || invoiceItems.reduce((sum: number, item: any) => sum + (item.total || item.amount || 0), 0);
  const tax = invoice.tax !== undefined ? invoice.tax : subtotal * 0.08;
  const discount = invoice.discount || 0;
  const total = invoice.total || (subtotal + tax - discount);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader
        title="Invoice Details"
        showBack={true}
      />

      <div className="flex-1 overflow-y-auto scrollable pt-14">
        {/* Header */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold mb-2">{invoice.id}</h2>
              <Badge className={cn("text-sm", statusColors[invoice.status as keyof typeof statusColors])}>
                {invoice.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold">${invoice.amount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = `mailto:${customer?.email} `}>
            <Mail className="h-4 w-4" />
            Send
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = `sms:${customer?.phone} `}>
            <MessageSquare className="h-4 w-4" />
            SMS
          </Button>
        </div>

        <div className="space-y-4 px-4 pb-6">
          {/* Customer Information */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {invoice.customerName}</p>
              {/* Job Address Logic */}
              <p>
                <span className="text-muted-foreground">Job Address:</span>{" "}
                {(invoice as any).source === "sell_product" ? "-" : customer?.address || "-"}
              </p>
              {/* Assigned To Logic */}
              <p>
                <span className="text-muted-foreground">Assigned to:</span>{" "}
                {(invoice as any).employeeName || (invoice as any).technicianName || "Unassigned"}
              </p>
              {customer && (
                <>
                  <p><span className="text-muted-foreground">Email:</span> {customer.email}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {customer.phone}</p>
                </>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Dates
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
              <p><span className="text-muted-foreground">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Items Section Consolidated */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Items
            </h3>

            <div className="space-y-4">
              {/* Items List */}
              <div className="space-y-4">
                {invoiceItems.map((item: any, idx: number) => {
                  // Helper to calculate item subtotal with all discounts and taxes
                  const calculateItemSubtotal = () => {
                    let total = item.price * item.quantity;
                    
                    // Apply default discounts
                    if (item.defaultDiscounts && Array.isArray(item.defaultDiscounts)) {
                      item.defaultDiscounts.forEach((discount: any) => {
                        const amount = discount.type === "%" 
                          ? total * (discount.value / 100)
                          : discount.value;
                        total -= amount;
                      });
                    }
                    
                    // Apply custom discounts
                    if (item.discounts && Array.isArray(item.discounts)) {
                      item.discounts.forEach((discount: any) => {
                        const amount = discount.type === "%" 
                          ? total * (discount.value / 100)
                          : discount.value;
                        total -= amount;
                      });
                    }
                    
                    // Apply single discount field for backwards compatibility
                    if (item.discount && item.discount > 0) {
                      const amount = item.discountType === "%" 
                        ? total * (item.discount / 100)
                        : item.discount;
                      total -= amount;
                    }
                    
                    // Apply default taxes
                    if (item.defaultTaxes && Array.isArray(item.defaultTaxes)) {
                      item.defaultTaxes.forEach((tax: any) => {
                        const amount = total * (tax.value / 100);
                        total += amount;
                      });
                    }
                    
                    // Apply custom taxes
                    if (item.taxes && Array.isArray(item.taxes)) {
                      item.taxes.forEach((tax: any) => {
                        const amount = total * (tax.value / 100);
                        total += amount;
                      });
                    }
                    
                    // Apply single tax field for backwards compatibility
                    if (item.taxRate && item.taxRate > 0) {
                      const amount = total * (item.taxRate / 100);
                      total += amount;
                    }
                    
                    return total;
                  };

                  return (
                    <div key={idx} className="pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                      
                      {/* Default Discounts */}
                      {item.defaultDiscounts && item.defaultDiscounts.length > 0 && (
                        <div className="space-y-0.5 mb-1.5">
                          {item.defaultDiscounts.map((discount: any, didx: number) => {
                            const baseAmount = item.price * item.quantity;
                            const discountAmount = discount.type === "%" 
                              ? baseAmount * (discount.value / 100)
                              : discount.value;
                            return (
                              <div key={didx} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {discount.name} ({discount.type === "%" ? `${discount.value}%` : `$${discount.value}`})
                                </span>
                                <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Custom Discounts */}
                      {item.discounts && item.discounts.length > 0 && (
                        <div className="space-y-0.5 mb-1.5">
                          {item.discounts.map((discount: any, didx: number) => {
                            const baseAmount = item.price * item.quantity;
                            const discountAmount = discount.type === "%" 
                              ? baseAmount * (discount.value / 100)
                              : discount.value;
                            return (
                              <div key={didx} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {discount.name} ({discount.type === "%" ? `${discount.value}%` : `$${discount.value}`})
                                </span>
                                <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Single Discount Field (backwards compatibility) */}
                      {!item.discounts && !item.defaultDiscounts && item.discount && item.discount > 0 && (
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">
                            {item.discountName || "Discount"} {item.discountType === "%" ? `(${item.discount}%)` : ""}
                          </span>
                          <span className="text-green-600 font-medium">
                            -${item.discountType === "$" ? item.discount : ((item.price * item.quantity * item.discount) / 100)}
                          </span>
                        </div>
                      )}
                      
                      {/* Default Taxes */}
                      {item.defaultTaxes && item.defaultTaxes.length > 0 && (
                        <div className="space-y-0.5 mb-1.5">
                          {item.defaultTaxes.map((tax: any, tidx: number) => {
                            const baseAmount = item.price * item.quantity;
                            let afterDiscounts = baseAmount;
                            
                            // Calculate after discounts
                            if (item.defaultDiscounts) {
                              item.defaultDiscounts.forEach((disc: any) => {
                                const dAmount = disc.type === "%" 
                                  ? afterDiscounts * (disc.value / 100)
                                  : disc.value;
                                afterDiscounts -= dAmount;
                              });
                            }
                            if (item.discounts) {
                              item.discounts.forEach((disc: any) => {
                                const dAmount = disc.type === "%" 
                                  ? afterDiscounts * (disc.value / 100)
                                  : disc.value;
                                afterDiscounts -= dAmount;
                              });
                            }
                            
                            const taxAmount = afterDiscounts * (tax.value / 100);
                            return (
                              <div key={tidx} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {tax.name} ({tax.value}%)
                                </span>
                                <span className="text-blue-600 font-medium">+${taxAmount.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Custom Taxes */}
                      {item.taxes && item.taxes.length > 0 && (
                        <div className="space-y-0.5 mb-1.5">
                          {item.taxes.map((tax: any, tidx: number) => {
                            const baseAmount = item.price * item.quantity;
                            let afterDiscounts = baseAmount;
                            
                            // Calculate after discounts
                            if (item.defaultDiscounts) {
                              item.defaultDiscounts.forEach((disc: any) => {
                                const dAmount = disc.type === "%" 
                                  ? afterDiscounts * (disc.value / 100)
                                  : disc.value;
                                afterDiscounts -= dAmount;
                              });
                            }
                            if (item.discounts) {
                              item.discounts.forEach((disc: any) => {
                                const dAmount = disc.type === "%" 
                                  ? afterDiscounts * (disc.value / 100)
                                  : disc.value;
                                afterDiscounts -= dAmount;
                              });
                            }
                            
                            const taxAmount = afterDiscounts * (tax.value / 100);
                            return (
                              <div key={tidx} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {tax.name} ({tax.value}%)
                                </span>
                                <span className="text-blue-600 font-medium">+${taxAmount.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Single Tax Field (backwards compatibility) */}
                      {!item.taxes && !item.defaultTaxes && item.taxRate && item.taxRate > 0 && (
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">
                            Tax ({item.taxRate}%)
                          </span>
                          <span className="text-blue-600 font-medium">
                            +${((item.price * item.quantity * item.taxRate) / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {/* Item Subtotal */}
                      <div className="flex items-center justify-between text-sm font-semibold mt-2 pt-2 border-t border-gray-200">
                        <span>Item Subtotal:</span>
                        <span>${calculateItemSubtotal().toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-4 border-t space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                
                {/* Discount - only show if applicable */}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Discount:</span>
                    <span className="font-semibold text-success">-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Tax - only show if applicable */}
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Tax:</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Total Amount - emphasized */}
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="font-bold text-base">Total Amount:</span>
                  <span className="font-bold text-lg text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Method:</span>{" "}
                {invoice.status === "Paid" ? invoice.paymentMethod : "-"}
              </p>
              <p><span className="text-muted-foreground">Status:</span> {invoice.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;

