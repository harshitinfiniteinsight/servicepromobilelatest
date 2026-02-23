import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  ClipboardList, 
  ShoppingCart,
  Users,
  Package,
  Settings,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  Shield,
  Building2,
  MessageSquare,
  CreditCard,
  Wallet,
  Globe,
  HelpCircle,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import FloatingCartButton from "./FloatingCartButton";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

// Navigation configuration for merchant role
const merchantNavItems: NavItem[] = [
  { title: "Dashboard", path: "/", icon: Home },
  { title: "Jobs", path: "/jobs", icon: Briefcase },
  { 
    title: "Sales", 
    path: "/sales", 
    icon: DollarSign,
    children: [
      { title: "Invoices", path: "/invoices", icon: FileText },
      { title: "Estimates", path: "/estimates", icon: TrendingUp },
      { title: "Agreements", path: "/agreements", icon: ClipboardList },
      { title: "Sell Product", path: "/sales/sell-product", icon: ShoppingCart },
    ]
  },
  { title: "Appointments", path: "/appointments/manage", icon: Calendar },
  { title: "Customers", path: "/customers", icon: Users },
  {
    title: "Inventory",
    path: "/inventory",
    icon: Package,
    children: [
      { title: "Inventory List", path: "/inventory", icon: Package },
      { title: "Inventory Stock In/Out", path: "/inventory/stock", icon: Package },
      { title: "Inventory Refund", path: "/inventory/refund", icon: Package },
    ]
  },
  {
    title: "Employees",
    path: "/employees",
    icon: Users,
    children: [
      { title: "Employee List", path: "/employees", icon: Users },
      { title: "Schedule", path: "/employees/schedule", icon: Calendar },
      { title: "Scheduled Route", path: "/employees/job-route", icon: Briefcase },
    ]
  },
  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
    children: [
      { title: "Invoice Report", path: "/reports/invoice", icon: FileText },
      { title: "Estimate Report", path: "/reports/estimate", icon: TrendingUp },
    ]
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    children: [
      { title: "Profile", path: "/settings/profile", icon: User },
      { title: "Change Password", path: "/settings/change-password", icon: Lock },
      { title: "Permission Settings", path: "/settings/permissions", icon: Shield },
      { title: "Business Policies", path: "/settings/business-policies", icon: Building2 },
      { title: "Feedback Settings", path: "/settings/feedback", icon: MessageSquare },
      { title: "Payment Settings", path: "/settings/payment-methods", icon: CreditCard },
      { title: "Configure Card Reader", path: "/settings/configure-card-reader", icon: Wallet },
      { title: "Change App Language", path: "/settings/language", icon: Globe },
      { title: "Help", path: "/settings/help", icon: HelpCircle },
    ]
  },
];

// Navigation configuration for employee role
const employeeNavItems: NavItem[] = [
  { title: "Dashboard", path: "/employee-dashboard", icon: Home },
  { title: "Jobs", path: "/jobs", icon: Briefcase },
  { 
    title: "Sales", 
    path: "/sales", 
    icon: DollarSign,
    children: [
      { title: "Invoices", path: "/invoices", icon: FileText },
      { title: "Estimates", path: "/estimates", icon: TrendingUp },
      { title: "Agreements", path: "/agreements", icon: ClipboardList },
      { title: "Sell Product", path: "/sales/sell-product", icon: ShoppingCart },
    ]
  },
  { title: "Appointments", path: "/appointments/manage", icon: Calendar },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    children: [
      { title: "Profile", path: "/settings/profile", icon: User },
      { title: "Change Password", path: "/settings/change-password", icon: Lock },
      { title: "Change App Language", path: "/settings/language", icon: Globe },
      { title: "Help", path: "/settings/help", icon: HelpCircle },
    ]
  },
];

interface TabletLayoutProps {
  children: React.ReactNode;
}

const TabletLayout = ({ children }: TabletLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const [expandedMenu, setExpandedMenu] = useState<string | null>("sales");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get user role and determine navigation items
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") || "merchant" : "merchant";
  const navItems = useMemo(() => {
    return userType === "merchant" ? merchantNavItems : employeeNavItems;
  }, [userType]);

  const isActive = (path: string, hasChildren: boolean = false) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/employee-dashboard") {
      return location.pathname === "/employee-dashboard";
    }
    if (path === "/sales" && hasChildren) {
      return location.pathname.startsWith("/invoices") || 
             location.pathname.startsWith("/estimates") || 
             location.pathname.startsWith("/agreements") ||
             location.pathname.startsWith("/sales/sell-product");
    }
    if (path === "/employees" && hasChildren) {
      return location.pathname.startsWith("/employees");
    }
    if (path === "/reports" && hasChildren) {
      return location.pathname.startsWith("/reports");
    }
    if (path === "/settings" && hasChildren) {
      return location.pathname.startsWith("/settings");
    }
    return location.pathname.startsWith(path);
  };

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      // Accordion behavior: if clicking the same menu, close it; otherwise open the new one
      if (expandedMenu === item.title) {
        setExpandedMenu(null);
      } else {
        setExpandedMenu(item.title);
      }
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="h-full w-full flex overflow-hidden bg-gray-50">
      {/* Collapsible Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 shadow-sm flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand & Toggle */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-primary">ServicePro</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-9 w-9 hover:bg-gray-100"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, !!item.children);
              const hasChildren = !!item.children;

              return (
                <div key={item.path}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 py-3 transition-all duration-200 relative group",
                      sidebarCollapsed ? "px-4 justify-center" : "px-6",
                      active 
                        ? "text-primary bg-primary/10 border-r-4 border-primary font-semibold" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    title={sidebarCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", active && "scale-110")} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.title}</span>
                        {hasChildren && (
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedMenu === item.title && "rotate-180"
                          )} />
                        )}
                        {item.title === "Sales" && getTotalItems() > 0 && (
                          <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {getTotalItems() > 99 ? '99+' : getTotalItems()}
                          </span>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && item.title === "Sales" && getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {getTotalItems() > 9 ? '9+' : getTotalItems()}
                      </span>
                    )}
                  </button>

                  {/* Sub-menu - only show when this specific menu is expanded */}
                  {hasChildren && !sidebarCollapsed && expandedMenu === item.title && (
                    <div className="bg-gray-50">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = location.pathname === child.path;

                        return (
                          <button
                            key={child.path}
                            onClick={() => navigate(child.path)}
                            className={cn(
                              "w-full flex items-center gap-3 px-6 pl-14 h-11 leading-5 transition-all duration-200",
                              childActive
                                ? "text-primary bg-primary/5 font-medium"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            <ChildIcon
                              className={cn(
                                "h-4 w-4 flex-shrink-0",
                                childActive ? "text-primary" : "text-gray-500"
                              )}
                            />
                            <span className="text-sm whitespace-nowrap truncate">{child.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem("isAuthenticated");
                localStorage.removeItem("userType");
                localStorage.removeItem("currentEmployeeId");
                navigate("/signin");
              }}
              className={cn(
                "w-full flex items-center gap-3 py-3 transition-all duration-200 text-red-600 hover:bg-red-50",
                sidebarCollapsed ? "px-4 justify-center" : "px-6"
              )}
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="flex-1 text-left text-sm font-medium">Logout</span>
              )}
            </button>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                Logged in as <span className="font-semibold capitalize">{userType}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  );
};

export default TabletLayout;