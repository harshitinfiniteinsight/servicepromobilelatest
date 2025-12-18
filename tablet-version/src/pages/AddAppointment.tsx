import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddCustomerModal from "@/components/modals/AddCustomerModal";
import { mockAppointments, mockCustomers, mockEmployees, serviceTypes } from "@/data/mobileMockData";
import { Plus, Users, UserCheck, UserRoundPlus, Calendar, Clock, Bell, Mail, Phone, Pencil } from "lucide-react";
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
  
  const [subject, setSubject] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [customers, setCustomers] = useState<typeof mockCustomers>(mockCustomers);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string; employeeId: string }>>([]);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [reminder, setReminder] = useState<string>("30 minutes");
  const [note, setNote] = useState<string>("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#4f46e5");
  const [categoryEmployeeId, setCategoryEmployeeId] = useState<string>("");
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

  const activeEmployees = useMemo(
    () => mockEmployees.filter(emp => emp.status === "Active"),
    []
  );
  const selectedCustomerRecord = useMemo(
    () => customers.find(customer => customer.id === customerId),
    [customerId, customers]
  );

  // Load categories from storage + seed with defaults
  useEffect(() => {
    const seed = serviceTypes.map((name, idx) => ({
      id: `seed-${idx}-${name}`,
      name,
      color: "#f97316",
      employeeId: "all",
    }));
    const stored = localStorage.getItem("servicepro_appointment_categories");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCategories([...seed, ...parsed]);
      } catch (e) {
        setCategories(seed);
      }
    } else {
      setCategories(seed);
    }
  }, []);

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

  // Shared customers: merge persisted with mock and keep newest first
  useEffect(() => {
    const stored = localStorage.getItem("servicepro_customers");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged = [...parsed, ...mockCustomers.filter(mc => !parsed.find((pc: any) => pc.id === mc.id))];
        setCustomers(merged);
      } catch (e) {
        setCustomers(mockCustomers);
      }
    } else {
      setCustomers(mockCustomers);
    }
  }, []);

  // Handle pre-selected customer from query params
  useEffect(() => {
    if (mode === "create" && preselectedCustomerId && preselectedCustomerName) {
      const customer = customers.find(c => c.id === preselectedCustomerId);
      if (customer) {
        setCustomerId(customer.id);
        setEmail(customer.email);
        setPhone(customer.phone);
        setAddress(customer.address || "");
      } else if (preselectedCustomerId) {
        setCustomerId(preselectedCustomerId);
      }
    }
  }, [preselectedCustomerId, preselectedCustomerName, mode, customers]);

  // Ensure dropdown closes when opening the add-customer modal
  useEffect(() => {
    if (addCustomerModalOpen) {
      setCustomerSelectOpen(false);
    }
  }, [addCustomerModalOpen]);

  // Default employee selection inside category modal follows current selection
  useEffect(() => {
    if (categoryModalOpen) {
      if (employeeId) {
        setCategoryEmployeeId(employeeId);
      } else if (isEmployee && currentEmployeeId) {
        setCategoryEmployeeId(currentEmployeeId);
      } else {
        setCategoryEmployeeId(activeEmployees[0]?.id || "");
      }
    }
  }, [categoryModalOpen, employeeId, isEmployee, currentEmployeeId, activeEmployees]);

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

  const availableCategories = useMemo(() => {
    return categories.filter(cat => cat.employeeId === "all" || cat.employeeId === employeeId || (!employeeId && cat.employeeId === "all"));
  }, [categories, employeeId]);

  // Filter appointments by selected employee for the right panel
  const employeeAppointments = useMemo(() => {
    if (!employeeId) return [];
    return mockAppointments.filter(apt => apt.technicianId === employeeId);
  }, [employeeId]);

  const selectedEmployeeName = useMemo(() => {
    return activeEmployees.find(emp => emp.id === employeeId)?.name || "";
  }, [employeeId, activeEmployees]);

  const handleEditAppointment = (appointmentId: string) => {
    navigate(`/appointments/edit/${appointmentId}?fromView=${fromView}`);
  };

  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryColor || !categoryEmployeeId) return;
    const duplicate = categories.find(
      c => c.name.trim().toLowerCase() === newCategoryName.trim().toLowerCase() && c.employeeId === categoryEmployeeId
    );
    if (duplicate) {
      showSuccessToast("Category already exists for this employee");
      return;
    }
    const created = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      color: newCategoryColor,
      employeeId: categoryEmployeeId,
    };
    const updated = [...categories, created];
    setCategories(updated);
    localStorage.setItem("servicepro_appointment_categories", JSON.stringify(updated.filter(c => !c.id.startsWith("seed-"))));
    setCategory(created.name);
    setCategoryModalOpen(false);
    setNewCategoryName("");
    setNewCategoryColor("#4f46e5");
    showSuccessToast("Category added");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      <TabletHeader
        title={mode === "edit" ? "Edit Appointment" : "Add Appointment"}
        showBack
        onBack={handleBack}
        className="px-4 md:px-6 lg:px-8"
      />

      <div className="flex-1 overflow-y-auto scrollable pb-8 pt-6">
        <div className="px-4 md:px-6 lg:px-8">
          {/* Split layout: ~48% form (left) + ~52% appointment list (right) for tablet/large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] xl:grid-cols-[45%_55%] gap-6">
            {/* LEFT SECTION: Add Appointment Form */}
            <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-4 md:px-6 lg:px-8 pt-5 pb-6 space-y-6">
                {/* Row 1: Appointment Subject + Employee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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

                  <div className="space-y-2">
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
                      <Select value={employeeId || ""} onValueChange={setEmployeeId}>
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
                </div>

                {/* Row 2: Customers + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <span>Customers</span>
                        <span className="text-destructive">*</span>
                      </Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg border border-dashed border-gray-300 text-primary hover:bg-gray-50"
                        onClick={() => {
                          setCustomerSelectOpen(false);
                          setAddCustomerModalOpen(true);
                        }}
                      >
                        <UserRoundPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select
                      value={customerId || ""}
                      onValueChange={setCustomerId}
                      open={customerSelectOpen}
                      onOpenChange={setCustomerSelectOpen}
                    >
                      <SelectTrigger className="h-11 border-gray-300">
                        <SelectValue placeholder="Choose customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} — {customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                        onClick={() => setCategoryModalOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select value={category || ""} onValueChange={setCategory}>
                      <SelectTrigger className="h-11 border-gray-300">
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map(type => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Address</Label>
                    <Input
                      placeholder="123 Main St, City, State"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-11 border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Reminder Before</Label>
                    <div className="relative">
                      <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Select value={reminder || ""} onValueChange={setReminder}>
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

                <div className="w-full md:grid md:grid-cols-2 md:gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Appointment Note</Label>
                    <Textarea
                      placeholder="Additional notes or special instructions..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[80px] border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:justify-center md:gap-3 mx-1 md:mx-0 pb-2 safe-bottom">
              <Button
                className="w-full md:w-60 rounded-full py-3 text-sm font-semibold"
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                {mode === "edit" ? "Update Appointment" : "Add Appointment"}
              </Button>
              <Button
                variant="outline"
                className="w-full md:w-60 rounded-full py-3 text-sm font-semibold text-gray-700 border-gray-200 hover:bg-muted mt-2 md:mt-0"
                onClick={handleBack}
                type="button"
              >
                Cancel
              </Button>
            </div>
            </div>

            {/* RIGHT SECTION: Appointment List for Selected Employee */}
            <div className="hidden lg:block">
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm sticky top-6">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {employeeId && selectedEmployeeName
                      ? `Appointment List of ${selectedEmployeeName}`
                      : "Appointment List"}
                  </h2>
                </div>

                <div className="p-6">
                  {!employeeId ? (
                    <div className="flex items-center justify-center py-12 text-center">
                      <div className="space-y-3">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-sm text-gray-500">
                          Select an employee to view appointments
                        </p>
                      </div>
                    </div>
                  ) : employeeAppointments.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-center">
                      <div className="space-y-3">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-sm text-gray-500">
                          No appointments found for {selectedEmployeeName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Customer Name
                            </th>
                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {employeeAppointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-3 text-sm text-gray-900">
                                {appointment.customerName}
                              </td>
                              <td className="py-3 px-3 text-sm text-gray-700">
                                {appointment.service}
                              </td>
                              <td className="py-3 px-3 text-sm text-gray-700">
                                {appointment.date}
                              </td>
                              <td className="py-3 px-3 text-sm text-gray-700">
                                {appointment.time}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => handleEditAppointment(appointment.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Appointment Category</DialogTitle>
              <DialogDescription>Assign to an employee and pick a color to keep categories organized.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Select Employee</Label>
                <Select value={categoryEmployeeId || ""} onValueChange={setCategoryEmployeeId}>
                  <SelectTrigger className="h-10 border-gray-300">
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Category Name</Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., HVAC Maintenance"
                  className="h-10 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="h-10 w-16 p-1 border-gray-300"
                  />
                  <Input
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="h-10 flex-1 border-gray-300"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-end sm:gap-3">
              <Button
                variant="outline"
                type="button"
                className="h-10 px-6 text-sm font-semibold"
                onClick={() => setCategoryModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                className="h-10 px-6 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!newCategoryName || !newCategoryColor || !categoryEmployeeId}
                onClick={handleAddCategory}
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AddCustomerModal
          isOpen={addCustomerModalOpen}
          onClose={() => setAddCustomerModalOpen(false)}
          onCustomerCreated={(customer) => {
            setCustomers(prev => [customer, ...prev.filter(c => c.id !== customer.id)]);
            setCustomerId(customer.id);
          }}
        />
      </div>
    </div>
  );
};

export default AddAppointment;
