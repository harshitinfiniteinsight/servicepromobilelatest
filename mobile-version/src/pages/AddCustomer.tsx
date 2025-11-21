import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { showSuccessToast } from "@/utils/toast";

const AddCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const isFromCheckout = (location.state as { fromCheckout?: boolean } | null)?.fromCheckout || false;

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePicture(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new customer object
    const newCustomer = {
      id: `customer-${Date.now()}`,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: "",
      status: "Active" as const,
      lastVisit: new Date().toISOString().split("T")[0],
      totalSpent: 0,
      joinedDate: new Date().toISOString().split("T")[0],
      notes: "",
    };

    // In real app, this would call an API to save the customer
    // For now, we'll simulate success
    
    if (isFromCheckout) {
      // If coming from checkout, return to customer selection with new customer
      showSuccessToast("Customer added successfully");
      navigate("/checkout/customer", { 
        state: { newCustomer },
        replace: true 
      });
    } else {
      // Normal flow: navigate to customers list
      showSuccessToast("Customer added successfully");
      navigate("/customers");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <MobileHeader title="New Customer" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6">
        <div className="flex flex-col items-center p-4 space-y-4">
          {/* Profile Picture Upload */}
          <div className="relative mt-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-300 overflow-hidden">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Form Fields */}
          <div className="w-full space-y-3">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </Label>
              <Input
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </Label>
              <Input
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </Label>
              <Input
                type="email"
                placeholder="customer@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </Label>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t bg-background">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
        >
          Create Customer
        </Button>
      </div>
    </div>
  );
};

export default AddCustomer;

