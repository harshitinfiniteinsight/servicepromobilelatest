import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";

const MinimumDepositPercentage = () => {
  const [percentage, setPercentage] = useState([25]);

  const handleSave = () => {
    // In real app, save settings
    alert(`Minimum deposit set to ${percentage[0]}%`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Minimum Deposit" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6 space-y-4">
        {/* Info Card */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Minimum Deposit Percentage</h3>
              <p className="text-sm text-muted-foreground">
                Set the minimum deposit percentage required for estimates and invoices. This helps ensure payment security.
              </p>
            </div>
          </div>
        </div>

        {/* Current Value Display */}
        <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
          <Label className="text-sm text-muted-foreground mb-2 block">Current Setting</Label>
          <div className="text-5xl font-bold text-primary mb-2">{percentage[0]}%</div>
          <p className="text-sm text-muted-foreground">
            Minimum deposit required for all estimates and invoices
          </p>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <div>
            <Label className="text-base mb-4 block">Adjust Percentage</Label>
            <Slider
              value={percentage}
              onValueChange={setPercentage}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="p-4 rounded-xl border bg-card">
          <h3 className="font-semibold mb-3">Examples</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">$1,000 invoice:</span>
              <span className="font-semibold">${(1000 * percentage[0] / 100).toFixed(2)} deposit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">$5,000 estimate:</span>
              <span className="font-semibold">${(5000 * percentage[0] / 100).toFixed(2)} deposit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">$10,000 job:</span>
              <span className="font-semibold">${(10000 * percentage[0] / 100).toFixed(2)} deposit</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full" size="lg" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default MinimumDepositPercentage;
