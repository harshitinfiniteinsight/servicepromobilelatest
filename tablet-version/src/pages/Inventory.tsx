import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { mockInventory } from "@/data/mobileMockData";
import { 
  Search, 
  List, 
  Grid3x3, 
  Image as ImageIcon, 
  Settings,
  Upload,
  Plus,
  Edit,
  PackageMinus,
  Bell,
  PackageX,
  FlaskConical,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import SetLowInventoryAlertModal from "@/components/modals/SetLowInventoryAlertModal";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { toast } from "sonner";

// Inventory type options
type InventoryType = "Fixed" | "Variable" | "Per Unit";

const Inventory = () => {
  const navigate = useNavigate();
  
  // Left section - Add Inventory form state
  const [formData, setFormData] = useState({
    image: null as File | null,
    name: "",
    type: "Fixed" as InventoryType,
    price: "",
    sku: "",
    stock: "",
    unit: "",
  });
  const [autoGenerateSku, setAutoGenerateSku] = useState(true);

  // Right section - Inventory list state
  const [search, setSearch] = useState("");
  const [activeButton, setActiveButton] = useState<"current" | "stock" | "discount">("current");
  const [activeTab, setActiveTab] = useState<"inventory" | "agreement" | "equipment">("inventory");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Agreement Inventory state
  const [agreementInventory, setAgreementInventory] = useState([
    { id: "AGR-INV-001", inventoryId: "INV-ITEM-001", name: "HVAC Filter - Standard", sku: "HVAC-FILT-001" },
    { id: "AGR-INV-002", inventoryId: "INV-ITEM-004", name: "Thermostat - Programmable", sku: "HVAC-THER-004" },
    { id: "AGR-INV-003", inventoryId: "INV-ITEM-010", name: "Air Filter - MERV 13", sku: "HVAC-FILT-010" },
  ]);
  const [selectedAgreementInventory, setSelectedAgreementInventory] = useState("");

  // Filter inventory based on search
  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Get Variable inventory only
  const variableInventory = mockInventory.filter(item => item.type === "V");

  // Filter agreement inventory based on search
  const filteredAgreementInventory = agreementInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Generate SKU
  const generateSku = () => {
    const prefix = formData.type === "Fixed" ? "FXD" : formData.type === "Variable" ? "VAR" : "UNT";
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate SKU when name changes and autoGenerate is on
    if (field === "name" && autoGenerateSku) {
      setFormData(prev => ({ ...prev, [field]: value, sku: generateSku() }));
    }
  };

  // Handle type change
  const handleTypeChange = (value: InventoryType) => {
    setFormData(prev => ({ 
      ...prev, 
      type: value,
      // Reset price if Variable type selected
      price: value === "Variable" ? "" : prev.price,
      // Reset unit if not Per Unit
      unit: value === "Per Unit" ? prev.unit : ""
    }));
    
    // Regenerate SKU with new prefix if autoGenerate is on
    if (autoGenerateSku) {
      const prefix = value === "Fixed" ? "FXD" : value === "Variable" ? "VAR" : "UNT";
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      setFormData(prev => ({ ...prev, type: value, sku: `${prefix}-${random}` }));
    }
  };

  // Handle form submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Inventory item saved successfully");
    // Reset form
    setFormData({
      image: null,
      name: "",
      type: "Fixed",
      price: "",
      sku: "",
      stock: "",
      unit: "",
    });
  };

  // Get type badge info
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "F":
        return { label: "F", className: "bg-blue-100 text-blue-700 border-blue-200" };
      case "V":
        return { label: "V", className: "bg-green-100 text-green-700 border-green-200" };
      case "U":
        return { label: "U", className: "bg-purple-100 text-purple-700 border-purple-200" };
      default:
        return { label: type, className: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const hasName = formData.name.trim() !== "";
    const hasSku = formData.sku.trim() !== "";
    const hasStock = formData.stock.trim() !== "";
    
    if (formData.type === "Variable") {
      return hasName && hasSku && hasStock;
    }
    
    const hasPrice = formData.price.trim() !== "";
    
    if (formData.type === "Per Unit") {
      const hasUnit = formData.unit.trim() !== "";
      return hasName && hasSku && hasStock && hasPrice && hasUnit;
    }
    
    return hasName && hasSku && hasStock && hasPrice;
  };

  // Handle Add Agreement Inventory
  const handleAddAgreementInventory = () => {
    if (!selectedAgreementInventory) {
      toast.error("Please select an inventory item");
      return;
    }

    const selectedItem = mockInventory.find(item => item.id === selectedAgreementInventory);
    if (selectedItem && !agreementInventory.find(item => item.inventoryId === selectedItem.id)) {
      const newId = `AGR-INV-${String(agreementInventory.length + 1).padStart(3, '0')}`;
      setAgreementInventory([
        ...agreementInventory,
        { id: newId, inventoryId: selectedItem.id, name: selectedItem.name, sku: selectedItem.sku }
      ]);
      setSelectedAgreementInventory("");
      toast.success(`${selectedItem.name} added to agreement inventory`);
    }
  };

  // Handle Delete Agreement Inventory
  const handleDeleteAgreementInventory = (id: string) => {
    const item = agreementInventory.find(item => item.id === id);
    setAgreementInventory(agreementInventory.filter(item => item.id !== id));
    if (item) {
      toast.success(`${item.name} removed from agreement inventory`);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Fixed Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Inventory List</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAlertModalOpen(true)}
          className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <Settings className="h-4 w-4" />
          Alert Settings
        </Button>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Section - Conditional Form */}
        <aside className="w-full md:w-[40%] bg-white border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
          <div className="p-5">
            {activeTab === "agreement" ? (
              // Add Agreement Inventory Form
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Agreement Inventory</h2>
                
                {/* Informational Text */}
                <div className="space-y-3 mb-5 text-sm text-gray-700">
                  {/* Paragraph 1 */}
                  <p className="text-sm leading-relaxed">
                    Every E-sign agreement comes with default inventory. You may edit the default inventory name by going to the inventory item and updating the name and information.
                  </p>

                  {/* Paragraph 2 - IMPORTANT */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm leading-relaxed">
                      <span className="font-bold text-yellow-900">IMPORTANT:</span>
                      {" "}
                      <span className="text-yellow-900">You may only use Variable inventory for the E-sign agreement.</span>
                    </p>
                  </div>

                  {/* Paragraph 3 */}
                  <p className="text-sm leading-relaxed">
                    When adding inventory for the E-sign Agreement, make sure to choose Variable under the field Price Type.
                  </p>

                  {/* Paragraph 4 */}
                  <p className="text-sm leading-relaxed">
                    Once saved, you will see the newly added variable inventory inside the E-sign Agreement inventory. Choose the newly created inventory and add it to the E-sign agreement as per your requirements or select an existing inventory shown below.
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Select Agreement Inventory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Select Agreement Inventory <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedAgreementInventory} onValueChange={setSelectedAgreementInventory}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choose inventory" />
                      </SelectTrigger>
                      <SelectContent>
                        {variableInventory.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleAddAgreementInventory}
                      className="flex-1 h-10 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedAgreementInventory("")}
                      className="flex-1 h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Add Inventory Form
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Inventory</h2>
                
                <form onSubmit={handleSave} className="space-y-4">
                  {/* Upload Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Upload Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="inventory-image"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFormData(prev => ({ ...prev, image: file }));
                        }}
                      />
                      <label htmlFor="inventory-image" className="cursor-pointer">
                        {formData.image ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <ImageIcon className="h-8 w-8" />
                            <span className="text-sm font-medium">{formData.image.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Upload className="h-8 w-8" />
                            <span className="text-sm">Click to upload image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Inventory Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Inventory Name
                    </label>
                    <Input
                      placeholder="Enter inventory name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {/* Inventory Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Inventory Type
                    </label>
                    <Select value={formData.type} onValueChange={handleTypeChange}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Variable">Variable</SelectItem>
                        <SelectItem value="Per Unit">Per Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price - Hidden for Variable type */}
                  {formData.type !== "Variable" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          className="h-10 pl-7"
                        />
                      </div>
                    </div>
                  )}

                  {/* Item Unit - Only for Per Unit type */}
                  {formData.type === "Per Unit" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Item Unit
                      </label>
                      <Input
                        placeholder="e.g., piece, meter, kg"
                        value={formData.unit}
                        onChange={(e) => handleInputChange("unit", e.target.value)}
                        className="h-10"
                      />
                    </div>
                  )}

                  {/* SKU */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        SKU
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={autoGenerateSku}
                          onChange={(e) => {
                            setAutoGenerateSku(e.target.checked);
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, sku: generateSku() }));
                            }
                          }}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        Auto-generate
                      </label>
                    </div>
                    <Input
                      placeholder="Enter SKU"
                      value={formData.sku}
                      onChange={(e) => {
                        setAutoGenerateSku(false);
                        handleInputChange("sku", e.target.value);
                      }}
                      className="h-10"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Stock Quantity
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter stock quantity"
                      value={formData.stock}
                      onChange={(e) => handleInputChange("stock", e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    type="submit"
                    disabled={!isFormValid()}
                    className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  >
                    Save
                  </Button>
                </form>
              </>
            )}
          </div>
        </aside>

        {/* Right Section - Inventory List */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="p-5 flex-1 overflow-y-auto">
            
            {/* Top Buttons Row */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeButton === "current" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveButton("current")}
                className={cn(
                  "flex-1 h-9",
                  activeButton === "current" 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                Current Report
              </Button>
              <Button
                variant={activeButton === "stock" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveButton("stock")}
                className={cn(
                  "flex-1 h-9",
                  activeButton === "stock" 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                Stock In/Out Report
              </Button>
              <Button
                variant={activeButton === "discount" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveButton("discount")}
                className={cn(
                  "flex-1 h-9",
                  activeButton === "discount" 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                Discount
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("inventory")}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                  activeTab === "inventory"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                Inventory / Services
              </button>
              <button
                onClick={() => setActiveTab("agreement")}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                  activeTab === "agreement"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                Agreement Inventory
              </button>
              <button
                onClick={() => setActiveTab("equipment")}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                  activeTab === "equipment"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                Equipment Tracking
              </button>
            </div>

            {/* Search & View Toggle */}
            <div className={cn("flex items-center gap-3 mb-4", activeTab === "agreement" && "flex-col items-stretch")}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or SKU"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              {activeTab !== "agreement" && (
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      viewMode === "list" 
                        ? "bg-white text-orange-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      viewMode === "grid" 
                        ? "bg-white text-orange-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    title="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Inventory List Content */}
            {activeTab === "inventory" && (
              <div className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-2 lg:grid-cols-3 gap-3" 
                  : "flex flex-col gap-2"
              )}>
                {filteredInventory.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <p className="text-sm">No inventory items found</p>
                  </div>
                ) : (
                  filteredInventory.map((item) => {
                    const typeBadge = getTypeBadge(item.type || "F");
                    const isLowStock = item.stock <= item.lowStockThreshold;
                    
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all overflow-hidden",
                          viewMode === "grid" ? "" : "p-3 flex items-center justify-between"
                        )}
                      >
                        {viewMode === "grid" ? (
                          // Grid View Card with Image
                          <>
                            {/* Image Thumbnail */}
                            <div className="w-full h-28 bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="h-10 w-10 text-gray-300" />
                            </div>
                            
                            {/* Card Content */}
                            <div className="p-3">
                              {/* Name + Menu Row */}
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 pr-2">
                                  {item.name}
                                </h3>
                                <KebabMenu
                                  align="end"
                                  menuWidth="w-44"
                                  items={[
                                    {
                                      label: "Edit",
                                      icon: Edit,
                                      action: () => {
                                        toast.info(`Edit ${item.name}`);
                                        navigate(`/inventory/${item.id}/edit`);
                                      },
                                    },
                                    {
                                      label: "Adjust Stock",
                                      icon: PackageMinus,
                                      action: () => {
                                        toast.info(`Adjust stock for ${item.name}`);
                                      },
                                    },
                                    {
                                      label: "Alert",
                                      icon: Bell,
                                      action: () => {
                                        toast.info(`Set alert for ${item.name}`);
                                      },
                                    },
                                    {
                                      label: "Damaged Goods",
                                      icon: PackageX,
                                      action: () => {
                                        toast.info(`Mark ${item.name} as damaged`);
                                      },
                                    },
                                    {
                                      label: "Tester",
                                      icon: FlaskConical,
                                      action: () => {
                                        toast.info(`Mark ${item.name} as tester`);
                                      },
                                    },
                                  ]}
                                />
                              </div>
                              
                              {/* Meta Row */}
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="text-gray-500">SKU:</span>
                                <span className="font-medium text-gray-700">{item.sku}</span>
                                <Badge 
                                  variant="outline" 
                                  className={cn("h-5 px-1.5 text-[10px] font-semibold", typeBadge.className)}
                                >
                                  {typeBadge.label}
                                </Badge>
                              </div>
                              
                              {/* Stock & Price Row */}
                              <div className="flex items-center justify-between mt-2 text-xs">
                                <span className="text-gray-500">
                                  Stock: <span className={cn("font-medium", isLowStock ? "text-red-600" : "text-gray-700")}>{item.stock}</span>
                                </span>
                                <span className="font-semibold text-orange-600">${item.unitPrice.toFixed(2)}</span>
                              </div>
                              
                              {/* Low Stock Alert */}
                              {isLowStock && (
                                <div className="mt-1.5">
                                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded">
                                    Low: {item.lowStockThreshold}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          // List View Card
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {item.name}
                                </h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-gray-500">
                                  SKU: <span className="font-medium text-gray-700">{item.sku}</span>
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={cn("h-5 px-1.5 text-[10px] font-semibold", typeBadge.className)}
                                >
                                  {typeBadge.label}
                                </Badge>
                                <span className="text-gray-500">
                                  Stock: <span className={cn("font-medium", isLowStock ? "text-red-600" : "text-gray-700")}>{item.stock}</span>
                                </span>
                                <span className="font-semibold text-orange-600">${item.unitPrice.toFixed(2)}</span>
                                {isLowStock && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded">
                                    Low: {item.lowStockThreshold}
                                  </span>
                                )}
                              </div>
                            </div>
                            <KebabMenu
                              align="end"
                              menuWidth="w-44"
                              items={[
                                {
                                  label: "Edit",
                                  icon: Edit,
                                  action: () => {
                                    toast.info(`Edit ${item.name}`);
                                    navigate(`/inventory/${item.id}/edit`);
                                  },
                                },
                                {
                                  label: "Adjust Stock",
                                  icon: PackageMinus,
                                  action: () => {
                                    toast.info(`Adjust stock for ${item.name}`);
                                  },
                                },
                                {
                                  label: "Alert",
                                  icon: Bell,
                                  action: () => {
                                    toast.info(`Set alert for ${item.name}`);
                                  },
                                },
                                {
                                  label: "Damaged Goods",
                                  icon: PackageX,
                                  action: () => {
                                    toast.info(`Mark ${item.name} as damaged`);
                                  },
                                },
                                {
                                  label: "Tester",
                                  icon: FlaskConical,
                                  action: () => {
                                    toast.info(`Mark ${item.name} as tester`);
                                  },
                                },
                              ]}
                            />
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Agreement Inventory Tab Content */}
            {activeTab === "agreement" && (
              <div className="flex flex-col gap-2">
                {filteredAgreementInventory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">No agreement inventory items found</p>
                  </div>
                ) : (
                  filteredAgreementInventory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all p-3 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 font-medium">SKU:</span>
                          <span className="text-xs text-gray-700">{item.sku}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteAgreementInventory(item.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Equipment Tracking Tab Content */}
            {activeTab === "equipment" && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">Equipment Tracking content</p>
                <p className="text-xs mt-1">Track equipment assigned to employees</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Set Low Inventory Alert Modal */}
      <SetLowInventoryAlertModal 
        isOpen={alertModalOpen} 
        onClose={() => setAlertModalOpen(false)} 
      />
    </div>
  );
};

export default Inventory;
