"use client";

import { useState } from "react";
import Image from "next/image";
import CrownMark from "./CrownMark";
import DishDetailModal from "./DishDetailModal";
import { getMenuItemImage } from "@/lib/foodImage";
import { useBasket } from "@/context/BasketContext";

export default function BestSellerCard({ item }) {
  const { addToBasket, updateQuantity, getItemQuantity, isMounted } = useBasket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const qty = isMounted ? getItemQuantity(item.id) : 0;
  const imageUrl = getMenuItemImage(item);

  return (
    <>
      <article
        onClick={() => setIsModalOpen(true)}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] transition-all duration-300 cursor-pointer active:scale-[0.99]"
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #fff5ed 50%, #fde4ce 100%)",
        boxShadow: "0 4px 24px -8px rgba(210,39,1,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 36px -8px rgba(210,39,1,0.3)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 24px -8px rgba(210,39,1,0.15)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Best Seller badge */}
      <div
        className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide shadow-sm"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-orange, #ff670e) 100%)",
          color: "#fff",
        }}
      >
        <span>★</span>
        <span>Best Seller</span>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-107"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
                backgroundSize: "200% auto",
                animation: "shimmer 1.5s linear infinite",
              }}
            />
            <CrownMark className="h-12 w-12 opacity-30" style={{ color: "var(--accent)" }} />
          </div>
        )}

        {/* Basket Overlay Controls */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {qty > 0 ? (
            <div
              className="flex items-center rounded-full text-white shadow-lg p-0.5 border border-white/20 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-orange, #ff670e) 100%)",
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(item.id, -1);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 text-sm font-bold"
              >
                -
              </button>
              <span className="w-5 text-center text-xs font-bold">{qty}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(item.id, 1);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 text-sm font-bold"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToBasket(item);
              }}
              className="flex h-8 items-center gap-1 rounded-full bg-white px-3 text-xs font-bold text-[var(--ink)] shadow-lg border border-[var(--line)] transition hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] active:scale-95"
            >
              <span>+</span>
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 sm:gap-2 p-3 pt-2 sm:p-5 sm:pt-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-3">
          <h3
            className="font-display text-base sm:text-xl leading-snug"
            style={{ color: "var(--ink)" }}
          >
            {item.name}
          </h3>
          <span
            className="shrink-0 font-display text-base sm:text-xl font-bold"
            style={{ color: "var(--accent)" }}
          >
            &#2547;{item.price}
          </span>
        </div>
        {item.description && (
          <p className="text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none" style={{ color: "var(--ink-soft)" }}>
            {item.description}
          </p>
        )}
      </div>
    </article>

    {/* Dish Spotlight Modal */}
    <DishDetailModal
      item={item}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  </>
  );
}
