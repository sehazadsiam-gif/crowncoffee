"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import CrownMark from "../CrownMark";

export default function MenuSlideshow({ menu, settings }) {
  // ─── 1. Build Slide Deck ───────────────────────────────────────────────────
  const slides = useMemo(() => {
    if (!menu || !menu.items || menu.items.length === 0) return [];

    const items = [...menu.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const categories =
      menu.categories && menu.categories.length > 0
        ? menu.categories
        : Array.from(new Set(items.map((i) => i.category)));

    const slideDeck = [];

    categories.forEach((category) => {
      const categoryItems = items.filter((item) => item.category === category);
      if (categoryItems.length === 0) return;

      // a) Category Cover / Intro Slide
      slideDeck.push({
        type: "category_intro",
        id: `cat_intro_${category.toLowerCase().replace(/\s+/g, "_")}`,
        category,
        totalItems: categoryItems.length,
        items: categoryItems,
      });

      // b) Individual Item Slides (100% Full-Screen Picture + Overlay Text)
      categoryItems.forEach((item, idx) => {
        slideDeck.push({
          type: "item",
          id: `item_${item.id || idx}`,
          item,
          category,
          itemIndex: idx + 1,
          totalCategoryItems: categoryItems.length,
        });
      });

      // c) Category Grid Overview Slide (if 2+ items)
      if (categoryItems.length >= 2) {
        slideDeck.push({
          type: "category_grid",
          id: `cat_grid_${category.toLowerCase().replace(/\s+/g, "_")}`,
          category,
          items: categoryItems,
        });
      }
    });

    return slideDeck;
  }, [menu]);

  // ─── 2. State & Timing ─────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(7); // seconds per slide
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [viewMode, setViewMode] = useState("items_only"); // default to items_only for TV
  const [clockTime, setClockTime] = useState("");

  const containerRef = useRef(null);
  const hideControlsTimerRef = useRef(null);

  // Filtered slides according to viewMode
  const activeSlides = useMemo(() => {
    if (viewMode === "items_only") {
      return slides.filter((s) => s.type === "item");
    }
    return slides;
  }, [slides, viewMode]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  // ─── Live Clock ────────────────────────────────────────────────────────────
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Control Bar Auto-hide ──────────────────────────────────────────────────
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 4000);
  };

  // ─── Next / Prev Slide ─────────────────────────────────────────────────────
  const nextSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    setProgress(0);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setProgress(0);
  }, [activeSlides.length]);

  // ─── Timer / Progress Loop ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || activeSlides.length === 0) return;

    const stepMs = 50;
    const totalMs = duration * 1000;
    const increment = (stepMs / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isPlaying, duration, nextSlide, activeSlides.length]);

  // ─── Fullscreen Toggle ─────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error("Fullscreen request failed:", err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // ─── Keyboard Shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        setShowQrModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // ─── Category Quick Jump ───────────────────────────────────────────────────
  const categoriesList = useMemo(() => {
    const set = new Set();
    slides.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [slides]);

  const jumpToCategory = (categoryName) => {
    const targetIdx = activeSlides.findIndex((s) => s.category === categoryName);
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
      setProgress(0);
    }
  };

  if (!currentSlide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070504] text-white">
        <p className="text-xl">Loading Crown Coffee Menu...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen w-screen overflow-hidden bg-[#070504] text-[#faf6ef] select-none font-sans"
    >
      {/* ─── Top Timer Progress Line ─── */}
      <div className="absolute top-0 left-0 right-0 z-50 h-2.5 bg-black/60">
        <div
          className="h-full bg-gradient-to-r from-[#b6862c] via-[#f3d37c] to-[#b6862c] transition-all duration-75 ease-linear shadow-[0_0_20px_rgba(243,211,124,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ─── Top Header Overlay (Prominent "Crown Coffee" Branding & Live Clock) ─── */}
      <header className="absolute top-6 left-8 right-8 z-40 flex items-center justify-between pointer-events-auto">
        {/* Prominent Crown Coffee Brand Pill */}
        <div className="flex items-center gap-4 bg-black/75 backdrop-blur-2xl px-7 py-3.5 rounded-3xl border-2 border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b6862c] via-[#e8c04a] to-[#785417] text-white shadow-lg">
            <CrownMark className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider uppercase text-white leading-none drop-shadow-md">
              {settings.siteName || "Crown Coffee"}
            </h1>
            <p className="text-xs sm:text-sm text-[#e8c04a] font-extrabold tracking-[0.25em] uppercase mt-1">
              Digital Menu Board • Bangladesh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 bg-black/75 backdrop-blur-2xl px-5 py-3 rounded-2xl border-2 border-white/20 text-sm font-black text-white shadow-2xl">
            <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="tracking-wider uppercase">Live TV</span>
          </div>

          <div className="bg-black/80 backdrop-blur-2xl px-6 py-3 rounded-2xl border-2 border-[#b6862c]/70 text-base font-mono font-black text-[#f3d37c] shadow-2xl">
            {clockTime}
          </div>

          <Link
            href="/menu"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-2xl p-3 rounded-2xl border-2 border-white/30 text-white transition hover:scale-105 shadow-2xl"
            title="Return to Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ─── 100% FULL-SCREEN PICTURE CANVAS & OVERLAY DATA ─── */}
      <main className="relative z-10 h-full w-full">
        {/* ─── TYPE A: ITEM SPOTLIGHT SLIDE (100% PICTURE + FLOATING OVERLAY DATA) ─── */}
        {currentSlide.type === "item" && (
          <div className="relative h-full w-full overflow-hidden bg-[#070504]">
            {/* 100% Full-Screen Photo */}
            {currentSlide.item.image ? (
              <Image
                src={currentSlide.item.image}
                alt={currentSlide.item.name}
                fill
                priority
                className="object-cover transition-transform duration-1000 ease-out"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-[#1c1612] via-[#2a211b] to-[#070504] h-full w-full">
                <div className="h-40 w-40 rounded-full bg-[#b6862c]/30 border-2 border-[#b6862c]/70 flex items-center justify-center mb-8 shadow-2xl">
                  <CrownMark className="h-24 w-24 text-[#f3d37c]" />
                </div>
                <h4 className="font-display text-5xl sm:text-7xl font-black text-white tracking-wide">
                  {currentSlide.item.name}
                </h4>
                <p className="text-lg text-[#b6862c] uppercase tracking-widest mt-4 font-black">
                  Crown Coffee House Specialty
                </p>
              </div>
            )}

            {/* Top Badges overlay floating on 100% image */}
            <div className="absolute top-28 left-8 flex flex-wrap gap-3 z-20">
              <span className="bg-[#b6862c] text-black text-base sm:text-lg font-black uppercase px-7 py-3 rounded-2xl shadow-2xl tracking-widest border border-white/30">
                {currentSlide.category}
              </span>
              {currentSlide.item.kiosk && (
                <span className="bg-white text-black text-base sm:text-lg font-black uppercase px-7 py-3 rounded-2xl shadow-2xl tracking-widest">
                  ★ Chef Special
                </span>
              )}
            </div>

            <div className="absolute top-28 right-8 bg-black/75 backdrop-blur-2xl px-6 py-2.5 rounded-2xl border-2 border-white/20 text-sm font-black text-white/90 z-20 shadow-2xl">
              Item {currentSlide.itemIndex} / {currentSlide.totalCategoryItems}
            </div>

            {/* 100% Picture Floating Bottom Glass Gradient Overlay: Giant Name & Price */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/85 to-transparent pt-28 pb-20 px-8 sm:px-14 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              {/* Item Name */}
              <div className="max-w-5xl">
                <div className="flex items-center gap-2.5 mb-3 text-[#f3d37c] font-black text-base sm:text-lg tracking-[0.25em] uppercase">
                  <CrownMark className="h-6 w-6" />
                  <span>{currentSlide.category}</span>
                </div>
                <h2 className="font-display text-6xl sm:text-8xl lg:text-9xl font-black text-white leading-none tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">
                  {currentSlide.item.name}
                </h2>
              </div>

              {/* Giant Price Tag in BDT */}
              <div className="shrink-0 flex items-center gap-4">
                <div className="inline-flex items-baseline gap-2 bg-gradient-to-r from-[#b6862c] via-[#e8c04a] to-[#d4a017] text-black px-10 py-5 rounded-3xl shadow-[0_20px_50px_rgba(182,134,44,0.9)] border-2 border-white/40 font-black">
                  <span className="text-3xl sm:text-4xl font-extrabold">৳</span>
                  <span className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight">
                    {currentSlide.item.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TYPE B: CATEGORY INTRO SLIDE ─── */}
        {currentSlide.type === "category_intro" && (
          <div className="relative h-full w-full bg-[#070504] p-8 sm:p-16 text-center flex flex-col items-center justify-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,134,44,0.35)_0%,transparent_75%)] pointer-events-none" />

            <div className="inline-flex items-center gap-3 bg-[#b6862c]/30 border-2 border-[#b6862c]/70 text-[#f3d37c] px-8 py-3 rounded-full text-lg font-black uppercase tracking-widest mb-8 shadow-2xl">
              <CrownMark className="h-7 w-7" />
              <span>Menu Section</span>
            </div>

            <h2 className="font-display text-7xl sm:text-9xl font-black text-white tracking-tight leading-none mb-6 drop-shadow-[0_15px_30px_rgba(0,0,0,1)]">
              {currentSlide.category}
            </h2>

            <p className="text-3xl sm:text-4xl text-[#e8c04a] font-extrabold max-w-4xl mb-14">
              {currentSlide.totalItems} Specialty Selections
            </p>

            {/* Collage of item photos */}
            <div className="flex items-center justify-center gap-6 flex-wrap max-w-5xl">
              {currentSlide.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="relative h-44 w-44 sm:h-56 sm:w-56 rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-[#1c1612]"
                >
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#2a211b]">
                      <CrownMark className="h-14 w-14 text-[#b6862c]/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-4">
                    <p className="text-base sm:text-lg font-black text-white truncate">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TYPE C: CATEGORY OVERVIEW GRID SLIDE ─── */}
        {currentSlide.type === "category_grid" && (
          <div className="relative h-full w-full bg-[#070504] p-8 sm:p-14 flex flex-col justify-center shadow-2xl pt-28 pb-24">
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-6 mb-8">
              <div>
                <span className="text-base font-black text-[#f3d37c] tracking-widest uppercase">
                  TV Section Overview
                </span>
                <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
                  {currentSlide.category}
                </h2>
              </div>
              <span className="bg-[#b6862c] text-black px-7 py-3 rounded-full text-base font-black uppercase tracking-wider">
                {currentSlide.items.length} Items
              </span>
            </div>

            {/* Grid of Menu Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto max-h-[70vh] pr-4">
              {currentSlide.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/20 backdrop-blur-xl hover:border-[#b6862c] transition"
                >
                  <div className="relative h-28 w-28 shrink-0 rounded-2xl overflow-hidden bg-[#1c1612] border border-white/25">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <CrownMark className="h-10 w-10 text-[#b6862c]/60" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-2xl font-black text-white truncate">
                      {item.name}
                    </h3>
                    <span className="inline-block mt-3 text-xl font-black text-[#f3d37c] bg-white/10 px-4 py-1.5 rounded-xl">
                      ৳{item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── BOTTOM CONTROLS & NAVIGATION BAR ─── */}
      <footer
        className={`absolute bottom-4 left-6 right-6 z-40 transition-opacity duration-300 pointer-events-auto ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/80 backdrop-blur-2xl p-3.5 sm:px-6 rounded-3xl border border-white/20 shadow-2xl">
          {/* Category Quick Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full sm:max-w-xl pb-1 sm:pb-0 scrollbar-none">
            {categoriesList.map((cat) => {
              const isCurrentCat = currentSlide.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => jumpToCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition ${
                    isCurrentCat
                      ? "bg-[#b6862c] text-black shadow-lg font-black scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Central Playback Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Prev */}
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              title="Previous Slide (Left Arrow)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3.5 rounded-full bg-gradient-to-r from-[#b6862c] to-[#d4a017] text-black shadow-xl hover:brightness-110 transition active:scale-95"
              title={isPlaying ? "Pause (Spacebar)" : "Play (Spacebar)"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              title="Next Slide (Right Arrow)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slide Counter */}
            <span className="text-xs font-mono font-bold text-white/80 px-2">
              {currentIndex + 1} / {activeSlides.length}
            </span>

            {/* Speed Selector */}
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-white/15 border border-white/20 text-white text-xs font-bold rounded-2xl px-3 py-2 outline-none cursor-pointer hover:bg-white/25"
              title="Slide Duration"
            >
              <option value={5} className="bg-[#1c1612] text-white">5s</option>
              <option value={7} className="bg-[#1c1612] text-white">7s</option>
              <option value={10} className="bg-[#1c1612] text-white">10s</option>
              <option value={15} className="bg-[#1c1612] text-white">15s</option>
            </select>

            {/* View Mode Switcher */}
            <button
              onClick={() => {
                setViewMode((prev) => (prev === "all" ? "items_only" : "all"));
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition ${
                viewMode === "items_only"
                  ? "bg-[#54614a] text-white shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-white/80"
              }`}
              title="Toggle View Mode"
            >
              {viewMode === "items_only" ? "Items Only" : "Full Story"}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 0l5-5m0 0l-5 0m5 0l0 5m-5 11l5 5m0 0l-5 0m5 0l0-5m-11 0l-5 5m0 0l5 0m-5 0l0-5" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* ─── SCAN TO ORDER QR MODAL ─── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#1c1612] border-2 border-[#b6862c]/60 p-8 text-center shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition text-lg font-bold"
            >
              ✕
            </button>
            <div className="h-14 w-14 rounded-full bg-[#b6862c]/30 border-2 border-[#b6862c]/70 flex items-center justify-center mx-auto mb-4">
              <CrownMark className="h-7 w-7 text-[#f3d37c]" />
            </div>
            <h3 className="font-display text-2xl font-black text-white">Order From Table</h3>
            <p className="text-xs text-white/70 mt-1">
              Scan with your mobile camera to view full menu & order live.
            </p>
            <div className="mt-6 p-4 bg-white rounded-2xl inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? `${window.location.origin}/menu`
                    : "https://crowncoffeebangladesh.xyz/menu"
                )}`}
                alt="Scan to order"
                className="w-44 h-44 mx-auto"
              />
            </div>
            <p className="mt-4 text-xs font-black text-[#f3d37c]">
              crowncoffeebangladesh.xyz/menu
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
