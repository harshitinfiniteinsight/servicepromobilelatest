import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Percent, DollarSign, Calendar } from "lucide-react";

const AddDiscount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    type: "%",
    value: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  const handleSubmit = () => {
    // In real app, create discount
    navigate("/inventory/discounts");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="New Discount" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6 space-y-4">
        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label>Discount Name *</Label>
            <Input
              placeholder="e.g., Senior Citizen, First Time Customer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Discount Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="%">Percentage (%)</SelectItem>
                <SelectItem value="$">Fixed Amount ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Discount Value *</Label>
            <div className="relative">
              {formData.type === "%" ? (
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              ) : (
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                type="number"
                min="0"
                max={formData.type === "%" ? "100" : undefined}
                step={formData.type === "%" ? "1" : "0.01"}
                placeholder={formData.type === "%" ? "10" : "50.00"}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="pl-10"
              />
            </div>
            {formData.value && (
              <p className="text-xs text-muted-foreground mt-1">
                {formData.type === "%" 
                  ? `${formData.value}% off` 
                  : `$${formData.value} off`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Active</Label>
                <p className="text-sm text-muted-foreground">Enable this discount immediately</p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t bg-background space-y-2">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!formData.name || !formData.value || !formData.startDate || !formData.endDate}
        >
          Create Discount
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate("/inventory/discounts")}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddDiscount;

