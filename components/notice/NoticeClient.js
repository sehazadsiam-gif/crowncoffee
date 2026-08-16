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

  // Next / Prev slide handlers
  const handleNext = useCallback(() => {
    if (filteredNotices.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % filteredNotices.length);
  }, [filteredNotices.length]);

  const handlePrev = useCallback(() => {
    if (filteredNotices.length <= 1) return;
    setCurrentIndex((prev) =>
      prev === 0 ? filteredNotices.length - 1 : prev - 1
    );
  }, [filteredNotices.length]);

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

  // URL Hash direct opening
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      const found = notices.find((n) => n.id === hashId);
      if (found) setSelectedNotice(found);
    }
  }, [notices]);

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
        return "URGENT";
      case "hours":
        return "STORE HOURS";
      case "offer":
        return "SPECIAL OFFER";
      case "event":
        return "EVENT";
      default:
        return "ANNOUNCEMENT";
    }
  }

  function getCategoryBadgeStyle(catId) {
    switch (catId) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "hours":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "offer":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "event":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  }

  // Dynamic background aura color based on category
  function getAuraGradient(catId) {
    switch (catId) {
      case "urgent":
        return "from-red-900/30 via-rose-950/40 to-slate-950";
      case "hours":
        return "from-amber-900/30 via-yellow-950/30 to-slate-950";
      case "offer":
        return "from-emerald-900/30 via-teal-950/30 to-slate-950";
      case "event":
        return "from-purple-900/30 via-indigo-950/30 to-slate-950";
      default:
        return "from-amber-900/20 via-slate-900 to-slate-950";
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
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent)]/15 blur-[140px] pointer-events-none animate-pulse"></div>

      {/* Top Floating Control Bar */}
      <header className="relative z-30 shrink-0 border-b border-white/10 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand & Return Link */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <CrownMark className="h-7 w-7 text-[var(--accent)] group-hover:scale-105 transition-transform" />
            <span className="font-display text-xl font-bold tracking-wide text-white">
              Crown Coffee
            </span>
          </Link>
          <span className="hidden sm:inline-block h-4 w-px bg-white/20"></span>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
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
            Main Site
          </Link>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full p-1">
          <button
            type="button"
            onClick={() => setViewMode("showcase")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition ${
              viewMode === "showcase"
                ? "bg-[var(--accent)] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
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
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Showcase View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("board")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition ${
              viewMode === "board"
                ? "bg-[var(--accent)] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
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
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Board View
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            LIVE DESK
          </div>

          {/* Auto-Play Toggle (Showcase Mode Only) */}
          {viewMode === "showcase" && (
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white transition"
              title={isPlaying ? "Pause Slideshow (Space)" : "Play Slideshow (Space)"}
            >
              {isPlaying ? (
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
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white transition"
            title="Toggle Fullscreen Mode"
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
                d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 overflow-hidden flex flex-col">
        {/* Category Tabs Sub-bar */}
        <div className="shrink-0 border-b border-white/5 bg-slate-950/40 px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setCurrentIndex(0);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide transition ${
                  activeCategory === cat.id
                    ? "bg-white/20 text-white border border-white/30"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium shrink-0 hidden sm:block">
            Showing {filteredNotices.length} active{" "}
            {filteredNotices.length === 1 ? "notice" : "notices"}
          </div>
        </div>

        {/* MODE 1: SHOWCASE FULL-SCREEN SLIDESHOW */}
        {viewMode === "showcase" && (
          <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
            {/* Top Auto-Play Progress Indicator Line */}
            {isPlaying && filteredNotices.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                <div
                  key={`${currentNotice?.id}-${currentIndex}`}
                  className="h-full bg-[var(--accent)] animate-[slideProgress_8000ms_linear_infinite]"
                ></div>
              </div>
            )}

            {!currentNotice ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="space-y-3">
                  <h3 className="font-display text-2xl font-bold text-white">
                    No active notices found
                  </h3>
                  <p className="text-sm text-slate-400">
                    Try selecting another category or check back later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-auto max-w-5xl mx-auto w-full space-y-6 sm:space-y-8 animate-fadeIn">
                {/* Notice Category & Badge Pills */}
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-block rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase ${getCategoryBadgeStyle(
                      currentNotice.category
                    )}`}
                  >
                    {getCategoryLabel(currentNotice.category)}
                  </span>

                  {currentNotice.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-bold tracking-wider uppercase">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      SPOTLIGHT NOTICE
                    </span>
                  )}

                  {currentNotice.badgeText && (
                    <span className="rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 uppercase tracking-wider">
                      {currentNotice.badgeText}
                    </span>
                  )}

                  <span className="text-xs text-slate-400 font-medium ml-auto">
                    Published {currentNotice.date}
                  </span>
                </div>

                {/* Massive Title */}
                <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                  {currentNotice.title}
                </h1>

                {/* Main Content Body */}
                <div className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-4xl whitespace-pre-line font-normal">
                  {currentNotice.summary || currentNotice.content}
                </div>

                {/* Interactive Action Bar */}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(currentNotice)}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-7 py-3 text-sm font-bold shadow-lg hover:brightness-110 transition-transform active:scale-95"
                  >
                    Read Full Notice
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>

                  {currentNotice.link && (
                    <Link
                      href={currentNotice.link}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                    >
                      {currentNotice.linkLabel || "Explore Action Link"}
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(currentNotice, e)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    {copiedId === currentNotice.id ? (
                      <span className="text-emerald-400 font-bold">
                        Link Copied!
                      </span>
                    ) : (
                      <>
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
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z"
                          />
                        </svg>
                        Share Notice
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Slideshow Navigation Bar */}
            {filteredNotices.length > 1 && (
              <div className="shrink-0 max-w-5xl mx-auto w-full pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                {/* Left / Right Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="rounded-full border border-white/20 bg-white/10 p-3 text-white hover:bg-white/20 transition active:scale-95"
                    title="Previous Notice (Left Arrow)"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-full border border-white/20 bg-white/10 p-3 text-white hover:bg-white/20 transition active:scale-95"
                    title="Next Notice (Right Arrow)"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <span className="text-xs text-slate-400 font-mono pl-2">
                    Notice {((currentIndex % filteredNotices.length) + 1).toString().padStart(2, "0")} / {filteredNotices.length.toString().padStart(2, "0")}
                  </span>
                </div>

                {/* Dot Pagination */}
                <div className="flex items-center gap-2">
                  {filteredNotices.map((n, idx) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === (currentIndex % filteredNotices.length)
                          ? "w-8 bg-[var(--accent)]"
                          : "w-2.5 bg-white/20 hover:bg-white/40"
                      }`}
                      title={`Go to notice ${idx + 1}`}
                    ></button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: BOARD GRID VIEW */}
        {viewMode === "board" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
            {/* Search Input Bar */}
            <div className="max-w-md mx-auto relative mb-6">
              <input
                type="text"
                placeholder="Search all notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/20 bg-slate-900/80 px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-400 focus:border-[var(--accent)] focus:outline-none transition"
              />
              <svg
                className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none"
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
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-md mx-auto">
                <p className="text-sm font-semibold text-slate-300">
                  No notices found in this category
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-md transition-all hover:border-[var(--accent)]/60 hover:bg-slate-900/90 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeStyle(
                            notice.category
                          )}`}
                        >
                          {getCategoryLabel(notice.category)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {notice.date}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors mb-2 leading-snug">
                        {notice.title}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                        {notice.summary || notice.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                      <span className="text-xs font-semibold text-[var(--accent)] group-hover:underline inline-flex items-center gap-1">
                        Read Full Details
                        <svg
                          className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(notice, e)}
                        className="text-xs text-slate-400 hover:text-white p-1 transition"
                      >
                        {copiedId === notice.id ? (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Copied
                          </span>
                        ) : (
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
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z"
                            />
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

      {/* FULL NOTICE DETAIL MODAL */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-slate-900 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase ${getCategoryBadgeStyle(
                  selectedNotice.category
                )}`}
              >
                {getCategoryLabel(selectedNotice.category)}
              </span>
              <span className="text-xs text-slate-400">
                Published {selectedNotice.date}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
              {selectedNotice.title}
            </h2>

            <div className="text-sm sm:text-base text-slate-200 space-y-3 leading-relaxed mb-6 whitespace-pre-line border-t border-white/10 pt-4">
              {selectedNotice.content}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              {selectedNotice.link ? (
                <Link
                  href={selectedNotice.link}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-5 py-2 text-xs font-semibold shadow hover:brightness-110 transition"
                >
                  {selectedNotice.linkLabel || "Action Link"}
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(selectedNotice, e)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  {copiedId === selectedNotice.id
                    ? "Link Copied!"
                    : "Copy Direct Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
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
