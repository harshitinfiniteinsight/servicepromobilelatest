import { useState, useEffect } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Landmark, Waves, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/utils/toast";
import ACHSetupSliderModal from "@/components/modals/ACHSetupSliderModal";

const PaymentMethods = () => {
  // Check ACH setup status from localStorage
  const getACHSetupStatus = () => {
    try {
      const achConfig = localStorage.getItem("achConfig");
      if (achConfig) {
        const config = JSON.parse(achConfig);
        return config.isSetupComplete === true && config.achEnabled === true;
      }
    } catch (error) {
      console.error("Error reading ACH config:", error);
    }
    return false;
  };

  const [paymentMethods, setPaymentMethods] = useState({
    creditDebit: true,
    bankACH: getACHSetupStatus(),
    tapToPay: true,
    manualCardEntry: true,
    otherPaymentMethods: false,
  });
  
  const [showACHSetupModal, setShowACHSetupModal] = useState(false);

  // Listen for ACH setup completion
  useEffect(() => {
    const handleACHSetupComplete = () => {
      const isConfigured = getACHSetupStatus();
      if (isConfigured) {
        setPaymentMethods(prev => ({ ...prev, bankACH: true }));
        showSuccessToast("ACH payment method enabled successfully.");
      }
    };

    // Listen for storage changes (ACH setup completion)
    window.addEventListener("storage", handleACHSetupComplete);
    
    // Also check periodically in case storage event doesn't fire
    const interval = setInterval(() => {
      const isConfigured = getACHSetupStatus();
      if (isConfigured && !paymentMethods.bankACH) {
        setPaymentMethods(prev => ({ ...prev, bankACH: true }));
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleACHSetupComplete);
      clearInterval(interval);
    };
  }, [paymentMethods.bankACH]);

  const handleToggle = (key: keyof typeof paymentMethods) => {
    // Special handling for ACH toggle
    if (key === "bankACH") {
      const isACHConfigured = getACHSetupStatus();
      
      // If trying to enable ACH but it's not set up, show setup modal
      if (!paymentMethods.bankACH && !isACHConfigured) {
        setShowACHSetupModal(true);
        return;
      }
      
      // If ACH is configured, allow normal toggle
      if (isACHConfigured) {
        setPaymentMethods(prev => ({ ...prev, [key]: !prev[key] }));
        showSuccessToast("Payment settings updated successfully.");
        return;
      }
      
      // Don't allow enabling if not configured
      return;
    }
    
    // Normal toggle for other payment methods
    setPaymentMethods(prev => ({ ...prev, [key]: !prev[key] }));
    
    // Auto-save on toggle change
    // In real app, this would be an API call
    showSuccessToast("Payment settings updated successfully.");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <style>{`
        .slim-switch button {
          height: 20px !important;
          width: 36px !important;
        }
        .slim-switch button > span {
          height: 16px !important;
          width: 16px !important;
        }
        .slim-switch button[data-state="checked"] > span {
          transform: translateX(18px) !important;
        }
      `}</style>
      <TabletHeader title="Payment Methods" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pb-4">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mt-1 mx-4">
          {/* Subtitle */}
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Changes made here will apply to all future invoices and payments. You can still edit these values on individual invoices.
          </p>

          {/* Section 1: Customer self-checkout */}
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-700 mb-2.5">
              Customer self-checkout
            </h2>
            
            <div className="space-y-0 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Credit and Debit cards */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
                    <CreditCard className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-gray-900 mb-0.5 leading-tight">
                      Credit and Debit cards
                    </h3>
                    <p className="text-[10px] text-gray-600 mb-0.5 leading-tight">
                      2.5% fee per payment
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Available on payments between $0.50 - $1,000
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2 p-2.5 -m-2.5 slim-switch">
                  <Switch
                    checked={paymentMethods.creditDebit}
                    onCheckedChange={() => handleToggle("creditDebit")}
                  />
                </div>
              </div>

              {/* Bank - ACH Transfer */}
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
                    <Landmark className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-gray-900 mb-0.5 leading-tight">
                      Bank - ACH Transfer
                    </h3>
                    <p className="text-[10px] text-gray-600 mb-0.5 leading-tight">
                      $1.00 fee per payment
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Available on payments between $1 - $1,000
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2 p-2.5 -m-2.5 slim-switch">
                  <Switch
                    checked={paymentMethods.bankACH}
                    onCheckedChange={() => handleToggle("bankACH")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Assisted checkout */}
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-700 mb-2.5">
              Assisted checkout
            </h2>
            
            <div className="space-y-0 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tap to Pay */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
                    <Waves className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-gray-900 mb-0.5 leading-tight">
                      Tap to Pay
                    </h3>
                    <p className="text-[10px] text-gray-600 mb-0.5 leading-tight">
                      2.5% fee per payment
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Available on payments between $0.50 - $1,000
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2 p-2.5 -m-2.5 slim-switch">
                  <Switch
                    checked={paymentMethods.tapToPay}
                    onCheckedChange={() => handleToggle("tapToPay")}
                  />
                </div>
              </div>

              {/* Manual card entry */}
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
                    <CreditCard className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-gray-900 mb-0.5 leading-tight">
                      Manual card entry
                    </h3>
                    <p className="text-[10px] text-gray-600 mb-0.5 leading-tight">
                      2.9% + 20¢ fee per payment
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Available on payments between $0.50 - $1,000
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2 p-2.5 -m-2.5 slim-switch">
                  <Switch
                    checked={paymentMethods.manualCardEntry}
                    onCheckedChange={() => handleToggle("manualCardEntry")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Record Payments Manually */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2.5">
              Record Payments Manually
            </h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-3 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
                    <Wallet className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-gray-900 mb-0.5 leading-tight">
                      Other Payment Methods
                    </h3>
                    <p className="text-[10px] text-gray-600 leading-tight">
                      Record cash, check, or other payments received.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2 p-2.5 -m-2.5 slim-switch">
                  <Switch
                    checked={paymentMethods.otherPaymentMethods}
                    onCheckedChange={() => handleToggle("otherPaymentMethods")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACH Setup Guide Modal */}
      <ACHSetupSliderModal
        isOpen={showACHSetupModal}
        onClose={() => setShowACHSetupModal(false)}
        onBack={() => setShowACHSetupModal(false)}
      />
    </div>
  );
};

export default PaymentMethods;
