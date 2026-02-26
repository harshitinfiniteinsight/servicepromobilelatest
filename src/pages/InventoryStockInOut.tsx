import { useState, useMemo } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUp, ArrowDown } from "lucide-react";

interface StockTransaction {
  id: string;
  date: string;
  itemName: string;
  sku: string;
  type: "in" | "out";
  quantity: number;
  reason: string;
  reference: string;
}

// Mock data for stock transactions
const mockTransactions: StockTransaction[] = [
  {
    id: "TXN-001",
    date: "2024-01-28",
    itemName: "HVAC Filter - Standard",
    sku: "HVAC-FILT-001",
    type: "in",
    quantity: 50,
    reason: "Received Inventory",
    reference: "REF-2024-001",
  },
  {
    id: "TXN-002",
    date: "2024-01-27",
    itemName: "Electrical Wire - 12 AWG",
    sku: "ELEC-WIRE-012",
    type: "out",
    quantity: 25,
    reason: "Correction",
    reference: "REF-2024-002",
  },
  {
    id: "TXN-003",
    date: "2024-01-26",
    itemName: "Plumbing Pipe - 1/2 inch",
    sku: "PLUM-PIPE-001",
    type: "in",
    quantity: 100,
    reason: "Return or Restock",
    reference: "REF-2024-003",
  },
  {
    id: "TXN-004",
    date: "2024-01-25",
    itemName: "HVAC Filter - Standard",
    sku: "HVAC-FILT-001",
    type: "out",
    quantity: 15,
    reason: "Marked as Damaged",
    reference: "REF-2024-004",
  },
  {
    id: "TXN-005",
    date: "2024-01-24",
    itemName: "Electrical Multimeter",
    sku: "ELEC-MULT-001",
    type: "in",
    quantity: 10,
    reason: "Received Inventory",
    reference: "REF-2024-005",
  },
  {
    id: "TXN-006",
    date: "2024-01-23",
    itemName: "Plumbing Pipe - 1/2 inch",
    sku: "PLUM-PIPE-001",
    type: "out",
    quantity: 30,
    reason: "Theft or Loss",
    reference: "REF-2024-006",
  },
];

const InventoryStockInOut = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Filter transactions based on search and type
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.itemName.toLowerCase().includes(search.toLowerCase()) ||
        transaction.sku.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        filterType === "all" ||
        (filterType === "in" && transaction.type === "in") ||
        (filterType === "out" && transaction.type === "out");
      return matchesSearch && matchesType;
    });
  }, [search, filterType]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Stock In/Out History" />

      <div
        className="flex-1 overflow-y-auto scrollable px-4 pb-4"
        style={{
          paddingTop: "calc(3.5rem + env(safe-area-inset-top) + 0.5rem)",
        }}
      >
        {/* Search and Filter Row */}
        <div className="flex flex-col min-[360px]:flex-row items-stretch min-[360px]:items-center gap-3 min-[360px]:gap-2 mb-2 mt-2">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Search by item name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[44px] pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="w-full min-[360px]:w-[120px] flex-shrink-0">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full h-[44px] border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">Stock In</SelectItem>
                <SelectItem value="out">Stock Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction Cards List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm"
              >
                {/* Top Row: Transaction ID (left) | Reference (right) */}
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-medium text-gray-700">
                    {transaction.id}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 border-gray-200 h-5"
                  >
                    {transaction.reference}
                  </Badge>
                </div>

                {/* Second Row: Date + Status (left) */}
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[10px] text-gray-500">{transaction.date}</p>
                  <Badge
                    className={`text-[10px] px-1.5 py-0.5 h-5 ${
                      transaction.type === "in"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {transaction.type === "in" ? (
                      <span className="flex items-center gap-0.5">
                        <ArrowUp className="h-2.5 w-2.5" />
                        <span className="text-[10px]">In</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <ArrowDown className="h-2.5 w-2.5" />
                        <span className="text-[10px]">Out</span>
                      </span>
                    )}
                  </Badge>
                </div>

                {/* Item Name */}
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  {transaction.itemName}
                </h3>

                {/* SKU and Quantity Row */}
                <div className="flex items-center justify-between mb-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-600 border-gray-200 h-5"
                  >
                    {transaction.sku}
                  </Badge>
                  <span className="text-sm font-semibold text-gray-800">
                    Qty: {transaction.quantity}
                  </span>
                </div>

                {/* Reason */}
                <p className="text-[10px] text-gray-500">{transaction.reason}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryStockInOut;
