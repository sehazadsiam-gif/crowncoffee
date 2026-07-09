"use client";

import Image from "next/image";
import CrownMark from "./CrownMark";
import { useBasket } from "@/context/BasketContext";

export default function MenuCard({ item }) {
  const { addToBasket, updateQuantity, getItemQuantity, isMounted } = useBasket();
  const qty = isMounted ? getItemQuantity(item.id) : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] transition-shadow hover:shadow-[0_12px_32px_-20px_rgba(28,22,18,0.35)]">
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

        {/* Basket Overlay Controls (Option A) */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {qty > 0 ? (
            <div
              className="flex items-center rounded-full text-white shadow-lg p-0.5 border border-white/20 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)",
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

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-1 sm:gap-2 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-3">
          <h3 className="font-display text-sm sm:text-lg leading-snug">{item.name}</h3>
          <span className="shrink-0 font-display text-sm sm:text-lg text-[var(--accent)] font-semibold">
            &#2547;{item.price}
          </span>
        </div>
        {item.description && (
          <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink-soft)] line-clamp-2 sm:line-clamp-none">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}
