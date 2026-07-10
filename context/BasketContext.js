"use client";

import { createContext, useContext, useState, useEffect } from "react";

const BasketContext = createContext();

export function BasketProvider({ children, deliveryCharge: initialDeliveryCharge }) {
  const [basket, setBasket] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isWaiterMode, setIsWaiterMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [tableNumber, setTableNumber] = useState(null); // Set from QR URL (can be "delivery" or "tab")
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(initialDeliveryCharge || 120);

  // Tab mode state
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  // Load basket + table number + delivery address + tab customer info from localStorage once mounted on client
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
    const savedTabName = localStorage.getItem("crown_coffee_tab_name");
    if (savedTabName) {
      setCustomerName(savedTabName);
    }
    const savedTabContact = localStorage.getItem("crown_coffee_tab_contact");
    if (savedTabContact) {
      setCustomerContact(savedTabContact);
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

  // Sync customerName to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("crown_coffee_tab_name", customerName);
    }
  }, [customerName, isMounted]);

  // Sync customerContact to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("crown_coffee_tab_contact", customerContact);
    }
  }, [customerContact, isMounted]);

  // Update deliveryCharge when initialDeliveryCharge prop changes
  useEffect(() => {
    if (initialDeliveryCharge !== undefined) {
      setDeliveryCharge(initialDeliveryCharge);
    }
  }, [initialDeliveryCharge]);

  const addToBasket = (item, customizations = null, customizedPrice = null) => {
    const price = customizedPrice !== null ? customizedPrice : item.price;
    const custKey = customizations ? JSON.stringify(customizations) : "";
    const basketItemId = `${item.id}-${custKey}`;

    setBasket((prev) => {
      const existing = prev.find((i) => i.basketItemId === basketItemId);
      if (existing) {
        return prev.map((i) =>
          i.basketItemId === basketItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          basketItemId,
          price,
          customizations,
          quantity: 1,
          specialRequest: "",
        },
      ];
    });
  };

  const updateQuantity = (basketItemId, change) => {
    setBasket((prev) =>
      prev
        .map((i) => {
          if (i.basketItemId === basketItemId) {
            const newQty = i.quantity + change;
            return { ...i, quantity: newQty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const decrementLastAddedCustom = (itemId) => {
    setBasket((prev) => {
      // Find the index of the last added item in the basket with this base item id
      const reversedIdx = [...prev].reverse().findIndex((i) => i.id === itemId);
      if (reversedIdx === -1) return prev;

      const idx = prev.length - 1 - reversedIdx;
      const target = prev[idx];
      if (target.quantity > 1) {
        return prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prev.filter((item, i) => i !== idx);
      }
    });
  };

  const updateSpecialRequest = (basketItemId, text) => {
    setBasket((prev) =>
      prev.map((i) => (i.basketItemId === basketItemId ? { ...i, specialRequest: text } : i))
    );
  };

  const removeFromBasket = (basketItemId) => {
    setBasket((prev) => prev.filter((i) => i.basketItemId !== basketItemId));
  };

  const clearBasket = () => {
    setBasket([]);
  };

  const getItemQuantity = (itemId) => {
    // Sum quantities of all customized versions of this item ID
    return basket
      .filter((i) => i.id === itemId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  // Calculate totals
  const totalItems = basket.reduce((acc, item) => acc + item.quantity, 0);
  const itemsPrice = basket.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isDelivery = tableNumber === "delivery";
  const isTab = tableNumber === "tab";
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
        decrementLastAddedCustom,
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
        customerName,
        setCustomerName,
        customerContact,
        setCustomerContact,
        isTab,
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
