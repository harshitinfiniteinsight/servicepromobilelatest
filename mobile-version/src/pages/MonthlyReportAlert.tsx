import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const MonthlyReportAlert = () => {
  const [emailAlertEnabled, setEmailAlertEnabled] = useState(false);
  const [smsAlertEnabled, setSmsAlertEnabled] = useState(false);

  const handleEmailToggle = (checked: boolean) => {
    setEmailAlertEnabled(checked);
    toast.success(checked ? "Email alert enabled" : "Email alert disabled");
  };

  const handleSmsToggle = (checked: boolean) => {
    setSmsAlertEnabled(checked);
    toast.success(checked ? "SMS alert enabled" : "SMS alert disabled");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Monthly Report Alert" showBack={true} />
      
      <div
        className="flex-1 overflow-y-auto scrollable px-4 pb-6"
        style={{
          paddingTop: "calc(3.5rem + env(safe-area-inset-top) + 0.5rem)",
        }}
      >
        <div className="space-y-3">
          {/* Email Alert Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Label */}
            <div className="px-4 pt-4 pb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email Alert {emailAlertEnabled ? "ON" : "OFF"}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-4"></div>

            {/* Setting Title and Toggle */}
            <div className="px-4 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                Monthly Email Alert
              </h3>
              <Switch
                checked={emailAlertEnabled}
                onCheckedChange={handleEmailToggle}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </div>

          {/* SMS Alert Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Label */}
            <div className="px-4 pt-4 pb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                SMS Alert {smsAlertEnabled ? "ON" : "OFF"}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-4"></div>

            {/* Setting Title and Toggle */}
            <div className="px-4 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                Monthly SMS Alert
              </h3>
              <Switch
                checked={smsAlertEnabled}
                onCheckedChange={handleSmsToggle}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportAlert;

