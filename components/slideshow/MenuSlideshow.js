"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import CrownMark from "../CrownMark";
import CustomizationModal from "../CustomizationModal";
import { useBasket } from "@/context/BasketContext";

export default function MenuSlideshow({ menu, settings }) {
  const { addToBasket } = useBasket();

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
  const [prevIndex, setPrevIndex] = useState(null);
  const [direction, setDirection] = useState("next"); // "next" | "prev"
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(7); // seconds per slide
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [viewMode, setViewMode] = useState("items_only"); // default to items_only for TV
  const [clockTime, setClockTime] = useState("");
  const [customizingItem, setCustomizingItem] = useState(null);

  // Interactive Swipe / Drag State
  const [dragStartX, setDragStartX] = useState(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const thumbnailScrollRef = useRef(null);

  // Filtered slides according to viewMode
  const activeSlides = useMemo(() => {
    if (viewMode === "items_only") {
      return slides.filter((s) => s.type === "item");
    }
    return slides;
  }, [slides, viewMode]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];
  const previousSlide = prevIndex !== null ? activeSlides[prevIndex] : null;

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
    }, 4500);
  };

  // ─── Next / Prev Slide ─────────────────────────────────────────────────────
  const goToSlide = useCallback((targetIndex, dir = "next") => {
    if (activeSlides.length === 0) return;
    setPrevIndex(currentIndex);
    setDirection(dir);
    setCurrentIndex(targetIndex);
    setProgress(0);
  }, [activeSlides.length, currentIndex]);

  const nextSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    const nextIdx = (currentIndex + 1) % activeSlides.length;
    goToSlide(nextIdx, "next");
  }, [activeSlides.length, currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    const prevIdx = (currentIndex - 1 + activeSlides.length) % activeSlides.length;
    goToSlide(prevIdx, "prev");
  }, [activeSlides.length, currentIndex, goToSlide]);

  // ─── Touch & Mouse Swipe / Drag Handlers ────────────────────────────────────
  const handlePointerDown = (clientX) => {
    setDragStartX(clientX);
    setIsDragging(true);
    setDragOffsetX(0);
  };

  const handlePointerMove = (clientX) => {
    if (!isDragging || dragStartX === null) return;
    const offset = clientX - dragStartX;
    setDragOffsetX(offset);
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffsetX < -60) {
      nextSlide();
    } else if (dragOffsetX > 60) {
      prevSlide();
    }
    setDragOffsetX(0);
    setDragStartX(null);
  };

  // ─── Timer / Progress Loop (Bulletproof Auto-Advance) ──────────────────────
  const startTimeRef = useRef(Date.now());

  // Reset timer start time whenever currentIndex changes or duration/isPlaying changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    setProgress(0);
  }, [currentIndex, duration, isPlaying]);

  useEffect(() => {
    if (!isPlaying || activeSlides.length <= 1 || customizingItem) {
      setProgress(0);
      return;
    }

    const totalMs = duration * 1000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);

      if (elapsed >= totalMs) {
        startTimeRef.current = Date.now();
        setProgress(0);
        setPrevIndex(currentIndex);
        setDirection("next");
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isPlaying, duration, activeSlides.length, customizingItem, currentIndex]);

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
      const dir = targetIdx >= currentIndex ? "next" : "prev";
      goToSlide(targetIdx, dir);
    }
  };

  // Scroll active item thumbnail into view
  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const activeThumb = document.getElementById(`thumb-slide-${currentIndex}`);
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentIndex]);

  if (!currentSlide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070504] text-white">
        <p className="text-xl">Loading Crown Coffee Menu...</p>
      </div>
    );
  }

  const slideAnimationClass = direction === "next" ? "animate-slide-next" : "animate-slide-prev";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
      onTouchEnd={handlePointerEnd}
      onMouseDown={(e) => handlePointerDown(e.clientX)}
      onMouseMoveCapture={(e) => handlePointerMove(e.clientX)}
      onMouseUp={handlePointerEnd}
      className="relative h-screen w-screen overflow-hidden bg-[#070504] text-[#faf6ef] select-none font-sans cursor-grab active:cursor-grabbing"
    >
      {/* ─── Top Timer Progress Line ─── */}
      <div className="absolute top-0 left-0 right-0 z-50 h-2 bg-black/60">
        <div
          className="h-full bg-gradient-to-r from-[#b6862c] via-[#f3d37c] to-[#b6862c] transition-all duration-75 ease-linear shadow-[0_0_20px_rgba(243,211,124,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ─── Top Header Overlay (Prominent Branding & Live Clock) ─── */}
      <header className="absolute top-5 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto">
        {/* Prominent Crown Coffee Brand Pill */}
        <div className="flex items-center gap-3.5 bg-black/80 backdrop-blur-2xl px-6 py-3 rounded-3xl border border-white/20 shadow-2xl transition-spring hover:scale-105">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b6862c] via-[#e8c04a] to-[#785417] text-white shadow-lg">
            <CrownMark className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-black tracking-wider uppercase text-white leading-none drop-shadow-md">
              {settings.siteName || "Crown Coffee"}
            </h1>
            <p className="text-[10px] sm:text-xs text-[#e8c04a] font-extrabold tracking-[0.25em] uppercase mt-1">
              Digital Menu Board &bull; Bangladesh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-black/80 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-black text-white shadow-2xl">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="tracking-wider uppercase">Live Menu</span>
          </div>

          <div className="bg-black/85 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-[#b6862c]/70 text-sm font-mono font-black text-[#f3d37c] shadow-2xl">
            {clockTime}
          </div>

          <Link
            href="/menu"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-2xl p-2.5 rounded-2xl border border-white/30 text-white transition-spring hover:scale-105 shadow-2xl"
            title="Return to Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ─── SINGLE FULL-SCREEN PICTURE CANVAS (LIGHTWEIGHT & LAG-FREE) ─── */}
      <main className="relative z-10 h-full w-full">
        {/* ─── TYPE A: ITEM SPOTLIGHT SLIDE ─── */}
        {currentSlide.type === "item" && (
          <div key={currentSlide.id} className="relative h-full w-full overflow-hidden bg-[#070504]">
            {/* 100% Full-Screen Photo */}
            {currentSlide.item.image ? (
              <Image
                src={currentSlide.item.image}
                alt={currentSlide.item.name}
                fill
                priority
                className="object-cover"
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

            {/* Floating Top Category & Chef Badges */}
            <div className="absolute top-24 left-8 flex flex-wrap gap-3 z-20">
              <span className="bg-[#b6862c] text-black text-xs sm:text-sm font-black uppercase px-6 py-2.5 rounded-2xl shadow-xl tracking-widest border border-white/30">
                {currentSlide.category}
              </span>
              {currentSlide.item.bestSeller && (
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs sm:text-sm font-black uppercase px-6 py-2.5 rounded-2xl shadow-xl tracking-widest">
                  ★ Best Seller
                </span>
              )}
            </div>

            <div className="absolute top-24 right-8 bg-black/80 px-5 py-2 rounded-2xl border border-white/20 text-xs font-black text-white/90 z-20 shadow-xl">
              {currentSlide.itemIndex} / {currentSlide.totalCategoryItems}
            </div>

            {/* Bottom Gradient Overlay: Name & Price */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/85 to-transparent pt-28 pb-36 px-8 sm:px-14 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              {/* Item Name */}
              <div className="max-w-4xl">
                <div className="flex items-center gap-2.5 mb-2.5 text-[#f3d37c] font-black text-xs sm:text-base tracking-[0.25em] uppercase">
                  <CrownMark className="h-5 w-5" />
                  <span>{currentSlide.category}</span>
                </div>
                <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight drop-shadow-md">
                  {currentSlide.item.name}
                </h2>
                {currentSlide.item.description && (
                  <p className="mt-3 text-sm sm:text-lg text-white/80 font-medium max-w-2xl line-clamp-2 drop-shadow-md">
                    {currentSlide.item.description}
                  </p>
                )}
              </div>

              {/* Price Tag & Direct Order / Customize Button */}
              <div className="shrink-0 flex items-center gap-4">
                <div className="inline-flex items-baseline gap-2 bg-gradient-to-r from-[#b6862c] via-[#e8c04a] to-[#d4a017] text-black px-8 py-4 rounded-3xl shadow-xl border-2 border-white/40 font-black">
                  <span className="text-2xl sm:text-3xl font-extrabold">৳</span>
                  <span className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight">
                    {currentSlide.item.price}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomizingItem(currentSlide.item);
                  }}
                  className="hidden md:flex items-center gap-2 bg-white hover:bg-amber-50 text-black px-6 py-4 rounded-3xl font-extrabold text-sm uppercase tracking-wider shadow-2xl active:scale-95 transition-transform"
                  title="Customize & Order Item"
                >
                  <span>♛</span>
                  <span>Order Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TYPE B: CATEGORY INTRO SLIDE ─── */}
        {currentSlide.type === "category_intro" && (
          <div key={currentSlide.id} className="relative h-full w-full bg-[#070504] p-8 sm:p-16 text-center flex flex-col items-center justify-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,134,44,0.25)_0%,transparent_75%)] pointer-events-none" />

            <div className="inline-flex items-center gap-3 bg-[#b6862c]/30 border-2 border-[#b6862c]/70 text-[#f3d37c] px-8 py-3 rounded-full text-base sm:text-lg font-black uppercase tracking-widest mb-6 shadow-2xl">
              <CrownMark className="h-6 w-6" />
              <span>Menu Section</span>
            </div>

            <h2 className="font-display text-6xl sm:text-8xl font-black text-white tracking-tight leading-none mb-4 drop-shadow-md">
              {currentSlide.category}
            </h2>

            <p className="text-2xl sm:text-3xl text-[#e8c04a] font-extrabold max-w-4xl mb-12">
              {currentSlide.totalItems} Specialty Selections
            </p>

            {/* Collage of item photos */}
            <div className="flex items-center justify-center gap-5 flex-wrap max-w-5xl">
              {currentSlide.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetIdx = activeSlides.findIndex((s) => s.item?.id === item.id);
                    if (targetIdx !== -1) goToSlide(targetIdx, "next");
                  }}
                  className="relative h-40 w-40 sm:h-52 sm:w-52 rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-[#1c1612] cursor-pointer hover:border-[#b6862c] transition-colors"
                >
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#2a211b]">
                      <CrownMark className="h-12 w-12 text-[#b6862c]/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3.5">
                    <p className="text-sm font-black text-white truncate">{item.name}</p>
                    <p className="text-xs font-bold text-[#f3d37c]">৳{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TYPE C: CATEGORY OVERVIEW GRID SLIDE ─── */}
        {currentSlide.type === "category_grid" && (
          <div key={currentSlide.id} className="relative h-full w-full bg-[#070504] p-8 sm:p-14 flex flex-col justify-center shadow-2xl pt-28 pb-36">
            <div className="flex items-center justify-between border-b border-white/20 pb-5 mb-8">
              <div>
                <span className="text-xs font-black text-[#f3d37c] tracking-widest uppercase">
                  Section Overview
                </span>
                <h2 className="font-display text-4xl sm:text-6xl font-black text-white">
                  {currentSlide.category}
                </h2>
              </div>
              <span className="bg-[#b6862c] text-black px-6 py-2.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg">
                {currentSlide.items.length} Items
              </span>
            </div>

            {/* Grid of Menu Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[65vh] pr-3">
              {currentSlide.items.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetIdx = activeSlides.findIndex((s) => s.item?.id === item.id);
                    if (targetIdx !== -1) goToSlide(targetIdx, "next");
                  }}
                  className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/20 hover:border-[#b6862c] shadow-xl cursor-pointer transition-colors"
                >
                  <div className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden bg-[#1c1612] border border-white/25">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <CrownMark className="h-9 w-9 text-[#b6862c]/60" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl font-black text-white truncate">
                      {item.name}
                    </h3>
                    <span className="inline-block mt-2.5 text-base font-black text-[#f3d37c] bg-white/10 px-3.5 py-1 rounded-xl border border-white/10">
                      ৳{item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── INTERACTIVE BOTTOM THUMBNAIL CAROUSEL & NAVIGATION BAR ─── */}
      <footer
        className={`absolute bottom-3 left-4 right-4 z-40 transition-all duration-300 pointer-events-auto ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-2 bg-black/85 backdrop-blur-2xl p-3 sm:px-5 rounded-3xl border border-white/20 shadow-2xl">
          {/* Scrollable Interactive Item Thumbnail Strip */}
          <div ref={thumbnailScrollRef} className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x">
            {activeSlides.map((s, idx) => {
              const isActive = idx === currentIndex;
              if (s.type === "item") {
                return (
                  <button
                    key={`thumb-${s.id}`}
                    id={`thumb-slide-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(idx, idx >= currentIndex ? "next" : "prev");
                    }}
                    className={`relative shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border text-left transition-spring snap-start cursor-pointer active:scale-95 ${
                      isActive
                        ? "border-[#b6862c] bg-[#b6862c]/20 shadow-[0_0_16px_rgba(182,134,44,0.4)] scale-105"
                        : "border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30"
                    }`}
                  >
                    <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0 bg-black/40">
                      {s.item.image ? (
                        <Image src={s.item.image} alt={s.item.name} fill className="object-cover" />
                      ) : (
                        <CrownMark className="h-5 w-5 text-[#b6862c] m-auto" />
                      )}
                    </div>
                    <div className="min-w-0 pr-1">
                      <p className={`text-xs font-bold leading-tight truncate max-w-[100px] ${isActive ? "text-[#f3d37c]" : "text-white/90"}`}>
                        {s.item.name}
                      </p>
                      <p className="text-[10px] font-bold text-white/60">৳{s.item.price}</p>
                    </div>
                  </button>
                );
              }
              return (
                <button
                  key={`thumb-${s.id}`}
                  id={`thumb-slide-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx, idx >= currentIndex ? "next" : "prev");
                  }}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-spring snap-start cursor-pointer active:scale-95 ${
                    isActive
                      ? "bg-[#b6862c] text-black shadow-md scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white/80"
                  }`}
                >
                  ★ {s.category} Cover
                </button>
              );
            })}
          </div>

          {/* Central Playback Controls & Category Jump */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10">
            {/* Category Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full sm:max-w-md scrollbar-none">
              {categoriesList.map((cat) => {
                const isCurrentCat = currentSlide.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToCategory(cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition-spring active:scale-90 ${
                      isCurrentCat
                        ? "bg-[#b6862c] text-black shadow-md font-black"
                        : "bg-white/10 hover:bg-white/20 text-white/80"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Playback Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-spring active:scale-80"
                title="Previous Slide"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                className="p-3 rounded-full bg-gradient-to-r from-[#b6862c] to-[#d4a017] text-black shadow-lg hover:brightness-110 transition-spring active:scale-80"
                title={isPlaying ? "Pause (Spacebar)" : "Play (Spacebar)"}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-spring active:scale-80"
                title="Next Slide"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <span className="text-[11px] font-mono font-bold text-white/80 px-1">
                {currentIndex + 1} / {activeSlides.length}
              </span>

              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/15 border border-white/20 text-white text-[11px] font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:bg-white/25 transition-spring"
                title="Slide Duration"
              >
                <option value={5} className="bg-[#1c1612] text-white">5s</option>
                <option value={7} className="bg-[#1c1612] text-white">7s</option>
                <option value={10} className="bg-[#1c1612] text-white">10s</option>
                <option value={15} className="bg-[#1c1612] text-white">15s</option>
              </select>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode((prev) => (prev === "all" ? "items_only" : "all"));
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-spring active:scale-90 ${
                  viewMode === "items_only"
                    ? "bg-[#54614a] text-white shadow-md"
                    : "bg-white/10 hover:bg-white/20 text-white/80"
                }`}
                title="Toggle View Mode"
              >
                {viewMode === "items_only" ? "Items" : "Full Deck"}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-spring active:scale-80"
                title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 0l5-5m0 0l-5 0m5 0l0 5m-5 11l5 5m0 0l-5 0m5 0l0-5m-11 0l-5 5m0 0l5 0m-5 0l0-5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── DIRECT CUSTOMIZATION MODAL (If customer taps "Order Now") ─── */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          isOpen={Boolean(customizingItem)}
          onClose={() => setCustomizingItem(null)}
          onConfirm={(selectedOptions, price) => addToBasket(customizingItem, selectedOptions, price)}
        />
      )}

      {/* ─── SCAN TO ORDER QR MODAL ─── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-backdrop-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#1c1612] border-2 border-[#b6862c]/60 p-8 text-center shadow-2xl animate-modal-pop">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-spring text-lg font-bold active:scale-90"
            >
              ✕
            </button>
            <div className="h-14 w-14 rounded-full bg-[#b6862c]/30 border-2 border-[#b6862c]/70 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CrownMark className="h-7 w-7 text-[#f3d37c]" />
            </div>
            <h3 className="font-display text-2xl font-black text-white">Order From Table</h3>
            <p className="text-xs text-white/70 mt-1">
              Scan with your mobile camera to view full menu & order live.
            </p>
            <div className="mt-6 p-4 bg-white rounded-2xl inline-block shadow-inner transition-spring hover:scale-105">
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

