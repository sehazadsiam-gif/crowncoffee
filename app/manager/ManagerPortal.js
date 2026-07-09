"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import CrownMark from "@/components/CrownMark";

// ─── Sound presets (Web Audio API — no files needed) ─────────────────────────
const SOUND_PRESETS = {
  gentle_bell: { label: "🔔 Gentle Bell", fn: playGentleBell },
  double_ding: { label: "🎵 Double Ding", fn: playDoubleDing },
  urgent_alarm: { label: "🚨 Urgent Alarm", fn: playUrgentAlarm },
  classic_chime: { label: "🎶 Classic Chime", fn: playClassicChime },
  soft_ping: { label: "💫 Soft Ping", fn: playSoftPing },
  cash_register: { label: "💰 Cash Register", fn: playCashRegister },
};

function getAudioCtx() {
  if (typeof window === "undefined") return null;
  if (!window._crownAudioCtx) {
    window._crownAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser requires user gesture first)
  if (window._crownAudioCtx.state === "suspended") {
    window._crownAudioCtx.resume();
  }
  return window._crownAudioCtx;
}

function playTone(freq, type, duration, gain = 0.5, startTime = 0, decay = true) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime + startTime);
  if (decay) gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration + 0.05);
}

function playGentleBell() {
  playTone(880, "sine", 1.2, 0.4);
  playTone(1320, "sine", 0.8, 0.2, 0.1);
}

function playDoubleDing() {
  playTone(1046, "sine", 0.6, 0.5);
  playTone(1318, "sine", 0.6, 0.5, 0.5);
}

function playUrgentAlarm() {
  for (let i = 0; i < 4; i++) {
    playTone(880, "square", 0.15, 0.3, i * 0.2);
    playTone(1100, "square", 0.15, 0.3, i * 0.2 + 0.1);
  }
}

function playClassicChime() {
  [523, 659, 784, 1046].forEach((f, i) => playTone(f, "sine", 0.8, 0.4, i * 0.18));
}

function playSoftPing() {
  playTone(1200, "sine", 0.8, 0.3);
}

function playCashRegister() {
  playTone(1500, "square", 0.05, 0.5);
  playTone(2000, "square", 0.05, 0.5, 0.08);
  playTone(1500, "sine", 0.6, 0.4, 0.15);
}

// ─── Helper: format timestamp ─────────────────────────────────────────────────
function formatTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleString("en-BD", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", hour12: true });
}

function timeSince(isoStr) {
  if (!isoStr) return "";
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    done: "bg-green-100 text-green-700 border-green-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
  };
  const labels = { pending: "⏳ Pending", done: "✅ Done", cancelled: "❌ Cancelled" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${map[status] || map.pending}`}>
      {labels[status] || status}
    </span>
  );
}

// ─── Order card ────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange, onDelete, isNew }) {
  const [expanded, setExpanded] = useState(true);
  const [updating, setUpdating] = useState(false);

  const patch = useCallback(async (payload) => {
    setUpdating(true);
    await onStatusChange(order.orderId, payload);
    setUpdating(false);
  }, [order.orderId, onStatusChange]);

  return (
    <div className={`rounded-2xl border-2 bg-white shadow-sm transition-all duration-500 ${
      isNew ? "border-[var(--accent)] shadow-[0_0_0_3px_rgba(182,134,44,0.15)]" : "border-[var(--line)]"
    } ${order.status === "done" ? "opacity-60" : ""}`}>
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start gap-3">
          {/* Table circle */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-display text-lg font-black"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}>
            {order.tableNumber}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-lg font-bold text-[var(--ink)]">Table {order.tableNumber}</span>
              <span className="font-mono text-sm font-bold text-[var(--accent)]">{order.orderNumber}</span>
              <StatusBadge status={order.status} />
              {isNew && <span className="animate-pulse rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-widest">NEW</span>}
            </div>
            <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
              {formatTime(order.placedAt)} · {timeSince(order.placedAt)} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-display text-lg font-bold text-[var(--accent)]">&#2547;{order.totalPrice}</span>
          <svg className={`h-4 w-4 text-[var(--ink-soft)] transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[var(--line)] px-5 pb-5">
          {/* Items */}
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
                  <span className="text-sm font-bold text-[var(--ink)]">&#2547;{item.price * item.quantity}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* Special note */}
          {order.specialNote && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-xs text-amber-800"><strong>Order note:</strong> {order.specialNote}</p>
            </div>
          )}

          {/* Wait time */}
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
            <p className="text-xs text-blue-800 font-semibold">⏱ Estimated prep: 15–20 minutes</p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {order.status === "pending" && (
              <>
                <button
                  onClick={() => patch({ status: "done" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition disabled:opacity-50"
                >
                  ✅ Mark Done
                </button>
                <button
                  onClick={() => patch({ status: "cancelled" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full bg-red-100 border border-red-300 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                >
                  ❌ Cancel
                </button>
              </>
            )}
            {(order.status === "done" || order.status === "cancelled") && (
              <button
                onClick={() => patch({ status: "pending" })}
                disabled={updating}
                className="flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-200 transition disabled:opacity-50"
              >
                🔓 Unlock Ticket
              </button>
            )}
            <button
              onClick={() => onDelete(order.orderId)}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--ink-soft)] hover:border-red-300 hover:text-red-600 transition disabled:opacity-50 ml-auto"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Manager Portal ──────────────────────────────────────────────────────
export default function ManagerPortal({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [tab, setTab] = useState("pending"); // pending | done | all
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [soundKey, setSoundKey] = useState("gentle_bell");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const eventSourceRef = useRef(null);

  // Update pending count whenever orders change
  useEffect(() => {
    const count = orders.filter(o => o.status === "pending").length;
    setPendingCount(count);
    // Update browser tab title
    document.title = count > 0 ? `(${count}) Manager Portal | Crown Coffee` : "Manager Portal | Crown Coffee";
  }, [orders]);

  // SSE connection
  useEffect(() => {
    function connect() {
      const es = new EventSource("/api/orders/stream");
      eventSourceRef.current = es;

      es.onopen = () => setConnected(true);

      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "connected") {
            setConnected(true);
          } else if (msg.type === "new_order") {
            setOrders(prev => [msg.order, ...prev]);
            setNewOrderIds(prev => new Set([...prev, msg.order.orderId]));
            if (soundEnabled) {
              SOUND_PRESETS[soundKey]?.fn();
            }
            // Remove "new" highlight after 8 seconds
            setTimeout(() => {
              setNewOrderIds(prev => {
                const next = new Set(prev);
                next.delete(msg.order.orderId);
                return next;
              });
            }, 8000);
          } else if (msg.type === "order_updated") {
            setOrders(prev => prev.map(o => o.orderId === msg.order.orderId ? msg.order : o));
          }
        } catch { /* ignore parse errors */ }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };
    }

    connect();
    return () => eventSourceRef.current?.close();
  }, [soundKey, soundEnabled]);

  const handleStatusChange = useCallback(async (orderId, patch) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(prev => prev.map(o => o.orderId === orderId ? data.order : o));
    }
  }, []);

  const handleDelete = useCallback(async (orderId) => {
    if (!confirm("Delete this order permanently?")) return;
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/manager-auth", { method: "DELETE" });
    window.location.href = "/manager/login";
  };

  const testSound = () => {
    SOUND_PRESETS[soundKey]?.fn();
  };

  // Filter orders based on tab
  const filteredOrders = orders.filter(o => {
    if (tab === "pending") return o.status === "pending";
    if (tab === "done") return o.status === "done" || o.status === "cancelled";
    return true;
  });

  const tabs = [
    { id: "pending", label: `⏳ Pending`, count: orders.filter(o => o.status === "pending").length },
    { id: "done", label: `✅ Done / Cancelled`, count: orders.filter(o => o.status === "done" || o.status === "cancelled").length },
    { id: "all", label: `📋 All Orders`, count: orders.length },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)]">
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
            {/* Connection status */}
            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${connected ? "border-green-300 bg-green-50 text-green-700" : "border-red-300 bg-red-50 text-red-700"}`}>
              <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              {connected ? "Live" : "Reconnecting…"}
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(s => !s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${soundEnabled ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--ink-soft)]"}`}
            >
              {soundEnabled ? "🔔 Sound ON" : "🔕 Sound OFF"}
            </button>

            <button onClick={handleLogout} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold hover:border-red-300 hover:text-red-600 transition">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* Sound picker */}
        <div className="rounded-2xl border border-[var(--line)] bg-white p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-[var(--ink)]">Alert Sound:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SOUND_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setSoundKey(key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${soundKey === key ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <button
            onClick={testSound}
            className="ml-auto rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
          >
            ▶ Test
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", value: orders.filter(o => o.status === "pending").length, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
            { label: "Done Today", value: orders.filter(o => o.status === "done").length, color: "text-green-600", bg: "bg-green-50 border-green-200" },
            { label: "Total Orders", value: orders.length, color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)] border-[var(--line)]" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.bg}`}>
              <p className={`font-display text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-[var(--line)]">
          {tabs.map(t => (
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
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  tab === t.id ? "bg-[var(--accent)] text-white" : "bg-[var(--line)] text-[var(--ink-soft)]"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Order list */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CrownMark className="h-12 w-12 text-[var(--accent)] opacity-20 mb-4" />
              <p className="font-display text-xl font-bold text-[var(--ink)]">
                {tab === "pending" ? "No pending orders" : "No orders here"}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                {tab === "pending"
                  ? "New orders will appear here instantly when customers place them."
                  : "Orders you manage will show up here."}
              </p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order.orderId}
                order={order}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                isNew={newOrderIds.has(order.orderId)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
