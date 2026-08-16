"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import CrownMark from "@/components/CrownMark";

export default function NoticeClient({ initialNotices = [] }) {
  const [notices, setNotices] = useState(initialNotices);
  const [viewMode, setViewMode] = useState("showcase"); // "showcase" or "board"
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);

  // Active notices only
  const activeNotices = useMemo(() => {
    return notices.filter((n) => n.active !== false);
  }, [notices]);

  // Filtered list based on category & search query
  const filteredNotices = useMemo(() => {
    return activeNotices.filter((notice) => {
      const matchesCat =
        activeCategory === "all" || notice.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        notice.title?.toLowerCase().includes(q) ||
        notice.summary?.toLowerCase().includes(q) ||
        notice.content?.toLowerCase().includes(q) ||
        notice.badgeText?.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeNotices, activeCategory, searchQuery]);

  // Current active notice in Showcase mode
  const currentNotice = useMemo(() => {
    if (filteredNotices.length === 0) return null;
    return filteredNotices[currentIndex % filteredNotices.length] || filteredNotices[0];
  }, [filteredNotices, currentIndex]);

  // Play audio click effect on slide change if not muted
  const playChime = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }, [isMuted]);

  // Next / Prev slide handlers
  const handleNext = useCallback(() => {
    if (filteredNotices.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % filteredNotices.length);
    playChime();
  }, [filteredNotices.length, playChime]);

  const handlePrev = useCallback(() => {
    if (filteredNotices.length <= 1) return;
    setCurrentIndex((prev) =>
      prev === 0 ? filteredNotices.length - 1 : prev - 1
    );
    playChime();
  }, [filteredNotices.length, playChime]);

  // Auto-play timer for Showcase mode
  useEffect(() => {
    if (viewMode !== "showcase" || !isPlaying || selectedNotice || filteredNotices.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewMode, isPlaying, selectedNotice, filteredNotices.length, handleNext]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (selectedNotice) {
        if (e.key === "Escape") setSelectedNotice(null);
        return;
      }
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, selectedNotice]);

  // Fullscreen toggle handler
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }

  function handleCopyLink(notice, e) {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/notice#${notice.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(notice.id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  function getCategoryLabel(catId) {
    switch (catId) {
      case "urgent":
        return "URGENT ANNOUNCEMENT";
      case "hours":
        return "STORE HOURS UPDATE";
      case "offer":
        return "EXCLUSIVE OFFER";
      case "event":
        return "SPECIAL EVENT";
      default:
        return "OFFICIAL NOTICE";
    }
  }

  function getCategoryBadgeStyle(catId) {
    switch (catId) {
      case "urgent":
        return "bg-red-500/25 text-red-300 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse";
      case "hours":
        return "bg-amber-500/25 text-amber-300 border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]";
      case "offer":
        return "bg-emerald-500/25 text-emerald-300 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
      case "event":
        return "bg-purple-500/25 text-purple-300 border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]";
      default:
        return "bg-amber-500/20 text-amber-200 border-2 border-amber-500/40 shadow-[0_0_20px_rgba(182,134,44,0.3)]";
    }
  }

  // Dynamic background aura color based on category
  function getAuraGradient(catId) {
    switch (catId) {
      case "urgent":
        return "from-red-950/60 via-rose-950/70 to-slate-950";
      case "hours":
        return "from-amber-950/60 via-yellow-950/60 to-slate-950";
      case "offer":
        return "from-emerald-950/60 via-teal-950/60 to-slate-950";
      case "event":
        return "from-purple-950/60 via-indigo-950/60 to-slate-950";
      default:
        return "from-amber-950/50 via-slate-950 to-slate-950";
    }
  }

  const categories = [
    { id: "all", label: "All Notices" },
    { id: "urgent", label: "Urgent" },
    { id: "hours", label: "Store Hours" },
    { id: "offer", label: "Offers & Menu" },
    { id: "event", label: "Events" },
    { id: "general", label: "General" },
  ];

  return (
    <div
      className={`w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans select-none relative transition-colors duration-1000 bg-gradient-to-b ${getAuraGradient(
        currentNotice?.category
      )}`}
    >
      {/* Background Multi-Layer Ambient Light Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--accent)]/20 blur-[180px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-amber-600/15 blur-[160px] pointer-events-none"></div>

      {/* Dynamic Floating Particles Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-amber-400 blur-sm animate-ping"></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-3 rounded-full bg-yellow-300 blur-md animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 rounded-full bg-amber-500 blur-sm animate-ping"></div>
      </div>

      {/* Top Floating Control Bar */}
      <header className="relative z-30 shrink-0 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand & Main Site Navigation Link */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <CrownMark className="h-8 w-8 text-[var(--accent)] group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(182,134,44,0.6)]" />
            <div className="flex flex-col">
              <span className="font-display text-2xl font-black tracking-wider text-white uppercase leading-none">
                Crown Coffee
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[var(--accent)] font-bold uppercase mt-0.5">
                Official Notice Desk
              </span>
            </div>
          </Link>
          <span className="hidden sm:inline-block h-6 w-px bg-white/20"></span>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:border-[var(--accent)]/50 hover:bg-white/10 transition"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return to Main Site
          </Link>
        </div>

        {/* Center View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/15 rounded-full p-1.5 shadow-2xl">
          <button
            type="button"
            onClick={() => setViewMode("showcase")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-extrabold tracking-wider uppercase transition-all ${
              viewMode === "showcase"
                ? "bg-gradient-to-r from-[var(--accent)] to-yellow-600 text-white shadow-[0_0_20px_rgba(182,134,44,0.5)] scale-105"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Showcase View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("board")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-extrabold tracking-wider uppercase transition-all ${
              viewMode === "board"
                ? "bg-gradient-to-r from-[var(--accent)] to-yellow-600 text-white shadow-[0_0_20px_rgba(182,134,44,0.5)] scale-105"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Board View
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            className={`rounded-full border p-2.5 transition ${
              isMuted
                ? "border-white/10 bg-white/5 text-slate-500"
                : "border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_15px_rgba(182,134,44,0.3)]"
            }`}
            title={isMuted ? "Enable Audio Feedback" : "Mute Audio Feedback"}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Auto-Play Toggle */}
          {viewMode === "showcase" && (
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="rounded-full border border-white/15 bg-white/5 p-2.5 text-slate-200 hover:text-white transition"
              title={isPlaying ? "Pause Presentation (Space)" : "Play Presentation (Space)"}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              )}
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full border border-white/15 bg-white/5 p-2.5 text-slate-200 hover:text-white transition"
            title="Toggle Fullscreen Canvas Mode"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Category Sub-Navigation Filter Bar */}
      <div className="relative z-20 shrink-0 border-b border-white/10 bg-slate-950/50 backdrop-blur-md px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`shrink-0 rounded-full px-5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
                activeCategory === cat.id
                  ? "bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105"
                  : "text-slate-400 hover:text-white border border-white/10 bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400 font-medium shrink-0 hidden md:block">
          TOTAL NOTICES: <span className="text-[var(--accent)] font-bold">{filteredNotices.length}</span>
        </div>
      </div>

      {/* Main Showcase Presentation Canvas */}
      <main className="relative z-20 flex-1 overflow-hidden flex flex-col">
        {/* MODE 1: SHOWCASE VIEW */}
        {viewMode === "showcase" && (
          <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-hidden">
            {/* Top Auto-Play Progress Bar */}
            {isPlaying && filteredNotices.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 overflow-hidden">
                <div
                  key={`${currentNotice?.id}-${currentIndex}`}
                  className="h-full bg-gradient-to-r from-[var(--accent)] via-yellow-400 to-amber-500 animate-[slideProgress_8000ms_linear_infinite]"
                ></div>
              </div>
            )}

            {!currentNotice ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="space-y-4">
                  <h3 className="font-display text-3xl font-bold text-white">
                    No active announcements found
                  </h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    No notices published under this category. Please select another category.
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-auto max-w-6xl mx-auto w-full space-y-6 sm:space-y-8 animate-fadeIn">
                {/* GIANT BADGES & META */}
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-block rounded-full px-5 py-2 text-xs sm:text-sm font-black tracking-widest uppercase ${getCategoryBadgeStyle(
                      currentNotice.category
                    )}`}
                  >
                    {getCategoryLabel(currentNotice.category)}
                  </span>

                  {currentNotice.pinned && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-yellow-600 text-white px-4 py-2 text-xs font-black tracking-widest uppercase shadow-[0_0_20px_rgba(182,134,44,0.5)]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      FEATURED SPOTLIGHT
                    </span>
                  )}

                  {currentNotice.badgeText && (
                    <span className="rounded-full border-2 border-red-500/40 bg-red-500/20 px-4 py-2 text-xs font-black text-red-200 uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      {currentNotice.badgeText}
                    </span>
                  )}

                  <span className="text-xs font-mono text-slate-400 font-medium ml-auto">
                    Date: {currentNotice.date}
                  </span>
                </div>

                {/* GIANT HIGH-CONTRAST ATTENTION TITLE */}
                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-500 tracking-tight leading-[1.05] drop-shadow-[0_10px_35px_rgba(182,134,44,0.4)]">
                  {currentNotice.title}
                </h1>

                {/* GIANT BODY TEXT */}
                <div className="text-lg sm:text-2xl md:text-3xl text-slate-200 leading-relaxed font-light tracking-wide max-w-5xl whitespace-pre-line border-l-4 border-[var(--accent)] pl-6 py-2 bg-white/5 rounded-r-2xl backdrop-blur-md">
                  {currentNotice.summary || currentNotice.content}
                </div>

                {/* ULTRA INTERACTIVE ACTION BUTTONS */}
                <div className="pt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(currentNotice)}
                    className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[var(--accent)] via-yellow-500 to-amber-600 text-white px-9 py-4 text-base font-extrabold shadow-[0_0_35px_rgba(182,134,44,0.5)] hover:scale-105 hover:brightness-110 transition-all duration-300 active:scale-95 uppercase tracking-wider"
                  >
                    Read Detailed Announcement
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  {currentNotice.link && (
                    <Link
                      href={currentNotice.link}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-extrabold text-white hover:bg-white/20 hover:border-white transition-all uppercase tracking-wider"
                    >
                      {currentNotice.linkLabel || "Explore Special Offer"}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(currentNotice, e)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition uppercase tracking-wider"
                  >
                    {copiedId === currentNotice.id ? (
                      <span className="text-emerald-400 font-extrabold">
                        Direct Link Copied!
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" />
                        </svg>
                        Share Announcement
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* INTERACTIVE CAROUSEL THUMBNAILS AT BOTTOM */}
            {filteredNotices.length > 1 && (
              <div className="shrink-0 max-w-6xl mx-auto w-full pt-6 border-t border-white/15 flex items-center justify-between gap-6">
                {/* Arrow Controls & Index Counter */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="rounded-full border-2 border-white/20 bg-slate-900/80 p-3.5 text-white hover:bg-white/20 hover:border-[var(--accent)] transition-all active:scale-90 shadow-lg"
                    title="Previous Announcement (Left Arrow Key)"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-full border-2 border-white/20 bg-slate-900/80 p-3.5 text-white hover:bg-white/20 hover:border-[var(--accent)] transition-all active:scale-90 shadow-lg"
                    title="Next Announcement (Right Arrow Key)"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="pl-3 font-display font-black text-xl text-amber-400 font-mono tracking-wider">
                    {((currentIndex % filteredNotices.length) + 1).toString().padStart(2, "0")} / {filteredNotices.length.toString().padStart(2, "0")}
                  </div>
                </div>

                {/* Interactive Slide Thumbnail Strip */}
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2">
                  {filteredNotices.map((n, idx) => {
                    const isSelected = idx === (currentIndex % filteredNotices.length);
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          playChime();
                        }}
                        className={`shrink-0 text-left rounded-xl px-4 py-2 border transition-all duration-300 max-w-[200px] ${
                          isSelected
                            ? "bg-[var(--accent)]/30 border-[var(--accent)] text-white shadow-[0_0_15px_rgba(182,134,44,0.4)] scale-105"
                            : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] truncate">
                          {n.badgeText || n.category}
                        </p>
                        <p className="text-xs font-bold truncate">
                          {n.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: BOARD GRID VIEW */}
        {viewMode === "board" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
            {/* Search Input Bar */}
            <div className="max-w-xl mx-auto relative mb-8">
              <input
                type="text"
                placeholder="Search announcements by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-2 border-white/20 bg-slate-900/90 px-6 py-3.5 pl-12 text-sm text-white placeholder-slate-400 focus:border-[var(--accent)] focus:outline-none transition shadow-2xl"
              />
              <svg
                className="w-5 h-5 absolute left-4 top-4 text-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Grid Cards */}
            {filteredNotices.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-md mx-auto">
                <p className="text-base font-bold text-slate-200">
                  No announcements match your search query
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                {filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className="group cursor-pointer rounded-3xl border border-white/15 bg-slate-900/70 p-7 backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent)] hover:shadow-[0_0_40px_rgba(182,134,44,0.3)] hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${getCategoryBadgeStyle(
                            notice.category
                          )}`}
                        >
                          {getCategoryLabel(notice.category)}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {notice.date}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-white group-hover:text-amber-300 transition-colors mb-3 leading-snug">
                        {notice.title}
                      </h3>

                      <p className="text-sm text-slate-300 line-clamp-4 leading-relaxed mb-6 font-light">
                        {notice.summary || notice.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                      <span className="text-xs font-bold text-[var(--accent)] group-hover:underline inline-flex items-center gap-1.5 uppercase tracking-wider">
                        View Notice Details
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(notice, e)}
                        className="text-xs text-slate-400 hover:text-white p-2 transition"
                      >
                        {copiedId === notice.id ? (
                          <span className="text-xs font-bold text-emerald-400">
                            Copied
                          </span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FULL NOTICE DETAIL POPUP MODAL */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl border-2 border-[var(--accent)]/50 bg-slate-900 p-8 sm:p-10 shadow-[0_0_60px_rgba(182,134,44,0.3)] overflow-y-auto max-h-[90vh] text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedNotice(null)}
              className="absolute top-6 right-6 rounded-full p-2.5 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-block rounded-full border px-4 py-1.5 text-xs font-black tracking-widest uppercase ${getCategoryBadgeStyle(
                  selectedNotice.category
                )}`}
              >
                {getCategoryLabel(selectedNotice.category)}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Published {selectedNotice.date}
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400 mb-6 leading-tight">
              {selectedNotice.title}
            </h2>

            <div className="text-base sm:text-xl text-slate-200 space-y-4 leading-relaxed mb-8 whitespace-pre-line border-t border-white/15 pt-6 font-light">
              {selectedNotice.content}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
              {selectedNotice.link ? (
                <Link
                  href={selectedNotice.link}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-yellow-600 text-white px-7 py-3 text-sm font-extrabold shadow-lg hover:scale-105 transition"
                >
                  {selectedNotice.linkLabel || "Action Link"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(selectedNotice, e)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-white/20 transition uppercase tracking-wider"
                >
                  {copiedId === selectedNotice.id
                    ? "Link Copied!"
                    : "Copy Direct Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
