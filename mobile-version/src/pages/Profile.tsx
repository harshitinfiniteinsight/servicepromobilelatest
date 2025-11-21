import { useState, useEffect, useMemo } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/utils/toast";
import { mockEmployees } from "@/data/mobileMockData";

const Profile = () => {
  // Check if user is employee
  const userType = localStorage.getItem("userType") || "merchant";
  const isEmployee = userType === "employee";
  const currentEmployeeId = localStorage.getItem("currentEmployeeId") || "1";
  const currentEmployee = useMemo(() => {
    return mockEmployees.find(emp => emp.id === currentEmployeeId);
  }, [currentEmployeeId]);

  // Employee profile data
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthdate: "",
    employeeId: "",
  });

  // Merchant profile data
  const [merchantFormData, setMerchantFormData] = useState({
    businessName: "ServicePro Solutions",
    ownerFirstName: "John",
    ownerLastName: "Doe",
    merchantEmployeeId: "6817175129155",
    birthdate: "",
    phone: "8000260025",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [canEditProfile, setCanEditProfile] = useState(true); // Default to true, can be set from user permissions

  // Initialize employee data from current employee
  useEffect(() => {
    if (isEmployee && currentEmployee) {
      try {
        // Extract first and last name from employee name
        const nameParts = (currentEmployee.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        // Clean phone number (remove parentheses, dashes, spaces)
        const cleanPhone = currentEmployee.phone ? currentEmployee.phone.replace(/\D/g, "") : "";
        
        setEmployeeFormData({
          firstName,
          lastName,
          email: currentEmployee.email || "",
          phone: cleanPhone,
          birthdate: "", // Can be populated from employee data if available
          employeeId: currentEmployee.id || currentEmployeeId,
        });
      } catch (error) {
        console.error("Error initializing employee profile data:", error);
        // Set default values if there's an error
        setEmployeeFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          birthdate: "",
          employeeId: currentEmployeeId,
        });
      }
    }
  }, [isEmployee, currentEmployee, currentEmployeeId]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (isEmployee) {
      setEmployeeFormData({ ...employeeFormData, phone: value });
    } else {
      setMerchantFormData({ ...merchantFormData, phone: value });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Handle DD/MM/YYYY format
    if (value.includes("/")) {
      const parts = value.split("/");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        // Store as YYYY-MM-DD internally
        const dateValue = `${year}-${month}-${day}`;
        if (isEmployee) {
          setEmployeeFormData({ ...employeeFormData, birthdate: dateValue });
        } else {
          setMerchantFormData({ ...merchantFormData, birthdate: dateValue });
        }
        return;
      }
    }
    if (isEmployee) {
      setEmployeeFormData({ ...employeeFormData, birthdate: value });
    } else {
      setMerchantFormData({ ...merchantFormData, birthdate: value });
    }
  };

  const getDateInputValue = () => {
    const birthdate = isEmployee ? employeeFormData.birthdate : merchantFormData.birthdate;
    if (!birthdate) return "";
    // Convert YYYY-MM-DD to DD/MM/YYYY for input
    const parts = birthdate.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return birthdate;
  };

  const validateFields = () => {
    if (isEmployee) {
      // Employee validation
      if (!employeeFormData.firstName.trim()) return false;
      if (!employeeFormData.lastName.trim()) return false;
      if (!employeeFormData.email.trim()) return false;
      if (!employeeFormData.phone.trim()) return false;
      return true;
    } else {
      // Merchant validation
      if (!merchantFormData.businessName.trim()) return false;
      if (!merchantFormData.ownerFirstName.trim()) return false;
      if (!merchantFormData.ownerLastName.trim()) return false;
      if (!merchantFormData.phone.trim()) return false;
      return true;
    }
  };

  const handleSave = () => {
    // Validate fields
    if (!validateFields()) {
      // You could show an error toast here if needed
      return;
    }

    // Save the profile data (in a real app, this would be an API call)
    if (isEmployee) {
      // For employees: Save all fields EXCEPT employeeId (which is read-only)
      const { employeeId, ...updatableFields } = employeeFormData;
      // API call would be: updateEmployeeProfile(updatableFields)
      console.log("Saving employee profile (excluding employeeId):", updatableFields);
    } else {
      // For merchants: Save merchant profile data
      // API call would be: updateMerchantProfile(merchantFormData)
      console.log("Saving merchant profile:", merchantFormData);
    }
    
    // Exit edit mode
    setIsEditing(false);
    
    // Show success toast
    showSuccessToast("Profile updated successfully.");
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FDF4EF" }}>
      <MobileHeader 
        title="Profile" 
        showBack={true}
        actions={
          canEditProfile && (
            isEditing ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="h-7 px-3 rounded-full text-xs font-medium transition-colors bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
                className="h-7 px-3 rounded-full text-xs font-medium transition-colors border-orange-500 text-orange-500 hover:bg-orange-50"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )
          )
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-4">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-2 mx-4">
          {isEmployee ? (
            /* Employee Profile - Single Column Layout */
            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                  First Name
                </Label>
                <Input
                  value={employeeFormData.firstName}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, firstName: e.target.value })}
                  disabled={!isEditing || !canEditProfile}
                  className={cn(
                    "rounded-lg border-gray-300 h-10",
                    isEditing && canEditProfile ? "bg-white" : "bg-gray-50"
                  )}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                  Last Name
                </Label>
                <Input
                  value={employeeFormData.lastName}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, lastName: e.target.value })}
                  disabled={!isEditing || !canEditProfile}
                  className={cn(
                    "rounded-lg border-gray-300 h-10",
                    isEditing && canEditProfile ? "bg-white" : "bg-gray-50"
                  )}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                  Email
                </Label>
                <Input
                  type="email"
                  value={employeeFormData.email}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                  disabled={!isEditing || !canEditProfile}
                  className={cn(
                    "rounded-lg border-gray-300 h-10",
                    isEditing && canEditProfile ? "bg-white" : "bg-gray-50"
                  )}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={employeeFormData.phone}
                  onChange={handlePhoneChange}
                  disabled={!isEditing || !canEditProfile}
                  className={cn(
                    "rounded-lg border-gray-300 h-10",
                    isEditing && canEditProfile ? "bg-white" : "bg-gray-50"
                  )}
                />
              </div>

              {/* Birthdate */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                  Birthdate
                </Label>
                <Input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={getDateInputValue()}
                  onChange={handleDateChange}
                  disabled={!isEditing || !canEditProfile}
                  className={cn(
                    "rounded-lg border-gray-300 h-10",
                    isEditing && canEditProfile ? "bg-white" : "bg-gray-50"
                  )}
                />
              </div>

              {/* Employee ID - Always Read-Only */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                  Employee ID
                </Label>
                <Input
                  value={employeeFormData.employeeId}
                  disabled
                  readOnly
                  className="rounded-lg border-gray-300 bg-gray-50 h-10 text-gray-600 cursor-not-allowed"
                  style={{
                    cursor: 'not-allowed',
                    backgroundColor: '#f9fafb',
                    color: '#4b5563',
                    opacity: 1
                  }}
                />
              </div>
            </div>
          ) : (
            /* Merchant Profile - Two-Column Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                    Business name
                  </Label>
                  <Input
                    value={merchantFormData.businessName}
                    onChange={(e) => setMerchantFormData({ ...merchantFormData, businessName: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "rounded-lg border-gray-300 h-10",
                      isEditing ? "bg-white" : "bg-gray-50"
                    )}
                  />
                </div>

                {/* Owner Last Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                    Owner last name
                  </Label>
                  <Input
                    value={merchantFormData.ownerLastName}
                    onChange={(e) => setMerchantFormData({ ...merchantFormData, ownerLastName: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "rounded-lg border-gray-300 h-10",
                      isEditing ? "bg-white" : "bg-gray-50"
                    )}
                  />
                </div>

                {/* Birthdate */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                    Birthdate
                  </Label>
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={getDateInputValue()}
                    onChange={handleDateChange}
                    disabled={!isEditing}
                    className={cn(
                      "rounded-lg border-gray-300 h-10",
                      isEditing ? "bg-white" : "bg-gray-50"
                    )}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Owner First Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                    Owner first name
                  </Label>
                  <Input
                    value={merchantFormData.ownerFirstName}
                    onChange={(e) => setMerchantFormData({ ...merchantFormData, ownerFirstName: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "rounded-lg border-gray-300 h-10",
                      isEditing ? "bg-white" : "bg-gray-50"
                    )}
                  />
                </div>

                {/* Merchant/Employee ID */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                    Merchant/Employee ID
                  </Label>
                  <Input
                    value={merchantFormData.merchantEmployeeId}
                    disabled
                    className="rounded-lg border-gray-300 bg-gray-50 h-10"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold" style={{ color: "#F97316" }}>
                    Phone
                  </Label>
                  <Input
                    type="tel"
                    value={merchantFormData.phone}
                    onChange={handlePhoneChange}
                    disabled={!isEditing}
                    className={cn(
                      "rounded-lg border-gray-300 h-10",
                      isEditing ? "bg-white" : "bg-gray-50"
                    )}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
