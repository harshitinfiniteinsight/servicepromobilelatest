import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockEmployees, mockJobs } from "@/data/mobileMockData";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import EmployeeCard from "@/components/cards/EmployeeCard";

// Type for employee feedback summary
type EmployeeFeedbackSummary = {
  averageRating: number;
  totalFeedbackCount: number;
};

const Employees = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"Active" | "Deactivated">("Active");
  const [employeeColors, setEmployeeColors] = useState<Record<string, string>>({});
  
  // Check if user is merchant
  const userRole = localStorage.getItem("userType") || "merchant";
  const isMerchant = userRole === "merchant";
  
  // Initialize demo feedback data if not present (for UI demonstration)
  const initializeDemoFeedback = () => {
    const existingData = localStorage.getItem("jobFeedbackStatus");
    if (!existingData || Object.keys(JSON.parse(existingData || "{}")).length === 0) {
      // Demo feedback data for completed jobs
      const demoFeedback: Record<string, { exists: boolean; feedback: { rating: number; comment: string; submittedAt: string } }> = {
        "JOB-003": { // Chris Davis - Electrical Service
          exists: true,
          feedback: {
            rating: 5,
            comment: "Excellent service! Very professional and completed the work quickly.",
            submittedAt: new Date("2024-01-30").toLocaleString(),
          },
        },
        "JOB-006": { // Sarah Martinez - Furnace Inspection
          exists: true,
          feedback: {
            rating: 4,
            comment: "Good work, but arrived a bit late. Overall satisfied.",
            submittedAt: new Date("2024-01-29").toLocaleString(),
          },
        },
        "JOB-010": { // Mike Johnson - AC Installation
          exists: true,
          feedback: {
            rating: 5,
            comment: "Outstanding installation! Clean work and great communication.",
            submittedAt: new Date("2024-01-28").toLocaleString(),
          },
        },
        "JOB-012": { // Tom Wilson - Leak Repair
          exists: true,
          feedback: {
            rating: 4,
            comment: "Fixed the leak perfectly. Very knowledgeable technician.",
            submittedAt: new Date("2024-01-30").toLocaleString(),
          },
        },
        "JOB-015": { // Sarah Martinez - Thermostat Install
          exists: true,
          feedback: {
            rating: 5,
            comment: "Perfect installation! Everything working great.",
            submittedAt: new Date("2024-01-27").toLocaleString(),
          },
        },
      };
      
      try {
        localStorage.setItem("jobFeedbackStatus", JSON.stringify(demoFeedback));
      } catch (error) {
        console.warn("Failed to save demo feedback to localStorage:", error);
      }
    }
  };

  // Calculate employee feedback summaries from jobs
  // In a real app, this would come from an API or shared state
  const employeeFeedbackSummaries = useMemo<Record<string, EmployeeFeedbackSummary | null>>(() => {
    // Initialize demo feedback on first load
    initializeDemoFeedback();
    
    const summaries: Record<string, EmployeeFeedbackSummary | null> = {};
    
    // Get feedback data from localStorage (if available from Jobs page or demo data)
    const jobFeedbackData = JSON.parse(localStorage.getItem("jobFeedbackStatus") || "{}");
    
    // Track completed jobs and feedback by employee name
    const completedJobsByEmployee: Record<string, number> = {};
    const feedbackByEmployee: Record<string, number[]> = {};
    
    mockJobs.forEach(job => {
      if (job.technicianName && job.status === "Completed") {
        // Count completed jobs
        completedJobsByEmployee[job.technicianName] = (completedJobsByEmployee[job.technicianName] || 0) + 1;
        
        // Track feedback ratings
        const feedback = jobFeedbackData[job.id]?.feedback;
        if (feedback && feedback.rating) {
          if (!feedbackByEmployee[job.technicianName]) {
            feedbackByEmployee[job.technicianName] = [];
          }
          feedbackByEmployee[job.technicianName].push(feedback.rating);
        }
      }
    });
    
    // Calculate summaries for each employee
    Object.entries(completedJobsByEmployee).forEach(([employeeName, completedCount]) => {
      const employee = mockEmployees.find(emp => emp.name === employeeName);
      if (employee) {
        const ratings = feedbackByEmployee[employeeName] || [];
        if (ratings.length > 0) {
          // Has feedback - calculate average
          const total = ratings.reduce((sum, rating) => sum + rating, 0);
          summaries[employee.id] = {
            averageRating: total / ratings.length,
            totalFeedbackCount: ratings.length,
          };
        } else if (completedCount > 0) {
          // Has completed jobs but no feedback yet
          summaries[employee.id] = null;
        }
      }
    });
    
    return summaries;
  }, []);

  const isActiveStatus = (status: string) => status === "Active";
  const isDeactivatedStatus = (status: string) => status === "Deactivated" || status === "Inactive";

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
                         emp.email.toLowerCase().includes(search.toLowerCase()) ||
                         emp.phone.includes(search);
    const matchesTab = activeTab === "Active" 
      ? isActiveStatus(emp.status) 
      : isDeactivatedStatus(emp.status);
    return matchesSearch && matchesTab;
  });

  const handleQuickAction = (employeeId: string, action: string) => {
    switch (action) {
      case "edit":
        navigate(`/employees/${employeeId}?edit=true`);
        break;
      case "schedule":
        navigate(`/employees/schedule?employeeId=${employeeId}`);
        break;
      case "tracking":
        navigate(`/employees/tracking?employeeId=${employeeId}`);
        break;
      case "details":
        navigate(`/employees/${employeeId}`);
        break;
      case "deactivate":
        toast.info("Deactivation workflow coming soon");
        break;
      case "activate":
        // Handle activate action (already handled by onActivate callback)
        break;
      default:
        toast.info("Action coming soon");
    }
  };

  const handleColorChange = (employeeId: string, color: string) => {
    setEmployeeColors((prev) => ({
      ...prev,
      [employeeId]: color,
    }));
    toast.success("Employee color updated");
  };

  const handleActivate = (employeeId: string, employeeName: string) => {
    toast.success(`${employeeName} activation coming soon`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      <TabletHeader 
        title="Employees"
        showBack={false}
        className="px-4 md:px-6 lg:px-8"
      />
      
      <div className="flex-1 overflow-y-auto scrollable pb-8 pt-6">
        <div className="px-4 md:px-6 lg:px-8">
          {/* Split layout: 40% form (left) + 60% employee list (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
            {/* LEFT SECTION: Add Employee Form */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
                <div className="px-4 md:px-6 lg:px-8 pt-5 pb-6 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Add Employee</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Name *</Label>
                      <Input
                        placeholder="Employee name"
                        className="h-11 border-gray-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Email *</Label>
                      <Input
                        type="email"
                        placeholder="employee@example.com"
                        className="h-11 border-gray-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Phone *</Label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="h-11 border-gray-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Role *</Label>
                      <Input
                        placeholder="e.g., Technician"
                        className="h-11 border-gray-300"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-4">
                    <Button 
                      className="w-full rounded-full py-3 text-sm font-semibold"
                      onClick={() => toast.info("Add employee feature coming soon")}
                    >
                      Add Employee
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-full py-3 text-sm font-semibold border-gray-200 text-gray-700 hover:bg-muted"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION: Employee List */}
            <div className="space-y-6">
              {/* Search */}
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-4">
                <div className="flex space-x-2">
                  <Button
                    variant={activeTab === "Active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("Active")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      activeTab === "Active" 
                        ? "bg-orange-500 text-white hover:bg-orange-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Active
                  </Button>
                  <Button
                    variant={activeTab === "Deactivated" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("Deactivated")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      activeTab === "Deactivated" 
                        ? "bg-orange-500 text-white hover:bg-orange-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Deactivated
                  </Button>
                </div>
              </div>

              {/* Employee Cards */}
              {filteredEmployees.length > 0 ? (
                <div className="space-y-3">
                  {filteredEmployees.map(employee => (
                    <EmployeeCard
                      key={employee.id}
                      employee={{
                        ...employee,
                        color: employeeColors[employee.id] || employee.color || "#3B82F6",
                      }}
                      variant={isDeactivatedStatus(employee.status) ? "deactivated" : "default"}
                      feedbackSummary={isMerchant ? employeeFeedbackSummaries[employee.id] : undefined}
                      onActivate={
                        isDeactivatedStatus(employee.status)
                          ? () => handleActivate(employee.id, employee.name)
                          : undefined
                      }
                      onQuickAction={action => handleQuickAction(employee.id, action)}
                      onColorChange={
                        isActiveStatus(employee.status)
                          ? (color) => handleColorChange(employee.id, color)
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <p>No {activeTab.toLowerCase()} employees found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
