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
    pending:     "bg-rose-950/40 text-rose-400 border-rose-800/50",
    kot_printed: "bg-amber-950/40 text-amber-400 border-amber-800/50",
    done:        "bg-emerald-950/40 text-emerald-400 border-emerald-800/50",
    cancelled:   "bg-slate-800 text-slate-400 border-slate-700",
  };
  const labels = {
    pending:     "⏳ Pending",
    kot_printed: "🍳 Cooking",
    done:        "✅ Served",
    cancelled:   "❌ Cancelled",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${map[status] || map.pending}`}>
      {labels[status] || status}
    </span>
  );
}

function ElapsedTime({ placedAt, status }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (status !== "pending" && status !== "kot_printed") {
      setElapsed("");
      return;
    }
    const update = () => {
      const diffMs = Date.now() - new Date(placedAt).getTime();
      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      setElapsed(`${mins}m ${secs}s`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [placedAt, status]);

  if (!elapsed) return null;
  return (
    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1 animate-pulse">
      ⏱ {elapsed}
    </span>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange, onDelete, isNew, isRinging, isEscalated }) {
  const [expanded, setExpanded] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItemCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const patch = useCallback(async (payload) => {
    setUpdating(true);
    const fullPayload = payload.status === "done"
      ? { ...payload, completedAt: new Date().toISOString() }
      : payload;
    await onStatusChange(order.orderId, fullPayload);
    setUpdating(false);
  }, [order.orderId, onStatusChange]);

  return (
    <div className={`rounded-2xl border-2 bg-slate-900 border-slate-800 shadow-xl transition-all duration-500 ${
      isRinging
        ? isEscalated
          ? "border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.35)] animate-pulse bg-red-950/5"
          : "border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse"
        : isNew
        ? "border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
        : "border-slate-800"
    } ${order.status === "done" || order.status === "cancelled" ? "opacity-50 hover:opacity-85 duration-300" : ""}`}>

      {/* Alert banner — visible only while pending (ringing) */}
      {order.status === "pending" && (
        <div className={`flex items-center gap-2 rounded-t-xl px-4 py-2 text-white font-bold text-xs tracking-wider uppercase ${isEscalated ? "bg-red-700 animate-pulse" : "bg-red-600"}`}>
          <span className="animate-ping text-white text-[10px]">●</span>
          <span className="text-[10px]">
            {isEscalated 
              ? "⚠️ ESCALATED — Pending > 4m!" 
              : "🔔 NEW ORDER ALERT"}
          </span>
        </div>
      )}

      {/* Card header */}
      <div
        className="flex items-start justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-slate-800/40 rounded-t-2xl transition"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-sans text-xl font-extrabold border border-slate-700"
            style={{ background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)" }}
          >
            {order.tableNumber === "tab" ? "💳" : order.tableNumber === "delivery" ? "🚚" : order.tableNumber}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-white tracking-tight">
                {order.tableNumber === "tab" ? "Tab Order" : order.tableNumber === "delivery" ? "Home Delivery" : `Table ${order.tableNumber}`}
              </span>
              <span className="font-mono text-sm font-extrabold text-amber-500">{order.orderNumber}</span>
              <StatusBadge status={order.status} />
              <ElapsedTime placedAt={order.placedAt} status={order.status} />
              {isNew && (
                <span className="animate-bounce rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-widest">
                  NEW
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {formatTime(order.placedAt)} · {timeSince(order.placedAt)} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {order.status === "pending" && (
            <button
              onClick={(e) => { e.stopPropagation(); patch({ status: "kot_printed" }); }}
              disabled={updating}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 tracking-wider uppercase transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {updating ? "⏳ Wait..." : "🖨 KOT"}
            </button>
          )}
          {order.status === "kot_printed" && (
            <button
              onClick={(e) => { e.stopPropagation(); patch({ status: "done" }); }}
              disabled={updating}
              className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] px-2.5 py-1 tracking-wider uppercase transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {updating ? "⏳ Wait..." : "✅ Serve"}
            </button>
          )}
          <span className="font-sans text-lg font-extrabold text-amber-500 ml-2">৳{order.totalPrice}</span>
          <svg 
            onClick={(e) => { e.stopPropagation(); setExpanded((ev) => !ev); }}
            className={`h-4 w-4 text-slate-500 transition-transform cursor-pointer hover:text-white ${expanded ? "rotate-180" : ""}`} 
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
        <div className="border-t border-slate-800/80 px-5 pb-5">
          {/* Item list */}
          <ul className="mt-4 divide-y divide-slate-800/60">
            {(order.items || []).map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <li key={idx} className="flex items-start justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {order.status !== "done" && order.status !== "cancelled" && (
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItemCheck(idx)}
                        className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer bg-slate-950"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-snug transition-all duration-300 ${isChecked ? "line-through text-slate-600 opacity-40" : "text-slate-100"}`}>
                        {item.name}
                      </p>
                      {item.customizations && (
                        <p className={`text-[10px] mt-0.5 font-medium transition-all ${isChecked ? "text-slate-600/40 opacity-30" : "text-slate-400"}`}>
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
                        <p className={`text-xs italic mt-0.5 transition-all ${isChecked ? "text-amber-800/30 opacity-40" : "text-amber-500"}`}>📝 {item.specialRequest}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-xs font-bold bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 transition-all ${isChecked ? "opacity-30 animate-none" : "text-slate-300"}`}>×{item.quantity}</span>
                    <span className={`text-sm font-bold transition-all ${isChecked ? "line-through text-slate-600 opacity-30" : "text-slate-200"}`}>৳{item.price * item.quantity}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {order.deliveryCharge > 0 && (
            <div className="mt-2 text-right text-xs text-slate-400 font-medium">
              Items: ৳{order.totalPrice - order.deliveryCharge} + Delivery: ৳{order.deliveryCharge}
            </div>
          )}

          {order.customerName && (
            <div className="mt-3 rounded-lg bg-amber-950/20 border border-amber-900/40 px-3 py-2.5 text-left">
              <p className="text-xs text-amber-300 leading-relaxed">
                <strong>👤 Customer Tab Contact:</strong>
                <br />
                <span className="font-sans mt-1 block font-bold text-white">
                  {order.customerName} ({order.customerContact})
                </span>
              </p>
            </div>
          )}

          {order.deliveryAddress && (
            <div className="mt-3 rounded-lg bg-rose-950/20 border border-rose-900/40 px-3 py-2.5 text-left">
              <p className="text-xs text-rose-300 leading-relaxed">
                <strong>📍 Delivery Address & Contact:</strong>
                <br />
                <span className="whitespace-pre-wrap font-sans mt-1 block text-white">{order.deliveryAddress}</span>
              </p>
            </div>
          )}

          {order.specialNote && (
            <div className="mt-3 rounded-lg bg-amber-950/20 border border-amber-900/40 px-3 py-2">
              <p className="text-xs text-amber-400"><strong>Order note:</strong> {order.specialNote}</p>
            </div>
          )}

          <div className="mt-3 rounded-lg bg-sky-950/20 border border-sky-900/40 px-3 py-2">
            <p className="text-xs text-sky-400 font-semibold">
              {order.tableNumber === "delivery" ? "⏱ Estimated delivery: 30–45 minutes" : "⏱ Estimated prep: 15–20 minutes"}
            </p>
          </div>

          {/* ─── Action buttons ─────────────────────────────── */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {order.status === "pending" && (
              <>
                {/* KOT Printed — primary, stops sound */}
                <button
                  onClick={() => patch({ status: "kot_printed" })}
                  disabled={updating}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-black text-white transition hover:brightness-105 active:scale-95 disabled:opacity-50 shadow-md cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                >
                  {updating ? "⏳ Wait..." : "🖨 KOT Printed"}
                </button>
                <button
                  onClick={() => patch({ status: "done" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-500 bg-emerald-950/20 px-4 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-950/40 transition disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "⏳ Wait..." : "✅ Done"}
                </button>
                <button
                  onClick={() => patch({ status: "cancelled" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-rose-900 bg-rose-950/20 px-4 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-950/40 transition disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "⏳ Wait..." : "❌ Cancel"}
                </button>
              </>
            )}

            {order.status === "kot_printed" && (
              <>
                <button
                  onClick={() => patch({ status: "done" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "⏳ Wait..." : "✅ Mark Done"}
                </button>
                <button
                  onClick={() => patch({ status: "cancelled" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-rose-900 bg-rose-950/20 px-4 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-950/40 transition disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "⏳ Wait..." : "❌ Cancel"}
                </button>
                <button
                  onClick={() => patch({ status: "pending" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-amber-900 bg-amber-950/20 px-4 py-2.5 text-sm font-bold text-amber-400 hover:bg-amber-950/40 transition disabled:opacity-50 ml-auto cursor-pointer"
                >
                  {updating ? "⏳ Wait..." : "🔓 Unlock Ticket"}
                </button>
              </>
            )}

            {(order.status === "done" || order.status === "cancelled") && (
              <button
                onClick={() => patch({ status: "pending" })}
                disabled={updating}
                className="flex items-center gap-1.5 rounded-full border border-amber-900 bg-amber-950/20 px-4 py-2.5 text-sm font-bold text-amber-400 hover:bg-amber-950/40 transition disabled:opacity-50 cursor-pointer"
              >
                {updating ? "⏳ Wait..." : "🔓 Unlock Ticket"}
              </button>
            )}
            <button
              onClick={() => onDelete(order.orderId)}
              disabled={updating}
              className="flex items-center justify-center h-10 w-10 rounded-full border border-slate-800 bg-slate-950 text-slate-400 hover:border-red-900 hover:text-red-400 transition disabled:opacity-50 ml-auto cursor-pointer"
            >
              🗑
            </button>
          </div>

          {order.status === "pending" && (
            <p className="mt-2 text-center text-[10px] text-red-400 font-semibold animate-pulse">
              🔊 Alarm is active — press KOT Printed to silence
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
  const [sortBy, setSortBy] = useState("oldest"); // oldest, newest, table

  // Set of order IDs that are pending and haven't been KOT-printed yet
  // Sound loops as long as this is non-empty
  const [pendingKotIds, setPendingKotIds] = useState(new Set());
  const loopRef = useRef(null); // setInterval reference
  const updatingOrderIdsRef = useRef(new Map()); // Map of orderId -> lastLocalActionTimestamp

  // Browser desktop notification helper
  const sendDesktopNotification = useCallback((title, body) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/icon.svg",
          tag: "crown-coffee-order"
        });
      } catch (err) {
        console.error("Desktop notification failed:", err);
      }
    }
  }, []);

  // Request Notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

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

  // ── 2-minute check reminder ──────────────────────────────────────────
  useEffect(() => {
    const triggerReminder = () => {
      const pendingCount = orders.filter((o) => o.status === "pending").length;
      if (pendingCount > 0) {
        sendDesktopNotification(
          "⚠️ Pending Orders Reminder",
          `You have ${pendingCount} pending order(s) waiting. Please check the portal!`
        );
        if (soundEnabled) {
          SOUND_PRESETS.double_ding?.fn();
        }
      }
    };

    const interval = setInterval(triggerReminder, 120_000); // 2 minutes (120,000 ms)
    return () => clearInterval(interval);
  }, [orders, soundEnabled, sendDesktopNotification]);

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
              sendDesktopNotification(
                `🔔 New Order ${order.orderNumber || ""}`,
                `Table ${order.tableName || "Kiosk"} placed a new order of ${order.items?.length || 0} item(s).`
              );
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
            if (lastAction && Date.now() - lastAction < 10000) {
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
  }, [soundEnabled, currentSoundKey, sendDesktopNotification]); // connect dependencies handled correctly

  // ── Polling fallback (ensures cross-device sync in serverless environments) ──
  useEffect(() => {
    async function pollOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const freshOrders = await res.json();
          
          setOrders((prev) => {
            return freshOrders.map((fresh) => {
              const exists = prev.some((o) => o.orderId === fresh.orderId);
              if (!exists && fresh.status === "pending") {
                sendDesktopNotification(
                  `🔔 New Order ${fresh.orderNumber || ""}`,
                  `Table ${fresh.tableName || "Kiosk"} placed a new order of ${fresh.items?.length || 0} item(s).`
                );
              }

              const lastAction = updatingOrderIdsRef.current.get(fresh.orderId);
              if (lastAction && Date.now() - lastAction < 10000) {
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
  }, [sendDesktopNotification]);

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

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime();
    }
    if (sortBy === "newest") {
      return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
    }
    if (sortBy === "table") {
      const tA = isNaN(a.tableNumber) ? 999 : Number(a.tableNumber);
      const tB = isNaN(b.tableNumber) ? 999 : Number(b.tableNumber);
      return tA - tB;
    }
    return 0;
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8 shadow-lg">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Performance Insights</h3>
          <p className="text-xs text-slate-400 mt-1">Real-time statistics of completed orders today.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
            <p className="text-2xl font-black text-white font-mono">৳{totalRevenue}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Sales</p>
          </div>
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
            <p className="text-2xl font-black text-white font-mono">{completedOrders.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</p>
          </div>
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
            <p className="text-2xl font-black text-white font-mono">৳{avgOrderValue}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Order Val</p>
          </div>
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
            <p className="text-2xl font-black text-white font-mono">{avgPrepText}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Prep Time</p>
          </div>
        </div>

        {/* Top Selling Categories */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Categories by Revenue</h4>
          {categoryData.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No sales data available yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map(([category, revenue]) => {
                const maxRevenue = Math.max(...categoryData.map((c) => c[1]));
                const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-200">{category}</span>
                      <span className="font-bold text-amber-500">৳{revenue}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
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
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans pb-24">
      {/* Ringing alert banner (top of page) */}
      {pendingKotIds.size > 0 && soundEnabled && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-red-600 py-3.5 px-4 shadow-lg border-b border-red-500/20">
          <span className="animate-ping h-2.5 w-2.5 rounded-full bg-white opacity-80 inline-block" />
          <span className="text-sm font-black text-white tracking-wide uppercase">
            🔊 ALARM — {pendingKotIds.size} active order{pendingKotIds.size > 1 ? "s" : ""} requiring attention — press KOT Printed to silence
          </span>
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-850 bg-slate-900/90 backdrop-blur-md shadow-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CrownMark className="h-6 w-6 text-amber-500" />
            <div>
              <p className="font-display text-lg font-bold text-white leading-none">Manager Portal</p>
              <p className="text-xs text-slate-400 mt-1">Crown Coffee Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection */}
            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${connected ? "border-emerald-800 bg-emerald-950/20 text-emerald-400" : "border-red-950/40 bg-red-950/20 text-red-400"}`}>
              <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              {connected ? "Live" : "Offline"}
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${soundEnabled ? "border-rose-900 bg-rose-950/25 text-rose-400 hover:bg-rose-950/40" : "border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"}`}
            >
              {soundEnabled ? "🔊 Sound ON" : "🔕 Muted"}
            </button>

            <button onClick={handleLogout} className="rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold hover:border-rose-900 hover:text-rose-400 transition cursor-pointer">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* Alert Tone Indicator */}
        <div className="rounded-2xl border border-slate-850 bg-slate-900/60 p-4 flex items-center justify-between gap-3 shadow-md backdrop-blur-xs">
          <div>
            <span className="text-sm font-semibold text-white">Alert Tone: {hasEscalatedOrder ? "🚨 Urgent Alarm" : "🎶 Classic Chime"}</span>
            <p className="text-xs text-slate-400 mt-0.5">This sound will ring continuously when a new order arrives until you press KOT Printed.</p>
          </div>
          <button
            onClick={() => SOUND_PRESETS[currentSoundKey].fn()}
            className="rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-amber-500 hover:text-amber-500 transition cursor-pointer"
          >
            ▶ Test Sound
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "🔴 Ringing",  value: pendingKotIds.size, color: "text-rose-400",          bg: "bg-rose-950/20 border-rose-900/40 shadow-rose-950/10" },
            { label: "⏳ Pending",  value: pendingCount,        color: "text-amber-400",         bg: "bg-amber-950/20 border-amber-900/40 shadow-amber-950/10" },
            { label: "✅ Done",     value: orders.filter((o) => o.status === "done").length, color: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-900/40 shadow-emerald-950/10" },
            { label: "📋 Total",    value: orders.length,       color: "text-slate-300",         bg: "bg-slate-900/60 border-slate-800" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 text-center shadow-md ${s.bg}`}>
              <p className={`font-mono text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-850 pb-3">
          <div className="flex gap-1.5 bg-slate-900 border border-slate-800/80 p-1 rounded-full">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer ${
                  tab === t.id
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "border border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${tab === t.id ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {tab !== "analytics" && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pb-2 sm:pb-0">
              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full border border-slate-800 bg-slate-900 py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-400 focus:border-slate-700 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="oldest">⏳ Oldest First (FIFO)</option>
                  <option value="newest">🆕 Newest First</option>
                  <option value="table">📍 Table Number</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[10px] text-slate-500">▼</span>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-500 pointer-events-none">🔍</span>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-slate-800 bg-slate-900 py-1.5 pl-8 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-slate-700 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order list / Analytics conditional */}
        {tab === "analytics" ? (
          renderAnalytics()
        ) : (
          <div className={`grid grid-cols-1 ${tab === "pending" ? "md:grid-cols-2 lg:grid-cols-3" : ""} gap-4`}>
            {sortedOrders.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <CrownMark className="h-12 w-12 text-slate-700 mb-4" />
                <p className="font-display text-xl font-bold text-white">
                  {tab === "pending" ? "No active orders" : "No orders here"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {tab === "pending"
                    ? "New orders will appear here instantly. The alarm will ring automatically."
                    : "Orders you manage will show up here."}
                </p>
              </div>
            ) : (
              sortedOrders.map((order) => {
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
