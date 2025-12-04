import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileCard from "@/components/mobile/MobileCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today's date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
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

  // Calculate real stats from mock data filtered by selected date
  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter(apt => apt.date === selectedDate);
  }, [selectedDate]);

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(inv => inv.issueDate === selectedDate);
  }, [selectedDate]);

  const filteredEstimates = useMemo(() => {
    return mockEstimates.filter(est => est.date === selectedDate);
  }, [selectedDate]);

  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => job.date === selectedDate);
  }, [selectedDate]);

  // Stats based on selected date
  const todaysAppointments = filteredAppointments;
  const openInvoices = filteredInvoices.filter(inv => inv.status === "Open");
  const sentEstimates = filteredEstimates.filter(est => est.status === "Paid");
  const activeJobs = filteredJobs.filter(job => job.status === "In Progress" || job.status === "Scheduled");

  const stats = [
    { label: "New Estimates", value: sentEstimates.length.toString(), icon: FileText, color: "text-primary", path: "/estimates" },
    { label: "Active Jobs", value: activeJobs.length.toString(), icon: Briefcase, color: "text-accent", path: "/jobs" },
    { label: "Awaiting Payment", value: openInvoices.length.toString(), amount: `$${openInvoices.reduce((sum, inv) => sum + inv.amount, 0)}`, icon: DollarSign, color: "text-warning", path: "/invoices" },
    { label: "Today's Appointments", value: todaysAppointments.length.toString(), icon: Calendar, color: "text-success", path: `/appointments/manage?view=calendar&tab=day&date=${selectedDate}` },
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
    { label: "Job Route", path: "/employees/tracking", icon: Route },
  ];

  // Format date for display
  const formattedDate = useMemo(() => {
    const date = new Date(selectedDate);
    const today = new Date();
    const isToday = selectedDate === today.toISOString().split('T')[0];
    
    if (isToday) {
      return "Today";
    }
    return format(date, "MMM d");
  }, [selectedDate]);

  const handleDateButtonClick = () => {
    // Trigger the hidden date input
    if (dateInputRef.current) {
      // Try modern showPicker API first (Chrome, Edge)
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker().catch(() => {
          // Fallback if showPicker fails
          dateInputRef.current?.click();
        });
      } else {
        // Fallback for browsers without showPicker
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Dashboard"
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
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

      <div className="flex-1 overflow-y-auto scrollable px-4 pb-6 space-y-4" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top) + 0.5rem)' }}>
        {/* Subheader Row: Date Range Filter */}
        <div className="flex items-center justify-end pt-1">
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="sr-only"
              aria-label="Select date"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDateButtonClick}
              type="button"
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs font-medium border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Calendar className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
              <span className="text-gray-700 whitespace-nowrap">{formattedDate}</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid - Compact Single Row */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPrimary = index === 0;
            return (
              <MobileCard 
                key={index} 
                className={cn(
                  "p-2.5 cursor-pointer relative overflow-hidden",
                  isPrimary && "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30"
                )}
                onClick={() => navigate(stat.path)}
              >
                {isPrimary && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6" />
                )}
                <div className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={cn(
                    "p-1.5 rounded-lg flex-shrink-0",
                    isPrimary ? "bg-primary text-white" : `bg-gray-100 ${stat.color}`
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col items-center gap-0.5 w-full">
                    <p className={cn(
                      "text-lg font-bold leading-tight",
                      isPrimary && "text-primary"
                    )}>
                      {stat.value}
                    </p>
                    {stat.amount && (
                      <p className={cn(
                        "text-[10px] font-medium leading-tight",
                        isPrimary ? "text-primary/70" : "text-muted-foreground"
                      )}>
                        {stat.amount}
                      </p>
                    )}
                    <p className={cn(
                      "text-[9px] font-medium text-center leading-tight line-clamp-2 mt-0.5",
                      isPrimary ? "text-primary/80" : "text-muted-foreground"
                    )}>
                      {stat.label}
                    </p>
                  </div>
                  {index === 0 && (
                    <TrendingUp className="h-3 w-3 text-primary absolute top-1 right-1" />
                  )}
                </div>
              </MobileCard>
            );
          })}
        </div>

        {/* Recent Activity - Filtered by selected date */}
        <div>
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {(() => {
              // Get recent activity items for selected date
              const dateInvoices = filteredInvoices.filter(inv => inv.status === "Paid");
              const dateEstimates = filteredEstimates.filter(est => est.status === "Paid" || est.status === "Unpaid");
              const activities: Array<{ type: "payment" | "estimate"; data: any }> = [];

              // Add paid invoices as payment activities
              dateInvoices.slice(0, 2).forEach(inv => {
                activities.push({ type: "payment", data: inv });
              });

              // Add estimates as estimate activities
              dateEstimates.slice(0, 2).forEach(est => {
                activities.push({ type: "estimate", data: est });
              });

              // Sort by date (most recent first) and limit to 2
              activities.sort((a, b) => {
                const dateA = a.type === "payment" ? a.data.issueDate : a.data.date;
                const dateB = b.type === "payment" ? b.data.issueDate : b.data.date;
                return dateB.localeCompare(dateA);
              });

              if (activities.length === 0) {
                return (
                  <MobileCard className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">No activity for this date</p>
                  </MobileCard>
                );
              }

              return activities.slice(0, 2).map((activity, index) => {
                if (activity.type === "payment") {
                  return (
                    <MobileCard key={`payment-${activity.data.id}`} className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/invoices")}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                          <DollarSign className="h-5 w-5 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Payment Received</p>
                          <p className="text-sm text-muted-foreground">${activity.data.amount.toFixed(2)} • {activity.data.customerName}</p>
                        </div>
                      </div>
                    </MobileCard>
                  );
                } else {
                  return (
                    <MobileCard key={`estimate-${activity.data.id}`} className="cursor-pointer active:scale-98 transition-transform" onClick={() => navigate("/estimates")}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Estimate {activity.data.status === "Paid" ? "Paid" : "Sent"}</p>
                          <p className="text-sm text-muted-foreground">{activity.data.customerName} • ${activity.data.amount.toFixed(2)}</p>
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
          <h3 className="font-semibold mb-3 text-gray-900">Quick Actions</h3>
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

        {/* Operational Modules */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900">Others</h3>
          <div className="grid grid-cols-3 gap-3">
            {operationalModules.map((module, index) => {
              const Icon = module.icon;
              const isPrimary = module.path === "/customers";
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "h-auto flex-col gap-2 py-4 px-2 border-gray-200 transition-all",
                    isPrimary ? "hover:border-primary/50 hover:bg-primary/5" : "hover:border-gray-300 hover:bg-gray-50"
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

        {/* Selected Date's Appointments */}
        {todaysAppointments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {selectedDate === new Date().toISOString().split('T')[0] 
                  ? "Today's Appointments" 
                  : `Appointments (${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/appointments/manage?view=calendar&tab=day&date=${selectedDate}`)}
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
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex-1 sm:flex-initial"
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
