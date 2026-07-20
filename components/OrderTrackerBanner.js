"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderTrackerBanner() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [removedNotice, setRemovedNotice] = useState(null); // { orderId, orderNumber }

  useEffect(() => {
    setIsMounted(true);
    
    // Helper to fetch and update status of active orders
    const checkActiveOrders = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("crown_coffee_placed_orders") || "[]");
        if (stored.length === 0) {
          setActiveOrders([]);
          return;
        }

        // Active statuses are "pending" or "kot_printed"
        const active = stored.filter((o) => o.status === "pending" || o.status === "kot_printed");
        if (active.length === 0) {
          setActiveOrders([]);
          return;
        }

        // Poll each active order status
        const updated = await Promise.all(
          active.map(async (order) => {
            try {
              const res = await fetch(`/api/orders/${order.orderId}`);
              if (res.ok) {
                const fresh = await res.json();
                return { ...order, status: fresh.status };
              } else if (res.status === 404) {
                // Show removed notice
                setRemovedNotice({ orderId: order.orderId, orderNumber: order.orderNumber });
                return { ...order, status: "deleted" };
              }
            } catch (err) {
              console.error(`Failed to fetch status for order ${order.orderId}`, err);
            }
            return order; // Fallback to current local state if fetch fails
          })
        );

        // Update localStorage with fresh statuses (filtering out deleted ones)
        const freshStored = stored
          .map((o) => {
            const match = updated.find((u) => u.orderId === o.orderId);
            return match ? { ...o, status: match.status } : o;
          })
          .filter((o) => o.status !== "deleted");
        localStorage.setItem("crown_coffee_placed_orders", JSON.stringify(freshStored));

        // Set active orders state with currently active ones
        const stillActive = updated.filter((o) => o.status === "pending" || o.status === "kot_printed");
        setActiveOrders(stillActive);
      } catch (e) {
        console.error("Error in checkActiveOrders", e);
      }
    };

    // Check immediately and then poll every 6 seconds
    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  // Show removed-by-manager alert (auto-dismiss after 12s)
  if (removedNotice && activeOrders.length === 0) {
    return (
      <div className="fixed bottom-24 left-6 right-6 z-40 max-w-xl mx-auto print:hidden">
        <div className="flex items-start gap-4 rounded-2xl bg-red-600 text-white px-5 py-4 shadow-xl border border-red-500/30 animate-pulse-once">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl">
            🚫
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-red-200">
              Order Removed
            </p>
            <p className="font-display text-sm font-bold mt-0.5">
              Order {removedNotice.orderNumber} was removed by staff
            </p>
            <p className="text-[11px] text-red-200 mt-0.5">
              Likely due to item unavailability. Please ask staff for help.
            </p>
          </div>
          <button
            onClick={() => setRemovedNotice(null)}
            className="shrink-0 text-red-200 hover:text-white text-lg leading-none mt-0.5"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (activeOrders.length === 0) return null;

  const latestOrder = activeOrders[activeOrders.length - 1];
  const statusLabels = {
    pending: "⏳ Placed & Received",
    kot_printed: "🍳 In the Kitchen",
  };

  return (
    <div className="fixed bottom-24 left-6 right-6 z-40 max-w-xl mx-auto animate-bounce-slow print:hidden">
      <Link 
        href={`/order/status?id=${latestOrder.orderId}`}
        className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--ink)] text-white px-5 py-4 shadow-xl border border-white/10 transition-all hover:scale-[1.02] active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-white text-lg">
            🔔
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)]">
              Active Order Status
            </p>
            <p className="font-display text-sm font-bold mt-0.5">
              Order {latestOrder.orderNumber} · {statusLabels[latestOrder.status] || "Preparing"}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[var(--accent)] hover:underline shrink-0">
          Track Order &rarr;
        </span>
      </Link>
    </div>
  );
}
