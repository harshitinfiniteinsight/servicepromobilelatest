import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileCard from "@/components/mobile/MobileCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Briefcase,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  User,
  Lock,
  Shield,
  Building2,
  CreditCard,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  Route,
} from "lucide-react";
import { mockAppointments, mockInvoices, mockEstimates } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { statusColors } from "@/data/mobileMockData";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Get current employee ID from localStorage (set during login)
  const currentEmployeeId = localStorage.getItem("currentEmployeeId") || "1"; // Default to "1" for demo

  // Get user's first name from localStorage or use fallback
  const getUserFirstName = () => {
    const userName = localStorage.getItem("userName") || localStorage.getItem("userFullName");
    if (userName) {
      const firstName = userName.split(" ")[0];
      return firstName;
    }
    return "Employee";
  };

  const userName = getUserFirstName();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const showWalkthrough = localStorage.getItem("showWalkthrough");
    
    if (!isAuthenticated) {
      navigate("/signin");
    } else if (showWalkthrough === "true") {
      navigate("/walkthrough");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentEmployeeId");
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  const menuItems = [
    { label: "Profile", icon: User, path: "/settings/profile" },
    { label: "Change Password", icon: Lock, path: "/settings/change-password" },
    { label: "Help", icon: HelpCircle, path: "/settings/help" },
  ];

  // Flag to control demo data usage (set to false when real API is connected)
  const useDemoData = true;

  // Local demo appointments array for employee dashboard
  const demoAppointments = [
    { id: "DEMO-001", subject: "AC Maintenance", customer: "Sarah Johnson", time: "09:00 AM" },
    { id: "DEMO-002", subject: "Plumbing Repair", customer: "John Smith", time: "10:30 AM" },
    { id: "DEMO-003", subject: "HVAC Installation", customer: "Robert Miller", time: "02:00 PM" },
    { id: "DEMO-004", subject: "Water Heater Inspection", customer: "David Brown", time: "03:30 PM" },
    { id: "DEMO-005", subject: "Kitchen Plumbing", customer: "William Taylor", time: "04:45 PM" },
    { id: "DEMO-006", subject: "Electrical Panel Check", customer: "Jessica Martinez", time: "05:00 PM" },
  ];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter today's appointments for current employee
  const realAppointments = mockAppointments
    .filter(apt => apt.date === today && apt.technicianId === currentEmployeeId)
    .sort((a, b) => {
      // Sort by time
      const timeA = a.time.replace(/[^\d]/g, '');
      const timeB = b.time.replace(/[^\d]/g, '');
      return timeA.localeCompare(timeB);
    });

  // Use demo appointments if flag is enabled and no real appointments exist
  const todaysAppointments = useDemoData && realAppointments.length === 0 
    ? demoAppointments 
    : realAppointments;

  // Map appointment status to display status
  const getAppointmentStatus = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed") return "Upcoming";
    if (statusLower === "pending") return "Upcoming";
    if (statusLower === "in progress") return "In Progress";
    if (statusLower === "completed") return "Completed";
    return "Upcoming";
  };

  const getStatusBadgeColor = (status: string) => {
    const displayStatus = getAppointmentStatus(status);
    if (displayStatus === "Upcoming") return "bg-blue-100 text-blue-700 border-blue-200";
    if (displayStatus === "In Progress") return "bg-orange-100 text-orange-700 border-orange-200";
    if (displayStatus === "Completed") return "bg-green-100 text-green-700 border-green-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const quickActions = [
    { label: "New Estimate", path: "/estimates/new", icon: FileText },
    { label: "New Invoice", path: "/invoices/new", icon: DollarSign },
    { label: "New Agreement", path: "/agreements/new", icon: ClipboardList },
    { label: "Job Route", path: "/employees/tracking", icon: Route },
  ];

  const operationalModules = [
    { label: "Customers", icon: Users, path: "/customers", color: "bg-primary/10 text-primary" },
    { label: "Jobs", icon: Briefcase, path: "/jobs", color: "bg-warning/10 text-warning" },
    { label: "Appointments", icon: Calendar, path: "/appointments/manage", color: "bg-info/10 text-info" },
    { label: "Inventory", icon: Package, path: "/inventory", color: "bg-orange-500/10 text-orange-500" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Dashboard"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-[15px] font-semibold text-gray-600 whitespace-nowrap">
              Hello {userName}!
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Settings className="h-4 w-4 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border border-gray-200 bg-white shadow-lg p-2"
                sideOffset={4}
              >
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={index}
                      onSelect={(e) => {
                        e.preventDefault();
                        navigate(item.path);
                      }}
                      className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-100 focus:bg-gray-100 min-h-[44px]"
                    >
                      <Icon className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator className="my-1.5 bg-gray-200" />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowLogoutDialog(true);
                  }}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 min-h-[44px]"
                >
                  <LogOut className="mr-3 h-4 w-4 flex-shrink-0 text-red-600" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto scrollable px-4 pb-6 space-y-5" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Today's Appointments Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#1A1A1A] text-base">Today's Appointments</h3>
          </div>
          {todaysAppointments.length > 0 ? (
            <MobileCard className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-0">
              <div className="space-y-0">
                {todaysAppointments.slice(0, 5).map((apt, index) => {
                  // Handle both demo appointments (subject/customer) and real appointments (service/customerName)
                  const subject = (apt as any).subject || (apt as any).service || "";
                  const customer = (apt as any).customer || (apt as any).customerName || "";
                  const time = apt.time;
                  // Get appointment date - use apt.date if available (real appointments), otherwise use today (demo appointments)
                  const appointmentDate = (apt as any).date || today;
                  
                  return (
                    <div
                      key={apt.id}
                      className={cn(
                        "px-3 py-2.5 cursor-pointer transition-colors hover:bg-gray-50 active:bg-gray-100",
                        index !== todaysAppointments.slice(0, 5).length - 1 && "border-b border-gray-100"
                      )}
                      onClick={() => navigate(`/appointments/manage?view=calendar&tab=day&date=${appointmentDate}`)}
                      style={{ minHeight: '36px', maxHeight: '42px' }}
                    >
                      <div className="flex items-center gap-2 h-full">
                        {/* Subject */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate whitespace-nowrap">
                            {subject}
                          </p>
                        </div>
                        {/* Customer Name */}
                        <div className="flex-1 min-w-0 text-center">
                          <p className="text-xs text-gray-600 truncate whitespace-nowrap">
                            {customer}
                          </p>
                        </div>
                        {/* Time - Right aligned */}
                        <div className="flex-shrink-0">
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {todaysAppointments.length > 5 && (
                  <div className="px-3 py-2 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/appointments/manage?view=calendar&tab=day&date=${today}`)}
                      className="w-full text-center text-xs text-[#EB6A3C] hover:text-[#EB6A3C]/80 font-medium transition-colors"
                    >
                      View More
                    </button>
                  </div>
                )}
              </div>
            </MobileCard>
          ) : (
            <MobileCard className="p-6 text-center">
              <p className="text-sm text-gray-500">No appointments scheduled for today</p>
            </MobileCard>
          )}
        </div>

        {/* Recent Activity Section */}
        <div>
          <h3 className="font-bold text-[#1A1A1A] text-base mb-3">Recent Activity</h3>
          <div className="space-y-2">
            <MobileCard className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/invoices")}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Payment Received</p>
                  <p className="text-sm text-muted-foreground">$320.33 • 2 days ago</p>
                </div>
              </div>
            </MobileCard>
            <MobileCard className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/estimates")}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Estimate Sent</p>
                  <p className="text-sm text-muted-foreground">Sharon Mcdonald • 3 days ago</p>
                </div>
              </div>
            </MobileCard>
            <MobileCard className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/invoices")}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Invoice Created</p>
                  <p className="text-sm text-muted-foreground">John Smith • 1 day ago</p>
                </div>
              </div>
            </MobileCard>
            <MobileCard className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/appointments/manage")}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Appointment Completed</p>
                  <p className="text-sm text-muted-foreground">Sarah Johnson • 4 hours ago</p>
                </div>
              </div>
            </MobileCard>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div>
          <h3 className="font-bold text-[#1A1A1A] text-base mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-3 px-2 border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all touch-target min-w-0"
                  onClick={() => navigate(action.path)}
                >
                  <Icon className="h-5 w-5 text-gray-700 flex-shrink-0" />
                  <span className="text-xs text-center leading-tight text-gray-700 break-words">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Others Section */}
        <div>
          <h3 className="font-bold text-[#1A1A1A] text-base mb-3">Others</h3>
          <div className="grid grid-cols-2 gap-3">
            {operationalModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "h-auto flex-col gap-2 py-4 px-2 border-gray-200 transition-all bg-white rounded-2xl shadow-sm",
                    "hover:border-primary/50 hover:bg-primary/5"
                  )}
                  onClick={() => navigate(module.path)}
                >
                  <div className={`p-3 rounded-xl ${module.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-center leading-tight font-medium text-gray-700">{module.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="h-10 px-6 text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="h-10 px-6 text-sm font-semibold"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDashboard;

