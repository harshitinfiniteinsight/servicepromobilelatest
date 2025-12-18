import { useState, useEffect } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const FeedbackSettings = () => {
  const [autoSendFeedback, setAutoSendFeedback] = useState(false);
  
  // Load saved feedback setting from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem("autoSendFeedback");
    if (savedSetting !== null) {
      setAutoSendFeedback(savedSetting === "true");
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("autoSendFeedback", String(autoSendFeedback));
    toast.success("Feedback settings saved successfully");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <TabletHeader title="Feedback Settings" showBack={true} />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Toggle Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-6">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Send Feedback Form Automatically
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Automatically email a feedback form to customers when their job status changes to Completed.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch
                  checked={autoSendFeedback}
                  onCheckedChange={setAutoSendFeedback}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="px-8 h-11 text-sm font-semibold"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSettings;
