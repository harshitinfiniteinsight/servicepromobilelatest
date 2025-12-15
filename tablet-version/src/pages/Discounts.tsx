import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { mockDiscounts } from "@/data/mobileMockData";
import { Plus, Percent, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Discounts = () => {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState(mockDiscounts);

  const toggleDiscount = (id: string) => {
    setDiscounts(discounts.map(d => 
      d.id === id ? { ...d, active: !d.active } : d
    ));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Discounts"
        actions={
          <Button size="sm" onClick={() => navigate("/discounts/new")}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Total Discounts</span>
            </div>
            <p className="text-2xl font-bold">{discounts.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs font-medium">Total Usage</span>
            </div>
            <p className="text-2xl font-bold">
              {discounts.reduce((sum, d) => sum + d.usageCount, 0)}
            </p>
          </div>
        </div>

        {/* Discount Cards */}
        <div className="space-y-3">
          {discounts.map(discount => {
            const isActive = discount.active;
            const isExpired = new Date(discount.endDate) < new Date();
            
            return (
              <div
                key={discount.id}
                className={cn(
                  "p-4 rounded-xl border",
                  isActive ? "bg-card" : "bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{discount.name}</h3>
                      <Badge className={cn(
                        "text-xs",
                        isActive && !isExpired 
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground border-muted"
                      )}>
                        {isExpired ? "Expired" : isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {discount.type === "%" ? (
                        <Percent className="h-4 w-4 text-primary" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-xl font-bold text-primary">
                        {discount.type === "%" ? `${discount.value}%` : `$${discount.value}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={isActive && !isExpired}
                    onCheckedChange={() => toggleDiscount(discount.id)}
                    disabled={isExpired}
                  />
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Usage Count</span>
                    <span className="text-sm font-semibold">{discount.usageCount} times</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Discounts;
