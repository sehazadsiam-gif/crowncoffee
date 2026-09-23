"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CrownMark from "./CrownMark";
import { getItemCustomizations } from "@/lib/customizations";
import { getMenuItemImage } from "@/lib/foodImage";
import { useBasket } from "@/context/BasketContext";

function getFlavorTags(item) {
  const tags = [];
  const cat = (item.category || "").toLowerCase();
  const name = (item.name || "").toLowerCase();

  if (item.bestSeller) tags.push("★ Crowd Favorite");
  if (cat.includes("coffee") || cat.includes("brew") || cat.includes("espresso")) {
    tags.push("Single Origin");
    tags.push("Fresh Roasted");
  } else if (cat.includes("tea") || cat.includes("matcha")) {
    tags.push("Artisan Brew");
    tags.push("Aromatic");
  } else if (cat.includes("burger") || cat.includes("sandwich")) {
    tags.push("Chef Crafted");
    tags.push("Made to Order");
  } else if (cat.includes("pastry") || cat.includes("dessert") || cat.includes("cake")) {
    tags.push("Freshly Baked");
    tags.push("Indulgent");
  } else if (cat.includes("cold") || cat.includes("iced") || cat.includes("frappe")) {
    tags.push("Chilled & Refreshing");
  } else {
    tags.push("Signature Dish");
  }

  return tags.slice(0, 3);
}

export default function DishDetailModal({ item, isOpen, onClose }) {
  const { addToBasket, getItemQuantity, isMounted } = useBasket();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  const customizations = item ? getItemCustomizations(item) : null;
  const currentBasketQty = isMounted && item ? getItemQuantity(item.id) : 0;

  // Initialize selections with default required options
  useEffect(() => {
    if (customizations && item) {
      const initial = {};
      customizations.forEach((custom) => {
        if (custom.required && custom.options.length > 0) {
          initial[custom.id] = custom.options[0];
        } else if (!custom.required) {
          initial[custom.id] = [];
        }
      });
      setSelectedOptions(initial);
    }
    setQuantity(1);
  }, [item]);

  // Keyboard escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handleSingleSelect = (customId, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [customId]: option,
    }));
  };

  const handleMultiSelect = (customId, option) => {
    setSelectedOptions((prev) => {
      const current = prev[customId] || [];
      const exists = current.some((opt) => opt.name === option.name);
      const updated = exists
        ? current.filter((opt) => opt.name !== option.name)
        : [...current, option];
      return {
        ...prev,
        [customId]: updated,
      };
    });
  };

  const calculateUnitPrice = () => {
    let price = item.price;
    Object.values(selectedOptions).forEach((selection) => {
      if (Array.isArray(selection)) {
        selection.forEach((opt) => {
          price += opt.price || 0;
        });
      } else if (selection && selection.price) {
        price += selection.price;
      }
    });
    return price;
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = unitPrice * quantity;

  const handleAddToOrder = () => {
    for (let i = 0; i < quantity; i++) {
      addToBasket(item, customizations ? selectedOptions : null, unitPrice);
    }
    onClose();
  };

  const flavorTags = getFlavorTags(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md animate-backdrop-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl border border-[var(--line)] flex flex-col max-h-[90vh] animate-modal-pop">
        {/* Close Button Top-Right Floating */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-spring hover:bg-black/75 hover:scale-110 active:scale-90"
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Hero Image Section */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[var(--card-tint)] shrink-0">
          {getMenuItemImage(item) ? (
            <Image
              src={getMenuItemImage(item)}
              alt={item.name}
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#4e070c]/10 to-[var(--accent)]/15">
              <CrownMark className="h-16 w-16 text-[var(--accent)] opacity-40 animate-pulse" />
              <p className="mt-3 text-xs font-bold tracking-widest text-[var(--accent)] uppercase">
                Crown Coffee Specialty
              </p>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--ink)]/85 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
              {item.category}
            </span>
            {item.bestSeller && (
              <span className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-orange)] px-3 py-1 text-[11px] font-bold text-white shadow-md">
                ★ Best Seller
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] leading-tight">
                {item.name}
              </h2>
              <span className="font-display text-2xl font-black text-[var(--accent)] shrink-0">
                ৳{item.price}
              </span>
            </div>

            {/* Flavor / Characteristic Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {flavorTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--card)] border border-[var(--line)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-soft)] shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            {item.description && (
              <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                {item.description}
              </p>
            )}
          </div>

          {/* Customization Options (if item supports milk/sweetness/addons) */}
          {customizations && customizations.length > 0 && (
            <div className="border-t border-[var(--line)] pt-5 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Personalize Your Drink
              </h3>

              {customizations.map((custom) => {
                const isRequired = custom.required;
                return (
                  <fieldset key={custom.id} className="space-y-2.5">
                    <legend className="text-xs font-semibold text-[var(--ink-soft)] flex items-center justify-between w-full">
                      <span>{custom.name}</span>
                      {isRequired ? (
                        <span className="text-[10px] text-[var(--accent)] font-bold uppercase">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--mute)]">Optional</span>
                      )}
                    </legend>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {custom.options.map((opt) => {
                        const priceModifier = opt.price ? `+৳${opt.price}` : "Free";
                        const isSelected = isRequired
                          ? selectedOptions[custom.id]?.name === opt.name
                          : (selectedOptions[custom.id] || []).some((o) => o.name === opt.name);

                        return (
                          <button
                            type="button"
                            key={opt.name}
                            onClick={() =>
                              isRequired
                                ? handleSingleSelect(custom.id, opt)
                                : handleMultiSelect(custom.id, opt)
                            }
                            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-spring active:scale-95 ${
                              isSelected
                                ? "border-[var(--accent)] bg-[var(--card-tint)] text-[var(--ink)] shadow-xs"
                                : "border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:border-[var(--mute)]"
                            }`}
                          >
                            <span className="font-semibold">{opt.name}</span>
                            <span className="text-[11px] font-bold text-[var(--accent)]">
                              {priceModifier}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions: Quantity Counter + Add to Order */}
        <div className="border-t border-[var(--line)] bg-[var(--card)] p-4 sm:p-5 flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center rounded-full border border-[var(--line)] bg-[var(--paper)] p-1 shadow-inner">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-[var(--ink)] hover:bg-white active:scale-90 transition disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-[var(--ink)]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-[var(--ink)] hover:bg-white active:scale-90 transition"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Basket Button */}
          <button
            onClick={handleAddToOrder}
            className="flex-1 flex items-center justify-between rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-spring hover:brightness-105 active:scale-98"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--accent-orange, #ff670e) 100%)",
            }}
          >
            <span>Add to Basket</span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-black">
              ৳{totalPrice}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
