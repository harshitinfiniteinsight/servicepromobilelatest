import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockAppointments, mockCustomers, mockEmployees, serviceTypes } from "@/data/mobileMockData";
import { Plus, Users, UserCheck, UserRoundPlus, Calendar, Clock, Bell, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/utils/toast";

const reminderOptions = [
  "15 minutes",
  "30 minutes",
  "1 hour",
  "2 hours",
  "1 day",
] as const;

interface AddAppointmentProps {
  mode?: "create" | "edit";
}

const AddAppointment = ({ mode = "create" }: AddAppointmentProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromView = searchParams.get("fromView") || "calendar";
  const fromDashboard = searchParams.get("from") === "dashboard";
  const preselectedCustomerId = searchParams.get("customerId");
  const preselectedCustomerName = searchParams.get("customerName");
  
  // Check if user is employee
  const userType = localStorage.getItem("userType") || "merchant";
  const isEmployee = userType === "employee";
  const currentEmployeeId = localStorage.getItem("currentEmployeeId") || "1";
  const currentEmployee = mockEmployees.find(emp => emp.id === currentEmployeeId);
  
  const [subject, setSubject] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState("30 minutes");
  const [note, setNote] = useState("");

  const activeEmployees = useMemo(
    () => mockEmployees.filter(emp => emp.status === "Active"),
    []
  );
  const selectedCustomerRecord = useMemo(
    () => mockCustomers.find(customer => customer.id === customerId),
    [customerId]
  );

  // Handle edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const appointment = mockAppointments.find(apt => apt.id === id);
      if (appointment) {
        setSubject(appointment.service);
        // For employees, lock to their own ID; for merchants, use appointment's technician
        if (isEmployee && currentEmployeeId) {
          setEmployeeId(currentEmployeeId);
        } else {
          setEmployeeId(appointment.technicianId);
        }
        setCustomerId(appointment.customerId);
        setCategory(serviceTypes.includes(appointment.service) ? appointment.service : "");
        setEmail(`${appointment.customerName.split(" ").join(".").toLowerCase()}@example.com`);
        const customer = mockCustomers.find(c => c.id === appointment.customerId);
        setPhone(customer?.phone ?? "");
        setAddress(customer?.address ?? "");
        setDate(appointment.date);
        setTime(
          appointment.time
            ? appointment.time
                .replace(" AM", "")
                .replace(" PM", "")
            : ""
        );
        setReminder("30 minutes");
        setNote(appointment.status === "Pending" ? "Follow up required" : "");
      }
    }
  }, [mode, id, isEmployee, currentEmployeeId]);

  // Auto-fill employee field for employee login
  useEffect(() => {
    if (isEmployee && currentEmployeeId && mode === "create") {
      setEmployeeId(currentEmployeeId);
    }
  }, [isEmployee, currentEmployeeId, mode]);

  // Handle pre-selected customer from query params
  useEffect(() => {
    if (mode === "create" && preselectedCustomerId && preselectedCustomerName) {
      // Find the customer by ID to get full details
      const customer = mockCustomers.find(c => c.id === preselectedCustomerId);
      if (customer) {
        setCustomerId(customer.id);
        setEmail(customer.email);
        setPhone(customer.phone);
        setAddress(customer.address || "");
      } else if (preselectedCustomerId) {
        // If customer ID exists but not found in mock data, still set it
        setCustomerId(preselectedCustomerId);
      }
    }
  }, [preselectedCustomerId, preselectedCustomerName, mode]);

  const handleSubmit = () => {
    if (mode === "edit") {
      showSuccessToast("Appointment updated successfully");
    } else {
      showSuccessToast("Appointment created successfully");
    }
    if (fromDashboard) {
      navigate("/");
    } else {
      navigate(`/appointments/manage?view=${fromView}`);
    }
  };

  const handleBack = () => {
    if (fromDashboard) {
      navigate("/");
    } else {
      navigate(`/appointments/manage?view=${fromView}`);
    }
  };

  const isFormValid = subject && employeeId && customerId && category && email && phone && date && time;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      <MobileHeader 
        title={mode === "edit" ? "Edit Appointment" : "Add Appointment"} 
        showBack 
        onBack={handleBack}
      />

      <div className="flex-1 overflow-y-auto scrollable pt-16 pb-6">
        <div className="mx-4 rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="px-4 pt-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-subject" className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                Appointment Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="appointment-subject"
                placeholder="e.g., HVAC Maintenance Check"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 border-gray-300"
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span>Employee</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  {/* Hidden input for employee ID (for form submission) */}
                  {isEmployee && currentEmployeeId && (
                    <input type="hidden" name="employeeId" value={currentEmployeeId} />
                  )}
                  {/* Employee field - disabled for employees, editable for merchants */}
                  {isEmployee && currentEmployee ? (
                    <Input
                      value={currentEmployee.name}
                      disabled
                      readOnly
                      className="h-11 border-gray-300 bg-gray-50 text-gray-700 cursor-not-allowed"
                      style={{ backgroundColor: '#f7f7f7', color: '#444', opacity: 1 }}
                    />
                  ) : (
                    <Select value={employeeId} onValueChange={setEmployeeId}>
                      <SelectTrigger className="h-11 border-gray-300">
                        <SelectValue placeholder="Choose employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeEmployees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} — {emp.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex-1 space-y-2 mt-4 sm:mt-0">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <span>Customers</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg border border-dashed border-gray-300 text-primary hover:bg-gray-50"
                      onClick={() => navigate("/customers/new")}
                    >
                      <UserRoundPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger className="h-11 border-gray-300">
                      <SelectValue placeholder="Choose customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} — {customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedCustomerRecord && (
                <p className="text-xs text-muted-foreground">
                  {selectedCustomerRecord.phone} · {selectedCustomerRecord.address}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span>Category</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg border border-dashed border-gray-300 text-primary hover:bg-gray-50"
                    onClick={() => navigate("/services/new")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 border-gray-300">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 h-11 border-gray-300"
                    placeholder="customer@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 h-11 border-gray-300"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Address</Label>
              <Textarea
                placeholder="123 Main St, City, State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="min-h-[80px] border-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span>Appointment Date</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="pl-10 h-11 border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span>Appointment Time</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-10 h-11 border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Appointment Note</Label>
              <Textarea
                placeholder="Additional notes or special instructions..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[80px] border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Reminder Before</Label>
              <div className="relative">
                <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select value={reminder} onValueChange={setReminder}>
                  <SelectTrigger className="pl-10 h-11 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4 flex flex-col gap-2 pb-2 safe-bottom">
          <Button
            className="w-full rounded-full py-3 text-sm font-semibold"
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            {mode === "edit" ? "Update Appointment" : "Add Appointment"}
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full py-3 text-sm font-semibold text-gray-700 border-gray-200 hover:bg-muted"
            onClick={handleBack}
            type="button"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddAppointment;
