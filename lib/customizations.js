// lib/customizations.js — Configuration and helper for menu item customizations

export const DEFAULT_CUSTOMIZATIONS = {
  COFFEE: [
    {
      id: "milk",
      name: "Milk Options",
      required: true,
      options: [
        { name: "Whole Milk", price: 0 },
        { name: "Almond Milk", price: 50 },
        { name: "Oat Milk", price: 60 },
        { name: "Soy Milk", price: 50 }
      ]
    },
    {
      id: "sweetness",
      name: "Sweetness Levels",
      required: true,
      options: [
        { name: "Normal Sweet", price: 0 },
        { name: "Less Sweet", price: 0 },
        { name: "No Sugar", price: 0 }
      ]
    },
    {
      id: "addons",
      name: "Add-ons",
      required: false,
      options: [
        { name: "Extra Espresso Shot", price: 60 },
        { name: "Caramel Drizzle", price: 30 },
        { name: "Vanilla Syrup", price: 30 }
      ]
    }
  ],
  TEA: [
    {
      id: "sweetness",
      name: "Sweetness Levels",
      required: true,
      options: [
        { name: "Normal Sweet", price: 0 },
        { name: "Less Sweet", price: 0 },
        { name: "No Sugar", price: 0 }
      ]
    },
    {
      id: "addons",
      name: "Add-ons",
      required: false,
      options: [
        { name: "Bobas", price: 50 },
        { name: "Popping Boba", price: 60 },
        { name: "Coconut Jelly", price: 40 }
      ]
    }
  ],
  FRAPPE: [
    {
      id: "milk",
      name: "Milk Options",
      required: true,
      options: [
        { name: "Whole Milk", price: 0 },
        { name: "Almond Milk", price: 50 },
        { name: "Oat Milk", price: 60 }
      ]
    },
    {
      id: "addons",
      name: "Add-ons",
      required: false,
      options: [
        { name: "Whipped Cream", price: 30 },
        { name: "Chocolate Drizzle", price: 20 },
        { name: "Caramel Drizzle", price: 20 }
      ]
    }
  ]
};

/**
 * Returns the customization schema for a menu item.
 * Prioritizes item-specific customizations defined in menu.json,
 * falling back to category-based defaults for coffee/tea/frappes.
 */
export function getItemCustomizations(item) {
  if (!item) return null;
  
  // 1. Return item-specific customizations if defined
  if (item.customizations && Array.isArray(item.customizations) && item.customizations.length > 0) {
    return item.customizations;
  }
  
  // 2. Fall back to category-based defaults
  const category = (item.category || "").toLowerCase();
  
  if (category.includes("iced coffee") || category.includes("coffee")) {
    return DEFAULT_CUSTOMIZATIONS.COFFEE;
  }
  
  if (category.includes("frappe")) {
    return DEFAULT_CUSTOMIZATIONS.FRAPPE;
  }
  
  if (category.includes("tea") || category.includes("boba")) {
    return DEFAULT_CUSTOMIZATIONS.TEA;
  }
  
  return null;
}
