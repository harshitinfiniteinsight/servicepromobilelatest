import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/utils/toast";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = (password: string): boolean => {
    // Min 8 characters
    if (password.length < 8) {
      return false;
    }
    
    // Must include uppercase letter
    if (!/[A-Z]/.test(password)) {
      return false;
    }
    
    // Must include lowercase letter
    if (!/[a-z]/.test(password)) {
      return false;
    }
    
    // Must include a number or special character (@,#,$,%,*,!)
    if (!/[0-9@#$%*!]/.test(password)) {
      return false;
    }
    
    return true;
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case "currentPassword":
        if (!value.trim()) {
          newErrors.currentPassword = "Current password is required";
        } else {
          newErrors.currentPassword = "";
        }
        break;
      case "newPassword":
        if (!value.trim()) {
          newErrors.newPassword = "New password is required";
        } else if (!validatePassword(value)) {
          newErrors.newPassword = "Password does not meet requirements";
        } else {
          newErrors.newPassword = "";
        }
        break;
      case "confirmPassword":
        if (!value.trim()) {
          newErrors.confirmPassword = "Confirm password is required";
        } else if (value !== newPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          newErrors.confirmPassword = "";
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChangePassword = () => {
    // Reset errors
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Validate all fields
    let hasErrors = false;

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
      hasErrors = true;
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      hasErrors = true;
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = "Password does not meet requirements";
      hasErrors = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
      hasErrors = true;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // In real app, this would be an API call
    // For now, simulate success
    
    // Show success toast
    showSuccessToast("Password updated successfully.");
    
    // Clear all fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FDF4EF" }}>
      <MobileHeader title="Change Password" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-6">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-2 mx-4">
          {/* Form Fields */}
          <div className="space-y-5">
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                Current Password
              </Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  validateField("currentPassword", e.target.value);
                }}
                onBlur={(e) => validateField("currentPassword", e.target.value)}
                className={cn(
                  "rounded-lg border-gray-300 h-10",
                  errors.currentPassword ? "border-red-500" : ""
                )}
              />
              {errors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                New Password
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validateField("newPassword", e.target.value);
                  // Also revalidate confirm password if it has a value
                  if (confirmPassword) {
                    validateField("confirmPassword", confirmPassword);
                  }
                }}
                onBlur={(e) => validateField("newPassword", e.target.value)}
                className={cn(
                  "rounded-lg border-gray-300 h-10",
                  errors.newPassword ? "border-red-500" : ""
                )}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                Confirm Password
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateField("confirmPassword", e.target.value);
                }}
                onBlur={(e) => validateField("confirmPassword", e.target.value)}
                className={cn(
                  "rounded-lg border-gray-300 h-10",
                  errors.confirmPassword ? "border-red-500" : ""
                )}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements Note */}
            <p className="text-xs mt-2" style={{ color: "#7A7A7A" }}>
              * Min 8 characters, must include uppercase, lowercase letters and a number or special character (@,#,$,%,*,!)
            </p>
          </div>

          {/* Change Password Button */}
          <div className="mt-8">
            <Button
              onClick={handleChangePassword}
              className="w-full rounded-lg font-bold text-white shadow-md hover:shadow-lg transition-all h-12 text-base"
              style={{ backgroundColor: "#F97316" }}
            >
              CHANGE PASSWORD
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
