import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockCustomers, mockEmployees, serviceTypes } from "@/data/mobileMockData";
import { Search, ChevronRight, Calendar, Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

const AddJob = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [technician, setTechnician] = useState("");
  const [notes, setNotes] = useState("");

  // Handle prefill data from location.state (when converting from notification)
  useEffect(() => {
    const prefill = (locationState.state as any)?.prefill;
    if (prefill) {
      // Prefill customer
      if (prefill.customerId) {
        setSelectedCustomer(prefill.customerId);
        const customer = mockCustomers.find(c => c.id === prefill.customerId);
        if (customer) {
          setCustomerSearch(customer.name);
        }
      }
      
      // Prefill job address
      if (prefill.jobAddress) {
        setJobLocation(prefill.jobAddress);
      }
      
      // Prefill employee/technician
      if (prefill.employeeId) {
        setTechnician(prefill.employeeId);
      }
    }
  }, [locationState.state]);

  const filteredCustomers = mockCustomers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const availableTechnicians = mockEmployees.filter(e => e.status === "Active" && e.role.includes("Technician"));

  const handleSubmit = () => {
    // In real app, create job
    navigate("/jobs");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="New Job" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 px-4 pb-6 space-y-4">
        {/* Customer Selection */}
        <div>
          <Label>Customer *</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {customerSearch && (
            <div className="mt-2 space-y-2">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-colors",
                    selectedCustomer === customer.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card hover:bg-accent/5"
                  )}
                  onClick={() => {
                    setSelectedCustomer(customer.id);
                    setCustomerSearch(customer.name);
                    setJobLocation(customer.address);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    {selectedCustomer === customer.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Type */}
        <div>
          <Label>Service Type *</Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger>
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div>
          <Label>Date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="pl-10"
            />
          </div>
        </div>

        {/* Time */}
        <div>
          <Label>Time *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label>Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              placeholder="Job location address"
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
              className="pl-10 min-h-[80px]"
            />
          </div>
        </div>

        {/* Technician */}
        <div>
          <Label>Assign Technician *</Label>
          <Select value={technician} onValueChange={setTechnician}>
            <SelectTrigger>
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              {availableTechnicians.map(tech => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name} - {tech.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div>
          <Label>Notes</Label>
          <Textarea
            placeholder="Add any special instructions or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t bg-background">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedCustomer || !serviceType || !date || !time || !jobLocation || !technician}
        >
          Create Job
        </Button>
      </div>
    </div>
  );
};

export default AddJob;

