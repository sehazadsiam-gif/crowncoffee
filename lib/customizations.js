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
  // Customizations are disabled based on user request.
  return null;
}
