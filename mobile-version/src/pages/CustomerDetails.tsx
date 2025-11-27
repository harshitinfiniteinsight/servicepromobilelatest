import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { mockCustomers, mockInvoices } from "@/data/mobileMockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MapPin, DollarSign, Calendar, Edit, Camera, ChevronDown, ChevronUp, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/data/mobileMockData";
import { toast } from "sonner";
import { showSuccessToast } from "@/utils/toast";
import CustomerAddNoteModal from "@/components/modals/CustomerAddNoteModal";
import CustomerPicturesModal from "@/components/modals/CustomerPicturesModal";
import ServicePictureViewerModal from "@/components/modals/ServicePictureViewerModal";
import { getCustomerOrders, Order } from "@/services/orderService";
import { loadCustomerPictures, uploadCustomerPicture, CustomerPicture, loadCustomerServicePictures, CustomerServicePicture } from "@/services/customerService";
import { mockJobs } from "@/data/mobileMockData";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const customer = mockCustomers.find(c => c.id === id);
  
  if (!customer) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Customer not found</p>
      </div>
    );
  }

  const customerInvoices = mockInvoices.filter(i => i.customerId === id);
  const initials = customer.name.split(" ").map(n => n[0]).join("");
  
  // Check for edit parameter in URL
  const editParam = searchParams.get("edit");
  const [isEditing, setIsEditing] = useState(editParam === "true");
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [customerPictures, setCustomerPictures] = useState<CustomerPicture[]>([]);
  const [isLoadingPictures, setIsLoadingPictures] = useState(false);
  const [picturesModalOpen, setPicturesModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [servicePictures, setServicePictures] = useState<CustomerServicePicture[]>([]);
  const [isLoadingServicePictures, setIsLoadingServicePictures] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  
  const [formState, setFormState] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.notes ?? "",
    address: customer.address,
    gender: (customer as any).gender || "Male", // Default to Male if not available
  });

  // Determine if customer is active
  const isActive = customer.status === "Active";

  // Reset form state when customer changes
  useEffect(() => {
    setFormState({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.notes ?? "",
      address: customer.address,
      gender: (customer as any).gender || "Male",
    });
  }, [customer]);

  // Set edit mode based on URL parameter
  useEffect(() => {
    if (editParam === "true") {
      setIsEditing(true);
    }
  }, [editParam]);

  // Fetch customer orders (including cart orders)
  useEffect(() => {
    const fetchOrders = async () => {
      if (!id) return;
      try {
        setIsLoadingOrders(true);
        const customerOrders = await getCustomerOrders(id);
        setOrders(customerOrders);
      } catch (error) {
        console.error("Error fetching customer orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [id, location.key]); // location.key ensures refresh when navigating from checkout

  // Load customer pictures on mount
  useEffect(() => {
    const fetchPictures = async () => {
      if (!id) return;
      try {
        setIsLoadingPictures(true);
        const pictures = await loadCustomerPictures(id);
        setCustomerPictures(pictures);
      } catch (error) {
        console.error("Error fetching customer pictures:", error);
      } finally {
        setIsLoadingPictures(false);
      }
    };

    fetchPictures();
  }, [id]);

  // Load customer service pictures on mount
  useEffect(() => {
    const fetchServicePictures = async () => {
      if (!id) return;
      try {
        setIsLoadingServicePictures(true);
        // Get jobs for this customer to match with service pictures
        const customerJobs = mockJobs.filter(job => job.customerId === id);
        const pictures = await loadCustomerServicePictures(id, customerJobs);
        setServicePictures(pictures);
      } catch (error) {
        console.error("Error fetching customer service pictures:", error);
      } finally {
        setIsLoadingServicePictures(false);
      }
    };

    fetchServicePictures();
  }, [id]);

  const handleChange = (field: keyof typeof formState) => (value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    if (isEditing) {
      // If in edit mode, exit edit mode and remove URL parameter
      setIsEditing(false);
      navigate(`/customers/${id}`, { replace: true });
    } else {
      // Otherwise, navigate back normally
      navigate(-1);
    }
  };

  const handleUploadPicture = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setIsLoadingPictures(true);
      const newPicture = await uploadCustomerPicture(id, file);
      setCustomerPictures(prev => [newPicture, ...prev]);
      showSuccessToast("Picture uploaded successfully");
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload picture");
    } finally {
      setIsLoadingPictures(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Get first 3 pictures for thumbnail display
  const displayPictures = customerPictures.slice(0, 3);
  const hasMorePictures = customerPictures.length > 3;

  // Handle image viewer
  const handleViewImage = (images: string[], initialIndex: number) => {
    setViewerImages(images);
    setViewerInitialIndex(initialIndex);
    setViewerModalOpen(true);
  };

  // Handle service picture upload
  const handleServicePictureUpload = async (
    jobId: string,
    type: "before" | "after",
    file: File
  ) => {
    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      // Convert file to data URL
      const imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update jobPictures in localStorage (same storage used by Jobs page)
      const jobPicturesStorage = localStorage.getItem("jobPictures");
      const jobPictures = jobPicturesStorage ? JSON.parse(jobPicturesStorage) : {};
      
      const currentPictures = jobPictures[jobId] || { beforeImage: null, afterImage: null };
      jobPictures[jobId] = {
        ...currentPictures,
        [type === "before" ? "beforeImage" : "afterImage"]: imageUrl,
      };

      localStorage.setItem("jobPictures", JSON.stringify(jobPictures));

      // Refresh service pictures
      const customerJobs = mockJobs.filter(job => job.customerId === id);
      const updatedPictures = await loadCustomerServicePictures(id!, customerJobs);
      setServicePictures(updatedPictures);

      showSuccessToast(`${type === "before" ? "Before" : "After"} service picture uploaded successfully`);
    } catch (error) {
      console.error("Error uploading service picture:", error);
      toast.error("Failed to upload image");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader 
        title={`Customer History of ${customer.name}`}
        showBack={true}
        onBack={handleBack}
      />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-6 space-y-4 px-4">
        {/* Customer Details Card */}
        <Card className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <CardHeader className="p-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-1">
              <CardTitle className="text-base font-semibold text-gray-800">Customer Details</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(prev => !prev)}
                  className="h-7 w-7 text-gray-500 hover:text-orange-500"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="h-7 w-7 text-gray-400 hover:text-gray-600"
                >
                  {isDetailsExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {isDetailsExpanded && (
            <CardContent className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {/* Name */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Name</p>
                  {isEditing ? (
                    <Input
                      value={formState.name}
                      onChange={e => handleChange("name")(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formState.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Email</p>
                  {isEditing ? (
                    <Input
                      value={formState.email}
                      onChange={e => handleChange("email")(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formState.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Phone</p>
                  {isEditing ? (
                    <Input
                      value={formState.phone}
                      onChange={e => handleChange("phone")(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formState.phone}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Company Name</p>
                  {isEditing ? (
                    <Input
                      value={formState.company}
                      onChange={e => handleChange("company")(e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formState.company || "-"}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Address</p>
                  {isEditing ? (
                    <Textarea
                      value={formState.address}
                      onChange={e => handleChange("address")(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-line">{formState.address || "-"}</p>
                  )}
                </div>

                {/* Active */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Active</p>
                  {isEditing ? (
                    <Select
                      value={isActive ? "Yes" : "No"}
                      onValueChange={(value) => {
                        // Handle active status change
                        console.info("Active status changed to", value);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">{isActive ? "YES" : "NO"}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <p className="font-medium text-gray-600 mb-1">Gender</p>
                  {isEditing ? (
                    <Select
                      value={formState.gender}
                      onValueChange={(value) => handleChange("gender")(value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">{formState.gender}</p>
                  )}
                </div>

                {/* Add Memo */}
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-600">Add Memo</p>
                  <Button
                    onClick={() => setAddNoteModalOpen(true)}
                    className="flex items-center space-x-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-100 transition h-auto text-xs font-normal"
                  >
                    <span>Memo</span>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Picture Gallery Section */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Picture Gallery</h3>
                  <Button
                    onClick={handleUploadPicture}
                    disabled={isLoadingPictures}
                    className="flex items-center space-x-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-100 transition h-auto text-xs font-normal disabled:opacity-50"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {isLoadingPictures && customerPictures.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Loading pictures...
                  </div>
                ) : customerPictures.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">No pictures uploaded yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {displayPictures.map((picture) => (
                        <div
                          key={picture.id}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                        >
                          <img
                            src={picture.thumbnailUrl || picture.url}
                            alt={`Picture ${picture.id}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Handle invalid blob URLs or broken images
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-400">Image unavailable</p></div>';
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {hasMorePictures && (
                      <Button
                        onClick={() => setPicturesModalOpen(true)}
                        variant="outline"
                        className="w-full text-sm text-gray-700 hover:bg-gray-50"
                      >
                        View More ({customerPictures.length} total)
                      </Button>
                    )}
                  </>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end pt-3 border-t border-gray-200 mt-3">
                  <Button 
                    size="sm"
                    onClick={() => {
                      console.info("Saving customer", formState);
                      setIsEditing(false);
                      navigate(`/customers/${id}`, { replace: true });
                      showSuccessToast("Customer information updated successfully");
                    }}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Orders & Service Pictures */}
        <Card className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <CardContent className="p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10 mb-4 bg-gray-100">
                <TabsTrigger 
                  value="orders" 
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="service-pictures" 
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Service Pictures
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Input
                    placeholder="Search orders..."
                    className="w-full sm:w-1/2"
                  />
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-28">
                        <span>All</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="invoices">Invoices</SelectItem>
                        <SelectItem value="estimates">Estimates</SelectItem>
                        <SelectItem value="agreements">Agreements</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Date Range
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  {(() => {
                    // Combine cart orders with invoices
                    // Convert invoices to order format for display
                    const invoiceOrders = customerInvoices.map(inv => ({
                      id: inv.id,
                      type: inv.type === "recurring" ? "invoice" : "invoice" as const,
                      orderType: inv.type === "recurring" ? "Recurring" : "Single" as const,
                      source: "invoice" as const,
                      customerId: inv.customerId,
                      customerName: inv.customerName,
                      items: [],
                      subtotal: inv.amount,
                      tax: 0,
                      total: inv.amount,
                      createdAt: inv.issueDate,
                      issueDate: inv.issueDate,
                      status: inv.status,
                      paymentMethod: inv.paymentMethod,
                    }));

                    // Combine all orders and sort by date (newest first)
                    const allOrders = [...orders, ...invoiceOrders].sort((a, b) => {
                      const dateA = new Date(a.createdAt || a.issueDate || 0).getTime();
                      const dateB = new Date(b.createdAt || b.issueDate || 0).getTime();
                      return dateB - dateA;
                    });

                    if (isLoadingOrders) {
                      return (
                        <div className="py-8 text-center text-muted-foreground">
                          Loading orders...
                        </div>
                      );
                    }

                    if (allOrders.length === 0) {
                      return (
                        <div className="py-8 text-center text-muted-foreground">
                          No orders found for this customer.
                        </div>
                      );
                    }

                    return (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allOrders.map(order => (
                            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/40">
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>{order.employeeName || "N/A"}</TableCell>
                              <TableCell>${order.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {order.orderType || order.type || "Invoice"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {new Date(order.createdAt || order.issueDate || Date.now()).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    );
                  })()}
                </div>
              </TabsContent>

              {/* Service Pictures Tab */}
              <TabsContent value="service-pictures" className="mt-4">
                {isLoadingServicePictures ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading service pictures...
                  </div>
                ) : servicePictures.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">No service pictures available for this customer.</p>
                  </div>
                ) : (
                  <Accordion 
                    type="single" 
                    collapsible 
                    className="w-full"
                    defaultValue={servicePictures.length > 0 ? servicePictures[0].jobId : undefined}
                  >
                    {servicePictures.map((picture, index) => {
                      const images: string[] = [];
                      if (picture.beforeImageUrl) images.push(picture.beforeImageUrl);
                      if (picture.afterImageUrl) images.push(picture.afterImageUrl);

                      return (
                        <AccordionItem 
                          key={picture.jobId} 
                          value={picture.jobId}
                          className="border border-gray-200 rounded-lg mb-3 bg-white px-3"
                        >
                          <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:no-underline py-3">
                            {picture.orderId ? `Order ID: ${picture.orderId}` : `Job ID: ${picture.jobId}`}
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              {/* Before Service */}
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-2">Before Service</p>
                                {picture.beforeImageUrl ? (
                                  <div
                                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => {
                                      const imgIndex = images.indexOf(picture.beforeImageUrl!);
                                      handleViewImage(images, imgIndex);
                                    }}
                                  >
                                    <img
                                      src={picture.beforeImageUrl}
                                      alt="Before service"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-400">Image unavailable</p></div>';
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center">
                                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                      <p className="text-xs text-gray-400 text-center px-2">No picture</p>
                                    </div>
                                    <input
                                      id={`before-input-${picture.jobId}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleServicePictureUpload(picture.jobId, "before", file);
                                        }
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs h-8"
                                      onClick={() => {
                                        const input = document.getElementById(`before-input-${picture.jobId}`) as HTMLInputElement;
                                        input?.click();
                                      }}
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      Upload
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* After Service */}
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-2">After Service</p>
                                {picture.afterImageUrl ? (
                                  <div
                                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => {
                                      const imgIndex = images.indexOf(picture.afterImageUrl!);
                                      handleViewImage(images, imgIndex);
                                    }}
                                  >
                                    <img
                                      src={picture.afterImageUrl}
                                      alt="After service"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-400">Image unavailable</p></div>';
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center">
                                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                      <p className="text-xs text-gray-400 text-center px-2">No picture</p>
                                    </div>
                                    <input
                                      id={`after-input-${picture.jobId}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleServicePictureUpload(picture.jobId, "after", file);
                                        }
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs h-8"
                                      onClick={() => {
                                        const input = document.getElementById(`after-input-${picture.jobId}`) as HTMLInputElement;
                                        input?.click();
                                      }}
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      Upload
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Note Modal */}
      <CustomerAddNoteModal
        open={addNoteModalOpen}
        onClose={() => setAddNoteModalOpen(false)}
        customer={customer}
        onAddNote={(customerId, noteText) => {
          console.info("Adding note to customer", customerId, noteText);
          showSuccessToast("Note added successfully");
        }}
      />

      {/* Customer Pictures Modal */}
      <CustomerPicturesModal
        open={picturesModalOpen}
        onClose={() => setPicturesModalOpen(false)}
        pictures={customerPictures}
        customerName={customer.name}
      />

      {/* Service Picture Viewer Modal */}
      <ServicePictureViewerModal
        open={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        images={viewerImages}
        initialIndex={viewerInitialIndex}
      />
    </div>
  );
};

export default CustomerDetails;
