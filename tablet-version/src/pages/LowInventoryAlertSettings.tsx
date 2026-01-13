import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertTriangle } from "lucide-react";

const LowInventoryAlertSettings = () => {
  const [threshold, setThreshold] = useState("10");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [alertFrequency, setAlertFrequency] = useState("daily");

  const handleSave = () => {
    // In real app, save settings
    alert("Settings saved!");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Low Stock Alerts" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6 space-y-4">
        {/* Info Card */}
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Low Stock Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when inventory items fall below the threshold level.
              </p>
            </div>
          </div>
        </div>

        {/* Threshold */}
        <div>
          <Label>Default Threshold Quantity</Label>
          <Input
            type="number"
            min="1"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Enter threshold"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Items with stock below this quantity will trigger alerts
          </p>
        </div>

        {/* Email Notifications */}
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for low stock items
                </p>
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>

        {/* Alert Frequency */}
        <div>
          <Label>Alert Frequency</Label>
          <Select value={alertFrequency} onValueChange={setAlertFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            How often to check and send alerts
          </p>
        </div>

        {/* Save Button */}
        <Button className="w-full" size="lg" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default LowInventoryAlertSettings;
