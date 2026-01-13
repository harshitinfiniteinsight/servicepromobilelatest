import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/utils/toast";

const PermissionSettings = () => {
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [crashReporting, setCrashReporting] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(true);

  const handlePrivacyChange = (checked: boolean) => {
    setPrivacyAgreed(checked);
    showSuccessToast("Permission settings updated successfully.");
  };

  const handleCrashReportingChange = (checked: boolean) => {
    setCrashReporting(checked);
    showSuccessToast("Permission settings updated successfully.");
  };

  const handleCameraPermissionChange = (checked: boolean) => {
    setCameraPermission(checked);
    showSuccessToast("Permission settings updated successfully.");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FDF4EF" }}>
      <MobileHeader title="Permission Settings" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-6">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-2 mx-4">
          {/* Permission Items */}
          <div className="space-y-8">
            {/* Privacy Policy & EULA */}
            <div className="flex items-start gap-4">
              <Checkbox
                id="privacy"
                checked={privacyAgreed}
                onCheckedChange={handlePrivacyChange}
                className={cn(
                  "h-5 w-5 rounded-md border-2 mt-0.5 flex-shrink-0",
                  "data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white",
                  "data-[state=unchecked]:border-gray-300 data-[state=unchecked]:bg-white",
                  "focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                )}
              />
              <Label
                htmlFor="privacy"
                className="text-sm text-gray-900 cursor-pointer flex-1 leading-relaxed"
              >
                I agree to{" "}
                <a
                  href="#"
                  className="text-orange-500 hover:text-orange-600 underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to Privacy Policy
                    console.log("Navigate to Privacy Policy");
                  }}
                >
                  Privacy Policy
                </a>{" "}
                &{" "}
                <a
                  href="#"
                  className="text-orange-500 hover:text-orange-600 underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to EULA
                    console.log("Navigate to EULA");
                  }}
                >
                  EULA
                </a>
                .
              </Label>
            </div>

            {/* Crash Reporting */}
            <div className="flex items-start gap-4">
              <Checkbox
                id="crash"
                checked={crashReporting}
                onCheckedChange={handleCrashReportingChange}
                className={cn(
                  "h-5 w-5 rounded-md border-2 mt-0.5 flex-shrink-0",
                  "data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white",
                  "data-[state=unchecked]:border-gray-300 data-[state=unchecked]:bg-white",
                  "focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                )}
              />
              <Label
                htmlFor="crash"
                className="text-sm text-gray-900 cursor-pointer flex-1 leading-relaxed"
              >
                I allow the app to collect crash reporting data.
              </Label>
            </div>

            {/* Camera Permission */}
            <div className="flex items-start gap-4">
              <Checkbox
                id="camera"
                checked={cameraPermission}
                onCheckedChange={handleCameraPermissionChange}
                className={cn(
                  "h-5 w-5 rounded-md border-2 mt-0.5 flex-shrink-0",
                  "data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white",
                  "data-[state=unchecked]:border-gray-300 data-[state=unchecked]:bg-white",
                  "focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                )}
              />
              <Label
                htmlFor="camera"
                className="text-sm text-gray-900 cursor-pointer flex-1 leading-relaxed"
              >
                I allow the application to use the camera to capture agreement images. I understand that limiting this permission will limit my ability to add images to my agreement through this application.
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionSettings;
