// Order service for managing customer orders
// Uses localStorage as a mock backend for persistence

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  type?: string;
}

export interface Order {
  id: string;
  type: "cart" | "invoice" | "estimate" | "agreement";
  orderType: "Cart" | "Single" | "Recurring" | "Estimate" | "Agreement";
  source: "cart" | "invoice" | "estimate" | "agreement";
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  discountType?: "%" | "$";
  notes?: string;
  employeeId?: string;
  employeeName?: string;
  createdAt: string;
  // Additional fields for compatibility with existing invoice structure
  issueDate?: string;
  dueDate?: string;
  status?: string;
  paymentMethod?: string;
}

const STORAGE_KEY = "servicepro_orders";

// Initialize orders storage if it doesn't exist
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all orders from storage
const getOrders = (): Order[] => {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save orders to storage
const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

/**
 * Create a new order
 */
export const createOrder = async (orderData: Omit<Order, "id" | "createdAt">): Promise<Order> => {
  const orders = getOrders();
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    issueDate: orderData.issueDate || new Date().toISOString().split("T")[0],
  };
  
  orders.push(newOrder);
  saveOrders(orders);
  
  return newOrder;
};

/**
 * Get all orders for a specific customer
 */
export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  const orders = getOrders();
  return orders.filter(order => order.customerId === customerId);
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const orders = getOrders();
  return orders.find(order => order.id === orderId) || null;
};

/**
 * Get all orders (for admin/debugging)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  return getOrders();
};

/**
 * Delete an order (for testing/cleanup)
 */
export const deleteOrder = async (orderId: string): Promise<boolean> => {
  const orders = getOrders();
  const filtered = orders.filter(order => order.id !== orderId);
  saveOrders(filtered);
  return filtered.length < orders.length;
};

