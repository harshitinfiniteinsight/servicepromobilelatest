import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { Phone, Mail, Edit, MessageSquare, FileText, Calendar, Receipt, FileCheck, ClipboardList, User, XCircle } from "lucide-react";

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    lastVisit: string;
    totalSpent: number;
    address?: string;
    notes?: string;
    photo?: string;
  };
  variant?: "default" | "deactivated";
  isEmployee?: boolean;
  onActivate?: () => void;
  onQuickAction?: (action: string) => void;
}

const formatCustomerId = (id: string) => {
  const numeric = id.replace(/\D/g, "");
  if (numeric.length === 0) return `ID: C-${id}`;
  return `ID: C-${numeric.padStart(3, "0")}`;
};

const CustomerCard = ({ customer, variant = "default", isEmployee = false, onActivate, onQuickAction }: CustomerCardProps) => {
  const navigate = useNavigate();
  const initials = customer.name.split(" ").map(n => n[0]).join("");
  const isDeactivated =
    variant === "deactivated" ||
    customer.status === "Deactivated" ||
    customer.status === "Inactive";

  if (isDeactivated) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 tablet:p-3 tablet:py-2.5 flex items-center gap-4 tablet:gap-3 border border-gray-200 opacity-75">
        {/* Avatar/Photo - Left */}
        <div className="flex-shrink-0">
          {customer.photo ? (
            <img
              src={customer.photo}
              alt={customer.name}
              className="w-14 h-14 tablet:w-12 tablet:h-12 rounded-full object-cover border-2 border-gray-200 opacity-60"
            />
          ) : (
            <div className="w-14 h-14 tablet:w-12 tablet:h-12 rounded-full bg-muted flex items-center justify-center border-2 border-gray-200">
              <span className="font-semibold text-gray-500 text-base tablet:text-sm">{initials}</span>
            </div>
          )}
        </div>

        {/* Customer Info - Center */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 tablet:mb-0.5">
            <h3 className="text-base tablet:text-sm font-semibold text-gray-900 truncate">{customer.name}</h3>
            <p className="text-xs tablet:text-[11px] text-gray-500">{formatCustomerId(customer.id)}</p>
          </div>
          <div className="grid grid-cols-2 tablet:grid-cols-3 gap-x-4 tablet:gap-x-6 gap-y-1 tablet:gap-y-0">
            <p className="flex items-center text-sm tablet:text-xs text-gray-600">
              <Phone className="h-4 w-4 tablet:h-3.5 tablet:w-3.5 mr-2 tablet:mr-1.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{customer.phone}</span>
            </p>
            <p className="flex items-center text-sm tablet:text-xs text-gray-600">
              <Mail className="h-4 w-4 tablet:h-3.5 tablet:w-3.5 mr-2 tablet:mr-1.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </p>
          </div>
        </div>

        {/* Activate Button - Right */}
        {onActivate && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-10 tablet:h-9 px-4 tablet:px-3 rounded-lg border-green-500 text-green-600 hover:bg-green-50 text-sm tablet:text-xs"
            onClick={onActivate}
          >
            Activate
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 tablet:p-3 tablet:py-2.5 flex items-center gap-4 tablet:gap-3 border border-gray-200 hover:shadow-md transition-shadow">
      {/* Avatar/Photo - Left */}
      <div 
        className="cursor-pointer flex-shrink-0"
        onClick={() => navigate(`/customers/${customer.id}`)}
      >
        {customer.photo ? (
          <img
            src={customer.photo}
            alt={customer.name}
            className="w-14 h-14 tablet:w-12 tablet:h-12 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 tablet:w-12 tablet:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-gray-200">
            <span className="font-semibold text-primary text-base tablet:text-sm">{initials}</span>
          </div>
        )}
      </div>

      {/* Customer Info - Center */}
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => navigate(`/customers/${customer.id}`)}
      >
        <div className="flex items-baseline gap-2 mb-1 tablet:mb-0.5">
          <h3 className="text-base tablet:text-sm font-semibold text-gray-900 truncate">{customer.name}</h3>
          <p className="text-xs tablet:text-[11px] text-gray-500">{formatCustomerId(customer.id)}</p>
        </div>
        <div className="grid grid-cols-2 tablet:grid-cols-3 gap-x-4 tablet:gap-x-6 gap-y-1 tablet:gap-y-0">
          <p className="flex items-center text-sm tablet:text-xs text-gray-600">
            <Phone className="h-4 w-4 tablet:h-3.5 tablet:w-3.5 mr-2 tablet:mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </p>
          <p className="flex items-center text-sm tablet:text-xs text-gray-600 tablet:col-span-2">
            <Mail className="h-4 w-4 tablet:h-3.5 tablet:w-3.5 mr-2 tablet:mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </p>
        </div>
      </div>

      {/* Actions - Right */}
      <div className="flex-shrink-0">
        {onQuickAction && (() => {
          const menuItems: KebabMenuItem[] = [];
          
          // For employees, exclude Edit Customer and Deactivate
          if (!isEmployee) {
            menuItems.push({
              label: "Edit Customer",
              icon: Edit,
              action: () => onQuickAction("edit"),
            });
          }
          
          menuItems.push(
            {
              label: "Send SMS",
              icon: MessageSquare,
              action: () => onQuickAction("sms"),
            },
            {
              label: "Memo",
              icon: FileText,
              action: () => onQuickAction("memo"),
            },
            {
              label: "Setup Appointment",
              icon: Calendar,
              action: () => onQuickAction("appointment"),
            },
            {
              label: "Create Invoice",
              icon: Receipt,
              action: () => onQuickAction("create-invoice"),
            },
            {
              label: "Create Estimate",
              icon: FileCheck,
              action: () => onQuickAction("create-estimate"),
            },
            {
              label: "Create Agreement",
              icon: ClipboardList,
              action: () => onQuickAction("create-agreement"),
            },
            {
              label: "Customer Details",
              icon: User,
              action: () => onQuickAction("details"),
              separator: !isEmployee, // Only show separator if Deactivate will follow
            }
          );
          
          // Only add Deactivate for merchant/admin
          if (!isEmployee) {
            menuItems.push({
              label: "Deactivate",
              icon: XCircle,
              action: () => onQuickAction("deactivate"),
              variant: "destructive",
            });
          }
          
          return (
            <KebabMenu
              items={menuItems}
              menuWidth="w-52"
            />
          );
        })()}
      </div>
    </div>
  );
};

export default CustomerCard;


