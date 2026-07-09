"use client";

import { createContext, useContext, useState, useEffect } from "react";

const BasketContext = createContext();

export function BasketProvider({ children }) {
  const [basket, setBasket] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isWaiterMode, setIsWaiterMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load basket from localStorage once component is mounted on the client
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
  }, []);

  // Sync basket to localStorage on changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("crown_coffee_basket", JSON.stringify(basket));
    }
  }, [basket, isMounted]);

  const addToBasket = (item) => {
    setBasket((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, change) => {
    setBasket((prev) => {
      return prev
        .map((i) => {
          if (i.id === itemId) {
            const newQty = i.quantity + change;
            return { ...i, quantity: newQty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0);
    });
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
  const totalPrice = basket.reduce((acc, item) => acc + item.price * item.quantity, 0);

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
        removeFromBasket,
        clearBasket,
        getItemQuantity,
        totalItems,
        totalPrice,
        isMounted,
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
