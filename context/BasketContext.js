"use client";

import { createContext, useContext, useState, useEffect } from "react";

const BasketContext = createContext();

export function BasketProvider({ children, deliveryCharge: initialDeliveryCharge }) {
  const [basket, setBasket] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isWaiterMode, setIsWaiterMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [tableNumber, setTableNumber] = useState(null); // Set from QR URL (can be "delivery")
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(initialDeliveryCharge || 120);

  // Load basket + table number + delivery address from localStorage once mounted on client
  useEffect(() => {
    setIsMounted(true);
    const savedBasket = localStorage.getItem("crown_coffee_basket");
    if (savedBasket) {
      try {
        setBasket(JSON.parse(savedBasket));
      } catch (e) {
        console.error("Failed to parse saved basket", e);
      }
    }
    const savedTable = localStorage.getItem("crown_coffee_table");
    if (savedTable) {
      setTableNumber(savedTable);
    }
    const savedAddress = localStorage.getItem("crown_coffee_address");
    if (savedAddress) {
      setDeliveryAddress(savedAddress);
    }
  }, []);

  // Sync basket to localStorage on changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("crown_coffee_basket", JSON.stringify(basket));
    }
  }, [basket, isMounted]);

  // Sync tableNumber to localStorage
  useEffect(() => {
    if (isMounted && tableNumber) {
      localStorage.setItem("crown_coffee_table", tableNumber);
    }
  }, [tableNumber, isMounted]);

  // Sync deliveryAddress to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("crown_coffee_address", deliveryAddress);
    }
  }, [deliveryAddress, isMounted]);

  // Update deliveryCharge when initialDeliveryCharge prop changes
  useEffect(() => {
    if (initialDeliveryCharge !== undefined) {
      setDeliveryCharge(initialDeliveryCharge);
    }
  }, [initialDeliveryCharge]);

  const addToBasket = (item) => {
    setBasket((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1, specialRequest: "" }];
    });
  };

  const updateQuantity = (itemId, change) => {
    setBasket((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId) {
            const newQty = i.quantity + change;
            return { ...i, quantity: newQty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const updateSpecialRequest = (itemId, text) => {
    setBasket((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, specialRequest: text } : i))
    );
  };

  const removeFromBasket = (itemId) => {
    setBasket((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearBasket = () => {
    setBasket([]);
  };

  const getItemQuantity = (itemId) => {
    const found = basket.find((i) => i.id === itemId);
    return found ? found.quantity : 0;
  };

  // Calculate totals
  const totalItems = basket.reduce((acc, item) => acc + item.quantity, 0);
  const itemsPrice = basket.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isDelivery = tableNumber === "delivery";
  const totalPrice = itemsPrice + (isDelivery ? deliveryCharge : 0);

  return (
    <BasketContext.Provider
      value={{
        basket,
        isOpen,
        setIsOpen,
        isWaiterMode,
        setIsWaiterMode,
        addToBasket,
        updateQuantity,
        updateSpecialRequest,
        removeFromBasket,
        clearBasket,
        getItemQuantity,
        totalItems,
        itemsPrice,
        totalPrice,
        isMounted,
        tableNumber,
        setTableNumber,
        deliveryAddress,
        setDeliveryAddress,
        deliveryCharge,
        isDelivery,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
