import { useState } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/utils/toast";

const ChangeLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    // Auto-save on change
    showSuccessToast(`Language changed to ${value === "english" ? "English" : "Spanish"}.`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <TabletHeader title="Change App Language" showBack={true} />
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollable pb-6 flex flex-col items-center">
        {/* Header & Description Spacing */}
        <div className="w-full max-w-2xl px-4 sm:px-6">
          <div className="pt-4 pb-2">
            {/* Header is in TabletHeader, so just add spacing here */}
            <p className="text-sm text-gray-600 mb-8 mt-2 leading-relaxed">
              The app language will be set by default to your Clover POS set language.<br />
              You may choose to change the language using the options below.
            </p>
          </div>
        </div>
        {/* Language Options Card - Constrained and Centered */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden px-0 py-0">
            <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange} className="divide-y divide-gray-200">
              {/* English Option */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
                  selectedLanguage === "english" ? "bg-orange-50/50" : "hover:bg-gray-50"
                )}
                onClick={() => handleLanguageChange("english")}
              >
                <span className={cn(
                  "text-base font-medium flex-1 text-left",
                  selectedLanguage === "english" ? "text-[#FF8A3C] font-bold" : "text-gray-900"
                )}>
                  English
                </span>
                <RadioGroupItem
                  value="english"
                  id="english"
                  className={cn(
                    "h-5 w-5 border-2 flex-shrink-0 ml-4",
                    selectedLanguage === "english"
                      ? "border-[#FF8A3C] text-[#FF8A3C]"
                      : "border-gray-300"
                  )}
                />
              </div>
              {/* Spanish Option */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
                  selectedLanguage === "spanish" ? "bg-orange-50/50" : "hover:bg-gray-50"
                )}
                onClick={() => handleLanguageChange("spanish")}
              >
                <span className={cn(
                  "text-base font-medium flex-1 text-left",
                  selectedLanguage === "spanish" ? "text-[#FF8A3C] font-bold" : "text-gray-900"
                )}>
                  Spanish
                </span>
                <RadioGroupItem
                  value="spanish"
                  id="spanish"
                  className={cn(
                    "h-5 w-5 border-2 flex-shrink-0 ml-4",
                    selectedLanguage === "spanish"
                      ? "border-[#FF8A3C] text-[#FF8A3C]"
                      : "border-gray-300"
                  )}
                />
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeLanguage;
