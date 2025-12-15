import { useState, useMemo } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";

interface Refund {
  id: string;
  date: string;
  customerName: string;
  itemName: string;
  sku: string;
  quantity: number;
  amount: number;
  reason: string;
  status: "Completed" | "Pending";
}

// Mock refund data
const mockRefunds: Refund[] = [
  {
    id: "REF-001",
    date: "2024-01-28",
    customerName: "John Smith",
    itemName: "HVAC Filter - Standard",
    sku: "HVAC-FILT-001",
    quantity: 2,
    amount: 51.98,
    reason: "Defective Item",
    status: "Completed",
  },
  {
    id: "REF-002",
    date: "2024-01-27",
    customerName: "Sarah Johnson",
    itemName: "Electrical Wire - 12 AWG",
    sku: "ELEC-WIRE-012",
    quantity: 5,
    amount: 87.50,
    reason: "Wrong Item Shipped",
    status: "Pending",
  },
  {
    id: "REF-003",
    date: "2024-01-26",
    customerName: "Mike Davis",
    itemName: "Plumbing Pipe - 1/2 inch",
    sku: "PLUM-PIPE-001",
    quantity: 10,
    amount: 45.00,
    reason: "Customer Return",
    status: "Completed",
  },
  {
    id: "REF-004",
    date: "2024-01-25",
    customerName: "Emma Wilson",
    itemName: "HVAC Filter - Standard",
    sku: "HVAC-FILT-001",
    quantity: 1,
    amount: 25.99,
    reason: "Damaged in Transit",
    status: "Pending",
  },
  {
    id: "REF-005",
    date: "2024-01-24",
    customerName: "Tom Brown",
    itemName: "Electrical Multimeter",
    sku: "ELEC-MULT-001",
    quantity: 1,
    amount: 89.99,
    reason: "Customer Changed Mind",
    status: "Completed",
  },
];

const InventoryRefund = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter refunds based on search and status
  const filteredRefunds = useMemo(() => {
    return mockRefunds.filter((refund) => {
      const matchesSearch =
        refund.customerName.toLowerCase().includes(search.toLowerCase()) ||
        refund.itemName.toLowerCase().includes(search.toLowerCase()) ||
        refund.sku.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || refund.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [search, filterStatus]);

  const handleSyncRefunds = () => {
    toast.info("Syncing refunds...");
  };

  const handleProcessRefund = () => {
    toast.info("Opening process refund form...");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Inventory Refunds" />

      <div
        className="flex-1 overflow-y-auto scrollable px-4 pb-4"
        style={{
          paddingTop: "calc(3.5rem + env(safe-area-inset-top) + 0.5rem)",
        }}
      >
        {/* Subtitle */}
        <p className="text-xs text-gray-500 mb-2 mt-1">Manage customer refunds and returns</p>

        {/* Action Buttons */}
        <div className="flex flex-row items-center gap-2 min-[320px]:gap-2 mb-2">
          <Button
            variant="outline"
            onClick={handleSyncRefunds}
            className="flex-1 h-[44px] border border-gray-300 rounded-lg text-sm font-medium px-3"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Sync Refunds
          </Button>
          <Button
            onClick={handleProcessRefund}
            className="flex-1 h-[44px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium px-3"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Process Refund
          </Button>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-row items-center gap-2 mb-2">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Search by customer, item, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[44px] pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="w-[140px] flex-shrink-0">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full h-[44px] border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Refund History List */}
        <div className="space-y-2">
          {filteredRefunds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No refunds found</p>
            </div>
          ) : (
            filteredRefunds.map((refund) => (
              <div
                key={refund.id}
                className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
              >
                {/* Top Row: Refund ID (left) | Status + Quantity (right) */}
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{refund.id}</p>
                    <p className="text-xs text-gray-500">{refund.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      Qty: {refund.quantity}
                    </span>
                    <Badge
                      className={`text-xs px-2 py-0.5 h-6 ${
                        refund.status === "Completed"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-orange-100 text-orange-700 border-orange-200"
                      }`}
                    >
                      {refund.status}
                    </Badge>
                  </div>
                </div>

                {/* Customer Name */}
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                  {refund.customerName}
                </h3>

                {/* Item Name */}
                <p className="text-sm text-gray-700 mb-1">{refund.itemName}</p>

                {/* SKU and Amount Row */}
                <div className="flex items-center justify-between mb-1">
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200 h-6"
                  >
                    {refund.sku}
                  </Badge>
                  <p className="text-sm font-semibold text-green-600">
                    ${refund.amount.toFixed(2)}
                  </p>
                </div>

                {/* Reason */}
                <p className="text-xs text-gray-500">{refund.reason}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryRefund;
