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
      <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col space-y-2 border border-gray-200 opacity-75">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3 flex-1">
            {customer.photo ? (
              <img
                src={customer.photo}
                alt={customer.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 opacity-60"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-gray-200 flex-shrink-0">
                <span className="font-semibold text-gray-500 text-sm">{initials}</span>
              </div>
            )}
            <div className="flex flex-col leading-tight min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{customer.name}</h3>
              <p className="text-xs text-gray-500">{formatCustomerId(customer.id)}</p>
            </div>
          </div>
          {onActivate && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-8 px-3 rounded-lg border-green-500 text-green-600 hover:bg-green-50 text-xs"
              onClick={onActivate}
            >
              Activate
            </Button>
          )}
        </div>
        <div className="pl-12 space-y-1">
          <p className="flex items-center text-xs text-gray-600">
            <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </p>
          <p className="flex items-center text-xs text-gray-600">
            <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col space-y-2 border border-gray-200">
      <div className="flex justify-between items-start">
        <div 
          className="flex items-center space-x-3 flex-1 cursor-pointer"
          onClick={() => navigate(`/customers/${customer.id}`)}
        >
          {customer.photo ? (
            <img
              src={customer.photo}
              alt={customer.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-gray-200 flex-shrink-0">
              <span className="font-semibold text-primary text-sm">{initials}</span>
            </div>
          )}
          <div className="flex flex-col leading-tight min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{customer.name}</h3>
            <p className="text-xs text-gray-500">{formatCustomerId(customer.id)}</p>
          </div>
        </div>
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
      <div className="pl-12 space-y-1">
        <p className="flex items-center text-xs text-gray-600">
          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{customer.phone}</span>
        </p>
        <p className="flex items-center text-xs text-gray-600">
          <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{customer.email}</span>
        </p>
      </div>
    </div>
  );
};

export default CustomerCard;


