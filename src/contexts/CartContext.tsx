import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  type?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CartContextType {
  items: CartItem[];
  selectedCustomer: Customer | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  setSelectedCustomer: (customer: Customer | null) => void;
  getSelectedCustomer: () => Customer | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomerState] = useState<Customer | null>(null);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity: number) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const setSelectedCustomer = useCallback((customer: Customer | null) => {
    setSelectedCustomerState(customer);
  }, []);

  const getSelectedCustomer = useCallback(() => {
    return selectedCustomer;
  }, [selectedCustomer]);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedCustomerState(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        selectedCustomer,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
        setSelectedCustomer,
        getSelectedCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

