import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Home, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Users, 
  Package, 
  UserCog, 
  BarChart3, 
  Settings as SettingsIcon,
  FileText,
  TrendingUp,
  ClipboardList,
  ShoppingCart,
  List,
  ArrowLeftRight,
  RefreshCw,
  User,
  Lock,
  Shield,
  Building2,
  CreditCard,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  MessageSquare,
  X
} from "lucide-react";
import { showSuccessToast } from "@/utils/toast";

const Settings = () => {
  const navigate = useNavigate();
  const [showFeedbackSettingsModal, setShowFeedbackSettingsModal] = useState(false);
  const [autoSendFeedback, setAutoSendFeedback] = useState(false);
  
  // Load saved feedback setting from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem("autoSendFeedback");
    if (savedSetting !== null) {
      setAutoSendFeedback(savedSetting === "true");
    }
  }, []);
  
  // Get user role
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") || "merchant" : "merchant";
  const isEmployee = userType === "employee";

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    localStorage.removeItem("currentEmployeeId");
    navigate("/signin");
  };

  // Base menu items
  const baseMenuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: Home,
      route: "/",
      hasSubmenu: false,
    },
    {
      id: "jobs",
      title: "Jobs",
      icon: Briefcase,
      route: "/jobs",
      hasSubmenu: false,
    },
    {
      id: "sales",
      title: "Sales",
      icon: DollarSign,
      hasSubmenu: true,
      submenus: [
        { label: "Invoices", route: "/invoices", icon: FileText },
        { label: "Estimates", route: "/estimates", icon: TrendingUp },
        { label: "Agreements", route: "/agreements", icon: ClipboardList },
        { label: "Sell Product", route: "/sales/sell-product", icon: ShoppingCart },
      ],
    },
    {
      id: "appointments",
      title: "Appointments",
      icon: Calendar,
      route: "/appointments/manage",
      hasSubmenu: false,
    },
    {
      id: "customers",
      title: "Customers",
      icon: Users,
      route: "/customers",
      hasSubmenu: false,
    },
    {
      id: "inventory",
      title: "Inventory",
      icon: Package,
      hasSubmenu: true,
      submenus: [
        { label: "Inventory List", route: "/inventory", icon: List },
        { label: "Inventory Stock In/Out", route: "/inventory/stock-in-out", icon: ArrowLeftRight },
        { label: "Inventory Refund", route: "/inventory/refunds", icon: RefreshCw },
      ],
    },
    {
      id: "employees",
      title: "Employees",
      icon: UserCog,
      hasSubmenu: true,
      submenus: [
        { label: "Employee List", route: "/employees", icon: Users },
        { label: "Schedule", route: "/employees/schedule", icon: Calendar },
        { label: "Job Route", route: "/employees/tracking", icon: BarChart3 },
      ],
    },
    {
      id: "reports",
      title: "Reports",
      icon: BarChart3,
      hasSubmenu: true,
      submenus: [
        { label: "Invoice Report", route: "/reports/invoice", icon: FileText },
        { label: "Estimate Report", route: "/reports/estimate", icon: TrendingUp },
        { label: "Monthly Report Alert", route: "/reports/monthly-alert", icon: BarChart3 },
      ],
    },
    {
      id: "settings",
      title: "Settings",
      icon: SettingsIcon,
      hasSubmenu: true,
      submenus: [
        { label: "Profile", route: "/settings/profile", icon: User },
        { label: "Change Password", route: "/settings/change-password", icon: Lock },
        { label: "Permission Settings", route: "/settings/permissions", icon: Shield },
        { label: "Business Policies", route: "/settings/business-policies", icon: Building2 },
        { label: "Feedback Settings", route: null, icon: MessageSquare, isModal: true },
        { label: "Payment Settings", route: "/settings/payment-methods", icon: CreditCard },
        { label: "Change App Language", route: "/settings/language", icon: Globe },
        { label: "Help", route: "/settings/help", icon: HelpCircle },
        { label: "Logout", route: null, icon: LogOut, isAction: true },
      ],
    },
  ];

  // Filter menu items based on user role
  const menuItems = baseMenuItems
    .filter(item => {
      // Remove Reports section for employees
      if (isEmployee && item.id === "reports") {
        return false;
      }
      return true;
    })
    .map(item => {
      // Filter Settings submenu for employees
      if (isEmployee && item.id === "settings" && item.hasSubmenu) {
        return {
          ...item,
          submenus: item.submenus?.filter(submenu => {
            const allowedLabels = [
              "Profile",
              "Change Password",
              "Change App Language",
              "Help",
              "Logout"
            ];
            return allowedLabels.includes(submenu.label);
          }) || []
        };
      }
      
      // Filter Employees submenu for employees - only show Schedule and Job Route
      if (isEmployee && item.id === "employees" && item.hasSubmenu) {
        return {
          ...item,
          submenus: item.submenus?.filter(submenu => {
            const allowedLabels = [
              "Schedule",
              "Job Route"
            ];
            return allowedLabels.includes(submenu.label);
          }) || []
        };
      }
      
      // Convert Inventory from submenu to direct navigation for employees
      if (isEmployee && item.id === "inventory" && item.hasSubmenu) {
        return {
          ...item,
          title: "Inventory List",
          route: "/inventory",
          hasSubmenu: false
        };
      }
      
      return item;
    });

  const getIconColor = (id: string) => {
    const colorMap: Record<string, string> = {
      dashboard: "bg-blue-100 text-blue-500",
      jobs: "bg-purple-100 text-purple-500",
      sales: "bg-orange-100 text-orange-500",
      appointments: "bg-green-100 text-green-500",
      customers: "bg-pink-100 text-pink-500",
      inventory: "bg-indigo-100 text-indigo-500",
      employees: "bg-teal-100 text-teal-500",
      reports: "bg-amber-100 text-amber-500",
      settings: "bg-gray-100 text-gray-500",
    };
    return colorMap[id] || "bg-primary/10 text-primary";
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Main Menu" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 pb-20">
        <div className="px-4 py-4">
          <Accordion type="single" collapsible className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              if (item.hasSubmenu) {
                // Special handling for Sales - open submenu overlay instead of accordion
                if (item.id === "sales") {
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm">
                      <button
                        onClick={() => {
                          // Dispatch custom event to open Sales submenu
                          window.dispatchEvent(new CustomEvent('openSalesSubmenu'));
                        }}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-accent/5 active:bg-accent/10 transition-colors rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(item.id)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-gray-800">{item.title}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  );
                }
                
                return (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border-0 bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/5">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(item.id)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-800">{item.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="pl-12 space-y-1">
                        {item.submenus?.map((submenu, idx) => {
                          const SubIcon = submenu.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (submenu.isAction && submenu.label === "Logout") {
                                  handleLogout();
                                } else if ((submenu as any).isModal && submenu.label === "Feedback Settings") {
                                  setShowFeedbackSettingsModal(true);
                                } else if (submenu.route) {
                                  navigate(submenu.route);
                                }
                              }}
                              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                                submenu.label === "Logout"
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <SubIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">{submenu.label}</span>
                              </div>
                              {(submenu.route || (submenu as any).isModal) && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }
              
              // Render non-expandable items as AccordionItems that are always "closed" (disabled state)
              // This maintains order while keeping them in the Accordion structure
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm">
                  <button
                    onClick={() => navigate(item.route!)}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-accent/5 active:bg-accent/10 transition-colors rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(item.id)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-800">{item.title}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              );
            })}
          </Accordion>
        </div>
      </div>

      {/* Feedback Settings Modal */}
      <Dialog 
        open={showFeedbackSettingsModal} 
        onOpenChange={(open) => {
          setShowFeedbackSettingsModal(open);
          // Load saved setting when modal opens
          if (open) {
            const savedSetting = localStorage.getItem("autoSendFeedback");
            if (savedSetting !== null) {
              setAutoSendFeedback(savedSetting === "true");
            } else {
              setAutoSendFeedback(false); // Default to OFF
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="relative px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold pr-8">Feedback Settings</DialogTitle>
            <DialogDescription className="sr-only">
              Configure automatic feedback form email settings for completed jobs
            </DialogDescription>
            <button
              onClick={() => setShowFeedbackSettingsModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </DialogHeader>
          
          <div className="px-6 py-4 space-y-4">
            {/* Toggle Row */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Send Feedback Form Automatically
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Automatically email a feedback form to customers when their job status changes to Completed.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={autoSendFeedback}
                    onCheckedChange={setAutoSendFeedback}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                onClick={() => {
                  // Save setting (in real app, this would be an API call)
                  // Store in localStorage for persistence
                  localStorage.setItem("autoSendFeedback", String(autoSendFeedback));
                  showSuccessToast("Feedback settings saved successfully");
                  setShowFeedbackSettingsModal(false);
                }}
                className="w-full"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
