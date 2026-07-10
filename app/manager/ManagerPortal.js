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

// ─── Icons (inline SVGs — no emoji) ──────────────────────────────────────────
const Icon = {
  chevronDown: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronUp: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ),
  trash: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  search: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  volume: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
    </svg>
  ),
  volumeOff: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  bell: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  play: (
    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  printer: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  ),
  check: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  unlock: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  ),
  logout: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  mapPin: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  user: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  note: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  clock: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  truck: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h10zm0 0l1 1h3a1 1 0 001-1v-5l-3.6-3.6A1 1 0 0014 7h-1v9z" />
    </svg>
  ),
};

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label: "Pending",   dot: "bg-red-500",     text: "text-red-400",     ring: "ring-red-500/20" },
  kot_printed: { label: "Cooking",   dot: "bg-amber-400",   text: "text-amber-400",   ring: "ring-amber-400/20" },
  done:        { label: "Served",    dot: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/20" },
  cancelled:   { label: "Cancelled", dot: "bg-neutral-600", text: "text-neutral-500", ring: "ring-neutral-600/20" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${cfg.text} bg-white/5 border border-white/8`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
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
    <span className="font-mono text-[10px] font-medium text-neutral-500 tabular-nums">
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
    const fullPayload = payload.status === "done"
      ? { ...payload, completedAt: new Date().toISOString() }
      : payload;
    await onStatusChange(order.orderId, fullPayload);
    setUpdating(false);
  }, [order.orderId, onStatusChange]);

  const isInactive = order.status === "done" || order.status === "cancelled";
  const orderTypeMeta =
    order.tableNumber === "delivery" ? { label: "Delivery", short: "DEL" }
    : order.tableNumber === "tab"    ? { label: "Tab", short: "TAB" }
    : { label: `Table ${order.tableNumber}`, short: `T${order.tableNumber}` };

  const ringBorder = isEscalated
    ? "border-red-500/60 shadow-[0_0_0_1px_rgba(239,68,68,0.15)]"
    : isRinging
    ? "border-red-400/30"
    : isNew
    ? "border-amber-500/30"
    : "border-white/6";

  return (
    <div className={`rounded-xl border bg-[#111113] transition-all duration-300 ${ringBorder} ${isInactive ? "opacity-45 hover:opacity-70 transition-opacity" : ""}`}>

      {/* Escalation strip */}
      {isEscalated && (
        <div className="rounded-t-xl bg-red-950/60 border-b border-red-500/20 px-4 py-1.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
            Escalated — Pending over 4 minutes
          </span>
        </div>
      )}

      {/* New order strip */}
      {isNew && !isEscalated && order.status === "pending" && (
        <div className="rounded-t-xl bg-amber-950/40 border-b border-amber-500/15 px-4 py-1.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            New Order
          </span>
        </div>
      )}

      {/* Card header */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Left: order type badge + meta */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/8">
            <span className="text-[11px] font-bold text-neutral-300 tracking-tight font-mono">
              {orderTypeMeta.short}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white leading-none">
                {orderTypeMeta.label}
              </span>
              <span className="font-mono text-xs font-medium text-neutral-500">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StatusPill status={order.status} />
              <ElapsedTimer placedAt={order.placedAt} status={order.status} />
            </div>
          </div>
        </div>

        {/* Right: price + quick actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {order.status === "pending" && (
            <button
              onClick={(e) => { e.stopPropagation(); patch({ status: "kot_printed" }); }}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              {Icon.printer}
              <span className="hidden sm:inline">KOT</span>
            </button>
          )}
          {order.status === "kot_printed" && (
            <button
              onClick={(e) => { e.stopPropagation(); patch({ status: "done" }); }}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              {Icon.check}
              <span className="hidden sm:inline">Serve</span>
            </button>
          )}
          <span className="text-sm font-bold text-amber-400 font-mono min-w-[52px] text-right">
            ৳{order.totalPrice}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((ev) => !ev); }}
            className="p-1 text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
          >
            {expanded ? Icon.chevronUp : Icon.chevronDown}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-4">

          {/* Metadata row */}
          <p className="mt-3 text-[11px] text-neutral-600">
            {formatTime(order.placedAt)} &middot; {timeSince(order.placedAt)} &middot; {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
          </p>

          {/* Item list */}
          <ul className="mt-3 divide-y divide-white/4">
            {(order.items || []).map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <li key={idx} className="flex items-start justify-between py-2.5 gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {!isInactive && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItemCheck(idx)}
                        className="mt-0.5 h-3.5 w-3.5 rounded-sm border border-white/15 bg-white/5 text-amber-400 focus:ring-0 cursor-pointer accent-amber-500"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug transition-all ${isChecked ? "line-through text-neutral-700" : "text-neutral-200"}`}>
                        {item.name}
                      </p>
                      {item.customizations && (
                        <p className={`text-[10px] mt-0.5 font-normal transition-all ${isChecked ? "text-neutral-800" : "text-neutral-600"}`}>
                          {Object.entries(item.customizations)
                            .map(([, opt]) => {
                              if (Array.isArray(opt)) return opt.map((o) => o.name).join(", ");
                              return opt ? opt.name : "";
                            })
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      {item.specialRequest && (
                        <p className={`text-[10px] mt-0.5 italic transition-all ${isChecked ? "text-neutral-800" : "text-amber-600/80"}`}>
                          {item.specialRequest}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-mono transition-all ${isChecked ? "text-neutral-800" : "text-neutral-600"}`}>
                      ×{item.quantity}
                    </span>
                    <span className={`text-xs font-semibold font-mono transition-all ${isChecked ? "line-through text-neutral-700" : "text-neutral-300"}`}>
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Delivery charge */}
          {order.deliveryCharge > 0 && (
            <div className="mt-2 pt-2 border-t border-white/4 flex justify-end">
              <span className="text-[10px] text-neutral-600">
                Items ৳{order.totalPrice - order.deliveryCharge} + Delivery ৳{order.deliveryCharge}
              </span>
            </div>
          )}

          {/* Info pills */}
          <div className="mt-3 space-y-2">
            {order.customerName && (
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                {Icon.user}
                <span>{order.customerName}</span>
                <span className="text-neutral-600">&middot;</span>
                <span className="font-mono text-neutral-500">{order.customerContact}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div className="flex items-start gap-2 text-[11px] text-neutral-400">
                {Icon.mapPin}
                <span className="whitespace-pre-wrap">{order.deliveryAddress}</span>
              </div>
            )}
            {order.specialNote && (
              <div className="flex items-start gap-2 text-[11px] text-neutral-400">
                {Icon.note}
                <span>{order.specialNote}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[11px] text-neutral-600">
              {order.tableNumber === "delivery" ? Icon.truck : Icon.clock}
              <span>
                {order.tableNumber === "delivery" ? "Est. delivery 30–45 min" : "Est. prep 15–20 min"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {order.status === "pending" && (
              <>
                <button
                  onClick={() => patch({ status: "kot_printed" })}
                  disabled={updating}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {Icon.printer}
                  {updating ? "Saving…" : "KOT Printed"}
                </button>
                <button
                  onClick={() => patch({ status: "done" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {Icon.check}
                  {updating ? "…" : "Done"}
                </button>
                <button
                  onClick={() => patch({ status: "cancelled" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-red-950/40 px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {Icon.x}
                  {updating ? "…" : "Cancel"}
                </button>
              </>
            )}

            {order.status === "kot_printed" && (
              <>
                <button
                  onClick={() => patch({ status: "done" })}
                  disabled={updating}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {Icon.check}
                  {updating ? "Saving…" : "Mark Served"}
                </button>
                <button
                  onClick={() => patch({ status: "cancelled" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-red-950/40 px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {Icon.x}
                </button>
                <button
                  onClick={() => patch({ status: "pending" })}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 px-3 py-2 text-xs font-semibold text-neutral-500 transition-colors disabled:opacity-40 ml-auto cursor-pointer"
                >
                  {Icon.unlock}
                </button>
              </>
            )}

            {isInactive && (
              <button
                onClick={() => patch({ status: "pending" })}
                disabled={updating}
                className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 px-3 py-2 text-xs font-semibold text-neutral-500 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {Icon.unlock}
                Reopen
              </button>
            )}

            <button
              onClick={() => onDelete(order.orderId)}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-red-950/40 hover:text-red-400 p-2 text-neutral-600 transition-colors disabled:opacity-40 ml-auto cursor-pointer"
            >
              {Icon.trash}
            </button>
          </div>

          {order.status === "pending" && (
            <p className="mt-2 text-center text-[10px] text-red-500/70 font-medium">
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
    const total = ordersWithPrep.reduce((sum, o) => {
      return sum + (new Date(o.completedAt) - new Date(o.placedAt)) / 60000;
    }, 0);
    const avg = Math.round(total / ordersWithPrep.length);
    avgPrepText = `${avg}m`;
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
    { label: "Total Revenue", value: `৳${totalRevenue}` },
    { label: "Completed", value: completedOrders.length },
    { label: "Avg Order", value: `৳${avgOrderValue}` },
    { label: "Avg Prep Time", value: avgPrepText },
  ];

  return (
    <div className="rounded-xl border border-white/6 bg-[#111113]">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Performance Insights</h3>
        <p className="text-[11px] text-neutral-600 mt-0.5">Statistics from completed orders in this session.</p>
      </div>
      <div className="p-5 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-white/5 bg-white/3 px-4 py-3">
              <p className="text-xl font-bold text-white font-mono">{m.value}</p>
              <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-widest mt-1">{m.label}</p>
            </div>
          ))}
        </div>
        {/* Category breakdown */}
        {categoryData.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-widest mb-3">Revenue by Category</p>
            <div className="space-y-3">
              {categoryData.map(([cat, rev]) => (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-300 font-medium">{cat}</span>
                    <span className="font-mono font-semibold text-amber-400">৳{rev}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${(rev / maxRev) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {categoryData.length === 0 && (
          <p className="text-sm text-neutral-700 text-center py-4">No sales data yet.</p>
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
  const loopRef = useRef(null);
  const updatingOrderIdsRef = useRef(new Map());

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
            const last = updatingOrderIdsRef.current.get(order.orderId);
            if (last && Date.now() - last < 10000) return;
            setOrders((prev) => prev.map((o) => o.orderId === order.orderId ? order : o));
            if (order.status !== "pending") setPendingKotIds((prev) => { const n = new Set(prev); n.delete(order.orderId); return n; });
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
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const fresh = await res.json();
        setOrders((prev) => fresh.map((f) => {
          if (!prev.some((o) => o.orderId === f.orderId) && f.status === "pending") {
            sendDesktopNotification(`New Order ${f.orderNumber || ""}`, `${f.items?.length || 0} item(s).`);
          }
          const last = updatingOrderIdsRef.current.get(f.orderId);
          if (last && Date.now() - last < 10000) return prev.find((o) => o.orderId === f.orderId) || f;
          return f;
        }));
        setPendingKotIds(new Set(fresh.filter((o) => o.status === "pending").map((o) => o.orderId)));
      } catch { }
    };
    const t = setInterval(poll, 4000);
    return () => clearInterval(t);
  }, [sendDesktopNotification]);

  const handleStatusChange = useCallback(async (orderId, p) => {
    updatingOrderIdsRef.current.set(orderId, Date.now());
    setOrders((prev) => prev.map((o) => o.orderId === orderId ? { ...o, ...p } : o));
    if (p.status && p.status !== "pending") setPendingKotIds((prev) => { const n = new Set(prev); n.delete(orderId); return n; });
    if (p.status === "pending") setPendingKotIds((prev) => new Set([...prev, orderId]));
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => o.orderId === orderId ? data.order : o));
      } else throw new Error();
    } catch {
      alert("Failed to save. Please try again.");
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

  // ── Derived data ─────────────────────────────────────────────────────────────
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
    { id: "pending",   label: "Active",     count: orders.filter((o) => o.status === "pending" || o.status === "kot_printed").length },
    { id: "done",      label: "Completed",  count: orders.filter((o) => o.status === "done" || o.status === "cancelled").length },
    { id: "all",       label: "All",        count: orders.length },
    { id: "analytics", label: "Insights",   count: 0 },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white antialiased" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>

      {/* Alarm banner */}
      {pendingKotIds.size > 0 && soundEnabled && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-red-950/80 border-b border-red-500/20 backdrop-blur-sm py-2.5 px-4">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-300 tracking-wide">
            {pendingKotIds.size} order{pendingKotIds.size > 1 ? "s" : ""} awaiting KOT — press KOT Printed to silence alarm
          </span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#0c0c0e]/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-5 flex h-14 items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <CrownMark className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-white leading-none tracking-tight">Crown Coffee</p>
              <p className="text-[10px] text-neutral-600 mt-0.5 uppercase tracking-widest">Manager Portal</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${connected ? "border-emerald-800/60 text-emerald-500" : "border-red-800/40 text-red-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              {connected ? "Live" : "Offline"}
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors cursor-pointer ${soundEnabled ? "border-white/10 text-neutral-300 hover:border-white/20" : "border-white/6 text-neutral-600 hover:text-neutral-400"}`}
            >
              {soundEnabled ? Icon.volume : Icon.volumeOff}
              {soundEnabled ? "Sound" : "Muted"}
            </button>

            {/* Test sound */}
            <button
              onClick={() => SOUND_PRESETS[currentSoundKey].fn()}
              className="flex items-center gap-1 rounded-full border border-white/6 px-2.5 py-1 text-[10px] font-medium text-neutral-600 hover:text-neutral-300 hover:border-white/15 transition-colors cursor-pointer"
            >
              {Icon.play}
              Test
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-white/6 px-2.5 py-1 text-[10px] font-medium text-neutral-600 hover:text-red-400 hover:border-red-900/40 transition-colors cursor-pointer"
            >
              {Icon.logout}
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: "Ringing",   value: pendingKotIds.size,                                           accent: pendingKotIds.size > 0 ? "text-red-400" : "text-neutral-500" },
            { label: "Pending",   value: pendingCount,                                                  accent: pendingCount > 0 ? "text-amber-400" : "text-neutral-500" },
            { label: "Served",    value: orders.filter((o) => o.status === "done").length,             accent: "text-emerald-400" },
            { label: "Total",     value: orders.length,                                                 accent: "text-neutral-300" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-[#111113] px-4 py-3 text-center">
              <p className={`text-2xl font-bold font-mono tracking-tight ${s.accent}`}>{s.value}</p>
              <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs + controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Tab bar */}
          <div className="flex items-center gap-0.5 rounded-lg border border-white/6 bg-[#111113] p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                  tab === t.id
                    ? "bg-white/8 text-white shadow-sm"
                    : "text-neutral-600 hover:text-neutral-300"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`rounded-full text-[9px] font-bold px-1.5 py-0.5 ${tab === t.id ? "bg-amber-500 text-black" : "bg-white/8 text-neutral-500"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          {tab !== "analytics" && (
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-white/6 bg-[#111113] py-1.5 pl-3 pr-7 text-[11px] font-medium text-neutral-400 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
                <option value="table">By table</option>
              </select>
              <div className="relative">
                <span className="absolute left-3 inset-y-0 flex items-center text-neutral-600 pointer-events-none">{Icon.search}</span>
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-white/6 bg-[#111113] py-1.5 pl-8 pr-3 text-[11px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-white/15 w-44 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {tab === "analytics" ? (
          <AnalyticsPanel orders={orders} />
        ) : (
          <div className={`grid grid-cols-1 gap-3 ${tab === "pending" ? "md:grid-cols-2 xl:grid-cols-3" : ""}`}>
            {sorted.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <CrownMark className="h-10 w-10 text-neutral-800 mb-4" />
                <p className="text-base font-semibold text-neutral-500">
                  {tab === "pending" ? "No active orders" : "No orders here"}
                </p>
                <p className="mt-1.5 text-sm text-neutral-700">
                  {tab === "pending"
                    ? "New orders will appear instantly. Alarm will ring automatically."
                    : "Orders you manage will appear here."}
                </p>
              </div>
            ) : (
              sorted.map((order) => {
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
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
