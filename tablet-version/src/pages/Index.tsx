import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import MobileCard from "@/components/mobile/MobileCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import { getUnreadCount, getNotifications, markNotificationRead, type Notification } from "@/services/notificationService";
import { convertToJob } from "@/services/jobConversionService";
import { formatDistanceToNow } from "date-fns";
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
  Route,
  Bell,
  Loader2,
  RotateCw,
} from "lucide-react";
import { mockAppointments, mockInvoices, mockEstimates, mockJobs } from "@/data/mobileMockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [convertingJobId, setConvertingJobId] = useState<string | null>(null);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  // Default to Today → Today (single day range)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { from: today, to: today };
  });

  // Get user's first name from localStorage or use fallback
  const getUserFirstName = () => {
    const userName = localStorage.getItem("userName") || localStorage.getItem("userFullName");
    if (userName) {
      // Extract first name from full name
      const firstName = userName.split(" ")[0];
      return firstName;
    }
    // Try to get from profile data if stored
    const profileData = localStorage.getItem("userProfile");
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        if (profile.fullName) {
          return profile.fullName.split(" ")[0];
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Fallback to default
    return "User";
  };

  const userName = getUserFirstName();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const showWalkthrough = localStorage.getItem("showWalkthrough");
    const userType = localStorage.getItem("userType");

    if (!isAuthenticated) {
      navigate("/signin");
    } else if (showWalkthrough === "true") {
      navigate("/walkthrough");
    } else if (userType === "employee") {
      // Redirect employees to employee dashboard
      navigate("/employee-dashboard", { replace: true });
    }
  }, [navigate]);

  // Update unread notification count and load notifications
  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadNotificationCount(getUnreadCount());
    };

    const loadNotifications = () => {
      const allNotifications = getNotifications();
      // Show most recent 5 notifications
      setNotifications(allNotifications.slice(0, 5));
    };

    // Initial load
    updateUnreadCount();
    loadNotifications();

    // Update when notification dropdown opens
    if (notificationDropdownOpen) {
      loadNotifications();
    }

    // Listen for notification events
    const handleNotificationCreated = () => {
      updateUnreadCount();
      loadNotifications();
    };

    const handleNotificationUpdated = () => {
      updateUnreadCount();
      loadNotifications();
    };

    window.addEventListener("notificationCreated", handleNotificationCreated);
    window.addEventListener("notificationUpdated", handleNotificationUpdated);

    // Poll for changes as fallback (since localStorage events don't fire in same tab)
    const interval = setInterval(() => {
      updateUnreadCount();
      if (notificationDropdownOpen) {
        loadNotifications();
      }
    }, 2000);

    return () => {
      window.removeEventListener("notificationCreated", handleNotificationCreated);
      window.removeEventListener("notificationUpdated", handleNotificationUpdated);
      clearInterval(interval);
    };
  }, [notificationDropdownOpen]);


  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markNotificationRead(notification.id);
      setUnreadNotificationCount(getUnreadCount());
      const allNotifications = getNotifications();
      setNotifications(allNotifications.slice(0, 5));
    }
  };

  const handleConvertToJob = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent multiple clicks
    if (convertingJobId === notification.id) {
      return;
    }

    setConvertingJobId(notification.id);

    try {
      // Convert document to job
      const result = convertToJob(
        notification.sourceType as "invoice" | "estimate" | "agreement",
        notification.sourceId
      );

      if (!result.success) {
        toast.error(result.error || "Failed to convert to job");
        setConvertingJobId(null);
        return;
      }

      // Mark notification as read
      if (!notification.isRead) {
        markNotificationRead(notification.id);
      }

      // Show success toast
      const documentTypeMap = {
        invoice: "Invoice",
        estimate: "Estimate",
        agreement: "Agreement",
      };
      const documentType = documentTypeMap[notification.sourceType as keyof typeof documentTypeMap] || notification.sourceType;
      toast.success(`Job created successfully from ${documentType} ${notification.sourceId}`);

      // Refresh notifications
      setUnreadNotificationCount(getUnreadCount());
      const allNotifications = getNotifications();
      setNotifications(allNotifications.slice(0, 5));

      // Close dropdown
      setNotificationDropdownOpen(false);

      // Navigate to jobs dashboard
      navigate("/jobs");
    } catch (error) {
      console.error("Error converting to job:", error);
      toast.error("An error occurred while converting to job");
      setConvertingJobId(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === "payment") {
      return DollarSign;
    }
    return Bell;
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  const menuItems = [
    { label: "Profile", icon: User, path: "/settings/profile" },
    { label: "Change Password", icon: Lock, path: "/settings/change-password" },
    { label: "Permission Settings", icon: Shield, path: "/settings/permissions" },
    { label: "Business Policies", icon: Building2, path: "/settings/business-policies" },
    { label: "Payment Settings", icon: CreditCard, path: "/settings/payment-methods" },
    { label: "Change App Language", icon: Globe, path: "/settings/language" },
    { label: "Help", icon: HelpCircle, path: "/settings/help" },
  ];

  // Helper function to check if a date string falls within the date range
  // Uses string comparison to avoid timezone issues
  const isDateInRange = useMemo(() => {
    return (dateString: string): boolean => {
      if (!dateRange.from || !dateRange.to) return false;

      // Convert date range to YYYY-MM-DD format strings for comparison
      const startDateStr = format(dateRange.from, "yyyy-MM-dd");
      const endDateStr = format(dateRange.to, "yyyy-MM-dd");

      // Compare date strings directly (YYYY-MM-DD format)
      // This avoids timezone issues with Date objects
      const isInRange = dateString >= startDateStr && dateString <= endDateStr;

      return isInRange;
    };
  }, [dateRange]);

  // Calculate real stats from mock data filtered by date range
  const filteredAppointments = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];
    return mockAppointments.filter(apt => isDateInRange(apt.date));
  }, [dateRange, isDateInRange]);

  const [invoices, setInvoices] = useState<any[]>(mockInvoices);

  // Load invoices from service on mount to get latest status (including Deactivated)
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const { getAllInvoices } = await import("@/services/invoiceService");
        const storedInvoices = await getAllInvoices();

        // Merge stored invoices with mock invoices same as Invoices page
        const mergedInvoices = [
          ...storedInvoices.map(inv => ({
            ...inv,
            // Ensure all required fields are present
            issueDate: inv.issueDate || new Date().toISOString().split("T")[0],
            dueDate: inv.dueDate || new Date().toISOString().split("T")[0],
            status: inv.status || "Open",
            type: inv.type || "single",
          })),
          // Add mock invoices that don't exist in stored invoices
          ...mockInvoices.filter(mockInv =>
            !storedInvoices.some(storedInv => storedInv.id === mockInv.id)
          ),
        ];
        setInvoices(mergedInvoices);
      } catch (error) {
        console.error("Error loading invoices:", error);
      }
    };
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];
    return invoices.filter(inv => isDateInRange(inv.issueDate));
  }, [dateRange, isDateInRange, invoices]);

  const filteredEstimates = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];
    return mockEstimates.filter(est => isDateInRange(est.date));
  }, [dateRange, isDateInRange]);

  const filteredJobs = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];
    return mockJobs.filter(job => isDateInRange(job.date));
  }, [dateRange, isDateInRange]);

  // Stats based on selected date
  const todaysAppointments = filteredAppointments;
  const openInvoices = filteredInvoices.filter(inv => inv.status === "Open");
  const sentEstimates = filteredEstimates.filter(est => est.status === "Converted to Invoice" || est.status === "Paid");
  const activeJobs = filteredJobs.filter(job => job.status === "In Progress" || job.status === "Scheduled");

  const stats = [
    { label: "New Estimates", value: sentEstimates.length.toString(), icon: FileText, color: "text-primary", path: "/estimates" },
    { label: "Active Jobs", value: activeJobs.length.toString(), icon: Briefcase, color: "text-accent", path: "/jobs" },
    { label: "Awaiting Payment", value: openInvoices.length.toString(), amount: `$${openInvoices.reduce((sum, inv) => sum + inv.amount, 0)}`, icon: DollarSign, color: "text-warning", path: "/invoices" },
    { label: "Today's Appointments", value: todaysAppointments.length.toString(), icon: Calendar, color: "text-success", path: `/appointments/manage?view=calendar&tab=day&date=${dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}` },
  ];

  const operationalModules = [
    { label: "Customers", icon: Users, path: "/customers", color: "bg-primary/10 text-primary" },
    { label: "Jobs", icon: Briefcase, path: "/jobs", color: "bg-warning/10 text-warning" },
    { label: "Appointments", icon: Calendar, path: "/appointments/manage", color: "bg-info/10 text-info" },
    { label: "Employees", icon: Users, path: "/employees", color: "bg-blue-500/10 text-blue-500" },
    { label: "Inventory", icon: Package, path: "/inventory", color: "bg-orange-500/10 text-orange-500" },
    { label: "Reports", icon: BarChart3, path: "/reports", color: "bg-indigo-500/10 text-indigo-500" },
  ];

  const quickActions = [
    { label: "New Estimate", path: "/estimates/new", icon: FileText },
    { label: "New Invoice", path: "/invoices/new", icon: DollarSign },
    { label: "New Agreement", path: "/agreements/new", icon: ClipboardList },
    { label: "Scheduled Route", path: "/employees/tracking", icon: Route },
  ];

  // Format date range for display
  const formattedDateRange = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return "Select date range";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateRange.to);
    endDate.setHours(0, 0, 0, 0);

    // Check if both dates are today
    const isToday = startDate.getTime() === today.getTime() && endDate.getTime() === today.getTime();

    if (isToday) {
      return "Today";
    }

    // Check if it's a single day range
    if (startDate.getTime() === endDate.getTime()) {
      return format(startDate, "MMM dd");
    }

    // Format as range with zero-padded days (e.g., "Dec 01 – Dec 05")
    return `${format(startDate, "MMM dd")} – ${format(endDate, "MMM dd")}`;
  }, [dateRange]);

  const handleDateRangeConfirm = (range: { from: Date | undefined; to: Date | undefined }) => {
    // Ensure both dates are set
    if (range.from && range.to) {
      setDateRange(range);
      setShowDateRangePicker(false);
      // Data will automatically refresh via useMemo dependencies when dateRange changes
    }
  };

  // Helper function to format dates for API queries (for future backend integration)
  // Format: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  const getDateRangeQueryParams = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return null;
    return {
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
    };
  }, [dateRange]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TabletHeader
        title="Dashboard"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Hello {userName}!
            </span>
            {/* Notification Bell Icon */}
            <div className="relative">
              <DropdownMenu open={notificationDropdownOpen} onOpenChange={setNotificationDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 shrink-0 touch-target relative"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4 text-gray-700" />
                    {/* Unread notification badge */}
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 rounded-xl border border-gray-200 bg-white shadow-lg p-2 max-h-[400px] overflow-y-auto"
                  sideOffset={4}
                >
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                      <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 mb-1">No notifications</p>
                      <p className="text-xs text-gray-500">You're all caught up!</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map((notification) => {
                        const IconComponent = getNotificationIcon(notification);
                        return (
                          <DropdownMenuItem
                            key={notification.id}
                            onSelect={(e) => {
                              e.preventDefault();
                              handleNotificationClick(notification);
                            }}
                            className={cn(
                              "flex items-start rounded-lg px-3 py-2.5 transition-colors cursor-pointer hover:bg-gray-100 focus:bg-gray-100",
                              !notification.isRead && "bg-orange-50/50"
                            )}
                          >
                            <div className="flex items-start gap-3 w-full">
                              {/* Icon */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5">
                                <IconComponent className="h-4 w-4" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-semibold mb-0.5 truncate",
                                  notification.isRead ? "text-gray-700" : "text-gray-900"
                                )}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                                {notification.type === "payment" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => handleConvertToJob(notification, e)}
                                    disabled={convertingJobId === notification.id}
                                    className="h-6 px-2 text-xs border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50 mt-1"
                                  >
                                    {convertingJobId === notification.id ? (
                                      <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Converting...
                                      </>
                                    ) : (
                                      <>
                                        <Briefcase className="h-3 w-3 mr-1" />
                                        Convert to Job
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator className="my-1.5 bg-gray-200" />
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setNotificationDropdownOpen(false);
                          toast.info("View all notifications feature coming soon");
                        }}
                        className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-100 focus:bg-gray-100 min-h-[44px]"
                      >
                        <span className="w-full text-center">View all notifications</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

      <div className="flex-1 overflow-y-auto scrollable p-4 tablet:p-6 space-y-4 tablet:space-y-5">
        {/* Tablet: Constrained width container */}
        <div className="tablet:max-w-6xl tablet:mx-auto">
        {/* Subheader Row: Date Range Filter */}
        <div className="flex items-center justify-end mb-4 tablet:mb-5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDateRangePicker(true)}
            type="button"
            className="h-9 px-3 text-sm font-medium border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Calendar className="h-4 w-4 text-gray-600 flex-shrink-0" />
            <span className="text-gray-700 whitespace-nowrap">{formattedDateRange}</span>
          </Button>
        </div>

        {/* Stats Grid - Tablet Optimized: 2 mobile, 3 tablet, 4 desktop */}
        <div className="grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-4 gap-3 tablet:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPrimary = index === 0;
            return (
              <MobileCard
                key={index}
                className={cn(
                  "p-4 tablet:p-3 cursor-pointer relative overflow-hidden hover:shadow-md transition-all",
                  isPrimary && "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30"
                )}
                onClick={() => navigate(stat.path)}
              >
                {isPrimary && (
                  <div className="absolute top-0 right-0 w-16 h-16 tablet:w-12 tablet:h-12 bg-primary/5 rounded-full -mr-8 -mt-8 tablet:-mr-6 tablet:-mt-6" />
                )}
                <div className="flex flex-col items-center gap-2 tablet:gap-1.5 relative z-10">
                  <div className={cn(
                    "p-3 tablet:p-2.5 rounded-xl tablet:rounded-lg flex-shrink-0",
                    isPrimary ? "bg-primary text-white" : `bg-gray-100 ${stat.color}`
                  )}>
                    <Icon className="h-5 w-5 tablet:h-4 tablet:w-4" />
                  </div>
                  <div className="flex flex-col items-center gap-1 tablet:gap-0.5 w-full">
                    <p className={cn(
                      "text-2xl tablet:text-xl font-bold leading-tight",
                      isPrimary && "text-primary"
                    )}>
                      {stat.value}
                    </p>
                    {stat.amount && (
                      <p className={cn(
                        "text-xs tablet:text-[11px] font-medium leading-tight",
                        isPrimary ? "text-primary/70" : "text-muted-foreground"
                      )}>
                        {stat.amount}
                      </p>
                    )}
                    <p className={cn(
                      "text-xs tablet:text-[11px] font-medium text-center leading-tight mt-1 tablet:mt-0.5",
                      isPrimary ? "text-primary/80" : "text-muted-foreground"
                    )}>
                      {stat.label}
                    </p>
                  </div>
                  {index === 0 && (
                    <TrendingUp className="h-4 w-4 tablet:h-3.5 tablet:w-3.5 text-primary absolute top-2 right-2" />
                  )}
                </div>
              </MobileCard>
            );
          })}
        </div>

        {/* Recent Activity - Filtered by selected date */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-900">Recent Activity</h3>
          <div className="space-y-2.5 tablet:space-y-2">
            {(() => {
              // Get recent activity items for selected date
              // Include Deactivated status for Invoices
              const dateInvoices = filteredInvoices.filter(inv => inv.status === "Paid" || inv.status === "Deactivated");

              // Get deactivated estimates set from localStorage to check status
              const deactivatedEstimatesSet = new Set(JSON.parse(localStorage.getItem("deactivatedEstimates") || "[]"));

              // Include Deactivated status for Estimates (check against localStorage set)
              const dateEstimates = filteredEstimates.filter(est =>
                est.status === "Paid" ||
                est.status === "Unpaid" ||
                deactivatedEstimatesSet.has(est.id)
              );

              const activities: Array<{ type: "payment" | "estimate" | "log"; data: any }> = [];

              // Add activity logs (Deactivated/Reactivated events)
              // We need to import this but inside the render is tricky, so we'll access localStorage directly for sync re-renders
              const activityLogs = JSON.parse(localStorage.getItem("activity_logs") || "[]");

              // Filter logs by date if range is selected
              const filteredLogs = activityLogs.filter((log: any) => isDateInRange(log.date.split('T')[0]));

              filteredLogs.forEach((log: any) => {
                activities.push({ type: "log", data: log });
              });

              // Add paid and deactivated invoices (fallback if not in logs)
              dateInvoices.forEach(inv => {
                // specific check to avoid duplicates if we have logs for this
                const hasLog = activityLogs.some((l: any) => l.documentId === inv.id && l.action === "deactivated" && l.date.startsWith(inv.issueDate));
                if (!hasLog && (inv.status === "Paid")) {
                  activities.push({ type: "payment", data: inv });
                }
              });

              // Add estimates
              dateEstimates.forEach(est => {
                // specific check to avoid duplicates if we have logs for this
                const hasLog = activityLogs.some((l: any) => l.documentId === est.id && l.action === "deactivated" && l.date.startsWith(est.date));
                if (!hasLog) {
                  activities.push({ type: "estimate", data: est });
                }
              });

              // Sort by date/timestamp (most recent first)
              activities.sort((a, b) => {
                const dateA = a.type === "log" ? a.data.timestamp : new Date(a.type === "payment" ? a.data.issueDate : a.data.date).getTime();
                const dateB = b.type === "log" ? b.data.timestamp : new Date(b.type === "payment" ? b.data.issueDate : b.data.date).getTime();
                return dateB - dateA;
              });

              if (activities.length === 0) {
                return (
                  <MobileCard className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">No activity for this date</p>
                  </MobileCard>
                );
              }

              return activities.slice(0, 5).map((activity, index) => { // Increased limit to 5 to see more
                if (activity.type === "log") {
                  const isDeactivated = activity.data.action === "deactivated";
                  const isReactivated = activity.data.action === "reactivated";
                  return (
                    <MobileCard key={`log-${activity.data.id}`} className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate(activity.data.type === "invoice" ? "/invoices" : "/estimates")}>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg",
                          isDeactivated ? "bg-muted text-muted-foreground" :
                            isReactivated ? "bg-blue-100 text-blue-600" :
                              "bg-primary/10"
                        )}>
                          {activity.data.type === "invoice" ? (
                            <DollarSign className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium capitalize">{activity.data.type} {activity.data.action}</p>
                          <p className="text-sm text-muted-foreground">${activity.data.amount?.toFixed(2)} • {activity.data.customerName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </MobileCard>
                  );
                } else if (activity.type === "payment") {
                  const isDeactivated = activity.data.status === "Deactivated";
                  return (
                    <MobileCard key={`payment-${activity.data.id}`} className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/invoices")}>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", isDeactivated ? "bg-muted text-muted-foreground" : "bg-success/10")}>
                          <DollarSign className={cn("h-5 w-5", isDeactivated ? "text-muted-foreground" : "text-success")} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{isDeactivated ? "Invoice Deactivated" : "Payment Received"}</p>
                          <p className="text-sm text-muted-foreground">${activity.data.amount.toFixed(2)} • {activity.data.customerName}</p>
                        </div>
                      </div>
                    </MobileCard>
                  );
                } else {
                  const isDeactivated = deactivatedEstimatesSet.has(activity.data.id);
                  return (
                    <MobileCard key={`estimate-${activity.data.id}`} className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/estimates")}>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", isDeactivated ? "bg-muted text-muted-foreground" : "bg-primary/10")}>
                          <FileText className={cn("h-5 w-5", isDeactivated ? "text-muted-foreground" : "text-primary")} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {isDeactivated ? "Estimate Deactivated" : `Estimate ${(activity.data.status === "Converted to Invoice" || activity.data.status === "Paid") ? "Converted" : "Sent"}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{activity.data.customerName || (activity.data as any).customName} • ${activity.data.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </MobileCard>
                  );
                }
              });
            })()}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto flex-col gap-1.5 py-3 tablet:py-3 px-2.5 border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all min-w-0"
                  onClick={() => navigate(action.path)}
                >
                  <Icon className="h-5 w-5 text-gray-700 flex-shrink-0" />
                  <span className="text-xs text-center leading-tight text-gray-700">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Operational Modules */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-900">Others</h3>
          <div className="grid grid-cols-3 gap-3">
            {operationalModules.map((module, index) => {
              const Icon = module.icon;
              const isPrimary = module.path === "/customers";
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "h-auto flex-col gap-2 py-4 tablet:py-4 px-2.5 border-gray-200 transition-all",
                    isPrimary ? "hover:border-primary/50 hover:bg-primary/5" : "hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => navigate(module.path)}
                >
                  <div className={`p-3 rounded-lg ${module.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-center leading-tight font-medium text-gray-700">{module.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Range's Appointments */}
        {todaysAppointments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isToday = dateRange.from && dateRange.to &&
                    dateRange.from.getTime() === today.getTime() &&
                    dateRange.to.getTime() === today.getTime();

                  if (isToday) {
                    return "Today's Appointments";
                  }

                  if (dateRange.from && dateRange.to) {
                    if (dateRange.from.getTime() === dateRange.to.getTime()) {
                      return `Appointments (${format(dateRange.from, "MMM d")})`;
                    }
                    return `Appointments (${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")})`;
                  }

                  return "Appointments";
                })()}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const dateParam = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "";
                  navigate(`/appointments/manage?view=calendar&tab=day&date=${dateParam}`);
                }}
              >
                View All
              </Button>
            </div>
            {todaysAppointments.slice(0, 3).map((apt, index) => (
              <MobileCard key={index} className="mb-2 cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/appointments/manage")}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {apt.customerName.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{apt.customerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{apt.service}</Badge>
                      <span className="text-xs text-muted-foreground">{apt.time}</span>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        )}
        </div>
      </div>


      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        open={showDateRangePicker}
        onOpenChange={setShowDateRangePicker}
        initialRange={dateRange}
        onConfirm={handleDateRangeConfirm}
      />

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

export default Index;
