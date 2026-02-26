import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User,
  Lock,
  Shield,
  Building2,
  CreditCard,
  Wallet,
  Globe,
  HelpCircle,
  ChevronRight,
  MessageSquare,
  X
} from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [showFeedbackSettingsModal, setShowFeedbackSettingsModal] = useState(false);
  const [autoSendFeedback, setAutoSendFeedback] = useState(false);
  
  // Load saved feedback setting from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem("autoSendFeedback");
    if (savedSetting !== null) {
      setAutoSendFeedback(savedSetting === "true");
    }
  }, []);

  // Settings options list
  const settingsOptions = [
    { label: "Profile", route: "/settings/profile", icon: User },
    { label: "Change Password", route: "/settings/change-password", icon: Lock },
    { label: "Permission Settings", route: "/settings/permissions", icon: Shield },
    { label: "Business Policies", route: "/settings/business-policies", icon: Building2 },
    { label: "Feedback Settings", route: null, icon: MessageSquare, isModal: true },
    { label: "Payment Settings", route: "/settings/payment-methods", icon: CreditCard },
    { label: "Configure Card Reader", route: "/settings/configure-card-reader", icon: Wallet },
    { label: "Change App Language", route: "/settings/language", icon: Globe },
    { label: "Help", route: "/settings/help", icon: HelpCircle },
  ];

  const handleOptionClick = (option: typeof settingsOptions[0]) => {
    if (option.isModal) {
      setShowFeedbackSettingsModal(true);
    } else if (option.route) {
      navigate(option.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <TabletHeader title="Settings" />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {settingsOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.label}
                  onClick={() => handleOptionClick(option)}
                  className={`flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors group ${
                    index !== settingsOptions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-base font-medium text-gray-800 group-hover:text-primary transition-colors">
                    {option.label}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback Settings Modal */}
      <Dialog 
        open={showFeedbackSettingsModal} 
        onOpenChange={(open) => {
          setShowFeedbackSettingsModal(open);
          // Load saved setting when modal opens
          if (open) {
            const savedSetting = localStorage.getItem("autoSendFeedback");
            if (savedSetting !== null) {
              setAutoSendFeedback(savedSetting === "true");
            } else {
              setAutoSendFeedback(false); // Default to OFF
            }
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:w-auto sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
          <DialogHeader className="relative px-6 pt-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-lg font-semibold text-center">Feedback Settings</DialogTitle>
            <DialogDescription className="sr-only">
              Configure automatic feedback form email settings for completed jobs
            </DialogDescription>
            <button
              onClick={() => setShowFeedbackSettingsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </DialogHeader>
          
          <div className="px-6 py-6 space-y-6">
            {/* Toggle Row */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-5">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1.5">
                    Send Feedback Form Automatically
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
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
            <div className="pt-4">
              <Button
                onClick={() => {
                  // Save setting (in real app, this would be an API call)
                  // Store in localStorage for persistence
                  localStorage.setItem("autoSendFeedback", String(autoSendFeedback));
                  showSuccessToast("Feedback settings saved successfully");
                  setShowFeedbackSettingsModal(false);
                }}
                className="w-full h-11 text-sm font-semibold"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
