"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useBasket } from "@/context/BasketContext";
import CrownMark from "./CrownMark";

export default function KioskMenu({ initialItems = [], settings }) {
  const {
    basket,
    addToBasket,
    updateQuantity,
    getItemQuantity,
    clearBasket,
    totalItems,
    totalPrice,
    setIsWaiterMode,
    isMounted,
  } = useBasket();

  const [selectedCategory, setSelectedCategory] = useState("All Dishes");
  const [currentTime, setCurrentTime] = useState("");

  // Clock in the header
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Get active categories based on items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(initialItems.map((item) => item.category)));
    return ["All Dishes", ...cats];
  }, [initialItems]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "All Dishes") return initialItems;
    return initialItems.filter((item) => item.category === selectedCategory);
  }, [initialItems, selectedCategory]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#120e0c] text-white font-sans">
      
      {/* ── Kiosk Header ─────────────────────────────────────────── */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#1a1411] px-8 shadow-md">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-zinc-900/80 p-2.5 border border-amber-500/20">
            <CrownMark className="h-7 w-7 text-[var(--accent)] animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-wide uppercase text-white">
              {settings.siteName || "Crown Coffee"}
            </h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-amber-500/80 uppercase">
              Self-Service Order Kiosk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Status badge */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Kiosk Active</span>
          </div>

          {/* Clock */}
          <div className="font-display text-xl font-bold tracking-wider text-zinc-300">
            {currentTime}
          </div>
        </div>
      </header>

      {/* ── Kiosk Main Layout ────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Categories Navigation */}
        <nav className="w-56 shrink-0 overflow-y-auto border-r border-zinc-800 bg-[#16110e] py-6 px-4">
          <h2 className="mb-4 px-3 text-xs font-black tracking-widest text-zinc-500 uppercase">
            Categories
          </h2>
          <ul className="flex flex-col gap-2.5">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <li key={category}>
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full rounded-xl py-4 px-4 text-left text-sm font-bold tracking-wide uppercase transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-[0_4px_16px_rgba(182,134,44,0.3)] border-l-4 border-white"
                        : "bg-zinc-900/40 text-zinc-400 border border-zinc-800/60 hover:bg-zinc-900/80 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Center: Scrollable Food Grid */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold tracking-wide">
              {selectedCategory}
            </h3>
            <p className="text-sm text-zinc-500 font-medium">
              Showing {filteredItems.length} items
            </p>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center text-center">
              <CrownMark className="h-16 w-16 text-zinc-800 mb-4" />
              <p className="text-zinc-500">No items available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                const qty = isMounted ? getItemQuantity(item.id) : 0;
                const hasImage = !!item.image;

                return (
                  <article
                    key={item.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#16110e] transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
                  >
                    {/* Item Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                      {hasImage ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <CrownMark className="h-12 w-12 text-[var(--accent)] opacity-20" />
                        </div>
                      )}
                      
                      {/* Price Tag Overlay */}
                      <div className="absolute right-3 top-3 rounded-full bg-zinc-950/80 px-3.5 py-1 text-sm font-black tracking-wide text-[var(--accent)] border border-amber-500/20 backdrop-blur-xs">
                        &#2547;{item.price}
                      </div>

                      {/* Best Seller Badge */}
                      {item.bestSeller && (
                        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                          <span>★</span>
                          <span>Popular</span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div className="space-y-1">
                        <h4 className="font-display text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {item.description || "Freshly made premium ingredients, crafted to perfection."}
                        </p>
                      </div>

                      {/* Touch Controls */}
                      <div className="mt-5">
                        {qty > 0 ? (
                          <div className="flex h-12 w-full items-center justify-between rounded-xl bg-zinc-900 px-2 border border-zinc-800 shadow-inner">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-white font-extrabold transition active:scale-90 hover:bg-zinc-700"
                            >
                              -
                            </button>
                            <span className="font-display text-base font-black text-white">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-extrabold transition active:scale-90 hover:brightness-110"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToBasket(item)}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-black tracking-wider uppercase text-zinc-300 transition hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] active:scale-98"
                          >
                            <span>+</span>
                            <span>Add to tray</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Sidebar: Persistent Order Tray */}
        <aside className="w-96 shrink-0 flex flex-col border-l border-zinc-800 bg-[#16110e]">
          {/* Header */}
          <div className="flex h-20 items-center justify-between border-b border-zinc-800 bg-[#1a1411] px-6">
            <div className="flex items-center gap-2.5">
              <svg
                className="h-5 w-5 text-[var(--accent)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="font-display text-lg font-black tracking-wide uppercase text-white">
                Your Order Tray
              </h3>
            </div>
            {basket.length > 0 && (
              <button
                onClick={clearBasket}
                className="text-xs font-bold text-red-500 hover:text-red-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            {basket.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
                <CrownMark className="h-16 w-16 text-zinc-700 mb-4" />
                <p className="font-bold text-zinc-400 uppercase tracking-wider">Tray is empty</p>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Tap foods in the grid to add them to your order tray.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {basket.map((item) => (
                  <div key={item.id} className="flex py-3.5 gap-3 items-center">
                    {/* Thumbnail */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-900 border border-zinc-850">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <CrownMark className="h-5 w-5 text-[var(--accent)] opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-display text-sm font-extrabold text-white truncate">
                        {item.name}
                      </h5>
                      <p className="text-xs text-[var(--accent)] font-bold mt-0.5">
                        &#2547;{item.price}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500">
                        &#2547;{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Summary Actions */}
          <div className="border-t border-zinc-800 bg-[#1a1411] p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-zinc-450 uppercase tracking-wider">
                <span>Items in Tray</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-white pt-1">
                <span>TOTAL AMOUNT</span>
                <span className="text-[var(--accent)] font-display">&#2547;{totalPrice}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (basket.length > 0) {
                  setIsWaiterMode(true);
                }
              }}
              disabled={basket.length === 0}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-sm font-black tracking-widest uppercase text-white shadow-lg transition duration-200 active:scale-97 disabled:opacity-40 disabled:pointer-events-none"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)",
                boxShadow: basket.length > 0 ? "0 8px 24px -6px rgba(182, 134, 44, 0.4)" : "none",
              }}
            >
              <span>♛</span>
              <span>Submit & Order</span>
            </button>

            <p className="text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              Ask staff for help at any time
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
