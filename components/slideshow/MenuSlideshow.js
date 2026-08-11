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

      // b) Individual Item Slides (Picture, Name, Description, Price)
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
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'items_only'
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
      <div className="flex min-h-screen items-center justify-center bg-[#0c0a09] text-white">
        <p className="text-xl">Loading Crown Coffee Menu...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen w-screen overflow-hidden bg-[#0a0806] text-[#faf6ef] select-none font-sans"
    >
      {/* ─── Ambient Glow & Blurred Backdrop ─── */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-all duration-1000 ease-out">
        {currentSlide.type === "item" && currentSlide.item.image ? (
          <Image
            src={currentSlide.item.image}
            alt=""
            fill
            className="object-cover blur-3xl scale-125"
            priority
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_40%,rgba(182,134,44,0.35)_0%,rgba(15,12,10,0.95)_70%)]" />
        )}
      </div>

      {/* Subtle floating gold aura particles */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(182,134,44,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(84,97,74,0.2),transparent_60%)] pointer-events-none" />

      {/* ─── Top Timer Progress Line ─── */}
      <div className="absolute top-0 left-0 right-0 z-50 h-1.5 bg-black/40">
        <div
          className="h-full bg-gradient-to-r from-[#b6862c] via-[#f3d37c] to-[#b6862c] transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(243,211,124,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ─── Top Header Overlay (Branding & Live Clock) ─── */}
      <header className="absolute top-4 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#b6862c] to-[#785417] text-white shadow-md">
            <CrownMark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-wider uppercase text-white leading-none">
              {settings.siteName || "Crown Coffee"}
            </h1>
            <p className="text-[10px] text-[#e8c04a] font-medium tracking-widest uppercase mt-0.5">
              Bangladesh • Digital Menu Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status pill */}
          <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Display</span>
          </div>

          {/* Clock */}
          <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#b6862c]/40 text-xs font-mono font-bold text-[#f3d37c] shadow-lg">
            {clockTime}
          </div>

          {/* Quick Exit / Back button */}
          <Link
            href="/menu"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/15 text-white transition hover:scale-105"
            title="Return to Menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ─── SLIDE CONTENT DISPLAY CONTAINER ─── */}
      <main className="relative z-10 h-full w-full flex items-center justify-center px-6 py-20 lg:px-16 lg:py-24">
        {/* ─── TYPE A: ITEM SPOTLIGHT SLIDE ─── */}
        {currentSlide.type === "item" && (
          <div className="w-full max-w-7xl h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
            {/* Left: Product Image Showcase */}
            <div className="relative w-full lg:w-1/2 h-[45vh] lg:h-[70vh] rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-[#14100c]/80 group flex items-center justify-center">
              {currentSlide.item.image ? (
                <Image
                  src={currentSlide.item.image}
                  alt={currentSlide.item.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#1c1612] via-[#2a211b] to-[#120e0c] h-full w-full">
                  <div className="h-24 w-24 rounded-full bg-[#b6862c]/20 border border-[#b6862c]/40 flex items-center justify-center mb-6 shadow-inner">
                    <CrownMark className="h-12 w-12 text-[#f3d37c]" />
                  </div>
                  <h4 className="font-display text-2xl font-bold text-white tracking-wide">
                    {currentSlide.item.name}
                  </h4>
                  <p className="text-xs text-[#b6862c] uppercase tracking-widest mt-2 font-semibold">
                    Crown Coffee House Signature
                  </p>
                </div>
              )}

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
                <span className="bg-[#b6862c] text-black text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full shadow-lg tracking-wider">
                  {currentSlide.category}
                </span>
                {currentSlide.item.kiosk && (
                  <span className="bg-white/90 text-black text-xs font-bold uppercase px-3.5 py-1.5 rounded-full shadow-lg tracking-wider">
                    ★ Kiosk Favorite
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10 text-xs font-medium text-white/80">
                Item {currentSlide.itemIndex} of {currentSlide.totalCategoryItems}
              </div>
            </div>

            {/* Right: Item Details */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
              {/* Category Breadcrumb */}
              <div className="flex items-center gap-2 mb-3 text-[#f3d37c] font-medium text-sm tracking-wider uppercase">
                <CrownMark className="h-4 w-4" />
                <span>{currentSlide.category}</span>
              </div>

              {/* Item Name */}
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
                {currentSlide.item.name}
              </h2>

              {/* Price Tag */}
              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex items-baseline gap-1 bg-gradient-to-r from-[#b6862c] to-[#d4a017] text-black px-6 py-2.5 rounded-2xl shadow-[0_10px_25px_-5px_rgba(182,134,44,0.5)] font-bold">
                  <span className="text-lg font-medium">৳</span>
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {currentSlide.item.price}
                  </span>
                </div>
                <span className="text-xs text-white/60 uppercase tracking-widest font-semibold">
                  VAT Included
                </span>
              </div>

              {/* Description */}
              {currentSlide.item.description && (
                <p className="mt-6 text-lg sm:text-xl text-[#d4cbbe] leading-relaxed font-light max-w-xl border-l-2 border-[#b6862c]/60 pl-4 py-1">
                  {currentSlide.item.description}
                </p>
              )}

              {/* Footer Info / Mobile Order Prompt */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#f3d37c]">
                    ☕
                  </div>
                  <div>
                    <p className="font-semibold text-white">Freshly Prepared</p>
                    <p className="text-xs text-white/50">Made to order by our expert baristas & chefs</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 rounded-xl text-xs font-semibold text-white transition"
                >
                  <svg className="w-4 h-4 text-[#f3d37c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span>Scan to Order</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TYPE B: CATEGORY INTRO SLIDE ─── */}
        {currentSlide.type === "category_intro" && (
          <div className="w-full max-w-4xl text-center flex flex-col items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 bg-[#b6862c]/20 border border-[#b6862c]/50 text-[#f3d37c] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <CrownMark className="h-4 w-4" />
              <span>Menu Section</span>
            </div>

            <h2 className="font-display text-5xl sm:text-7xl font-bold text-white tracking-tight leading-none mb-6">
              {currentSlide.category}
            </h2>

            <p className="text-xl sm:text-2xl text-[#d4cbbe] max-w-2xl font-light mb-10">
              Featuring {currentSlide.totalItems} exquisite selections hand-crafted for Crown Coffee patrons.
            </p>

            {/* Collage of item photos */}
            <div className="flex items-center justify-center gap-4 flex-wrap max-w-3xl">
              {currentSlide.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-[#1c1612]"
                >
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#2a211b]">
                      <CrownMark className="h-8 w-8 text-[#b6862c]/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TYPE C: CATEGORY OVERVIEW GRID SLIDE ─── */}
        {currentSlide.type === "category_grid" && (
          <div className="w-full max-w-6xl flex flex-col h-full justify-center">
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#f3d37c] tracking-widest uppercase">
                  Category Overview
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  {currentSlide.category} Selection
                </h2>
              </div>
              <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-white/80">
                {currentSlide.items.length} Items Available
              </span>
            </div>

            {/* Grid of Menu Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 overflow-y-auto max-h-[60vh] pr-2">
              {currentSlide.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#b6862c]/60 transition"
                >
                  <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-[#1c1612] border border-white/10">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <CrownMark className="h-6 w-6 text-[#b6862c]/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-white truncate">
                        {item.name}
                      </h3>
                      <span className="text-sm font-extrabold text-[#f3d37c] shrink-0">
                        ৳{item.price}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-white/60 line-clamp-2 mt-1 font-light">
                        {item.description}
                      </p>
                    )}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/60 backdrop-blur-xl p-3 sm:px-6 sm:py-3 rounded-2xl border border-white/15 shadow-2xl">
          {/* Category Quick Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full sm:max-w-xl pb-1 sm:pb-0 scrollbar-none">
            {categoriesList.map((cat) => {
              const isCurrentCat = currentSlide.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => jumpToCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isCurrentCat
                      ? "bg-[#b6862c] text-black shadow-md font-bold"
                      : "bg-white/5 hover:bg-white/15 text-white/80"
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
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              title="Previous Slide (Left Arrow)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-gradient-to-r from-[#b6862c] to-[#d4a017] text-black shadow-lg hover:brightness-110 transition active:scale-95"
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
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              title="Next Slide (Right Arrow)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slide Counter */}
            <span className="text-xs font-mono text-white/70 px-2">
              {currentIndex + 1} / {activeSlides.length}
            </span>

            {/* Speed Selector */}
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-white/10 border border-white/15 text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:bg-white/20"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewMode === "items_only"
                  ? "bg-[#54614a] text-white"
                  : "bg-white/10 hover:bg-white/20 text-white/80"
              }`}
              title="Toggle View Mode"
            >
              {viewMode === "items_only" ? "Items Only" : "Full Story"}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#1c1612] border border-[#b6862c]/40 p-8 text-center shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition"
            >
              ✕
            </button>
            <div className="h-12 w-12 rounded-full bg-[#b6862c]/20 border border-[#b6862c]/50 flex items-center justify-center mx-auto mb-4">
              <CrownMark className="h-6 w-6 text-[#f3d37c]" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Order From Your Table</h3>
            <p className="text-xs text-white/70 mt-1">
              Scan with your phone camera to view menu & place your order live.
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
            <p className="mt-4 text-xs font-semibold text-[#f3d37c]">
              crowncoffeebangladesh.xyz/menu
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
