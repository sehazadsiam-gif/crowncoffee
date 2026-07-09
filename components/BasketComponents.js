"use client";

import { useBasket } from "@/context/BasketContext";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import CrownMark from "./CrownMark";

// ─── Real menu item suggestions carousel ────────────────────────────────────
function SuggestionsCarousel() {
  const { addToBasket, getItemQuantity, isMounted } = useBasket();
  const [menuItems, setMenuItems] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real menu items once
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => {
        const items = (data.items || []).filter((item) => item.available !== false);
        // Shuffle so suggestions feel fresh
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        setMenuItems(shuffled);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Rotate 3 visible items every 10 seconds
  useEffect(() => {
    if (menuItems.length === 0) return;
    const timer = setInterval(() => {
      setStartIdx((prev) => (prev + 3) % menuItems.length);
    }, 10_000);
    return () => clearInterval(timer);
  }, [menuItems.length]);

  if (loading || menuItems.length === 0) return null;

  const visible = [0, 1, 2].map((offset) => menuItems[(startIdx + offset) % menuItems.length]);

  return (
    <div className="mt-5 pt-4 border-t border-[var(--line)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)]">
          ✨ You might also like
        </p>
        <p className="text-[9px] text-[var(--ink-soft)] opacity-60">refreshes every 10s</p>
      </div>

      <div className="flex gap-2.5">
        {visible.map((item) => {
          if (!item) return null;
          const qty = isMounted ? getItemQuantity(item.id) : 0;
          return (
            <div
              key={item.id}
              className="flex-1 min-w-0 rounded-xl border border-[var(--line)] bg-[var(--paper)] overflow-hidden flex flex-col transition hover:border-[var(--accent)] hover:shadow-sm"
            >
              {/* Food image */}
              <div className="relative w-full aspect-square bg-[var(--accent-soft)] overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <CrownMark className="h-6 w-6 text-[var(--accent)] opacity-30" />
                  </div>
                )}
              </div>

              {/* Info + action */}
              <div className="p-2 flex flex-col gap-1.5 flex-1">
                <p className="text-[11px] font-semibold text-[var(--ink)] leading-tight line-clamp-2">
                  {item.name}
                </p>
                <p className="text-[11px] font-bold text-[var(--accent)]">৳{item.price}</p>

                {qty > 0 ? (
                  <p className="text-[10px] text-center font-bold text-green-600 bg-green-50 rounded-full py-0.5">
                    ✓ In basket ×{qty}
                  </p>
                ) : (
                  <button
                    onClick={() => addToBasket(item)}
                    className="w-full rounded-full border border-[var(--accent)] py-1 text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Floating basket button ─────────────────────────────────────────────────
export function FloatingBasketButton() {
  const { totalItems, setIsOpen, isMounted } = useBasket();
  if (!isMounted || totalItems === 0) return null;
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
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold shadow-md" style={{ color: "var(--accent)" }}>
        {totalItems}
      </span>
    </button>
  );
}

// ─── Basket drawer ───────────────────────────────────────────────────────────
export function BasketDrawer() {
  const {
    basket, isOpen, setIsOpen, updateQuantity, updateSpecialRequest,
    removeFromBasket, clearBasket, itemsPrice, totalPrice, totalItems,
    setIsWaiterMode, tableNumber, deliveryAddress, setDeliveryAddress,
    deliveryCharge, isDelivery
  } = useBasket();

  const [mounted, setMounted] = useState(false);
  const [orderStatus, setOrderStatus] = useState("idle"); // idle | placing | success | error
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      alert("No table assigned. Please scan your table's QR code.");
      return;
    }
    if (isDelivery && !deliveryAddress.trim()) {
      alert("Please enter a delivery address.");
      return;
    }
    setOrderStatus("placing");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          items: basket,
          totalPrice,
          deliveryAddress: isDelivery ? deliveryAddress : null,
          deliveryCharge: isDelivery ? deliveryCharge : 0,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setOrderNumber(data.order.orderNumber);
      setOrderStatus("success");
      clearBasket();
      setTimeout(() => {
        setIsOpen(false);
        setOrderStatus("idle");
      }, 3500);
    } catch {
      setOrderStatus("error");
      setTimeout(() => setOrderStatus("idle"), 3000);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsOpen(false)} />
      <div className="relative z-10 flex h-full w-full flex-col bg-[var(--paper)] shadow-2xl sm:max-w-md">
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-[var(--line)] bg-[var(--card)] px-6">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">
              Basket ({totalItems})
              {tableNumber && (
                <span className="ml-2 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">
                  {isDelivery ? "Home Delivery" : `Table ${tableNumber}`}
                </span>
              )}
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success screen */}
        {orderStatus === "success" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-[var(--ink)]">Order Placed!</h3>
            <p className="font-mono text-3xl font-black text-[var(--accent)]">{orderNumber}</p>
            <p className="text-sm text-[var(--ink-soft)]">
              {isDelivery ? "Your delivery order has been received." : "Your order has been sent to the kitchen."}
            </p>
            <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-6 py-3">
              <p className="text-sm font-semibold text-amber-900">
                ⏱ {isDelivery ? "Estimated delivery: 30–45 minutes" : "Estimated wait: 15–20 minutes"}
              </p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {orderStatus === "error" && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-semibold text-center">
            ⚠️ Could not place order. Please try again or show to waiter.
          </div>
        )}

        {/* Items list + suggestions */}
        {orderStatus !== "success" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {basket.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center pt-8">
                <CrownMark className="h-12 w-12 text-[var(--accent)] opacity-20 mb-4" />
                <p className="font-semibold text-[var(--ink)]">Your basket is empty</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Browse our menu and add items to your order.</p>
                <button onClick={() => setIsOpen(false)} className="mt-6 rounded-full border border-[var(--accent)] px-6 py-2.5 text-sm font-semibold tracking-wide text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition">
                  Start Browsing
                </button>
                {/* Show suggestions even when empty */}
                <div className="w-full mt-2">
                  <SuggestionsCarousel />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-xs font-semibold tracking-wider text-[var(--ink-soft)] uppercase">Selected Dishes</span>
                  <button onClick={clearBasket} className="text-xs font-semibold text-red-600 hover:underline">Clear All</button>
                </div>

                <div className="divide-y divide-[var(--line)]">
                  {basket.map((item) => (
                    <div key={item.id} className="py-4 space-y-2">
                      <div className="flex gap-4 items-center">
                        {/* Thumbnail */}
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--accent-soft)]">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <CrownMark className="h-6 w-6 text-[var(--accent)] opacity-40" />
                            </div>
                          )}
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm font-semibold text-[var(--ink)] truncate">{item.name}</h4>
                          <p className="text-xs text-[var(--accent)] font-semibold mt-0.5">৳{item.price}</p>
                        </div>
                        {/* Qty + total */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center rounded-full border border-[var(--line)] bg-[var(--card)] p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]" aria-label="Decrease">-</button>
                            <span className="w-6 text-center text-xs font-semibold text-[var(--ink)]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]" aria-label="Increase">+</button>
                          </div>
                          <span className="text-xs font-semibold text-[var(--ink-soft)]">৳{item.price * item.quantity}</span>
                        </div>
                      </div>
                      {/* Special request */}
                      <input
                        type="text"
                        placeholder={`Special request for ${item.name} (e.g. no onions)`}
                        value={item.specialRequest || ""}
                        onChange={(e) => updateSpecialRequest(item.id, e.target.value)}
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Delivery address input */}
                {isDelivery && (
                  <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 space-y-2">
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                      🚚 Delivery Address & Phone Number (Required)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter your full home address and contact phone number..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>
                )}

                {/* Real food suggestions */}
                <SuggestionsCarousel />
              </>
            )}
          </div>
        )}

        {/* Footer */}
        {basket.length > 0 && orderStatus !== "success" && (
          <div className="border-t border-[var(--line)] bg-[var(--card)] p-6 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-[var(--ink-soft)]">
                <span>Items Subtotal</span><span>৳{itemsPrice}</span>
              </div>
              {isDelivery && (
                <div className="flex justify-between text-sm text-[var(--ink-soft)]">
                  <span>Delivery Charge</span><span>৳{deliveryCharge}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[var(--ink)]">
                <span>Total Price</span>
                <span className="text-[var(--accent)]">৳{totalPrice}</span>
              </div>
            </div>

            {/* Primary: Place Order */}
            {tableNumber && (
              <button
                onClick={handlePlaceOrder}
                disabled={orderStatus === "placing"}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold tracking-wide text-white transition hover:brightness-105 active:scale-98 shadow-md disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}
              >
                {orderStatus === "placing" ? (
                  <><span className="animate-spin">⟳</span><span>Placing Order…</span></>
                ) : (
                  <><span>♛</span><span>{isDelivery ? "Place Delivery Order" : `Place Order — Table ${tableNumber}`}</span></>
                )}
              </button>
            )}

            {/* Fallback: Show to Waiter (hidden for delivery) */}
            {!isDelivery && (
              <button
                onClick={() => { setIsOpen(false); setIsWaiterMode(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--accent)] py-3 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition"
              >
                Show to Waiter
              </button>
            )}

            <p className="text-center text-xs text-[var(--ink-soft)]">
              {isDelivery ? "Your order will be delivered to your address." : tableNumber ? "Your order goes directly to the kitchen." : "Scan your table QR to place orders directly."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Waiter Mode Modal (fallback) ────────────────────────────────────────────
export function WaiterModeModal() {
  const { basket, isWaiterMode, setIsWaiterMode, totalItems, totalPrice } = useBasket();
  const [tableNumberLocal, setTableNumberLocal] = useState("");

  useEffect(() => {
    document.body.style.overflow = isWaiterMode ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isWaiterMode]);

  if (!isWaiterMode) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--paper)] overflow-y-auto">
      <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between border-b border-2 border-[var(--ink)] bg-white px-6">
        <div className="flex items-center gap-3">
          <CrownMark className="h-6 w-6 text-[var(--accent)]" />
          <h2 className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">ORDER SUMMARY</h2>
        </div>
        <button onClick={() => setIsWaiterMode(false)} className="rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] p-2 font-bold text-[var(--ink)] hover:bg-[var(--line)] transition" aria-label="Close">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-8 space-y-8">
        <div className="rounded-xl border-2 border-dashed border-[var(--accent)] bg-amber-50/50 p-4 text-center">
          <p className="text-sm font-bold text-amber-900 uppercase tracking-wide">★ Attention Waiter / Counter Staff</p>
          <p className="mt-1 text-xs text-amber-800">Please copy down or input these items into the billing system.</p>
        </div>

        <div className="rounded-xl border-2 border-[var(--ink)] bg-white p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(28,22,18,1)]">
          <div className="flex items-center gap-4">
            <label htmlFor="table-num" className="text-sm font-bold tracking-wider text-[var(--ink)] uppercase shrink-0">Table / Room #</label>
            <input id="table-num" type="text" placeholder="e.g. 5A" value={tableNumberLocal} onChange={(e) => setTableNumberLocal(e.target.value)} className="flex-1 rounded-lg border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm font-bold text-[var(--ink)] uppercase placeholder-[var(--mute)] focus:border-[var(--accent)] focus:outline-none" />
          </div>
        </div>

        <div className="rounded-xl border-2 border-[var(--ink)] bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(28,22,18,1)]">
          <div className="bg-[var(--ink)] text-white px-5 py-3 flex justify-between items-center">
            <span className="text-xs font-bold tracking-widest uppercase">Items Selected</span>
            <span className="text-xs font-bold tracking-widest uppercase bg-[var(--accent)] px-2 py-0.5 rounded-sm">Qty</span>
          </div>
          <ul className="divide-y-2 divide-[var(--line)]">
            {basket.map((item) => (
              <li key={item.id} className="px-5 py-4 flex justify-between items-center hover:bg-[var(--paper)]/30">
                <div className="min-w-0 pr-4">
                  <span className="text-xs font-semibold tracking-wider text-[var(--accent)] uppercase">{item.category}</span>
                  <h3 className="font-display text-lg font-bold text-[var(--ink)] leading-snug mt-0.5">{item.name}</h3>
                  {item.specialRequest && (
                    <p className="text-xs text-amber-700 italic mt-0.5">Note: {item.specialRequest}</p>
                  )}
                  <span className="text-xs text-[var(--ink-soft)] mt-0.5 block">Unit Price: ৳{item.price}</span>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex items-center justify-center rounded-lg border-2 border-[var(--ink)] bg-amber-50 h-10 w-12 font-display text-lg font-extrabold text-[var(--ink)]">{item.quantity}</div>
                  <div className="text-right w-20">
                    <span className="font-display text-base font-bold text-[var(--ink)]">৳{item.price * item.quantity}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-amber-50/40 border-t-2 border-[var(--ink)] px-5 py-4 space-y-1">
            <div className="flex justify-between text-sm text-[var(--ink-soft)] font-medium">
              <span>Total Dishes</span><span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-[var(--ink)] pt-1">
              <span>ESTIMATED TOTAL</span>
              <span className="text-[var(--accent)]">৳{totalPrice}</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 border-t-2 border-[var(--ink)] bg-white p-6 flex flex-col gap-3 shrink-0">
        <button onClick={() => setIsWaiterMode(false)} className="flex w-full items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] py-3 text-sm font-bold tracking-wide text-[var(--ink)] hover:bg-[var(--line)] transition shadow-sm active:scale-98">
          Back to Menu
        </button>
      </footer>
    </div>
  );
}
