"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import CrownMark from "@/components/CrownMark";

// ─── Sound presets (Web Audio API — no files needed) ──────────────────────────
const SOUND_PRESETS = {
  gentle_bell:   { label: "Gentle Bell",    fn: playGentleBell },
  double_ding:   { label: "Double Ding",     fn: playDoubleDing },
  urgent_alarm:  { label: "Urgent Alarm",    fn: playUrgentAlarm },
  classic_chime: { label: "Classic Chime",   fn: playClassicChime },
  soft_ping:     { label: "Soft Ping",       fn: playSoftPing },
  cash_register: { label: "Cash Register",   fn: playCashRegister },
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

// ─── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  const time = now.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-BD", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  return (
    <div className="hidden sm:flex flex-col items-end leading-none select-none">
      <span className="font-mono text-sm font-semibold tracking-tight mp-clock-time">{time}</span>
      <span className="text-[10px] font-medium mt-0.5 mp-clock-date">{date}</span>
    </div>
  );
}

// ─── Icons (inline SVGs) ──────────────────────────────────────────────────────
const Icon = {
  chevronDown: (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>),
  chevronUp:   (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>),
  trash:       (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
  search:      (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>),
  volume:      (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" /></svg>),
  volumeOff:   (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>),
  play:        (<svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>),
  printer:     (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>),
  check:       (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>),
  x:           (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
  unlock:      (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>),
  logout:      (<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>),
  mapPin:      (<svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  user:        (<svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
  note:        (<svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
  clock:       (<svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  truck:       (<svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h10zm0 0l1 1h3a1 1 0 001-1v-5l-3.6-3.6A1 1 0 0014 7h-1v9z" /></svg>),
  // Theme icons
  sun: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  moon: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
};

// ─── Theme tokens ─────────────────────────────────────────────────────────────
// All colours are expressed as inline-style CSS variables on the root div.
// Tailwind classes use the mp-* semantic classes defined below via a <style> tag.
const DARK_THEME = {
  "--mp-bg":           "#0c0c0e",
  "--mp-surface":      "#111113",
  "--mp-surface2":     "#18181b",
  "--mp-border":       "rgba(255,255,255,0.06)",
  "--mp-border2":      "rgba(255,255,255,0.10)",
  "--mp-text":         "#f4f4f5",
  "--mp-text2":        "#a1a1aa",
  "--mp-text3":        "#52525b",
  "--mp-accent":       "#d97706",
  "--mp-accent-soft":  "rgba(217,119,6,0.12)",
  "--mp-red":          "#ef4444",
  "--mp-red-bg":       "rgba(239,68,68,0.08)",
  "--mp-red-border":   "rgba(239,68,68,0.20)",
  "--mp-green":        "#22c55e",
  "--mp-green-bg":     "rgba(34,197,94,0.10)",
  "--mp-sky":          "#38bdf8",
  "--mp-sky-bg":       "rgba(56,189,248,0.10)",
  "--mp-header-bg":    "rgba(12,12,14,0.90)",
  "--mp-input-bg":     "#111113",
  "--mp-shadow":       "0 1px 3px rgba(0,0,0,0.4)",
};
const LIGHT_THEME = {
  "--mp-bg":           "#f8f8f6",
  "--mp-surface":      "#ffffff",
  "--mp-surface2":     "#f1f1ef",
  "--mp-border":       "rgba(0,0,0,0.08)",
  "--mp-border2":      "rgba(0,0,0,0.14)",
  "--mp-text":         "#18181b",
  "--mp-text2":        "#52525b",
  "--mp-text3":        "#a1a1aa",
  "--mp-accent":       "#b45309",
  "--mp-accent-soft":  "rgba(180,83,9,0.08)",
  "--mp-red":          "#dc2626",
  "--mp-red-bg":       "rgba(220,38,38,0.06)",
  "--mp-red-border":   "rgba(220,38,38,0.18)",
  "--mp-green":        "#16a34a",
  "--mp-green-bg":     "rgba(22,163,74,0.08)",
  "--mp-sky":          "#0284c7",
  "--mp-sky-bg":       "rgba(2,132,199,0.08)",
  "--mp-header-bg":    "rgba(248,248,246,0.92)",
  "--mp-input-bg":     "#f1f1ef",
  "--mp-shadow":       "0 1px 3px rgba(0,0,0,0.10)",
};

// Inline styles applied directly (no Tailwind dark: needed)
const T = {
  bg:          { background: "var(--mp-bg)" },
  surface:     { background: "var(--mp-surface)", border: "1px solid var(--mp-border)", boxShadow: "var(--mp-shadow)" },
  surface2:    { background: "var(--mp-surface2)" },
  border:      { borderColor: "var(--mp-border)" },
  text:        { color: "var(--mp-text)" },
  text2:       { color: "var(--mp-text2)" },
  text3:       { color: "var(--mp-text3)" },
  accent:      { color: "var(--mp-accent)" },
  accentBg:    { background: "var(--mp-accent-soft)", border: "1px solid rgba(217,119,6,0.18)" },
  headerBg:    { background: "var(--mp-header-bg)", borderBottom: "1px solid var(--mp-border)", backdropFilter: "blur(12px)" },
  inputBg:     { background: "var(--mp-input-bg)", border: "1px solid var(--mp-border)", color: "var(--mp-text)" },
  card:        { background: "var(--mp-surface)", border: "1px solid var(--mp-border)", borderRadius: "12px", boxShadow: "var(--mp-shadow)" },
  divider:     { borderTop: "1px solid var(--mp-border)" },
  chip:        { background: "var(--mp-surface2)", border: "1px solid var(--mp-border)", color: "var(--mp-text2)", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "opacity 0.15s" },
};

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label: "Pending",   dot: "#ef4444", color: "#ef4444" },
  kot_printed: { label: "Cooking",   dot: "#f59e0b", color: "#f59e0b" },
  done:        { label: "Served",    dot: "#22c55e", color: "#22c55e" },
  cancelled:   { label: "Cancelled", dot: "#71717a", color: "#71717a" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 7px", borderRadius: "4px", background: cfg.color + "15", border: `1px solid ${cfg.color}30`, fontSize: "10px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: cfg.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function ElapsedTimer({ placedAt, status }) {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    if (status !== "pending" && status !== "kot_printed") { setElapsed(""); return; }
    const update = () => {
      const diff = Date.now() - new Date(placedAt).getTime();
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${m}:${String(s).padStart(2, "0")}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [placedAt, status]);
  if (!elapsed) return null;
  return (
    <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 500, color: "var(--mp-text3)" }}>
      {elapsed}
    </span>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange, onDelete, isNew, isRinging, isEscalated }) {
  const [expanded, setExpanded] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItemCheck = (idx) =>
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const patch = useCallback(async (payload) => {
    setUpdating(true);
    const full = payload.status === "done" ? { ...payload, completedAt: new Date().toISOString() } : payload;
    await onStatusChange(order.orderId, full);
    setUpdating(false);
  }, [order.orderId, onStatusChange]);

  const isInactive = order.status === "done" || order.status === "cancelled";
  const orderTypeMeta =
    order.tableNumber === "delivery" ? { label: "Delivery", short: "DEL" }
    : order.tableNumber === "tab"    ? { label: "Tab",      short: "TAB" }
    : { label: `Table ${order.tableNumber}`, short: `T${order.tableNumber}` };

  const cardExtra = isEscalated
    ? { border: "1px solid rgba(239,68,68,0.40)", boxShadow: "0 0 0 3px rgba(239,68,68,0.06)" }
    : isRinging
    ? { border: "1px solid rgba(239,68,68,0.20)" }
    : isNew
    ? { border: "1px solid rgba(217,119,6,0.25)" }
    : {};

  const btnBase = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
    padding: "7px 12px", transition: "opacity 0.15s", border: "none",
  };
  const btnGhost = {
    ...btnBase,
    background: "var(--mp-surface2)",
    border: "1px solid var(--mp-border)",
    color: "var(--mp-text2)",
  };
  const btnGreen  = { ...btnBase, background: "#16a34a", color: "#fff", flex: 1 };
  const btnSky    = { ...btnBase, background: "#0284c7", color: "#fff", flex: 1 };
  const btnDanger = { ...btnGhost, color: "var(--mp-red)" };
  const btnIcon   = { ...btnBase, background: "var(--mp-surface2)", border: "1px solid var(--mp-border)", color: "var(--mp-text3)", padding: "7px 9px" };

  return (
    <div style={{ ...T.card, ...cardExtra, opacity: isInactive ? 0.5 : 1, transition: "opacity 0.3s" }}>

      {/* Escalation strip */}
      {isEscalated && (
        <div style={{ borderRadius: "12px 12px 0 0", background: "var(--mp-red-bg)", borderBottom: "1px solid var(--mp-red-border)", padding: "6px 16px", display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mp-red)", animation: "pulse 1s infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--mp-red)" }}>
            Escalated — Pending over 4 minutes
          </span>
        </div>
      )}

      {/* New order strip */}
      {isNew && !isEscalated && order.status === "pending" && (
        <div style={{ borderRadius: "12px 12px 0 0", background: "var(--mp-accent-soft)", borderBottom: "1px solid rgba(217,119,6,0.18)", padding: "6px 16px", display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mp-accent)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--mp-accent)" }}>
            New Order
          </span>
        </div>
      )}

      {/* Header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--mp-surface2)", border: "1px solid var(--mp-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: "var(--mp-text2)" }}>
              {orderTypeMeta.short}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--mp-text)" }}>{orderTypeMeta.label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--mp-text3)" }}>{order.orderNumber}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <StatusPill status={order.status} />
              <ElapsedTimer placedAt={order.placedAt} status={order.status} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {order.status === "pending" && (
            <button onClick={(e) => { e.stopPropagation(); patch({ status: "kot_printed" }); }} disabled={updating}
              style={{ ...btnBase, background: "#16a34a", color: "#fff", padding: "6px 10px" }}>
              {Icon.printer}
            </button>
          )}
          {order.status === "kot_printed" && (
            <button onClick={(e) => { e.stopPropagation(); patch({ status: "done" }); }} disabled={updating}
              style={{ ...btnBase, background: "#0284c7", color: "#fff", padding: "6px 10px" }}>
              {Icon.check}
            </button>
          )}
          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--mp-accent)", minWidth: 52, textAlign: "right" }}>
            ৳{order.totalPrice}
          </span>
          <button onClick={(e) => { e.stopPropagation(); setExpanded((ev) => !ev); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--mp-text3)" }}>
            {expanded ? Icon.chevronUp : Icon.chevronDown}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ ...T.divider, padding: "12px 16px 16px" }}>
          <p style={{ fontSize: 11, color: "var(--mp-text3)", marginBottom: 10 }}>
            {formatTime(order.placedAt)} &middot; {timeSince(order.placedAt)} &middot; {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
          </p>

          {/* Items */}
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {(order.items || []).map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--mp-border)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
                    {!isInactive && (
                      <input type="checkbox" checked={isChecked} onChange={() => toggleItemCheck(idx)}
                        style={{ width: 14, height: 14, marginTop: 2, accentColor: "var(--mp-accent)", flexShrink: 0, cursor: "pointer" }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: isChecked ? "var(--mp-text3)" : "var(--mp-text)", textDecoration: isChecked ? "line-through" : "none", transition: "all 0.2s" }}>
                        {item.name}
                      </p>
                      {item.customizations && (
                        <p style={{ margin: "3px 0 0", fontSize: 10, color: isChecked ? "var(--mp-text3)" : "var(--mp-text2)", opacity: isChecked ? 0.4 : 1 }}>
                          {Object.entries(item.customizations).map(([, opt]) => {
                            if (Array.isArray(opt)) return opt.map((o) => o.name).join(", ");
                            return opt ? opt.name : "";
                          }).filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {item.specialRequest && (
                        <p style={{ margin: "2px 0 0", fontSize: 10, fontStyle: "italic", color: isChecked ? "var(--mp-text3)" : "var(--mp-accent)", opacity: isChecked ? 0.3 : 1 }}>
                          {item.specialRequest}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--mp-text3)", opacity: isChecked ? 0.4 : 1 }}>×{item.quantity}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: isChecked ? "var(--mp-text3)" : "var(--mp-text2)", textDecoration: isChecked ? "line-through" : "none" }}>৳{item.price * item.quantity}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Delivery charge */}
          {order.deliveryCharge > 0 && (
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <span style={{ fontSize: 10, color: "var(--mp-text3)" }}>
                Items ৳{order.totalPrice - order.deliveryCharge} + Delivery ৳{order.deliveryCharge}
              </span>
            </div>
          )}

          {/* Info rows */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {order.customerName && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "var(--mp-text2)" }}>
                {Icon.user}<span>{order.customerName}</span>
                <span style={{ color: "var(--mp-text3)" }}>&middot;</span>
                <span style={{ fontFamily: "monospace", color: "var(--mp-text3)" }}>{order.customerContact}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: "var(--mp-text2)" }}>
                {Icon.mapPin}<span style={{ whiteSpace: "pre-wrap" }}>{order.deliveryAddress}</span>
              </div>
            )}
            {order.specialNote && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, color: "var(--mp-text2)" }}>
                {Icon.note}<span>{order.specialNote}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "var(--mp-text3)" }}>
              {order.tableNumber === "delivery" ? Icon.truck : Icon.clock}
              <span>{order.tableNumber === "delivery" ? "Est. delivery 30–45 min" : "Est. prep 15–20 min"}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 16 }}>
            {order.status === "pending" && (
              <>
                <button onClick={() => patch({ status: "kot_printed" })} disabled={updating} style={btnGreen}>
                  {Icon.printer}{updating ? "Saving…" : "KOT Printed"}
                </button>
                <button onClick={() => patch({ status: "done" })} disabled={updating} style={btnGhost}>
                  {Icon.check}{updating ? "…" : "Done"}
                </button>
                <button onClick={() => patch({ status: "cancelled" })} disabled={updating} style={btnDanger}>
                  {Icon.x}{updating ? "…" : "Cancel"}
                </button>
              </>
            )}
            {order.status === "kot_printed" && (
              <>
                <button onClick={() => patch({ status: "done" })} disabled={updating} style={btnSky}>
                  {Icon.check}{updating ? "Saving…" : "Mark Served"}
                </button>
                <button onClick={() => patch({ status: "cancelled" })} disabled={updating} style={btnDanger}>
                  {Icon.x}
                </button>
                <button onClick={() => patch({ status: "pending" })} disabled={updating} style={{ ...btnIcon, marginLeft: "auto" }}>
                  {Icon.unlock}
                </button>
              </>
            )}
            {isInactive && (
              <button onClick={() => patch({ status: "pending" })} disabled={updating} style={btnGhost}>
                {Icon.unlock} Reopen
              </button>
            )}
            <button onClick={() => onDelete(order.orderId)} disabled={updating}
              style={{ ...btnIcon, marginLeft: isInactive ? "auto" : (order.status === "kot_printed" ? 0 : "auto"), color: "var(--mp-red)" }}>
              {Icon.trash}
            </button>
          </div>

          {order.status === "pending" && (
            <p style={{ marginTop: 8, textAlign: "center", fontSize: 10, color: "var(--mp-red)", opacity: 0.7 }}>
              Alarm active — press KOT Printed to silence
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsPanel({ orders }) {
  const completedOrders = orders.filter((o) => o.status === "done");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
  const ordersWithPrep = completedOrders.filter((o) => o.completedAt);
  let avgPrepText = "—";
  if (ordersWithPrep.length > 0) {
    const total = ordersWithPrep.reduce((sum, o) => sum + (new Date(o.completedAt) - new Date(o.placedAt)) / 60000, 0);
    avgPrepText = `${Math.round(total / ordersWithPrep.length)}m`;
  }
  const categorySales = {};
  completedOrders.forEach((o) =>
    (o.items || []).forEach((item) => {
      const cat = item.category || "Other";
      categorySales[cat] = (categorySales[cat] || 0) + item.price * item.quantity;
    })
  );
  const categoryData = Object.entries(categorySales).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxRev = Math.max(...categoryData.map((c) => c[1]), 1);

  const metrics = [
    { label: "Total Revenue",  value: `৳${totalRevenue}` },
    { label: "Completed",      value: completedOrders.length },
    { label: "Avg Order",      value: `৳${avgOrderValue}` },
    { label: "Avg Prep Time",  value: avgPrepText },
  ];

  return (
    <div style={T.card}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--mp-border)" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--mp-text)" }}>Performance Insights</h3>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--mp-text3)" }}>Statistics from completed orders in this session.</p>
      </div>
      <div style={{ padding: 20 }}>
        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 24 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ ...T.surface2, border: "1px solid var(--mp-border)", borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: "var(--mp-text)" }}>{m.value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 10, fontWeight: 600, color: "var(--mp-text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</p>
            </div>
          ))}
        </div>
        {/* Category bar chart */}
        {categoryData.length > 0 ? (
          <div>
            <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 600, color: "var(--mp-text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue by Category</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {categoryData.map(([cat, rev]) => (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
                    <span style={{ fontWeight: 500, color: "var(--mp-text2)" }}>{cat}</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--mp-accent)" }}>৳{rev}</span>
                  </div>
                  <div style={{ height: 4, background: "var(--mp-surface2)", borderRadius: 4, overflow: "hidden", border: "1px solid var(--mp-border)" }}>
                    <div style={{ height: "100%", background: "var(--mp-accent)", borderRadius: 4, width: `${(rev / maxRev) * 100}%`, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--mp-text3)", padding: "24px 0" }}>No sales data yet.</p>
        )}
      </div>
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
  const [sortBy, setSortBy] = useState("oldest");
  const [pendingKotIds, setPendingKotIds] = useState(new Set());
  const [isDark, setIsDark] = useState(true); // default dark
  const loopRef = useRef(null);
  const updatingOrderIdsRef = useRef(new Map());

  // Load theme preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mp-theme");
      if (saved === "light") setIsDark(false);
      else setIsDark(true);
    } catch { }
  }, []);

  const toggleTheme = () => {
    setIsDark((d) => {
      const next = !d;
      try { localStorage.setItem("mp-theme", next ? "dark" : "light"); } catch { }
      return next;
    });
  };

  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const sendDesktopNotification = useCallback((title, body) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try { new Notification(title, { body, icon: "/icon.svg", tag: "crown-coffee-order" }); } catch { }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const check = () => {
      const escalated = orders.filter((o) => o.status === "pending").some((o) =>
        Date.now() - new Date(o.placedAt).getTime() > 4 * 60 * 1000
      );
      setHasEscalatedOrder(escalated);
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, [orders]);

  const currentSoundKey = hasEscalatedOrder ? "urgent_alarm" : "classic_chime";

  useEffect(() => {
    if (pendingKotIds.size > 0 && soundEnabled) {
      if (loopRef.current) { clearInterval(loopRef.current); loopRef.current = null; }
      const play = () => SOUND_PRESETS[currentSoundKey]?.fn();
      play();
      loopRef.current = setInterval(play, currentSoundKey === "urgent_alarm" ? 1000 : 2000);
    } else {
      if (loopRef.current) { clearInterval(loopRef.current); loopRef.current = null; }
    }
  }, [pendingKotIds, soundEnabled, currentSoundKey]);

  useEffect(() => () => { if (loopRef.current) clearInterval(loopRef.current); }, []);

  useEffect(() => {
    setPendingKotIds(new Set(
      (initialOrders || []).filter((o) => o.status === "pending").map((o) => o.orderId)
    ));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const n = orders.filter((o) => o.status === "pending").length;
    document.title = n > 0 ? `(${n}) Manager Portal | Crown Coffee` : "Manager Portal | Crown Coffee";
  }, [orders]);

  useEffect(() => {
    const t = setInterval(() => {
      const n = orders.filter((o) => o.status === "pending").length;
      if (n > 0) {
        sendDesktopNotification("Pending Orders Reminder", `${n} order${n > 1 ? "s" : ""} waiting.`);
        if (soundEnabled) SOUND_PRESETS.double_ding?.fn();
      }
    }, 120_000);
    return () => clearInterval(t);
  }, [orders, soundEnabled, sendDesktopNotification]);

  useEffect(() => {
    function connect() {
      const es = new EventSource("/api/orders/stream");
      es.onopen = () => setConnected(true);
      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "connected") { setConnected(true); }
          else if (msg.type === "new_order") {
            const order = msg.order;
            setOrders((prev) => {
              if (prev.some((o) => o.orderId === order.orderId)) return prev;
              sendDesktopNotification(`New Order ${order.orderNumber || ""}`, `Table ${order.tableName || "Kiosk"} — ${order.items?.length || 0} item(s).`);
              return [order, ...prev];
            });
            setNewOrderIds((prev) => new Set([...prev, order.orderId]));
            if (order.status === "pending" && soundEnabled) SOUND_PRESETS[currentSoundKey]?.fn();
            if (order.status === "pending") setPendingKotIds((prev) => new Set([...prev, order.orderId]));
            setTimeout(() => setNewOrderIds((prev) => { const n = new Set(prev); n.delete(order.orderId); return n; }), 8000);
          } else if (msg.type === "order_updated") {
            const order = msg.order;
            // SSE updates always apply — they come from OTHER devices/tabs.
            // Don't check the local lock here.
            setOrders((prev) => prev.map((o) => o.orderId === order.orderId ? order : o));
            if (order.status !== "pending") setPendingKotIds((prev) => { const n = new Set(prev); n.delete(order.orderId); return n; });
            if (order.status === "pending") setPendingKotIds((prev) => new Set([...prev, order.orderId]));
          }
        } catch { }
      };
      es.onerror = () => { setConnected(false); es.close(); setTimeout(connect, 3000); };
    }
    connect();
  }, [soundEnabled, currentSoundKey, sendDesktopNotification]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const poll = async () => {
      try {
        // cache: no-store ensures Vercel's edge cache never serves stale data
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (!res.ok) return;
        const fresh = await res.json();
        setOrders((prev) => {
          const prevMap = Object.fromEntries(prev.map((o) => [o.orderId, o]));
          let hasNew = false;
          const merged = fresh.map((f) => {
            // Detect truly new orders for desktop notification
            if (!prevMap[f.orderId] && f.status === "pending") {
              sendDesktopNotification(`New Order ${f.orderNumber || ""}`, `${f.items?.length || 0} item(s).`);
              hasNew = true;
            }
            // Short lock (2s): suppress the very next poll after a local PATCH
            // so our optimistic update isn't overwritten before R2 saves.
            const last = updatingOrderIdsRef.current.get(f.orderId);
            if (last && Date.now() - last < 2000) return prevMap[f.orderId] || f;
            return f;
          });
          // Clear expired locks
          for (const [id, ts] of updatingOrderIdsRef.current) {
            if (Date.now() - ts >= 2000) updatingOrderIdsRef.current.delete(id);
          }
          return merged;
        });
        setPendingKotIds(new Set(fresh.filter((o) => o.status === "pending").map((o) => o.orderId)));
      } catch { }
    };
    // Poll every 2.5 seconds — fast enough to feel live, slow enough to not spam R2
    const t = setInterval(poll, 2500);
    return () => clearInterval(t);
  }, [sendDesktopNotification]);

  const handleStatusChange = useCallback(async (orderId, p) => {
    // Optimistic update — show the change immediately in the UI
    setOrders((prev) => prev.map((o) => o.orderId === orderId ? { ...o, ...p } : o));
    if (p.status && p.status !== "pending") setPendingKotIds((prev) => { const n = new Set(prev); n.delete(orderId); return n; });
    if (p.status === "pending") setPendingKotIds((prev) => new Set([...prev, orderId]));
    // Set a short 2-second lock so the next poll doesn't overwrite our optimistic state
    updatingOrderIdsRef.current.set(orderId, Date.now());
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
      if (res.ok) {
        const data = await res.json();
        // Confirm with the actual server response, then clear the lock
        setOrders((prev) => prev.map((o) => o.orderId === orderId ? data.order : o));
        updatingOrderIdsRef.current.delete(orderId);
      } else throw new Error();
    } catch {
      alert("Failed to save. Please try again.");
      // Revert the optimistic update on failure
      updatingOrderIdsRef.current.delete(orderId);
    }
  }, []);

  const handleDelete = useCallback(async (orderId) => {
    if (!confirm("Permanently delete this order?")) return;
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    setPendingKotIds((prev) => { const n = new Set(prev); n.delete(orderId); return n; });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/manager-auth", { method: "DELETE" });
    window.location.href = "/manager/login";
  };

  // Derived
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const filtered = orders.filter((o) => {
    if (tab === "pending" && o.status !== "pending" && o.status !== "kot_printed") return false;
    if (tab === "done" && o.status !== "done" && o.status !== "cancelled") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        String(o.tableNumber).toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.items && o.items.some((i) => i.name.toLowerCase().includes(q)))
      );
    }
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.placedAt) - new Date(b.placedAt);
    if (sortBy === "newest") return new Date(b.placedAt) - new Date(a.placedAt);
    if (sortBy === "table") {
      const tA = isNaN(a.tableNumber) ? 999 : Number(a.tableNumber);
      const tB = isNaN(b.tableNumber) ? 999 : Number(b.tableNumber);
      return tA - tB;
    }
    return 0;
  });

  const tabs = [
    { id: "pending",   label: "Active",    count: orders.filter((o) => o.status === "pending" || o.status === "kot_printed").length },
    { id: "done",      label: "Completed", count: orders.filter((o) => o.status === "done" || o.status === "cancelled").length },
    { id: "all",       label: "All",       count: orders.length },
    { id: "analytics", label: "Insights",  count: 0 },
  ];

  const stats = [
    { label: "Ringing",  value: pendingKotIds.size,                                  color: pendingKotIds.size > 0 ? "var(--mp-red)" : "var(--mp-text3)" },
    { label: "Pending",  value: pendingCount,                                          color: pendingCount > 0 ? "var(--mp-accent)" : "var(--mp-text3)" },
    { label: "Served",   value: orders.filter((o) => o.status === "done").length,    color: "var(--mp-green)" },
    { label: "Total",    value: orders.length,                                         color: "var(--mp-text2)" },
  ];

  const chipBtn = (onClick, children, extra = {}) => (
    <button onClick={onClick} style={{ ...T.chip, ...extra }}>{children}</button>
  );

  return (
    <div style={{ ...T.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", ...theme, transition: "background 0.25s, color 0.25s" }}>

      {/* Keyframes for pulse (escalation strip) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes mpPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .mp-clock-time { color: var(--mp-text); }
        .mp-clock-date { color: var(--mp-text3); }
      `}</style>

      {/* Alarm banner */}
      {pendingKotIds.size > 0 && soundEnabled && (
        <div style={{ position: "sticky", top: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: isDark ? "rgba(120,10,10,0.85)" : "rgba(220,38,38,0.10)", borderBottom: "1px solid var(--mp-red-border)", backdropFilter: "blur(10px)", padding: "10px 16px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mp-red)", animation: "mpPulse 1s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--mp-red)", letterSpacing: "0.03em" }}>
            {pendingKotIds.size} order{pendingKotIds.size > 1 ? "s" : ""} awaiting KOT — press KOT Printed to silence alarm
          </span>
        </div>
      )}

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, ...T.headerBg }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 16 }}>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CrownMark style={{ width: 20, height: 20, color: "var(--mp-accent)" }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--mp-text)", lineHeight: 1 }}>Crown Coffee</p>
              <p style={{ margin: "3px 0 0", fontSize: 9, fontWeight: 500, color: "var(--mp-text3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Manager Portal</p>
            </div>
          </div>

          {/* Clock */}
          <LiveClock />

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Live status */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20, border: `1px solid ${connected ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.25)"}`, fontSize: 10, fontWeight: 500, color: connected ? "var(--mp-green)" : "var(--mp-red)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "var(--mp-green)" : "var(--mp-red)", animation: connected ? "mpPulse 2s infinite" : "none" }} />
              {connected ? "Live" : "Offline"}
            </div>

            {/* Sound toggle */}
            {chipBtn(() => setSoundEnabled((s) => !s), <>{soundEnabled ? Icon.volume : Icon.volumeOff}{soundEnabled ? "Sound" : "Muted"}</>)}

            {/* Test sound */}
            {chipBtn(() => SOUND_PRESETS[currentSoundKey].fn(), <>{Icon.play}Test</>)}

            {/* Theme toggle */}
            {chipBtn(toggleTheme, isDark ? <>{Icon.sun}Light</> : <>{Icon.moon}Dark</>)}

            {/* Logout */}
            {chipBtn(handleLogout, <>{Icon.logout}Sign out</>, { color: "var(--mp-red)" })}
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ ...T.card, padding: "14px 16px", textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 600, color: "var(--mp-text3)", textTransform: "uppercase", letterSpacing: "0.09em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs + search */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          {/* Tab bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--mp-surface)", border: "1px solid var(--mp-border)", borderRadius: 10, padding: 4 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                  borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", border: "none",
                  background: tab === t.id ? "var(--mp-surface2)" : "transparent",
                  color: tab === t.id ? "var(--mp-text)" : "var(--mp-text3)",
                  boxShadow: tab === t.id ? "var(--mp-shadow)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
                {t.count > 0 && (
                  <span style={{
                    padding: "1px 6px", borderRadius: 20, fontSize: 9, fontWeight: 700,
                    background: tab === t.id ? "var(--mp-accent)" : "var(--mp-surface2)",
                    color: tab === t.id ? "#fff" : "var(--mp-text3)",
                    border: `1px solid ${tab === t.id ? "transparent" : "var(--mp-border)"}`,
                  }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          {tab !== "analytics" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ ...T.inputBg, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer", outline: "none", appearance: "none" }}
              >
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
                <option value="table">By table</option>
              </select>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--mp-text3)", pointerEvents: "none" }}>
                  {Icon.search}
                </span>
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...T.inputBg, borderRadius: 8, padding: "6px 12px 6px 32px", fontSize: 11, width: 170, outline: "none" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {tab === "analytics" ? (
          <AnalyticsPanel orders={orders} />
        ) : sorted.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
            <CrownMark style={{ width: 36, height: 36, color: "var(--mp-text3)", marginBottom: 14, opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--mp-text2)" }}>
              {tab === "pending" ? "No active orders" : "No orders here"}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--mp-text3)" }}>
              {tab === "pending" ? "New orders will appear instantly. Alarm will ring automatically." : "Orders you manage will appear here."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: tab === "pending" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr", gap: 12 }}>
            {sorted.map((order) => {
              const isEscalated = order.status === "pending" && Date.now() - new Date(order.placedAt) > 4 * 60 * 1000;
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
