import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEmployees, mockJobs, mockInvoices, mockEstimates, mockAgreements, mockCustomers } from "@/data/mobileMockData";
import { Phone, Mail, Calendar, Star, Briefcase, MapPin, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";
import StarRating from "@/components/common/StarRating";
import EmptyState from "@/components/cards/EmptyState";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const employee = mockEmployees.find(e => e.id === id);
  
  const [formData, setFormData] = useState({
    firstName: employee?.name.split(" ")[0] || "",
    lastName: employee?.name.split(" ").slice(1).join(" ") || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    birthdate: "",
    role: employee?.role || "",
  });

  const [workingHours, setWorkingHours] = useState({
    allowOutsideHours: false,
    timeZone: "America/Los_Angeles",
    selectedDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as string[],
    dayTimes: {} as Record<string, { startTime: string; endTime: string }>,
  });

  const timeZones = [
    "America/Los_Angeles",
    "America/New_York",
    "Europe/London",
    "Asia/Kolkata",
  ];

  const daysOfWeek = [
    { label: "S", value: "Sunday" },
    { label: "M", value: "Monday" },
    { label: "T", value: "Tuesday" },
    { label: "W", value: "Wednesday" },
    { label: "T", value: "Thursday" },
    { label: "F", value: "Friday" },
    { label: "S", value: "Saturday" },
  ];
  
  if (!employee) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Employee not found</p>
      </div>
    );
  }

  const toggleDay = (dayValue: string) => {
    setWorkingHours(prev => {
      const isCurrentlySelected = prev.selectedDays.includes(dayValue);
      const newSelectedDays = isCurrentlySelected
        ? prev.selectedDays.filter(d => d !== dayValue)
        : [...prev.selectedDays, dayValue];
      
      const newDayTimes = { ...prev.dayTimes };
      if (isCurrentlySelected) {
        delete newDayTimes[dayValue];
      } else {
        newDayTimes[dayValue] = { startTime: "", endTime: "" };
      }
      
      return {
        ...prev,
        selectedDays: newSelectedDays,
        dayTimes: newDayTimes
      };
    });
  };

  const updateDayTime = (dayValue: string, field: "startTime" | "endTime", value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      dayTimes: {
        ...prev.dayTimes,
        [dayValue]: {
          ...prev.dayTimes[dayValue],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Employee updated successfully");
    navigate(`/employees/${id}`);
  };

  if (isEditMode) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-white">
        <MobileHeader title="Edit Employee" showBack={true} />
        
        <div className="flex-1 overflow-y-auto scrollable pt-14 pb-24">
          <div className="p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="space-y-2">
                {/* First Name / Last Name - Side by side */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">First Name *</Label>
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full mt-0.5 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Last Name *</Label>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full mt-0.5 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Email *</Label>
                  <Input
                    type="email"
                    placeholder="employee@servicepro.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-0.5 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
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
                    className="w-full mt-0.5 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                {/* Birthdate / Role - Side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Birthdate</Label>
                    <Input
                      type="date"
                      value={formData.birthdate}
                      onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                      className="w-full mt-0.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-orange-500 focus:border-orange-500 h-10"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="w-full mt-0.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-orange-500 focus:border-orange-500 h-10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Section Divider */}
                <hr className="border-gray-100 my-2" />

                {/* Working Hours Section */}
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-gray-700 mt-2 mb-1.5">Working Hours</h2>

                  <p className="text-xs text-gray-500 leading-tight mb-1.5">
                    Set the time slots during which the employee may log in to the system.
                    If no specific time is set, the employee can log in at any time.
                  </p>

                  <div className="flex items-center mb-1.5 p-1.5">
                    <Checkbox
                      id="allow-outside"
                      checked={workingHours.allowOutsideHours}
                      onCheckedChange={(checked) => 
                        setWorkingHours({ ...workingHours, allowOutsideHours: checked as boolean })
                      }
                      className="mr-2"
                    />
                    <Label htmlFor="allow-outside" className="text-sm text-gray-700 cursor-pointer">
                      Allow employee to log in outside working hours
                    </Label>
                  </div>

                  <div className="mb-1.5">
                    <Label className="text-sm font-medium text-gray-700">Time Zone</Label>
                    <Select 
                      value={workingHours.timeZone} 
                      onValueChange={(value) => setWorkingHours({ ...workingHours, timeZone: value })}
                    >
                      <SelectTrigger className="w-full mt-0.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-orange-500 focus:border-orange-500 h-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeZones.map(tz => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Day Selector */}
                  <div className="flex justify-between gap-1 mt-1.5 mb-2">
                    {daysOfWeek.map((day, index) => {
                      const isSelected = workingHours.selectedDays.includes(day.value);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-colors",
                            isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Day Time Inputs */}
                  <div className="space-y-1.5">
                    {daysOfWeek.map((day, index) => {
                      const isSelected = workingHours.selectedDays.includes(day.value);
                      const dayTime = workingHours.dayTimes[day.value] || { startTime: "", endTime: "" };
                      
                      if (!isSelected) return null;

                      return (
                        <div key={index} className="grid grid-cols-[80px,1fr,1fr] items-center gap-2">
                          <span className="text-sm text-gray-700 truncate">{day.value}</span>
                          <Input
                            type="time"
                            value={dayTime.startTime}
                            onChange={(e) => updateDayTime(day.value, "startTime", e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-orange-500 focus:border-orange-500 w-full"
                            placeholder="🕒 Start Time"
                          />
                          <Input
                            type="time"
                            value={dayTime.endTime}
                            onChange={(e) => updateDayTime(day.value, "endTime", e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-orange-500 focus:border-orange-500 w-full"
                            placeholder="🕒 End Time"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Share Employee Shift Detail Button */}
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        // Handle share functionality
                        toast.info("Share employee shift detail functionality");
                      }}
                    >
                      Share Employee Shift Detail
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sticky Footer with Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 pb-6">
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600"
            disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role}
          >
            Update Employee
          </Button>
        </div>
      </div>
    );
  }

  const initials = employee.name.split(" ").map(n => n[0]).join("");
  
  // Get all jobs assigned to this employee (from mockJobs, invoices, estimates, agreements)
  const allEmployeeJobs = useMemo(() => {
    // Helper to assign technician based on customer or random assignment (same logic as Jobs page)
    const assignTechnician = (customerId: string, index: number) => {
      const technicians = ["Mike Johnson", "Tom Wilson", "Chris Davis", "Sarah Martinez"];
      const techIndex = (parseInt(customerId) + index) % technicians.length;
      return technicians[techIndex];
    };

    // Helper to get customer address
    const getCustomerAddress = (customerId: string): string => {
      const customer = mockCustomers.find(c => c.id === customerId);
      return customer?.address || "";
    };

    // Transform invoices to jobs
    const invoiceJobs = mockInvoices.map((invoice, index) => ({
      id: invoice.id,
      title: (invoice as any).serviceName || (invoice as any).services?.[0] || "Service Job",
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      technicianId: "1",
      technicianName: assignTechnician(invoice.customerId, index),
      date: invoice.issueDate,
      time: "09:00 AM",
      status: invoice.status === "Paid" ? "Completed" : invoice.status === "Overdue" ? "In Progress" : "Scheduled",
      location: getCustomerAddress(invoice.customerId),
    }));

    // Transform estimates to jobs (exclude converted estimates)
    const convertedEstimates = JSON.parse(localStorage.getItem("convertedEstimates") || "[]");
    const convertedEstimatesSet = new Set(convertedEstimates);
    const estimateJobs = mockEstimates
      .filter(estimate => !convertedEstimatesSet.has(estimate.id))
      .map((estimate, index) => ({
        id: estimate.id,
        title: (estimate as any).serviceName || (estimate as any).services?.[0] || "Service Job",
        customerId: estimate.customerId,
        customerName: estimate.customerName,
        technicianId: "1",
        technicianName: assignTechnician(estimate.customerId, index),
        date: estimate.date,
        time: "10:00 AM",
        status: estimate.status === "Paid" ? "Completed" : "Scheduled",
        location: getCustomerAddress(estimate.customerId),
      }));

    // Transform agreements to jobs
    const agreementJobs = mockAgreements.map((agreement, index) => ({
      id: agreement.id,
      title: agreement.type,
      customerId: agreement.customerId,
      customerName: agreement.customerName,
      technicianId: "1",
      technicianName: assignTechnician(agreement.customerId, index),
      date: agreement.startDate,
      time: "11:00 AM",
      status: agreement.status === "Paid" ? "Completed" : "In Progress",
      location: getCustomerAddress(agreement.customerId),
    }));

    // Combine all jobs
    const allJobs = [...mockJobs, ...invoiceJobs, ...estimateJobs, ...agreementJobs];

    // Filter by employee ID or name (prefer ID if available, fallback to name)
    const filtered = allJobs.filter(job => 
      job.technicianId === id || job.technicianName === employee.name
    );
    
    // Sort by date descending (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order
    });
  }, [employee.name, id]);

  const employeeJobs = allEmployeeJobs;
  // Count all scheduled jobs for "Upcoming" metric
  const upcomingJobs = employeeJobs.filter(j => j.status === "Scheduled");

  // Load feedback data for this employee
  const employeeFeedback = useMemo(() => {
    try {
      const jobFeedbackStatus = JSON.parse(localStorage.getItem("jobFeedbackStatus") || "{}");
      const feedbackList: Array<{
        jobId: string;
        jobTitle: string;
        customerName: string;
        rating: number;
        comment: string;
        submittedAt: string;
      }> = [];

      // Iterate through all jobs assigned to this employee
      allEmployeeJobs.forEach(job => {
        const feedback = jobFeedbackStatus[job.id];
        if (feedback?.exists && feedback.feedback) {
          feedbackList.push({
            jobId: job.id,
            jobTitle: job.title,
            customerName: job.customerName,
            rating: feedback.feedback.rating,
            comment: feedback.feedback.comment,
            submittedAt: feedback.feedback.submittedAt,
          });
        }
      });

      // Sort by submitted date descending (most recent first)
      return feedbackList.sort((a, b) => {
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return dateB - dateA; // Descending order
      });
    } catch (error) {
      console.warn("Failed to load feedback:", error);
      return [];
    }
  }, [allEmployeeJobs]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Employee Details" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{employee.name}</h2>
              <Badge className={cn("mb-2", statusColors[employee.status])}>
                {employee.status}
              </Badge>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = `sms:${employee.phone}`}>
            <MessageSquare className="h-4 w-4" />
            SMS
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = `mailto:${employee.email}`}>
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Rating</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <p className="text-lg font-bold">{employee.rating}</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-success/5 border border-success/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Jobs</p>
            <p className="text-lg font-bold">{employeeJobs.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-warning/5 border border-warning/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Upcoming</p>
            <p className="text-lg font-bold">{upcomingJobs.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="px-4">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pb-6">
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Hired: {new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-3 pb-6">
            {employeeJobs.length > 0 ? (
              employeeJobs.map(job => (
                <div 
                  key={job.id} 
                  className="p-4 rounded-xl border bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.customerName}</p>
                    </div>
                    <Badge className={cn("text-xs", statusColors[job.status])}>{job.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(job.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{job.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
                title="No jobs assigned"
                description="This employee has no assigned jobs yet"
              />
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-3 pb-6">
            {employeeFeedback.length > 0 ? (
              employeeFeedback.map((feedback, index) => (
                <div key={`${feedback.jobId}-${index}`} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{feedback.customerName}</h4>
                      <p className="text-xs text-muted-foreground">{feedback.jobTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(feedback.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={feedback.rating}
                        onRatingChange={() => {}}
                        maxRating={5}
                        size="sm"
                        disabled={true}
                      />
                      <span className="text-sm font-medium">{feedback.rating}/5</span>
                    </div>
                  </div>

                  {feedback.comment && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {feedback.comment}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
                title="No feedback yet"
                description="This employee hasn't received any feedback yet"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeDetails;

