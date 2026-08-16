"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import CrownMark from "@/components/CrownMark";

const GOLD = "#b6862c";
const GOLD_LIGHT = "#f3d37c";
const GOLD_MID = "#e8c04a";
const BG_DARK = "#070504";
const BG_SURFACE = "#1c1612";
const BG_CARD = "#2a211b";

function getCategoryColor(catId) {
  switch (catId) {
    case "urgent": return { bg: "#450a0a", accent: "#f87171", glow: "rgba(248,113,113,0.5)", label: "URGENT ANNOUNCEMENT" };
    case "hours":  return { bg: "#431407", accent: "#fb923c", glow: "rgba(251,146,60,0.5)",  label: "STORE HOURS UPDATE"  };
    case "offer":  return { bg: "#052e16", accent: "#4ade80", glow: "rgba(74,222,128,0.4)",  label: "EXCLUSIVE OFFER"     };
    case "event":  return { bg: "#1e1b4b", accent: "#a78bfa", glow: "rgba(167,139,250,0.4)", label: "SPECIAL EVENT"       };
    default:       return { bg: BG_SURFACE, accent: GOLD_LIGHT, glow: "rgba(243,211,124,0.4)", label: "OFFICIAL NOTICE"  };
  }
}

export default function NoticeClient({ initialNotices = [] }) {
  const notices = useMemo(() => initialNotices.filter((n) => n.active !== false), [initialNotices]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex]       = useState(null);
  const [direction, setDirection]       = useState("next");
  const [isPlaying, setIsPlaying]       = useState(true);
  const [progress, setProgress]         = useState(0);
  const [duration, setDuration]         = useState(8); // seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [clockTime, setClockTime]       = useState("");
  const [viewMode, setViewMode]         = useState("all"); // "all" | category id
  const [dragStartX, setDragStartX]     = useState(null);
  const [dragOffsetX, setDragOffsetX]   = useState(0);
  const [isDragging, setIsDragging]     = useState(false);

  const containerRef         = useRef(null);
  const hideControlsTimer    = useRef(null);
  const thumbnailScrollRef   = useRef(null);
  const startTimeRef         = useRef(Date.now());

  // Filtered notice list
  const filteredNotices = useMemo(() => {
    if (viewMode === "all") return notices;
    return notices.filter((n) => n.category === viewMode);
  }, [notices, viewMode]);

  const currentNotice = filteredNotices[currentIndex % Math.max(filteredNotices.length, 1)] ?? null;

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-hide controls after inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 4500);
  }, [isPlaying]);

  // Navigation helpers
  const goToSlide = useCallback((idx, dir = "next") => {
    if (filteredNotices.length === 0) return;
    setPrevIndex(currentIndex);
    setDirection(dir);
    setCurrentIndex(idx % filteredNotices.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [currentIndex, filteredNotices.length]);

  const nextSlide = useCallback(() => {
    const n = filteredNotices.length;
    if (n === 0) return;
    goToSlide((currentIndex + 1) % n, "next");
  }, [currentIndex, filteredNotices.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const n = filteredNotices.length;
    if (n === 0) return;
    goToSlide((currentIndex - 1 + n) % n, "prev");
  }, [currentIndex, filteredNotices.length, goToSlide]);

  // Swipe/drag
  const handlePointerDown = (x) => { setDragStartX(x); setIsDragging(true); setDragOffsetX(0); };
  const handlePointerMove = (x) => { if (!isDragging || dragStartX === null) return; setDragOffsetX(x - dragStartX); };
  const handlePointerEnd  = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if      (dragOffsetX < -60) nextSlide();
    else if (dragOffsetX > 60)  prevSlide();
    setDragOffsetX(0);
    setDragStartX(null);
  };

  // Progress bar (50ms tick)
  useEffect(() => {
    startTimeRef.current = Date.now();
    setProgress(0);
  }, [currentIndex, duration, isPlaying]);

  useEffect(() => {
    if (!isPlaying || filteredNotices.length <= 1) {
      setProgress(0);
      return;
    }
    const totalMs = duration * 1000;
    const id = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);
      if (elapsed >= totalMs) {
        startTimeRef.current = Date.now();
        setProgress(0);
        setCurrentIndex((prev) => (prev + 1) % filteredNotices.length);
      }
    }, 50);
    return () => clearInterval(id);
  }, [isPlaying, duration, filteredNotices.length, currentIndex]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      if (e.key === " " || e.code === "Space")          { e.preventDefault(); setIsPlaying((p) => !p); }
      else if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); nextSlide(); }
      else if (e.key === "ArrowLeft"  || e.key === "PageUp")   { e.preventDefault(); prevSlide(); }
      else if (e.key === "f" || e.key === "F")                 { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextSlide, prevSlide]);

  // Thumbnail scroll to active
  useEffect(() => {
    const active = document.getElementById(`notice-thumb-${currentIndex}`);
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentIndex]);



  const categories = useMemo(() => {
    const cats = new Set(notices.map((n) => n.category));
    return Array.from(cats);
  }, [notices]);

  if (notices.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070504] text-center">
        <div className="space-y-4">
          <CrownMark className="h-16 w-16 text-[#b6862c] mx-auto opacity-40" />
          <p className="font-display text-3xl font-black text-white">No Notices Published</p>
          <a href="/" className="inline-flex items-center gap-2 text-[#b6862c] hover:underline text-sm">Return to Main Site</a>
        </div>
      </div>
    );
  }

  const col = currentNotice ? getCategoryColor(currentNotice.category) : getCategoryColor("general");

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden text-white select-none cursor-grab active:cursor-grabbing font-sans"
      style={{ background: BG_DARK }}
      onMouseMove={resetHideTimer}
      onTouchStart={(e) => { handlePointerDown(e.touches[0].clientX); resetHideTimer(); }}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
      onTouchEnd={handlePointerEnd}
      onMouseDown={(e) => handlePointerDown(e.clientX)}
      onMouseMoveCapture={(e) => handlePointerMove(e.clientX)}
      onMouseUp={handlePointerEnd}
    >
      {/* ── Dynamic Full-Screen Background Color Wash ── */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 40%, ${col.bg}CC 0%, ${BG_DARK} 75%)`,
        }}
      />

      {/* ── Golden Glow Orb (Category-Reactive) ── */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] pointer-events-none transition-all duration-1000"
        style={{ background: col.glow, opacity: 0.35 }}
      />

      {/* ── Top Progress Bar ── */}
      <div className="absolute top-0 left-0 right-0 z-50 h-[3px] bg-black/50">
        <div
          className="h-full transition-none"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})`,
            boxShadow: `0 0 18px ${GOLD_LIGHT}`,
          }}
        />
      </div>

      {/* ── TOP HEADER BAR ── */}
      <header
        className={`absolute top-5 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto transition-all duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Crown Coffee Brand Pill */}
        <div className="flex items-center gap-4 bg-black/80 backdrop-blur-2xl px-6 py-3 rounded-3xl border border-white/20 shadow-2xl">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shrink-0"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_MID}, #785417)` }}
          >
            <CrownMark className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-wider uppercase text-white leading-none">
              Crown Coffee
            </h1>
            <p className="text-[11px] font-extrabold tracking-[0.25em] uppercase mt-0.5" style={{ color: GOLD_MID }}>
              Official Notice Desk &bull; Bangladesh
            </p>
          </div>
        </div>

        {/* Right Cluster */}
        <div className="flex items-center gap-3">
          {/* Live badge */}
          <div className="hidden sm:flex items-center gap-2 bg-black/80 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-black shadow-2xl">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="tracking-wider uppercase text-white">Live Desk</span>
          </div>

          {/* Live clock */}
          <div
            className="bg-black/85 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border text-sm font-mono font-black shadow-2xl"
            style={{ borderColor: `${GOLD}70`, color: GOLD_LIGHT }}
          >
            {clockTime}
          </div>

          {/* Return to site */}
          <a
            href="/"
            className="bg-white/15 hover:bg-white/25 backdrop-blur-2xl p-2.5 rounded-2xl border border-white/30 text-white transition hover:scale-105 shadow-2xl"
            title="Return to Main Site"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── MAIN CONTENT CANVAS ── */}
      <main className="relative z-10 h-full w-full flex flex-col items-center justify-center px-10 sm:px-16 lg:px-24 pt-28 pb-40">
        {currentNotice && (
          <div key={currentNotice.id} className="max-w-6xl w-full mx-auto">
            {/* Top badges row */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {/* Category badge */}
              <span
                className="inline-flex items-center px-7 py-3 rounded-2xl text-base sm:text-lg font-black uppercase tracking-widest border-2 shadow-xl"
                style={{
                  background: `${col.bg}bb`,
                  color: col.accent,
                  borderColor: `${col.accent}90`,
                  boxShadow: `0 0 32px ${col.glow}`,
                }}
              >
                {col.label}
              </span>

              {currentNotice.pinned && (
                <span
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-black uppercase tracking-widest border-2 shadow-xl text-black"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_MID})`, borderColor: GOLD_LIGHT }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  FEATURED SPOTLIGHT
                </span>
              )}

              {currentNotice.badgeText && (
                <span
                  className="px-6 py-3 rounded-2xl text-base font-black uppercase tracking-widest border-2 shadow-xl"
                  style={{ background: "#450a0abb", color: "#f87171", borderColor: "#f8717190" }}
                >
                  {currentNotice.badgeText}
                </span>
              )}

              <span className="ml-auto text-sm font-mono font-bold" style={{ color: `${GOLD_LIGHT}99` }}>
                {currentNotice.date}
              </span>
            </div>

            {/* MASSIVE TITLE — the hero */}
            <h1
              className="font-display font-black text-white tracking-tight mb-8"
              style={{
                fontSize: "clamp(3rem, 9vw, 9rem)",
                lineHeight: 1.0,
                textShadow: `0 0 80px ${col.glow}, 0 4px 60px rgba(0,0,0,0.9)`,
              }}
            >
              {currentNotice.title}
            </h1>

            {/* Divider Line */}
            <div
              className="h-1.5 rounded-full mb-8"
              style={{
                width: "min(480px, 60%)",
                background: `linear-gradient(90deg, ${col.accent}, ${GOLD_LIGHT}, transparent)`,
                boxShadow: `0 0 24px ${col.glow}`,
              }}
            />

            {/* LARGE SUMMARY — prominent, bright */}
            <p
              className="font-medium max-w-5xl"
              style={{
                fontSize: "clamp(1.35rem, 3vw, 2.4rem)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.92)",
                textShadow: `0 2px 20px rgba(0,0,0,0.7)`,
              }}
            >
              {currentNotice.summary || currentNotice.content}
            </p>
          </div>
        )}
      </main>

      {/* ── INTERACTIVE BOTTOM CONTROLS & THUMBNAIL BAR ── */}
      <footer
        className={`absolute bottom-3 left-4 right-4 z-40 pointer-events-auto transition-all duration-300 ${showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <div className="flex flex-col gap-2.5 bg-black/85 backdrop-blur-2xl p-3 sm:px-5 rounded-3xl border border-white/20 shadow-2xl">
          {/* Scrollable Thumbnail Notice Strip */}
          <div
            ref={thumbnailScrollRef}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-none snap-x pb-1"
          >
            {filteredNotices.map((notice, idx) => {
              const isActive = idx === (currentIndex % filteredNotices.length);
              const c = getCategoryColor(notice.category);
              return (
                <button
                  key={notice.id}
                  id={`notice-thumb-${idx}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx, idx >= currentIndex ? "next" : "prev"); }}
                  className="relative shrink-0 flex flex-col text-left snap-start rounded-2xl border px-4 py-2.5 transition-all duration-200 cursor-pointer active:scale-95 min-w-[140px] max-w-[200px]"
                  style={
                    isActive
                      ? { borderColor: GOLD, background: `${GOLD}22`, boxShadow: `0 0 20px ${GOLD}50` }
                      : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)" }
                  }
                >
                  <span
                    className="text-[9px] font-black uppercase tracking-widest truncate"
                    style={{ color: isActive ? GOLD_LIGHT : c.accent }}
                  >
                    {notice.badgeText || c.label}
                  </span>
                  <span className={`text-xs font-bold truncate mt-0.5 ${isActive ? "text-white" : "text-white/70"}`}>
                    {notice.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Playback Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5 border-t border-white/10">
            {/* Category Quick Jump Pills */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-xs sm:max-w-md scrollbar-none">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewMode("all"); setCurrentIndex(0); }}
                className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition active:scale-90"
                style={
                  viewMode === "all"
                    ? { background: GOLD, color: "#000" }
                    : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }
                }
              >
                All
              </button>
              {categories.map((cat) => {
                const c = getCategoryColor(cat);
                const isSelected = viewMode === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setViewMode(cat); setCurrentIndex(0); }}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition active:scale-90"
                    style={
                      isSelected
                        ? { background: c.accent, color: "#000" }
                        : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Prev / Play / Next + duration + fullscreen */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-75"
                title="Previous (Left Arrow)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsPlaying((p) => !p); }}
                className="p-3 rounded-full text-black shadow-lg hover:brightness-110 transition active:scale-75"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #d4a017)` }}
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying
                  ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
                  : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                }
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-75"
                title="Next (Right Arrow)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <span className="text-[11px] font-mono font-bold text-white/70 px-1">
                {(currentIndex % Math.max(filteredNotices.length, 1)) + 1} / {filteredNotices.length}
              </span>

              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/15 border border-white/20 text-white text-[11px] font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:bg-white/25 transition"
                title="Slide Duration"
              >
                <option value={5}  className="bg-[#1c1612] text-white">5s</option>
                <option value={8}  className="bg-[#1c1612] text-white">8s</option>
                <option value={12} className="bg-[#1c1612] text-white">12s</option>
                <option value={20} className="bg-[#1c1612] text-white">20s</option>
              </select>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-75"
                title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
              >
                {isFullscreen
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 0l5-5m0 0l-5 0m5 0l0 5m-5 11l5 5m0 0l-5 0m5 0l0-5m-11 0l-5 5m0 0l5 0m-5 0l0-5" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                }
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
