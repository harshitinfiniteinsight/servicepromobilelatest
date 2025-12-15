import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/utils/toast";

const BusinessPolicies = () => {
  const [termsConditions, setTermsConditions] = useState("");
  const [cancellationReturn, setCancellationReturn] = useState("");

  const handleSubmit = () => {
    // Validate fields (if required by backend)
    // For now, we'll allow empty fields but you can add validation if needed
    // if (!termsConditions.trim() || !cancellationReturn.trim()) {
    //   return;
    // }

    // In real app, save to server
    // For now, simulate save
    
    // Show success toast
    showSuccessToast("Business policies saved successfully.");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FDF4EF" }}>
      <MobileHeader title="Business Policies" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-6">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-2 mx-4 mb-8">
          {/* Form Fields */}
          <div className="space-y-6">
            {/* Terms & Conditions */}
            <div className="space-y-2">
              <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                Terms & Conditions:
              </Label>
              <Textarea
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                placeholder="Enter your terms and conditions..."
                className={cn(
                  "min-h-[150px] rounded-lg border-gray-300 resize-none",
                  "focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                  "placeholder:text-gray-400"
                )}
              />
            </div>

            {/* Cancellation & Return */}
            <div className="space-y-2">
              <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                Cancellation & Return:
              </Label>
              <Textarea
                value={cancellationReturn}
                onChange={(e) => setCancellationReturn(e.target.value)}
                placeholder="Enter your cancellation and return policy..."
                className={cn(
                  "min-h-[150px] rounded-lg border-gray-300 resize-none",
                  "focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                  "placeholder:text-gray-400"
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 mb-8">
            <Button
              onClick={handleSubmit}
              className="w-full rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all h-14 text-base"
              style={{ backgroundColor: "#F97316" }}
            >
              SUBMIT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPolicies;
