"use client";

import { useBasket } from "@/context/BasketContext";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import CrownMark from "./CrownMark";

export function FloatingBasketButton() {
  const { totalItems, setIsOpen, isMounted } = useBasket();
  const pathname = usePathname();

  if (!isMounted || totalItems === 0 || pathname === "/kiosk") return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 scale-100 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
      style={{
        background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)",
        boxShadow: "0 10px 25px -5px rgba(182, 134, 44, 0.5)",
      }}
      aria-label={`Open Basket with ${totalItems} items`}
    >
      {/* Shopping Bag Icon */}
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {/* Item Badge */}
      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold shadow-md" style={{ color: "var(--accent)" }}>
        {totalItems}
      </span>
    </button>
  );
}

export function BasketDrawer() {
  const {
    basket,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromBasket,
    clearBasket,
    totalPrice,
    totalItems,
    setIsWaiterMode,
  } = useBasket();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll background when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-over Drawer panel */}
      <div className="relative z-10 flex h-full w-full flex-col bg-[var(--paper)] shadow-2xl sm:max-w-md">
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-[var(--line)] bg-[var(--card)] px-6">
          <div className="flex items-center gap-2">
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
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">
              Saved Items ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Saved items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {basket.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <CrownMark className="h-12 w-12 text-[var(--accent)] opacity-20 mb-4" />
              <p className="font-semibold text-[var(--ink)]">Your basket is empty</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Browse our menu and save items you want to order.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 rounded-full border border-[var(--accent)] px-6 py-2.5 text-sm font-semibold tracking-wide text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center pb-2">
                <span className="text-xs font-semibold tracking-wider text-[var(--ink-soft)] uppercase">
                  Selected Dishes
                </span>
                <button
                  onClick={clearBasket}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-[var(--line)]">
                {basket.map((item) => (
                  <div key={item.id} className="flex py-4 gap-4 items-center">
                    {/* Tiny Image Thumbnail */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--accent-soft)]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <CrownMark className="h-6 w-6 text-[var(--accent)] opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm font-semibold text-[var(--ink)] truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[var(--accent)] font-semibold mt-0.5">
                        &#2547;{item.price}
                      </p>
                    </div>

                    {/* Quantity Selector and Total */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center rounded-full border border-[var(--line)] bg-[var(--card)] p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-[var(--ink)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-[var(--ink-soft)]">
                        &#2547;{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {basket.length > 0 && (
          <div className="border-t border-[var(--line)] bg-[var(--card)] p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-[var(--ink-soft)]">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--ink)]">
                <span>Total Price</span>
                <span className="text-[var(--accent)]">&#2547;{totalPrice}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                setIsWaiterMode(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold tracking-wide text-white transition hover:brightness-105 active:scale-98 shadow-md"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)",
              }}
            >
              <span>♛</span>
              <span>Show to Waiter</span>
            </button>

            <p className="text-center text-xs text-[var(--ink-soft)]">
              This list will remain saved in your browser storage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function WaiterModeModal() {
  const { basket, isWaiterMode, setIsWaiterMode, totalItems, totalPrice } = useBasket();
  const [tableNumber, setTableNumber] = useState("");

  // Lock scrolling when Waiter Mode is active
  useEffect(() => {
    if (isWaiterMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isWaiterMode]);

  if (!isWaiterMode) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--paper)] overflow-y-auto">
      {/* High-Contrast header */}
      <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between border-b border-2 border-[var(--ink)] bg-white px-6">
        <div className="flex items-center gap-3">
          <CrownMark className="h-6 w-6 text-[var(--accent)]" />
          <h2 className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
            ORDER SUMMARY
          </h2>
        </div>
        <button
          onClick={() => setIsWaiterMode(false)}
          className="rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] p-2 font-bold text-[var(--ink)] hover:bg-[var(--line)] transition"
          aria-label="Close waiter mode"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* waiter mode sheet content */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-8 space-y-8">
        {/* Helper Callout */}
        <div className="rounded-xl border-2 border-dashed border-[var(--accent)] bg-amber-50/50 p-4 text-center">
          <p className="text-sm font-bold text-amber-900 uppercase tracking-wide">
            ★ Attention Waiter / Counter Staff
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Please copy down or input these items into the billing system.
          </p>
        </div>

        {/* Table/Info Section */}
        <div className="rounded-xl border-2 border-[var(--ink)] bg-white p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(28,22,18,1)]">
          <div className="flex items-center gap-4">
            <label htmlFor="table-num" className="text-sm font-bold tracking-wider text-[var(--ink)] uppercase shrink-0">
              Table / Room #
            </label>
            <input
              id="table-num"
              type="text"
              placeholder="e.g. 5A"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="flex-1 rounded-lg border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm font-bold text-[var(--ink)] uppercase placeholder-[var(--mute)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        {/* Order Details List */}
        <div className="rounded-xl border-2 border-[var(--ink)] bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(28,22,18,1)]">
          <div className="bg-[var(--ink)] text-white px-5 py-3 flex justify-between items-center">
            <span className="text-xs font-bold tracking-widest uppercase">Items Selected</span>
            <span className="text-xs font-bold tracking-widest uppercase bg-[var(--accent)] px-2 py-0.5 rounded-sm">
              Qty
            </span>
          </div>

          <ul className="divide-y-2 divide-[var(--line)]">
            {basket.map((item) => (
              <li key={item.id} className="px-5 py-4 flex justify-between items-center hover:bg-[var(--paper)]/30">
                <div className="min-w-0 pr-4">
                  <span className="text-xs font-semibold tracking-wider text-[var(--accent)] uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[var(--ink)] leading-snug mt-0.5">
                    {item.name}
                  </h3>
                  <span className="text-xs text-[var(--ink-soft)] mt-0.5 block">
                    Unit Price: &#2547;{item.price}
                  </span>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex items-center justify-center rounded-lg border-2 border-[var(--ink)] bg-amber-50 h-10 w-12 font-display text-lg font-extrabold text-[var(--ink)]">
                    {item.quantity}
                  </div>
                  <div className="text-right w-20">
                    <span className="font-display text-base font-bold text-[var(--ink)]">
                      &#2547;{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Subtotals in list box */}
          <div className="bg-amber-50/40 border-t-2 border-[var(--ink)] px-5 py-4 space-y-1">
            <div className="flex justify-between text-sm text-[var(--ink-soft)] font-medium">
              <span>Total Dishes</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-[var(--ink)] pt-1">
              <span>ESTIMATED TOTAL</span>
              <span className="text-[var(--accent)]">&#2547;{totalPrice}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky footer action */}
      <footer className="sticky bottom-0 z-10 border-t-2 border-[var(--ink)] bg-white p-6 flex flex-col gap-3 shrink-0">
        <button
          onClick={() => setIsWaiterMode(false)}
          className="flex w-full items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] py-3 text-sm font-bold tracking-wide text-[var(--ink)] hover:bg-[var(--line)] transition shadow-sm active:scale-98"
        >
          Back to Menu
        </button>
      </footer>
    </div>
  );
}
