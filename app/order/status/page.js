"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CrownMark from "@/components/CrownMark";

function StatusTimeline({ status }) {
  const steps = [
    { id: "pending", label: "Order Received", icon: "⏳", desc: "Sent to the kitchen and awaiting confirmation." },
    { id: "kot_printed", label: "Preparing", icon: "🍳", desc: "Our chefs are preparing your delicious items." },
    { id: "done", label: "Served", icon: "✅", desc: "Your order has been served. Enjoy your meal!" },
  ];

  // Helper to determine step status
  const getStepState = (stepId) => {
    if (status === "cancelled") return "inactive";
    
    if (status === "done") return "completed";
    if (status === "kot_printed") {
      if (stepId === "pending") return "completed";
      if (stepId === "kot_printed") return "active";
      return "inactive";
    }
    // pending
    if (stepId === "pending") return "active";
    return "inactive";
  };

  return (
    <div className="space-y-6">
      {status === "cancelled" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <span className="text-xl">❌</span>
          <div>
            <p className="font-bold text-red-950">Order Cancelled</p>
            <p className="text-xs text-red-800">This order was marked cancelled. Please ask our service staff for help.</p>
          </div>
        </div>
      )}

      <div className="relative border-l-2 border-[var(--line)] ml-4 pl-8 space-y-8 py-2">
        {steps.map((step) => {
          const state = getStepState(step.id);
          const isCompleted = state === "completed";
          const isActive = state === "active";

          return (
            <div key={step.id} className="relative">
              {/* Connector dot */}
              <div 
                className={`absolute -left-[41px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs transition-all duration-500 ${
                  isCompleted 
                    ? "bg-green-600 border-green-600 text-white shadow-sm"
                    : isActive
                    ? "bg-amber-500 border-amber-500 text-white animate-pulse shadow-md"
                    : "bg-white border-[var(--line)] text-[var(--ink-soft)]"
                }`}
              >
                {isCompleted ? "✓" : step.icon}
              </div>

              <div>
                <h4 className={`font-display text-base font-bold ${
                  isCompleted ? "text-green-700" : isActive ? "text-amber-600" : "text-[var(--ink-soft)]"
                }`}>
                  {step.label}
                </h4>
                <p className="text-xs text-[var(--ink-soft)] mt-1 max-w-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removedByManager, setRemovedByManager] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided. Scan a QR code to order.");
      setLoading(false);
      return;
    }

    // Initial fetch + polling fallback
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setError("");
        } else if (res.status === 404) {
          setRemovedByManager(true);
          setOrder(null);
        } else {
          setError("Order not found or has been removed.");
        }
      } catch (err) {
        console.error("Failed to fetch order status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    // SSE for instant real-time updates
    const es = new EventSource(`/api/orders/${orderId}/stream`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "order_updated" && msg.order?.orderId === orderId) {
          setOrder(msg.order);
          setError("");
          setLoading(false);
        } else if (msg.type === "order_deleted" && msg.orderId === orderId) {
          setRemovedByManager(true);
          setOrder(null);
          clearInterval(interval);
        }
      } catch { }
    };
    es.onerror = () => es.close();

    return () => {
      clearInterval(interval);
      es.close();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="animate-spin text-4xl mb-4 text-[var(--accent)]">⟳</div>
        <p className="text-sm text-[var(--ink-soft)] font-medium">Connecting to kitchen...</p>
      </div>
    );
  }

  // Removed by manager — clear, friendly notification
  if (removedByManager) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border-2 border-red-200">
          <span className="text-4xl">🚫</span>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">Order Removed</h3>
          <p className="text-sm text-[var(--ink-soft)] max-w-xs leading-relaxed">
            We&apos;re sorry — this order was removed by our staff, likely due to item unavailability.
            Please approach a staff member or place a new order.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 max-w-xs text-center">
          <p className="text-xs font-semibold text-amber-800">
            💬 Apologies for the inconvenience. Our staff will assist you shortly.
          </p>
        </div>
        <Link
          href="/order"
          className="rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
        >
          Place a New Order
        </Link>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h3 className="font-display text-xl font-bold text-[var(--ink)]">Tracking Error</h3>
        <p className="text-sm text-[var(--ink-soft)] max-w-xs">{error || "Could not retrieve order details."}</p>
        <Link 
          href="/order"
          className="rounded-full border border-[var(--accent)] px-6 py-2.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Receipt header */}
      <div className="text-center pb-6 border-b border-dashed border-[var(--line)]">
        <CrownMark className="h-10 w-10 text-[var(--accent)] mx-auto mb-3" />
        <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)]">
          Crown Coffee Bangladesh
        </h2>
        <h1 className="font-display text-4xl font-black mt-2 text-[var(--ink)]">
          Order {order.orderNumber}
        </h1>
        <p className="text-xs text-[var(--ink-soft)] mt-1.5">
          {order.tableNumber === "delivery"
            ? "🏠 Home Delivery Order"
            : order.tableNumber === "tab"
            ? `💳 Tab Order: ${order.customerName || "Customer"}`
            : `📍 Table ${order.tableNumber}`}
        </p>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-2xl border border-[var(--line)] p-6 shadow-xs">
        <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--ink-soft)] mb-5">
          Order Progress
        </h3>
        <StatusTimeline status={order.status} />
      </div>

      {/* Item Summary Details */}
      <div className="bg-white rounded-2xl border border-[var(--line)] p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold tracking-wider uppercase text-[var(--ink-soft)] border-b border-[var(--line)] pb-3">
          Ordered Dishes
        </h3>
        
        <ul className="divide-y divide-[var(--line)]">
          {order.items.map((item, index) => (
            <li key={index} className="py-3 flex justify-between gap-3 text-sm">
              <div>
                <p className="font-bold text-[var(--ink)]">{item.name}</p>
                {item.customizations && (
                  <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">
                    {Object.entries(item.customizations)
                      .map(([key, opt]) => {
                        if (Array.isArray(opt)) {
                          return opt.map((o) => o.name).join(", ");
                        }
                        return opt ? opt.name : "";
                      })
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {item.specialRequest && (
                  <p className="text-[10px] text-amber-700 italic mt-0.5">📝 {item.specialRequest}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-semibold text-[var(--ink-soft)]">×{item.quantity}</span>
                <span className="font-bold text-[var(--ink)] ml-4">৳{item.price * item.quantity}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-[var(--line)] pt-3 space-y-1.5 text-xs text-[var(--ink-soft)] font-medium">
          {order.deliveryCharge > 0 && (
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>৳{order.deliveryCharge}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-[var(--ink)] pt-1.5">
            <span>Total Paid/Due</span>
            <span className="text-[var(--accent)]">৳{order.totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Button to go back */}
      <div className="text-center pt-2">
        <Link 
          href="/order"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-8 py-3 text-sm font-semibold tracking-wide text-[var(--paper)] transition hover:bg-[var(--accent)]"
        >
          &larr; Back to Order Menu
        </Link>
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-12 lg:py-16">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="animate-spin text-4xl mb-4 text-[var(--accent)]">⟳</div>
          <p className="text-sm text-[var(--ink-soft)] font-medium">Loading status page...</p>
        </div>
      }>
        <StatusContent />
      </Suspense>
    </div>
  );
}
