"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import CrownMark from "@/components/CrownMark";

// ─── Sound presets (Web Audio API — no files needed) ──────────────────────────
const SOUND_PRESETS = {
  gentle_bell:   { label: "🔔 Gentle Bell",    fn: playGentleBell },
  double_ding:   { label: "🎵 Double Ding",     fn: playDoubleDing },
  urgent_alarm:  { label: "🚨 Urgent Alarm",    fn: playUrgentAlarm },
  classic_chime: { label: "🎶 Classic Chime",   fn: playClassicChime },
  soft_ping:     { label: "💫 Soft Ping",       fn: playSoftPing },
  cash_register: { label: "💰 Cash Register",   fn: playCashRegister },
};

function getAudioCtx() {
  if (typeof window === "undefined") return null;
  if (!window._crownAudioCtx) {
    window._crownAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (window._crownAudioCtx.state === "suspended") window._crownAudioCtx.resume();
  return window._crownAudioCtx;
}

function playTone(freq, type, duration, gain = 0.5, startTime = 0) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime + startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration + 0.05);
}

function playGentleBell()   { playTone(880, "sine", 1.2, 0.4); playTone(1320, "sine", 0.8, 0.2, 0.1); }
function playDoubleDing()   { playTone(1046, "sine", 0.6, 0.5); playTone(1318, "sine", 0.6, 0.5, 0.5); }
function playUrgentAlarm()  { for (let i = 0; i < 4; i++) { playTone(880, "square", 0.15, 0.3, i * 0.2); playTone(1100, "square", 0.15, 0.3, i * 0.2 + 0.1); } }
function playClassicChime() { [523, 659, 784, 1046].forEach((f, i) => playTone(f, "sine", 0.8, 0.4, i * 0.18)); }
function playSoftPing()     { playTone(1200, "sine", 0.8, 0.3); }
function playCashRegister() { playTone(1500, "square", 0.05, 0.5); playTone(2000, "square", 0.05, 0.5, 0.08); playTone(1500, "sine", 0.6, 0.4, 0.15); }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleString("en-BD", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", hour12: true });
}
function timeSince(isoStr) {
  if (!isoStr) return "";
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function StatusBadge({ status }) {
  const map = {
    pending:     "bg-red-100 text-red-800 border-red-300",
    kot_printed: "bg-amber-100 text-amber-800 border-amber-300",
    done:        "bg-green-100 text-green-700 border-green-300",
    cancelled:   "bg-gray-100 text-gray-600 border-gray-300",
  };
  const labels = {
    pending:     "⏳ Pending",
    kot_printed: "🖨 KOT Printed",
    done:        "✅ Done",
    cancelled:   "❌ Cancelled",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${map[status] || map.pending}`}>
      {labels[status] || status}
    </span>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange, onDelete, isNew, isRinging, isEscalated }) {
  const [expanded, setExpanded] = useState(true);
  const [updating, setUpdating] = useState(false);

  const patch = useCallback(async (payload) => {
    setUpdating(true);
    const fullPayload = payload.status === "done"
      ? { ...payload, completedAt: new Date().toISOString() }
      : payload;
    await onStatusChange(order.orderId, fullPayload);
    setUpdating(false);
  }, [order.orderId, onStatusChange]);

  return (
    <div className={`rounded-2xl border-2 bg-white shadow-sm transition-all duration-500 ${
      isRinging
        ? isEscalated
          ? "border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.45)] animate-pulse bg-red-50/5"
          : "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] animate-pulse"
        : isNew
        ? "border-[var(--accent)] shadow-[0_0_0_3px_rgba(182,134,44,0.12)]"
        : "border-[var(--line)]"
    } ${order.status === "done" || order.status === "cancelled" ? "opacity-60" : ""}`}>

      {/* Alert banner — visible only while pending (ringing) */}
      {order.status === "pending" && (
        <div className={`flex items-center gap-2 rounded-t-xl px-4 py-2 text-white font-bold text-xs ${isEscalated ? "bg-red-700 animate-pulse" : "bg-red-500"}`}>
          <span className="animate-ping text-white text-xs">●</span>
          <span>
            {isEscalated 
              ? "⚠️ ESCALATED WARNING — Order pending for > 4 minutes! Silence immediately!" 
              : "🔔 ALERT — Press KOT Printed to silence the alarm"}
          </span>
        </div>
      )}

      {/* Card header */}
      <div
        className="flex items-start justify-between gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-display text-lg font-black"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}
          >
            {order.tableNumber === "tab" ? "💳" : order.tableNumber === "delivery" ? "🚚" : order.tableNumber}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-lg font-bold text-[var(--ink)]">
                {order.tableNumber === "tab" ? "Tab Order" : order.tableNumber === "delivery" ? "Home Delivery" : `Table ${order.tableNumber}`}
              </span>
              <span className="font-mono text-sm font-bold text-[var(--accent)]">{order.orderNumber}</span>
              <StatusBadge status={order.status} />
              {isNew && (
                <span className="animate-bounce rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-widest">
                  NEW
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
              {formatTime(order.placedAt)} · {timeSince(order.placedAt)} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {order.status === "pending" && (
            <button
              onClick={(e) => { e.stopPropagation(); patch({ status: "kot_printed" }); }}
              disabled={updating}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1 tracking-wider uppercase transition shadow-sm cursor-pointer"
            >
              🖨 KOT
            </button>
          )}
          {order.status === "kot_printed" && (
            <button
              onClick={(e) => { e.stopPropagation(); patch({ status: "done" }); }}
              disabled={updating}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 tracking-wider uppercase transition shadow-sm cursor-pointer"
            >
              ✅ Serve
            </button>
          )}
          <span className="font-display text-lg font-bold text-[var(--accent)] ml-2">৳{order.totalPrice}</span>
          <svg 
            onClick={(e) => { e.stopPropagation(); setExpanded((ev) => !ev); }}
            className={`h-4 w-4 text-[var(--ink-soft)] transition-transform cursor-pointer hover:text-[var(--ink)] ${expanded ? "rotate-180" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[var(--line)] px-5 pb-5">
          {/* Item list */}
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {(order.items || []).map((item, idx) => (
              <li key={idx} className="flex items-start justify-between py-2.5 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">{item.name}</p>
                  {item.specialRequest && (
                    <p className="text-xs text-amber-700 italic mt-0.5">📝 {item.specialRequest}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-bold text-[var(--ink-soft)] bg-[var(--paper)] rounded-full px-2 py-0.5">×{item.quantity}</span>
                  <span className="text-sm font-bold text-[var(--ink)]">৳{item.price * item.quantity}</span>
                </div>
              </li>
            ))}
          </ul>

          {order.deliveryCharge > 0 && (
            <div className="mt-2 text-right text-xs text-[var(--ink-soft)] font-medium">
              Items: ৳{order.totalPrice - order.deliveryCharge} + Delivery: ৳{order.deliveryCharge}
            </div>
          )}

          {order.customerName && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-left">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>👤 Customer Tab Contact:</strong>
                <br />
                <span className="font-sans mt-1 block font-bold text-[var(--ink)]">
                  {order.customerName} ({order.customerContact})
                </span>
              </p>
            </div>
          )}

          {order.deliveryAddress && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-left">
              <p className="text-xs text-red-900 leading-relaxed">
                <strong>📍 Delivery Address & Contact:</strong>
                <br />
                <span className="whitespace-pre-wrap font-sans mt-1 block">{order.deliveryAddress}</span>
              </p>
            </div>
          )}

          {order.specialNote && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-xs text-amber-800"><strong>Order note:</strong> {order.specialNote}</p>
            </div>
          )}

          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
            <p className="text-xs text-blue-800 font-semibold">
              {order.tableNumber === "delivery" ? "⏱ Estimated delivery: 30–45 minutes" : "⏱ Estimated prep: 15–20 minutes"}
            </p>
          </div>

          {/* ─── Action buttons ─────────────────────────────── */}
          <div className="mt-4 flex flex-wrap gap-2">
            {order.status === "pending" && (
              <>
                {/* KOT Printed — primary, stops sound */}
                <button
                  onClick={() => patch({ status: "kot_printed" })}
                  disabled={updating}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-black text-white transition hover:brightness-105 active:scale-95 disabled:opacity-50 shadow-md"
                  style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}
                >
                  🖨 KOT Printed
                </button>
                <button
                  onClick={() => patch({ status: "done" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-green-400 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100 transition disabled:opacity-50"
                >
                  ✅ Done
                </button>
                <button
                  onClick={() => patch({ status: "cancelled" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                >
                  ❌ Cancel
                </button>
              </>
            )}

            {order.status === "kot_printed" && (
              <>
                <button
                  onClick={() => patch({ status: "done" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50"
                >
                  ✅ Mark Done
                </button>
                <button
                  onClick={() => patch({ status: "cancelled" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={() => patch({ status: "pending" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-50 transition disabled:opacity-50 ml-auto"
                >
                  🔓 Unlock Ticket
                </button>
              </>
            )}

            {(order.status === "done" || order.status === "cancelled") && (
              <button
                onClick={() => patch({ status: "pending" })}
                disabled={updating}
                className="flex items-center gap-1.5 rounded-full border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-50 transition disabled:opacity-50"
              >
                🔓 Unlock Ticket
              </button>
            )}
            <button
              onClick={() => onDelete(order.orderId)}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2.5 text-xs font-bold text-[var(--ink-soft)] hover:border-red-300 hover:text-red-600 transition disabled:opacity-50 ml-auto"
            >
              🗑
            </button>
          </div>

          {order.status === "pending" && (
            <p className="mt-2 text-center text-[10px] text-red-500 font-semibold">
              🔊 Alarm is ringing — KOT Printed will silence it
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Manager Portal ────────────────────────────────────────────────────────────
export default function ManagerPortal({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [tab, setTab] = useState("pending");
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  const [hasEscalatedOrder, setHasEscalatedOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Set of order IDs that are pending and haven't been KOT-printed yet
  // Sound loops as long as this is non-empty
  const [pendingKotIds, setPendingKotIds] = useState(new Set());
  const loopRef = useRef(null); // setInterval reference
  const updatingOrderIdsRef = useRef(new Map()); // Map of orderId -> lastLocalActionTimestamp

  // Periodic check for escalated orders (> 4 minutes pending)
  useEffect(() => {
    const checkEscalation = () => {
      const pending = orders.filter((o) => o.status === "pending");
      const escalated = pending.some((o) => {
        const ageMs = Date.now() - new Date(o.placedAt).getTime();
        return ageMs > 4 * 60 * 1000;
      });
      setHasEscalatedOrder(escalated);
    };
    checkEscalation();
    const interval = setInterval(checkEscalation, 5000);
    return () => clearInterval(interval);
  }, [orders]);

  const currentSoundKey = hasEscalatedOrder ? "urgent_alarm" : "classic_chime";

  // ── Continuous loop: start/stop based on pendingKotIds ─────────────────
  useEffect(() => {
    if (pendingKotIds.size > 0 && soundEnabled) {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
      
      const playActiveSound = () => {
        SOUND_PRESETS[currentSoundKey]?.fn();
      };
      
      playActiveSound();
      loopRef.current = setInterval(playActiveSound, currentSoundKey === "urgent_alarm" ? 1000 : 2000);
    } else {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    }
  }, [pendingKotIds, soundEnabled, currentSoundKey]);

  // Stop loop when component unmounts
  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  // Sync pendingKotIds from orders (for page refresh / initial load)
  useEffect(() => {
    const ids = new Set(
      (initialOrders || [])
        .filter((o) => o.status === "pending")
        .map((o) => o.orderId)
    );
    setPendingKotIds(ids);
  }, []); // only on mount

  // ── Browser tab title ──────────────────────────────────────────────────
  useEffect(() => {
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    document.title = pendingCount > 0
      ? `(${pendingCount}) Manager Portal | Crown Coffee`
      : "Manager Portal | Crown Coffee";
  }, [orders]);

  // ── SSE connection ─────────────────────────────────────────────────────
  useEffect(() => {
    function connect() {
      const es = new EventSource("/api/orders/stream");

      es.onopen = () => setConnected(true);

      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "connected") {
            setConnected(true);
          } else if (msg.type === "new_order") {
            const order = msg.order;
            setOrders((prev) => {
              // Deduplicate order list (in case it already exists via polling)
              if (prev.some((o) => o.orderId === order.orderId)) {
                return prev;
              }
              return [order, ...prev];
            });
            setNewOrderIds((prev) => new Set([...prev, order.orderId]));

            // Play sound immediately on arrival if pending & sound enabled
            if (order.status === "pending" && soundEnabled) {
              SOUND_PRESETS[currentSoundKey]?.fn();
            }

            // Add to pending-KOT set → triggers sound loop
            if (order.status === "pending") {
              setPendingKotIds((prev) => new Set([...prev, order.orderId]));
            }

            // Remove "new" bounce badge after 8 seconds
            setTimeout(() => {
              setNewOrderIds((prev) => {
                const next = new Set(prev); next.delete(order.orderId); return next;
              });
            }, 8000);
          } else if (msg.type === "order_updated") {
            const order = msg.order;
            
            // Skip updating state if we just updated this locally to prevent latency overwrite
            const lastAction = updatingOrderIdsRef.current.get(order.orderId);
            if (lastAction && Date.now() - lastAction < 5000) {
              return;
            }

            setOrders((prev) => prev.map((o) => o.orderId === order.orderId ? order : o));

            // If status moved away from pending → remove from ringing set
            if (order.status !== "pending") {
              setPendingKotIds((prev) => {
                const next = new Set(prev); next.delete(order.orderId); return next;
              });
            }
          }
        } catch { /* ignore */ }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        setTimeout(connect, 3000);
      };
    }
    connect();
  }, [soundEnabled, currentSoundKey]); // connect dependencies handled correctly

  // ── Polling fallback (ensures cross-device sync in serverless environments) ──
  useEffect(() => {
    async function pollOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const freshOrders = await res.json();
          
          setOrders((prev) => {
            return freshOrders.map((fresh) => {
              const lastAction = updatingOrderIdsRef.current.get(fresh.orderId);
              if (lastAction && Date.now() - lastAction < 5000) {
                const local = prev.find((o) => o.orderId === fresh.orderId);
                return local ? local : fresh;
              }
              return fresh;
            });
          });

          // Re-calculate pendingKotIds based on fresh orders
          const ringingIds = new Set(
            freshOrders
              .filter((o) => o.status === "pending")
              .map((o) => o.orderId)
          );
          setPendingKotIds(ringingIds);
        }
      } catch (err) {
        console.error("Polling orders failed:", err);
      }
    }

    const interval = setInterval(pollOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  // ── Status update ──────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (orderId, patch) => {
    updatingOrderIdsRef.current.set(orderId, Date.now());

    // 1. Optimistic Local State Update:
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o))
    );

    // If moved away from pending -> stop sound immediately
    if (patch.status && patch.status !== "pending") {
      setPendingKotIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
    // If moved back to pending -> start sound immediately
    if (patch.status === "pending") {
      setPendingKotIds((prev) => new Set([...prev, orderId]));
    }

    // 2. Perform Network Update in Background:
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state with exact response from server
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? data.order : o))
        );
      } else {
        throw new Error("PATCH failed");
      }
    } catch (err) {
      console.error("Failed to update status on server:", err);
      alert("Failed to save changes. Please try again.");
      updatingOrderIdsRef.current.delete(orderId); // clear lockout so it reverts on next poll
    }
  }, []);

  const handleDelete = useCallback(async (orderId) => {
    if (!confirm("Delete this order permanently?")) return;
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    setPendingKotIds((prev) => { const next = new Set(prev); next.delete(orderId); return next; });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/manager-auth", { method: "DELETE" });
    window.location.href = "/manager/login";
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const filteredOrders = orders.filter((o) => {
    // Tab filter
    if (tab === "pending" && o.status !== "pending" && o.status !== "kot_printed") return false;
    if (tab === "done" && o.status !== "done" && o.status !== "cancelled") return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = o.orderNumber.toLowerCase().includes(q) || o.orderId.includes(q);
      const tableMatch = String(o.tableNumber).toLowerCase().includes(q);
      const nameMatch = o.customerName && o.customerName.toLowerCase().includes(q);
      const itemMatch = o.items && o.items.some((item) => item.name.toLowerCase().includes(q));
      return numMatch || tableMatch || nameMatch || itemMatch;
    }
    return true;
  });

  const tabs = [
    { id: "pending", label: "🔴 Active",       count: orders.filter((o) => o.status === "pending" || o.status === "kot_printed").length },
    { id: "done",    label: "✅ Completed",    count: orders.filter((o) => o.status === "done" || o.status === "cancelled").length },
    { id: "all",     label: "📋 All Orders",   count: orders.length },
    { id: "analytics", label: "📊 Insights",   count: 0 },
  ];

  // Helper component to render Analytics Dashboard
  const renderAnalytics = () => {
    const completedOrders = orders.filter((o) => o.status === "done");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
    
    // Average prep time
    const ordersWithPrep = completedOrders.filter((o) => o.completedAt);
    let avgPrepText = "N/A";
    if (ordersWithPrep.length > 0) {
      const totalPrepMinutes = ordersWithPrep.reduce((sum, o) => {
        const start = new Date(o.placedAt).getTime();
        const end = new Date(o.completedAt).getTime();
        return sum + (end - start) / (1000 * 60);
      }, 0);
      const avgPrep = Math.round(totalPrepMinutes / ordersWithPrep.length);
      avgPrepText = `${avgPrep} min${avgPrep !== 1 ? "s" : ""}`;
    }

    // Sales by Category
    const categorySales = {};
    completedOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const cat = item.category || "Uncategorized";
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
      });
    });

    const categoryData = Object.entries(categorySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // top 5 categories

    return (
      <div className="bg-white rounded-2xl border border-[var(--line)] p-6 space-y-8 shadow-sm">
        <div>
          <h3 className="font-display text-xl font-bold text-[var(--ink)]">Performance Insights</h3>
          <p className="text-xs text-[var(--ink-soft)] mt-1">Real-time statistics of completed orders today.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bg-[var(--paper)] rounded-xl p-4 border border-[var(--line)]">
            <p className="text-2xl font-black text-[var(--ink)]">৳{totalRevenue}</p>
            <p className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider mt-1">Total Sales</p>
          </div>
          <div className="bg-[var(--paper)] rounded-xl p-4 border border-[var(--line)]">
            <p className="text-2xl font-black text-[var(--ink)]">{completedOrders.length}</p>
            <p className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider mt-1">Completed</p>
          </div>
          <div className="bg-[var(--paper)] rounded-xl p-4 border border-[var(--line)]">
            <p className="text-2xl font-black text-[var(--ink)]">৳{avgOrderValue}</p>
            <p className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider mt-1">Avg Order Val</p>
          </div>
          <div className="bg-[var(--paper)] rounded-xl p-4 border border-[var(--line)]">
            <p className="text-2xl font-black text-[var(--ink)]">{avgPrepText}</p>
            <p className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider mt-1">Avg Prep Time</p>
          </div>
        </div>

        {/* Top Selling Categories */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">Top Categories by Revenue</h4>
          {categoryData.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)] italic">No sales data available yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map(([category, revenue]) => {
                const maxRevenue = Math.max(...categoryData.map((c) => c[1]));
                const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-[var(--ink)]">{category}</span>
                      <span className="font-bold text-[var(--accent)]">৳{revenue}</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--paper)] rounded-full overflow-hidden border border-[var(--line)]">
                      <div 
                        className="h-full bg-[var(--accent)] rounded-full" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Ringing alert banner (top of page) */}
      {pendingKotIds.size > 0 && soundEnabled && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-red-600 py-2 px-4 shadow-lg">
          <span className="animate-ping h-2.5 w-2.5 rounded-full bg-white opacity-80 inline-block" />
          <span className="text-sm font-black text-white tracking-wide">
            🔊 ALARM — {pendingKotIds.size} unacknowledged order{pendingKotIds.size > 1 ? "s" : ""} — Press KOT Printed to silence
          </span>
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CrownMark className="h-6 w-6 text-[var(--accent)]" />
            <div>
              <p className="font-display text-lg font-bold text-[var(--ink)] leading-none">Manager Portal</p>
              <p className="text-xs text-[var(--ink-soft)]">Crown Coffee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection */}
            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${connected ? "border-green-300 bg-green-50 text-green-700" : "border-red-300 bg-red-50 text-red-700"}`}>
              <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              {connected ? "Live" : "Reconnecting…"}
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${soundEnabled ? "border-red-400 bg-red-50 text-red-700" : "border-[var(--line)] text-[var(--ink-soft)]"}`}
            >
              {soundEnabled ? "🔊 Sound ON" : "🔕 Muted"}
            </button>

            <button onClick={handleLogout} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold hover:border-red-300 hover:text-red-600 transition">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* Alert Tone Indicator */}
        <div className="rounded-2xl border border-[var(--line)] bg-white p-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-sm font-semibold text-[var(--ink)]">Alert Tone: {hasEscalatedOrder ? "🚨 Urgent Alarm" : "🎶 Classic Chime"}</span>
            <p className="text-xs text-[var(--ink-soft)]">This sound will ring continuously when a new order arrives until you press KOT Printed.</p>
          </div>
          <button
            onClick={() => SOUND_PRESETS[currentSoundKey].fn()}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
          >
            ▶ Test Sound
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "🔴 Ringing",  value: pendingKotIds.size, color: "text-red-600",          bg: "bg-red-50 border-red-200" },
            { label: "⏳ Pending",  value: pendingCount,        color: "text-amber-600",         bg: "bg-amber-50 border-amber-200" },
            { label: "✅ Done",     value: orders.filter((o) => o.status === "done").length, color: "text-green-600", bg: "bg-green-50 border-green-200" },
            { label: "📋 Total",    value: orders.length,       color: "text-[var(--accent)]",   bg: "bg-[var(--accent-soft)] border-[var(--line)]" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.bg}`}>
              <p className={`font-display text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-semibold text-[var(--ink-soft)] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--line)]">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                  tab === t.id
                    ? "border-[var(--accent)] text-[var(--ink)]"
                    : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab === t.id ? "bg-[var(--accent)] text-white" : "bg-[var(--line)] text-[var(--ink-soft)]"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {tab !== "analytics" && (
            <div className="relative w-full sm:w-64 pb-2 sm:pb-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-[var(--ink-soft)] pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[var(--line)] bg-white py-1.5 pl-8 pr-4 text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Order list / Analytics conditional */}
        {tab === "analytics" ? (
          renderAnalytics()
        ) : (
          <div className={`grid grid-cols-1 ${tab === "pending" ? "md:grid-cols-2 lg:grid-cols-3" : ""} gap-4`}>
            {filteredOrders.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <CrownMark className="h-12 w-12 text-[var(--accent)] opacity-20 mb-4" />
                <p className="font-display text-xl font-bold text-[var(--ink)]">
                  {tab === "pending" ? "No active orders" : "No orders here"}
                </p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  {tab === "pending"
                    ? "New orders will appear here instantly. The alarm will ring automatically."
                    : "Orders you manage will show up here."}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const ageMs = Date.now() - new Date(order.placedAt).getTime();
                const isEscalated = order.status === "pending" && ageMs > 4 * 60 * 1000;
                return (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    isNew={newOrderIds.has(order.orderId)}
                    isRinging={pendingKotIds.has(order.orderId)}
                    isEscalated={isEscalated}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
