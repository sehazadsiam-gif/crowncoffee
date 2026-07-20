"use client";

import { useState } from "react";
import Image from "next/image";
import CrownMark from "./CrownMark";
import { useBasket } from "@/context/BasketContext";

export default function MenuCard({ item }) {
  const { addToBasket, decrementLastAddedCustom, getItemQuantity, isMounted } = useBasket();
  const qty = isMounted ? getItemQuantity(item.id) : 0;

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToBasket(item);
  };

  const handleMinusClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    decrementLastAddedCustom(item.id);
  };

  return (
    <>
      {/* ─── Mobile View: Horizontal List Row (shows 4-5 items at once) ─── */}
      <article className="flex md:hidden gap-3.5 items-center p-3 rounded-2xl border border-[var(--line)] bg-[var(--card)]">
        {/* Left: Thumbnail image */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--accent-soft)]">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CrownMark className="h-6 w-6 text-[var(--accent)] opacity-40" />
            </div>
          )}
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-display text-sm font-bold text-[var(--ink)] leading-snug">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-[10px] leading-relaxed text-[var(--ink-soft)] mt-0.5">
              {item.description}
            </p>
          )}
          <span className="text-xs font-semibold text-[var(--accent)] mt-1">
            ৳{item.price}
          </span>
        </div>

        {/* Right: Quantity / Add button */}
        <div className="shrink-0 flex items-center justify-end">
          {qty > 0 ? (
            <div
              className="flex items-center rounded-full text-white shadow-md p-0.5 border border-white/20 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)",
              }}
            >
              <button
                onClick={handleMinusClick}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 text-xs font-bold"
              >
                -
              </button>
              <span className="w-4 text-center text-[11px] font-bold">{qty}</span>
              <button
                onClick={handleAddClick}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 text-xs font-bold"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              className="flex h-7 items-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-bold text-[var(--ink)] shadow-md border border-[var(--line)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] active:scale-95 transition"
            >
              <span>+</span>
              <span>Add</span>
            </button>
          )}
        </div>
      </article>

      {/* ─── Desktop View: Classic Grid Card ─── */}
      <article className="group hidden md:flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] transition-shadow hover:shadow-[0_12px_32px_-20px_rgba(28,22,18,0.35)]">
        {/* Image / Thumbnail Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--accent-soft)]">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CrownMark className="h-10 w-10 text-[var(--accent)] opacity-40" />
            </div>
          )}

          {/* Basket Overlay Controls */}
          <div className="absolute bottom-2.5 right-2.5 z-10">
            {qty > 0 ? (
              <div
                className="flex items-center rounded-full text-white shadow-lg p-0.5 border border-white/20 transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)",
                }}
              >
                <button
                  onClick={handleMinusClick}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 text-sm font-bold"
                >
                  -
                </button>
                <span className="w-5 text-center text-xs font-bold">{qty}</span>
                <button
                  onClick={handleAddClick}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 text-sm font-bold"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="flex h-8 items-center gap-1 rounded-full bg-white px-3 text-xs font-bold text-[var(--ink)] shadow-lg border border-[var(--line)] transition hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] active:scale-95"
              >
                <span>+</span>
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-1 flex-col gap-1 sm:gap-2 p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-3">
            <h3 className="font-display text-sm sm:text-lg leading-snug">{item.name}</h3>
            <span className="shrink-0 font-display text-sm sm:text-lg text-[var(--accent)] font-semibold">
              ৳{item.price}
            </span>
          </div>
          {item.description && (
            <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink-soft)] line-clamp-2 sm:line-clamp-none">
              {item.description}
            </p>
          )}
        </div>
      </article>
    </>
  );
}
