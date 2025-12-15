import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
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
      <MobileHeader title="Change App Language" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-6 px-4">
        {/* Informational Text - Outside the card */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          The app language will be set by default to your Clover POS set language.
          <br />
          You may choose to change the language using the options below.
        </p>

        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Language Options */}
          <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange} className="space-y-0">
            {/* English Option */}
            <div
              className={cn(
                "flex items-center justify-between px-5 py-4 cursor-pointer transition-colors active:bg-gray-50",
                selectedLanguage === "english" && "bg-orange-50/50"
              )}
              onClick={() => handleLanguageChange("english")}
            >
              <Label
                htmlFor="english"
                className={cn(
                  "text-base font-bold cursor-pointer flex-1",
                  selectedLanguage === "english" ? "text-[#FF8A3C]" : "text-gray-900"
                )}
              >
                English
              </Label>
              <RadioGroupItem
                value="english"
                id="english"
                className={cn(
                  "h-5 w-5 border-2 flex-shrink-0",
                  selectedLanguage === "english"
                    ? "border-[#FF8A3C] text-[#FF8A3C]"
                    : "border-gray-300"
                )}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mx-5" />

            {/* Spanish Option */}
            <div
              className={cn(
                "flex items-center justify-between px-5 py-4 cursor-pointer transition-colors active:bg-gray-50",
                selectedLanguage === "spanish" && "bg-orange-50/50"
              )}
              onClick={() => handleLanguageChange("spanish")}
            >
              <Label
                htmlFor="spanish"
                className={cn(
                  "text-base font-bold cursor-pointer flex-1",
                  selectedLanguage === "spanish" ? "text-[#FF8A3C]" : "text-gray-900"
                )}
              >
                Spanish
              </Label>
              <RadioGroupItem
                value="spanish"
                id="spanish"
                className={cn(
                  "h-5 w-5 border-2 flex-shrink-0",
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
  );
};

export default ChangeLanguage;
