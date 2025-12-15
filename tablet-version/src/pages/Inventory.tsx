import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockInventory, mockEmployees, mockDiscounts } from "@/data/mobileMockData";
import { Plus, Search, Trash2, Edit, Package, AlertTriangle, PackageX, FlaskConical, UserCog, FileText, Settings, List, Grid3x3, Image as ImageIcon } from "lucide-react";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LowInventoryAlertModal from "@/components/modals/LowInventoryAlertModal";
import StockAdjustmentModal from "@/components/modals/StockAdjustmentModal";
import AddAgreementInventoryModal from "@/components/modals/AddAgreementInventoryModal";
import AssignEmployeeModal from "@/components/modals/AssignEmployeeModal";
import AddNoteModal from "@/components/modals/AddNoteModal";
import AddEquipmentModal from "@/components/modals/AddEquipmentModal";
import UpdateEquipmentModal from "@/components/modals/UpdateEquipmentModal";
import ManageDiscountModal from "@/components/modals/ManageDiscountModal";
import AddDiscountModal from "@/components/modals/AddDiscountModal";
import EditDiscountModal from "@/components/modals/EditDiscountModal";
import SendCurrentReportModal from "@/components/modals/SendCurrentReportModal";
import SendStockInOutReportModal from "@/components/modals/SendStockInOutReportModal";
import SetLowInventoryAlertModal from "@/components/modals/SetLowInventoryAlertModal";
import { toast } from "sonner";
import { showSuccessToast } from "@/utils/toast";

const Inventory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("inventory-services");
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    const saved = localStorage.getItem("inventory-view-mode");
    return (saved === "grid" || saved === "list") ? saved : "list";
  });
  
  // Get user role
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") || "merchant" : "merchant";
  const isEmployee = userType === "employee";

  // Ensure grid view and inventory-services tab are applied when navigating from "Sell Product"
  useEffect(() => {
    const mode = searchParams.get("mode");
    const state = location.state as { fromSellProduct?: boolean } | null;
    
    if (mode === "sell" || state?.fromSellProduct) {
      // Set grid view (localStorage was already set in SalesSubmenu)
      setViewMode("grid");
      // Ensure inventory-services tab is active
      setActiveTab("inventory-services");
      // Clear the query parameter and state to prevent re-triggering
      if (mode === "sell") {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("mode");
        navigate(`${location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`, { replace: true });
      }
      if (state?.fromSellProduct) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.pathname, location.state, searchParams, navigate]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [assignEmployeeModalOpen, setAssignEmployeeModalOpen] = useState(false);
  const [selectedEquipmentForAssign, setSelectedEquipmentForAssign] = useState<{ id: string; currentEmployeeId: string | null } | null>(null);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [selectedEquipmentForNote, setSelectedEquipmentForNote] = useState<string | null>(null);
  const [addEquipmentModalOpen, setAddEquipmentModalOpen] = useState(false);
  const [updateEquipmentModalOpen, setUpdateEquipmentModalOpen] = useState(false);
  const [selectedEquipmentForUpdate, setSelectedEquipmentForUpdate] = useState<{ id: string; inventoryName: string; serialNumber: string } | null>(null);
  const [manageDiscountModalOpen, setManageDiscountModalOpen] = useState(false);
  const [addDiscountModalOpen, setAddDiscountModalOpen] = useState(false);
  const [editDiscountModalOpen, setEditDiscountModalOpen] = useState(false);
  const [selectedDiscountForEdit, setSelectedDiscountForEdit] = useState<{
    id: string;
    name: string;
    value: number;
    type: "%" | "$";
    startDate: string;
    endDate: string;
    active: boolean;
    usageCount: number;
  } | null>(null);
  const [sendCurrentReportModalOpen, setSendCurrentReportModalOpen] = useState(false);
  const [sendStockInOutReportModalOpen, setSendStockInOutReportModalOpen] = useState(false);
  const [lowAlertModalOpen, setLowAlertModalOpen] = useState(false);
  const [selectedItemForAlert, setSelectedItemForAlert] = useState<{ id: string; threshold?: number } | null>(null);
  const [setLowInventoryAlertModalOpen, setSetLowInventoryAlertModalOpen] = useState(false);
  const [stockAdjustmentModalOpen, setStockAdjustmentModalOpen] = useState(false);
  const [selectedItemForAdjustment, setSelectedItemForAdjustment] = useState<{ id: string; name: string; sku: string; stock: number } | null>(null);
  const [stockAdjustmentDefaults, setStockAdjustmentDefaults] = useState<{
    transactionType?: "stock-in" | "stock-out";
    adjustmentReason?: string;
    remarks?: string;
    adjustBy?: string;
  } | null>(null);
  const [addAgreementInventoryModalOpen, setAddAgreementInventoryModalOpen] = useState(false);
  
  // Mock agreement inventory data
  const [agreementInventory, setAgreementInventory] = useState([
    { id: "AGR-INV-001", inventoryId: "INV-ITEM-001", name: "HVAC Filter - Standard" },
    { id: "AGR-INV-002", inventoryId: "INV-ITEM-004", name: "Thermostat - Programmable" },
    { id: "AGR-INV-003", inventoryId: "INV-ITEM-010", name: "Air Filter - MERV 13" },
    { id: "AGR-INV-004", inventoryId: "INV-ITEM-016", name: "Condensate Pump" },
  ]);
  
  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const filteredAgreementInventory = agreementInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.inventoryId.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteAgreementInventory = (id: string) => {
    setAgreementInventory(agreementInventory.filter(item => item.id !== id));
    toast.success("Item removed from agreement inventory");
  };

  // Filter variable inventory for agreement inventory modal
  const variableInventory = mockInventory.filter(item => item.type === "V");

  const handleAddAgreementInventory = (inventoryId: string) => {
    const selectedItem = mockInventory.find(item => item.id === inventoryId);
    if (selectedItem) {
      const newId = `AGR-INV-${String(agreementInventory.length + 1).padStart(3, '0')}`;
      setAgreementInventory([
        ...agreementInventory,
        { id: newId, inventoryId: selectedItem.id, name: selectedItem.name }
      ]);
      toast.success("Inventory added to agreement successfully");
      setAddAgreementInventoryModalOpen(false);
    }
  };

  const handleAddButtonClick = () => {
    if (activeTab === "agreement-inventory") {
      setAddAgreementInventoryModalOpen(true);
    } else if (activeTab === "equipment-tracking") {
      setAddEquipmentModalOpen(true);
    } else {
      navigate("/inventory/new");
    }
  };

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("inventory-view-mode", mode);
  };

  // Mock equipment notes data
  const [equipmentNotes, setEquipmentNotes] = useState<Record<string, Array<{
    id: string;
    text: string;
    author: string;
    date: string;
  }>>>({
    "EQ-001": [
      {
        id: "note-1",
        text: "Replaced damaged cable.",
        author: "James Miller",
        date: "2025-11-08",
      },
      {
        id: "note-2",
        text: "Checked calibration and functionality.",
        author: "Sarah Kim",
        date: "2025-11-03",
      },
    ],
    "EQ-002": [
      {
        id: "note-3",
        text: "Routine maintenance completed.",
        author: "Mike Johnson",
        date: "2025-11-05",
      },
    ],
  });

  // Mock equipment tracking data (using state to allow updates)
  const [equipmentTracking, setEquipmentTracking] = useState([
    {
      id: "EQ-001",
      serialNumber: "SN-0001",
      inventoryName: "HVAC Diagnostic Tool",
      employeeId: "1",
      employeeName: "Mike Johnson",
      status: "Assigned" as const,
    },
    {
      id: "EQ-002",
      serialNumber: "SN-0002",
      inventoryName: "Electrical Multimeter",
      employeeId: "3",
      employeeName: "Chris Davis",
      status: "Assigned" as const,
    },
    {
      id: "EQ-003",
      serialNumber: "SN-0003",
      inventoryName: "Pipe Inspection Camera",
      employeeId: "2",
      employeeName: "Tom Wilson",
      status: "Assigned" as const,
    },
    {
      id: "EQ-004",
      serialNumber: "SN-0004",
      inventoryName: "Pressure Gauge Set",
      employeeId: null,
      employeeName: null,
      status: "Unassigned" as const,
    },
    {
      id: "EQ-005",
      serialNumber: "SN-0005",
      inventoryName: "Refrigerant Leak Detector",
      employeeId: "1",
      employeeName: "Mike Johnson",
      status: "Assigned" as const,
    },
  ]);

  // Filter equipment tracking data
  const filteredEquipmentTracking = equipmentTracking.filter((equipment) => {
    const matchesSearch = equipment.inventoryName.toLowerCase().includes(search.toLowerCase()) ||
                         equipment.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchesEmployee = selectedEmployee === "all" || equipment.employeeId === selectedEmployee;
    return matchesSearch && matchesEmployee;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title="Inventory"
        actions={
          isEmployee ? (
            <button
              onClick={() => {
                setManageDiscountModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition whitespace-nowrap"
            >
              Discount
            </button>
          ) : (
            <button
              onClick={() => {
                setSetLowInventoryAlertModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition whitespace-nowrap"
            >
              Alert Settings
            </button>
          )
        }
      />
      
      <div className="flex-1 overflow-y-auto scrollable px-3 pb-2 inventory--compact" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top) + 0.125rem)' }}>
        {/* Action Buttons - Merchant only */}
        {!isEmployee && (
          <div className="flex justify-between gap-2 mb-3">
            <button
              onClick={() => {
                setSendCurrentReportModalOpen(true);
              }}
              className="flex-1 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
            >
              Current Report
            </button>
            <button
              onClick={() => {
                setSendStockInOutReportModalOpen(true);
              }}
              className="flex-1 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
            >
              Stock In/Out Report
            </button>
            <button
              onClick={() => {
                setManageDiscountModalOpen(true);
              }}
              className="flex-1 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
            >
              Discount
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-3">
          <button
            onClick={() => setActiveTab("inventory-services")}
            className={cn(
              "flex-1 py-1.5 text-center text-xs font-medium transition-colors",
              activeTab === "inventory-services"
                ? "text-orange-600 border-b-2 border-orange-500"
                : "text-gray-600 hover:text-orange-600"
            )}
          >
            Inventory / Services
          </button>
          <button
            onClick={() => setActiveTab("agreement-inventory")}
            className={cn(
              "flex-1 py-1.5 text-center text-xs font-medium transition-colors",
              activeTab === "agreement-inventory"
                ? "text-orange-600 border-b-2 border-orange-500"
                : "text-gray-600 hover:text-orange-600"
            )}
          >
            Agreement Inventory
          </button>
          <button
            onClick={() => setActiveTab("equipment-tracking")}
            className={cn(
              "flex-1 py-1.5 text-center text-xs font-medium transition-colors",
              activeTab === "equipment-tracking"
                ? "text-orange-600 border-b-2 border-orange-500"
                : "text-gray-600 hover:text-orange-600"
            )}
          >
            Equipment Tracking
          </button>
        </div>

        {/* Employee Filter - Only for Equipment Tracking (Merchant/Admin only) */}
        {activeTab === "equipment-tracking" && !isEmployee && (
          <div className="mb-3">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full h-9 text-xs py-2 px-3 border border-gray-200 rounded-lg">
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {mockEmployees
                  .filter(emp => emp.status === "Active")
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search, View Toggle, and Add Button */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
            <Input 
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "pl-9 h-9 text-sm py-2",
                activeTab === "inventory-services" && "pr-20"
              )}
            />
            {activeTab === "inventory-services" && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 shrink-0">
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={cn(
                    "p-1 rounded transition-colors",
                    viewMode === "list"
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 hover:text-gray-800"
                  )}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={cn(
                    "p-1 rounded transition-colors",
                    viewMode === "grid"
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 hover:text-gray-800"
                  )}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddButtonClick}
            className="h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Inventory Cards */}
        <div className={cn(viewMode === "grid" && activeTab === "inventory-services" ? "grid grid-cols-2 gap-1.5" : "space-y-1.5")}>
          {activeTab === "inventory-services" && filteredInventory.map(item => {
            if (viewMode === "grid") {
              const getTypeInitial = (type?: string) => {
                switch (type) {
                  case "F": return "F";
                  case "V": return "V";
                  case "U": return "U";
                  default: return "U";
                }
              };

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 active:scale-[0.98]"
                  onClick={() => navigate(`/inventory/${item.id}`)}
                >
                  {/* Full-Width Image Section */}
                  <div className="relative w-full h-24 bg-gray-100 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    {/* Three-dot menu overlay - positioned in top-right of image */}
                    <div className="absolute top-1 right-1 z-10" onClick={(e) => e.stopPropagation()}>
                      <KebabMenu
                        items={[
                          {
                            label: "Edit",
                            icon: Edit,
                            action: () => navigate(`/inventory/${item.id}/edit`),
                          },
                          {
                            label: "Adjust Stock",
                            icon: Package,
                            action: () => {
                              setSelectedItemForAdjustment({
                                id: item.id,
                                name: item.name,
                                sku: item.sku,
                                stock: item.stock,
                              });
                              setStockAdjustmentModalOpen(true);
                            },
                          },
                          ...(!isEmployee ? [{
                            label: "Alert",
                            icon: AlertTriangle,
                            action: () => {
                              setSelectedItemForAlert({ id: item.id, threshold: item.lowStockThreshold });
                              setLowAlertModalOpen(true);
                            },
                          }] : []),
                          {
                            label: "Damaged Goods",
                            icon: PackageX,
                            action: () => {
                              setSelectedItemForAdjustment({
                                id: item.id,
                                name: item.name,
                                sku: item.sku,
                                stock: item.stock,
                              });
                              setStockAdjustmentDefaults({
                                transactionType: "stock-out",
                                adjustmentReason: "Marked as Damaged",
                                remarks: "Item marked as damaged goods",
                              });
                              setStockAdjustmentModalOpen(true);
                            },
                          },
                          {
                            label: "Tester",
                            icon: FlaskConical,
                            action: () => {
                              setSelectedItemForAdjustment({
                                id: item.id,
                                name: item.name,
                                sku: item.sku,
                                stock: item.stock,
                              });
                              setStockAdjustmentDefaults({
                                transactionType: "stock-out",
                                adjustmentReason: "Marked as Demo Units",
                                remarks: "Item marked as tester/demo unit",
                              });
                              setStockAdjustmentModalOpen(true);
                            },
                          },
                        ]}
                        menuWidth="w-48"
                        triggerClassName="bg-white/90 hover:bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-2">
                    {/* Item Title */}
                    <h3 className="text-xs font-semibold text-gray-900 mb-0.5 truncate leading-tight">
                      {item.name}
                    </h3>

                    {/* Compact Info Row: SKU, Type, Stock, Price */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-[8px] text-gray-600 font-medium truncate">
                          SKU: {item.sku}
                        </span>
                        <span className="text-gray-400 text-[8px]">•</span>
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-medium rounded-full shrink-0">
                          {getTypeInitial(item.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[8px] text-gray-500">Stock:</span>
                        <span className="text-xs font-bold text-gray-900">{item.stock}</span>
                        {item.type !== "V" && item.unitPrice !== undefined && (
                          <>
                            <span className="text-gray-400 text-[8px]">•</span>
                            <span className="text-xs font-bold text-orange-600">
                              ${item.unitPrice.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            
            // List View
            const getTypeInitial = (type?: string) => {
              switch (type) {
                case "F": return "F";
                case "V": return "V";
                case "U": return "U";
                default: return "U";
              }
            };

            return (
              <div
                key={item.id}
                className="bg-white p-2 rounded-lg border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex flex-col flex-1 min-w-0">
                    {/* Compact Info Row: SKU, Type, Stock, Price, Low Alert */}
                    <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                      <span className="text-[8px] text-gray-600 font-medium">
                        SKU: {item.sku}
                      </span>
                      <span className="text-gray-400 text-[8px]">•</span>
                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-medium rounded-full shrink-0">
                        {getTypeInitial(item.type)}
                      </span>
                      <span className="text-gray-400 text-[8px]">•</span>
                      <span className="text-[8px] text-green-600 font-semibold">Stock: {item.stock}</span>
                      {item.type !== "V" && item.unitPrice !== undefined && (
                        <>
                          <span className="text-gray-400 text-[8px]">•</span>
                          <span className="text-[8px] text-orange-600 font-semibold">${item.unitPrice.toFixed(2)}</span>
                        </>
                      )}
                      <span className="text-gray-400 text-[8px]">•</span>
                      <span className="text-[8px] text-gray-500">Low: {item.lowStockThreshold}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 leading-tight">
                      {item.name}
                    </p>
                  </div>
                  
                  {/* Quick Action Menu */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <KebabMenu
                      items={[
                        {
                          label: "Edit",
                          icon: Edit,
                          action: () => navigate(`/inventory/${item.id}/edit`),
                        },
                        {
                          label: "Adjust Stock",
                          icon: Package,
                          action: () => {
                            setSelectedItemForAdjustment({
                              id: item.id,
                              name: item.name,
                              sku: item.sku,
                              stock: item.stock,
                            });
                            setStockAdjustmentModalOpen(true);
                          },
                        },
                        ...(!isEmployee ? [{
                          label: "Alert",
                          icon: AlertTriangle,
                          action: () => {
                            setSelectedItemForAlert({ id: item.id, threshold: item.lowStockThreshold });
                            setLowAlertModalOpen(true);
                          },
                        }] : []),
                        {
                          label: "Damaged Goods",
                          icon: PackageX,
                          action: () => {
                            setSelectedItemForAdjustment({
                              id: item.id,
                              name: item.name,
                              sku: item.sku,
                              stock: item.stock,
                            });
                            setStockAdjustmentDefaults({
                              transactionType: "stock-out",
                              adjustmentReason: "Marked as Damaged",
                              remarks: "Item marked as damaged goods",
                            });
                            setStockAdjustmentModalOpen(true);
                          },
                        },
                        {
                          label: "Tester",
                          icon: FlaskConical,
                          action: () => {
                            setSelectedItemForAdjustment({
                              id: item.id,
                              name: item.name,
                              sku: item.sku,
                              stock: item.stock,
                            });
                            setStockAdjustmentDefaults({
                              transactionType: "stock-out",
                              adjustmentReason: "Marked as Demo Units",
                              remarks: "Item marked as tester/demo unit",
                            });
                            setStockAdjustmentModalOpen(true);
                          },
                        },
                      ]}
                      menuWidth="w-48"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Agreement Inventory Tab */}
          {activeTab === "agreement-inventory" && (
            <div className="space-y-2">
              {filteredAgreementInventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No items available for Agreement Inventory</p>
                </div>
              ) : (
                filteredAgreementInventory.map(item => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
                  >
                    <div className="flex flex-col flex-1">
                      <p className="text-xs text-gray-500">{item.inventoryId}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAgreementInventory(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      aria-label="Delete item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Equipment Tracking Tab */}
          {activeTab === "equipment-tracking" && (
            <div className="space-y-2">
              {filteredEquipmentTracking.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No equipment tracking data available</p>
                  {selectedEmployee !== "all" && (
                    <p className="text-xs mt-1">
                      Filtered by: {mockEmployees.find(emp => emp.id === selectedEmployee)?.name || "Unknown"}
                    </p>
                  )}
                </div>
              ) : (
                filteredEquipmentTracking.map((equipment) => {
                  return (
                    <div
                      key={equipment.id}
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col flex-1">
                          <p className="text-sm font-semibold text-gray-800">{equipment.serialNumber}</p>
                          <p className="text-base text-gray-700 mt-0.5">{equipment.inventoryName}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Employee:{" "}
                            <span className="font-medium text-gray-800">
                              {equipment.employeeName || "None"}
                            </span>
                          </p>
                        </div>

                        {/* Status Badge and Quick Action Menu */}
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-1 rounded-full shrink-0",
                              equipment.status === "Assigned"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            )}
                          >
                            {equipment.status}
                          </span>

                          {/* Quick Action Menu */}
                          <KebabMenu
                            items={[
                              {
                                label: "Assign / Reassign Employee",
                                icon: UserCog,
                                action: () => {
                                  setSelectedEquipmentForAssign({
                                    id: equipment.id,
                                    currentEmployeeId: equipment.employeeId,
                                  });
                                  setAssignEmployeeModalOpen(true);
                                },
                              },
                              {
                                label: "Add / View Note",
                                icon: FileText,
                                action: () => {
                                  setSelectedEquipmentForNote(equipment.id);
                                  setAddNoteModalOpen(true);
                                },
                              },
                              {
                                label: "Update Equipment",
                                icon: Settings,
                                action: () => {
                                  setSelectedEquipmentForUpdate({
                                    id: equipment.id,
                                    inventoryName: equipment.inventoryName,
                                    serialNumber: equipment.serialNumber,
                                  });
                                  setUpdateEquipmentModalOpen(true);
                                },
                              },
                            ]}
                            menuWidth="w-48"
                          />
                        </div>
                </div>
              </div>
            );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Low Inventory Alert Modal */}
      <LowInventoryAlertModal
        open={lowAlertModalOpen}
        onClose={() => {
          setLowAlertModalOpen(false);
          setSelectedItemForAlert(null);
        }}
        itemId={selectedItemForAlert?.id || null}
        currentThreshold={selectedItemForAlert?.threshold}
        onSave={(itemId, threshold) => {
          // In real app, this would call an API: PUT /api/inventory/:id/alert-threshold
          console.info("Updating low inventory alert threshold", itemId, threshold);
          toast.success("Low inventory alert updated successfully");
          setLowAlertModalOpen(false);
          setSelectedItemForAlert(null);
        }}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        open={stockAdjustmentModalOpen}
        onClose={() => {
          setStockAdjustmentModalOpen(false);
          setSelectedItemForAdjustment(null);
          setStockAdjustmentDefaults(null);
        }}
        item={selectedItemForAdjustment}
        initialTransactionType={stockAdjustmentDefaults?.transactionType}
        initialAdjustmentReason={stockAdjustmentDefaults?.adjustmentReason}
        initialRemarks={stockAdjustmentDefaults?.remarks}
        initialAdjustBy={stockAdjustmentDefaults?.adjustBy}
        onSave={(itemId, adjustment, transactionType, reason, remarks) => {
          // In real app, this would call an API: POST /api/inventory/:id/adjust-stock
          console.info("Saving stock adjustment", {
            itemId,
            adjustment,
            transactionType,
            reason,
            remarks,
          });
          showSuccessToast("Transaction recorded successfully");
          setStockAdjustmentModalOpen(false);
          setSelectedItemForAdjustment(null);
          setStockAdjustmentDefaults(null);
        }}
      />

      {/* Add Agreement Inventory Modal */}
      <AddAgreementInventoryModal
        open={addAgreementInventoryModalOpen}
        onClose={() => setAddAgreementInventoryModalOpen(false)}
        availableInventory={variableInventory.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
        }))}
        onAdd={handleAddAgreementInventory}
      />

      {/* Assign Employee Modal */}
      <AssignEmployeeModal
        open={assignEmployeeModalOpen}
        onClose={() => {
          setAssignEmployeeModalOpen(false);
          setSelectedEquipmentForAssign(null);
        }}
        equipmentId={selectedEquipmentForAssign?.id || null}
        currentEmployeeId={selectedEquipmentForAssign?.currentEmployeeId || null}
        availableEmployees={mockEmployees
          .filter(emp => emp.status === "Active")
          .map(emp => ({
            id: emp.id,
            name: emp.name,
          }))}
        onSave={(equipmentId, employeeId) => {
          // Update equipment tracking data
          setEquipmentTracking(equipmentTracking.map(equipment => {
            if (equipment.id === equipmentId) {
              const employee = employeeId ? mockEmployees.find(emp => emp.id === employeeId) : null;
              return {
                ...equipment,
                employeeId: employeeId,
                employeeName: employee?.name || null,
                status: employeeId ? ("Assigned" as const) : ("Unassigned" as const),
              };
            }
            return equipment;
          }));
          toast.success("Employee assigned successfully");
          setAssignEmployeeModalOpen(false);
          setSelectedEquipmentForAssign(null);
        }}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        open={addNoteModalOpen}
        onClose={() => {
          setAddNoteModalOpen(false);
          setSelectedEquipmentForNote(null);
        }}
        equipmentId={selectedEquipmentForNote}
        existingNotes={selectedEquipmentForNote ? equipmentNotes[selectedEquipmentForNote] || [] : []}
        onSave={(equipmentId, noteText) => {
          // Add new note to equipment notes
          const newNote = {
            id: `note-${Date.now()}`,
            text: noteText,
            author: "Current User", // In real app, this would be the logged-in user
            date: new Date().toISOString().split("T")[0],
          };

          setEquipmentNotes({
            ...equipmentNotes,
            [equipmentId]: [
              newNote,
              ...(equipmentNotes[equipmentId] || []),
            ],
          });

          showSuccessToast("Note added successfully");
          setAddNoteModalOpen(false);
          setSelectedEquipmentForNote(null);
        }}
      />

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        open={addEquipmentModalOpen}
        onClose={() => setAddEquipmentModalOpen(false)}
        availableInventory={mockInventory.map(item => ({
          id: item.id,
          name: item.name,
        }))}
        onSave={(inventoryId, serialNumber) => {
          // Add new equipment to tracking
          const selectedInventory = mockInventory.find(item => item.id === inventoryId);
          if (selectedInventory) {
            const newEquipment = {
              id: `EQ-${String(equipmentTracking.length + 1).padStart(3, '0')}`,
              serialNumber: serialNumber,
              inventoryName: selectedInventory.name,
              employeeId: null,
              employeeName: null,
              status: "Unassigned" as const,
            };
            setEquipmentTracking([...equipmentTracking, newEquipment]);
            showSuccessToast("Equipment added successfully");
            setAddEquipmentModalOpen(false);
          }
        }}
      />

      {/* Update Equipment Modal */}
      <UpdateEquipmentModal
        open={updateEquipmentModalOpen}
        onClose={() => {
          setUpdateEquipmentModalOpen(false);
          setSelectedEquipmentForUpdate(null);
        }}
        equipment={selectedEquipmentForUpdate}
        availableInventory={mockInventory.map(item => ({
          id: item.id,
          name: item.name,
        }))}
        onUpdate={(equipmentId, inventoryId, serialNumber) => {
          // Update equipment in tracking
          const selectedInventory = mockInventory.find(item => item.id === inventoryId);
          if (selectedInventory) {
            setEquipmentTracking(equipmentTracking.map(equipment => {
              if (equipment.id === equipmentId) {
                return {
                  ...equipment,
                  inventoryName: selectedInventory.name,
                  serialNumber: serialNumber,
                };
              }
              return equipment;
            }));
            showSuccessToast("Equipment updated successfully");
            setUpdateEquipmentModalOpen(false);
            setSelectedEquipmentForUpdate(null);
          }
        }}
      />

      {/* Manage Discount Modal */}
      <ManageDiscountModal
        open={manageDiscountModalOpen && !addDiscountModalOpen && !editDiscountModalOpen}
        onClose={() => setManageDiscountModalOpen(false)}
        discounts={mockDiscounts}
        onAdd={() => {
          setAddDiscountModalOpen(true);
        }}
        onEdit={(discount) => {
          setSelectedDiscountForEdit(discount);
          setEditDiscountModalOpen(true);
        }}
        onDelete={(discountId) => {
          toast.info(`Delete discount ${discountId} - to be implemented`);
        }}
      />

      {/* Add Discount Modal */}
      <AddDiscountModal
        open={addDiscountModalOpen}
        onClose={() => setAddDiscountModalOpen(false)}
        onBack={() => {
          setAddDiscountModalOpen(false);
          setManageDiscountModalOpen(true);
        }}
        onAdd={(discount) => {
          // In a real app, this would call an API to add the discount
          console.info("Adding discount:", discount);
          toast.success("Discount added successfully");
          setAddDiscountModalOpen(false);
          setManageDiscountModalOpen(true);
        }}
      />

      {/* Edit Discount Modal */}
      <EditDiscountModal
        open={editDiscountModalOpen}
        onClose={() => {
          setEditDiscountModalOpen(false);
          setSelectedDiscountForEdit(null);
        }}
        discount={selectedDiscountForEdit}
        onBack={() => {
          setEditDiscountModalOpen(false);
          setSelectedDiscountForEdit(null);
          setManageDiscountModalOpen(true);
        }}
        onUpdate={(discountId, discount) => {
          // In a real app, this would call an API to update the discount
          console.info("Updating discount:", discountId, discount);
          toast.success("Discount updated successfully");
          setEditDiscountModalOpen(false);
          setSelectedDiscountForEdit(null);
          setManageDiscountModalOpen(true);
        }}
      />

      {/* Send Current Report Modal */}
      <SendCurrentReportModal
        open={sendCurrentReportModalOpen}
        onClose={() => setSendCurrentReportModalOpen(false)}
        onSend={(data) => {
          // In a real app, this would call an API to send the report
          console.info("Sending current report:", data);
          toast.success("Report sent successfully");
          setSendCurrentReportModalOpen(false);
        }}
      />

      {/* Send Stock In/Out Report Modal */}
      <SendStockInOutReportModal
        open={sendStockInOutReportModalOpen}
        onClose={() => setSendStockInOutReportModalOpen(false)}
        onSend={(data) => {
          // In a real app, this would call an API to send the report
          console.info("Sending stock in/out report:", data);
          toast.success("Report sent successfully");
          setSendStockInOutReportModalOpen(false);
        }}
      />

      {/* Set Low Inventory Alert Modal */}
      <SetLowInventoryAlertModal
        isOpen={setLowInventoryAlertModalOpen}
        onClose={() => setSetLowInventoryAlertModalOpen(false)}
        onSave={(settings) => {
          // In a real app, this would call an API to save alert settings
          console.info("Saving alert settings:", settings);
          toast.success("Alert settings saved successfully");
          setSetLowInventoryAlertModalOpen(false);
        }}
      />

    </div>
  );
};

export default Inventory;
