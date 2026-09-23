// lib/foodImage.js — Curated high-resolution imagery for Crown Coffee items

const CATEGORY_IMAGES = {
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80",
  coldbrew: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80",
  icedcoffee: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80",
  tea: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
  boba: "https://images.unsplash.com/photo-1558857563-b37cf5a23075?w=800&auto=format&fit=crop&q=80",
  frappe: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80",
  breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80",
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
  pasta: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
  dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80",
  pastry: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
  juice: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&auto=format&fit=crop&q=80",
  shake: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80"
};

export function getMenuItemImage(item) {
  if (item && item.image && item.image.trim().length > 0) {
    return item.image;
  }
  if (!item) return CATEGORY_IMAGES.default;

  const cat = (item.category || "").toLowerCase();
  const name = (item.name || "").toLowerCase();

  if (cat.includes("boba") || name.includes("boba")) return CATEGORY_IMAGES.boba;
  if (cat.includes("frappe") || name.includes("frappe")) return CATEGORY_IMAGES.frappe;
  if (cat.includes("iced coffee") || name.includes("iced")) return CATEGORY_IMAGES.icedcoffee;
  if (cat.includes("cold brew") || name.includes("cold brew")) return CATEGORY_IMAGES.coldbrew;
  if (cat.includes("tea") || name.includes("tea") || name.includes("matcha")) return CATEGORY_IMAGES.tea;
  if (cat.includes("coffee") || name.includes("latte") || name.includes("espresso") || name.includes("cappuccino")) return CATEGORY_IMAGES.coffee;
  if (cat.includes("sandwich")) return CATEGORY_IMAGES.sandwich;
  if (cat.includes("burger") || name.includes("burger")) return CATEGORY_IMAGES.burger;
  if (cat.includes("pizza") || name.includes("pizza")) return CATEGORY_IMAGES.pizza;
  if (cat.includes("pasta") || cat.includes("noodles") || name.includes("pasta") || name.includes("spaghetti")) return CATEGORY_IMAGES.pasta;
  if (cat.includes("breakfast") || name.includes("breakfast") || name.includes("brunch")) return CATEGORY_IMAGES.breakfast;
  if (cat.includes("pastry") || cat.includes("dessert") || cat.includes("desert") || cat.includes("cake") || name.includes("waffle") || name.includes("cake")) return CATEGORY_IMAGES.pastry;
  if (cat.includes("salad")) return CATEGORY_IMAGES.salad;
  if (cat.includes("juice")) return CATEGORY_IMAGES.juice;
  if (cat.includes("shake") || cat.includes("smoothie")) return CATEGORY_IMAGES.shake;

  return CATEGORY_IMAGES.coffee;
}
