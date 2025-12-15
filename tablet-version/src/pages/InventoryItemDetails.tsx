import { useParams, useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockInventory, mockStockTransactions } from "@/data/mobileMockData";
import { Package, AlertTriangle, TrendingUp, TrendingDown, Calendar, Building2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const InventoryItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = mockInventory.find(i => i.id === id);
  
  if (!item) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Item not found</p>
      </div>
    );
  }

  const isLowStock = item.stock <= item.lowStockThreshold;
  const transactions = mockStockTransactions.filter(t => t.itemId === id).slice(0, 5);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Item Details" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
              <Badge variant="outline" className="mb-2">{item.category}</Badge>
              {isLowStock && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Low Stock
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stock Alert */}
        {isLowStock && (
          <div className="mx-4 mb-4 p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning mb-1">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  Current stock ({item.stock}) is below threshold ({item.lowStockThreshold}). Consider reordering.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 px-4 mb-4">
          <Button variant="outline" onClick={() => navigate(`/inventory/stock-in-out?item=${item.id}`)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Stock In
          </Button>
          <Button variant="outline" onClick={() => navigate(`/inventory/stock-in-out?item=${item.id}`)}>
            <TrendingDown className="h-4 w-4 mr-2" />
            Stock Out
          </Button>
        </div>

        {/* Details */}
        <div className="px-4 space-y-4 pb-6">
          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Stock Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Stock:</span>
                <span className={cn("font-bold text-lg", isLowStock ? "text-destructive" : "text-success")}>
                  {item.stock} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Low Stock Threshold:</span>
                <span className="font-semibold">{item.lowStockThreshold} units</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Pricing
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Price:</span>
                <span className="font-bold text-lg">${item.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-bold">${(item.stock * item.unitPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Supplier Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Supplier:</span> {item.supplier}</p>
              <p><span className="text-muted-foreground">SKU:</span> {item.sku}</p>
              <p><span className="text-muted-foreground">Last Updated:</span> {new Date(item.lastUpdated).toLocaleDateString()}</p>
            </div>
          </div>

          {transactions.length > 0 && (
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{txn.type === "In" ? "Stock In" : "Stock Out"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold", txn.type === "In" ? "text-success" : "text-destructive")}>
                        {txn.type === "In" ? "+" : ""}{txn.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">Balance: {txn.runningBalance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryItemDetails;

