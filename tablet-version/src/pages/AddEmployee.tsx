import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthdate: "",
    role: "",
  });

  const roles = [
    "Admin",
    "Manager",
    "Employee",
  ];

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    // In real app, create employee
    toast.success("Employee created successfully");
    navigate("/employees");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <MobileHeader title="New Employee" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-gray-800 mb-4">New Employee</h1>

          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div>
            <Label className="text-sm font-medium text-gray-700">First Name *</Label>
            <Input
              type="text"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Last Name *</Label>
            <Input
              type="text"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Email *</Label>
            <Input
              type="email"
              placeholder="employee@servicepro.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Phone Number *</Label>
            <Input
              type="tel"
              placeholder="(555) 111-0001"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Birthdate</Label>
            <Input
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-orange-500 focus:border-orange-500 h-auto">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            <Button
              type="submit"
              className="w-full mt-4 py-3 bg-orange-500 text-white font-medium rounded-xl shadow-sm hover:bg-orange-600"
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role}
            >
              Create Employee
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full py-2 text-gray-500 text-sm font-medium"
              onClick={() => navigate("/employees")}
            >
              Cancel
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;

