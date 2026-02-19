import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, Wrench, Tags, FileText, AlertTriangle, Edit, Trash2, UserCheck, LayoutGrid, List, Bell } from "lucide-react";
import { mockInventory, mockEquipment, mockDiscounts } from "@/data/mockData";
import { InventoryFormModal } from "@/components/modals/InventoryFormModal";
import { StockAdjustmentModal } from "@/components/modals/StockAdjustmentModal";
import { LowStockAlertModal } from "@/components/modals/LowStockAlertModal";
import { DiscountFormModal } from "@/components/modals/DiscountFormModal";
import { EquipmentFormModal } from "@/components/modals/EquipmentFormModal";
import { EquipmentAssignModal } from "@/components/modals/EquipmentAssignModal";
import { EquipmentNotesModal } from "@/components/modals/EquipmentNotesModal";
import { AddAgreementInventoryModal } from "@/components/modals/AddAgreementInventoryModal";
import { SendCurrentReportModal } from "@/components/modals/SendCurrentReportModal";
import { SendStockInOutReportModal } from "@/components/modals/SendStockInOutReportModal";

const Inventory = () => {
  const navigate = useNavigate();
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<any>(null);
  const [stockAdjustmentModal, setStockAdjustmentModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const [lowStockAlertModal, setLowStockAlertModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [equipmentAssignModal, setEquipmentAssignModal] = useState<{ open: boolean; equipment: any }>({ open: false, equipment: null });
  const [equipmentNotesModal, setEquipmentNotesModal] = useState<{ open: boolean; equipment: any }>({ open: false, equipment: null });
  const [agreementInventoryModalOpen, setAgreementInventoryModalOpen] = useState(false);
  const [sendCurrentReportModalOpen, setSendCurrentReportModalOpen] = useState(false);
  const [sendStockInOutReportModalOpen, setSendStockInOutReportModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("inventory");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "Fixed": return "F";
      case "Variable": return "V";
      case "Per Unit": return "PER UNIT";
      default: return type;
    }
  };

  return (
    <div className="flex-1">
      <AppHeader searchPlaceholder="Search inventory, equipment..." />

      <main className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <LayoutGrid className="h-4 w-4 mr-1" />
              Grid
            </Button>
          </div>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="agreement-inventory">Agreement</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
          </TabsList>
          <TabsContent value="inventory" className="space-y-4 mt-6">
            {/* List View */}
            {viewMode === "list" && (
              <div className="grid gap-4">
                {mockInventory.map((item) => (
                <Card 
                  key={item.id} 
                  className="border border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          {item.image && (
                            <div className="flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-24 h-24 rounded-lg object-cover border border-border"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-bold text-base sm:text-lg text-foreground">
                                {item.name}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className="w-fit bg-primary/5 text-primary border-primary/30 font-semibold px-3 py-1"
                              >
                                {getTypeLabel(item.type)}
                              </Badge>
                            </div>
                          
                          <div className="flex flex-wrap gap-3 sm:gap-4">
                            <div className="px-3 py-1.5 bg-muted rounded-md">
                              <span className="text-xs font-medium text-muted-foreground">ID: </span>
                              <span className="text-xs font-bold text-foreground">{item.id}</span>
                            </div>
                            <div className="px-3 py-1.5 bg-muted rounded-md">
                              <span className="text-xs font-medium text-muted-foreground">SKU: </span>
                              <span className="text-xs font-bold text-foreground">{item.sku}</span>
                            </div>
                            <div className="px-3 py-1.5 bg-muted rounded-md">
                              <span className="text-xs font-medium text-muted-foreground">Category: </span>
                              <span className="text-xs font-bold text-foreground">{item.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 pt-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/20">
                              <Package className="h-4 w-4 text-accent" />
                              <div>
                                <span className="text-xs text-muted-foreground block">Stock</span>
                                <span className="font-bold text-lg text-foreground">{item.stockQuantity}</span>
                              </div>
                            </div>
                            
                            {item.stockQuantity <= item.lowStockAlert && item.stockQuantity > 0 && (
                              <Badge variant="outline" className="bg-warning/15 text-warning border-warning/40 gap-1.5 px-3 py-1.5 font-semibold shadow-sm">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Low Stock Alert
                              </Badge>
                            )}
                            
                            <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                              <span className="text-xs text-muted-foreground block">Price</span>
                              <span className="font-bold text-xl text-primary">${item.price}</span>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-3 border-t border-border">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all font-medium"
                          onClick={() => {
                            setEditingInventory(item);
                            setInventoryModalOpen(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span className="text-xs">Update</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 hover:bg-accent/10 hover:text-accent hover:border-accent transition-all font-medium"
                          onClick={() => setStockAdjustmentModal({ open: true, item })}
                        >
                          <Package className="h-3.5 w-3.5" />
                          <span className="text-xs">Adjust Stock</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 hover:bg-warning/10 hover:text-warning hover:border-warning transition-all font-medium"
                          onClick={() => setLowStockAlertModal({ open: true, item })}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="text-xs">Alert</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all font-medium"
                          onClick={() => setStockAdjustmentModal({ open: true, item })}
                        >
                          <span className="text-xs">Damage</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 hover:bg-info/10 hover:text-info hover:border-info transition-all font-medium col-span-2 sm:col-span-1"
                          onClick={() => setStockAdjustmentModal({ open: true, item })}
                        >
                          <span className="text-xs">Tester</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mockInventory.map((item) => (
                  <Card 
                    key={item.id} 
                    className="border border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="h-20 w-20 text-primary/30" />
                        </div>
                      )}
                      {item.stockQuantity <= item.lowStockAlert && item.stockQuantity > 0 && (
                        <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-base text-foreground truncate">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30">
                            {getTypeLabel(item.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">SKU: {item.sku}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-border">
                        <div>
                          <div className="text-xs text-muted-foreground">Stock</div>
                          <div className="font-bold text-lg text-foreground">{item.stockQuantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Price</div>
                          <div className="font-bold text-lg text-primary">${item.price}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setEditingInventory(item);
                            setInventoryModalOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setStockAdjustmentModal({ open: true, item })}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          Adjust Stock
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Agreement Inventory Tab */}
          <TabsContent value="agreement-inventory" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Button 
                onClick={() => setAgreementInventoryModalOpen(true)}
                className="gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Agreement Inventory</span>
              </Button>
            </div>

            <Card className="border border-border bg-card shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="border-b border-border bg-muted/30">
                <CardTitle className="text-lg font-bold">Agreement Inventory List</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3">
                {mockInventory.filter(item => item.type === "Variable").map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-base text-foreground mb-1">{item.name}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30 text-xs">
                          ID: {item.id}
                        </Badge>
                        <Badge variant="outline" className="bg-accent/5 text-accent border-accent/30 text-xs">
                          SKU: {item.sku}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="jane-smith">Jane Smith</SelectItem>
                  <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => setEquipmentModalOpen(true)} 
                className="gap-2 shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Equipment</span>
              </Button>
            </div>

            <div className="grid gap-4">
              {mockEquipment.map((equipment) => (
                <Card 
                  key={equipment.id} 
                  className="border border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-bold text-base sm:text-lg text-foreground">{equipment.name}</h3>
                            <Badge 
                              className={
                                equipment.status === "Assigned" 
                                  ? "w-fit bg-success/15 text-success border border-success/40 font-semibold px-3 py-1 shadow-sm" 
                                  : "w-fit bg-muted text-muted-foreground border border-border font-semibold px-3 py-1"
                              }
                            >
                              {equipment.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <div className="px-3 py-1.5 bg-muted rounded-md">
                              <span className="text-xs font-medium text-muted-foreground">Serial: </span>
                              <span className="text-xs font-bold text-foreground">{equipment.serialNumber}</span>
                            </div>
                            {equipment.assignedTo && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-md border border-accent/20">
                                <UserCheck className="h-4 w-4 text-accent" />
                                <div>
                                  <span className="text-xs text-muted-foreground">Assigned To: </span>
                                  <span className="text-xs font-semibold text-foreground">{equipment.assignedTo}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-border">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all font-medium"
                          onClick={() => setEquipmentAssignModal({ open: true, equipment })}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span className="text-xs">{equipment.status === "Assigned" ? "Reassign" : "Assign"}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 hover:bg-accent/10 hover:text-accent hover:border-accent transition-all font-medium"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span className="text-xs">Update</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 hover:bg-info/10 hover:text-info hover:border-info transition-all font-medium col-span-2 sm:col-span-1"
                          onClick={() => setEquipmentNotesModal({ open: true, equipment })}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span className="text-xs">Notes ({equipment.notes.length})</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <InventoryFormModal 
          open={inventoryModalOpen} 
          onOpenChange={(open) => {
            setInventoryModalOpen(open);
            if (!open) setEditingInventory(null);
          }} 
          mode={editingInventory ? "edit" : "create"}
          inventory={editingInventory}
        />
        <StockAdjustmentModal 
          open={stockAdjustmentModal.open} 
          onOpenChange={(open) => setStockAdjustmentModal({ open, item: null })}
          item={stockAdjustmentModal.item}
        />
        <LowStockAlertModal
          open={lowStockAlertModal.open}
          onOpenChange={(open) => setLowStockAlertModal({ open, item: null })}
          item={lowStockAlertModal.item}
        />
        <DiscountFormModal open={discountModalOpen} onOpenChange={setDiscountModalOpen} mode="create" />
        <EquipmentFormModal open={equipmentModalOpen} onOpenChange={setEquipmentModalOpen} mode="create" />
        <EquipmentAssignModal
          open={equipmentAssignModal.open}
          onOpenChange={(open) => setEquipmentAssignModal({ open, equipment: null })}
          equipment={equipmentAssignModal.equipment}
        />
        <EquipmentNotesModal
          open={equipmentNotesModal.open}
          onOpenChange={(open) => setEquipmentNotesModal({ open, equipment: null })}
          equipment={equipmentNotesModal.equipment}
        />
        <AddAgreementInventoryModal
          open={agreementInventoryModalOpen}
          onOpenChange={setAgreementInventoryModalOpen}
        />
        <SendCurrentReportModal
          open={sendCurrentReportModalOpen}
          onOpenChange={setSendCurrentReportModalOpen}
        />
        <SendStockInOutReportModal
          open={sendStockInOutReportModalOpen}
          onOpenChange={setSendStockInOutReportModalOpen}
        />
      </main>
    </div>
  );
};

export default Inventory;
