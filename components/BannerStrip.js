"use client";

import { useState, useEffect, useCallback } from "react";

const TYPE_STYLES = {
  offer: {
    bg: "linear-gradient(135deg, #b6862c 0%, #d4a017 100%)",
    color: "#fff",
    icon: "☕",
  },
  news: {
    bg: "linear-gradient(135deg, #54614a 0%, #6b7c5e 100%)",
    color: "#fff",
    icon: "📢",
  },
  alert: {
    bg: "linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)",
    color: "#fff",
    icon: "⚠️",
  },
};

export default function BannerStrip({ initialBanners = [] }) {
  const [banners] = useState(() => initialBanners.filter((b) => b.active));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Load dismissed state from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("crown_dismissed_banners");
      const dismissedIds = stored ? JSON.parse(stored) : [];
      const activeBanners = initialBanners.filter(
        (b) => b.active && !dismissedIds.includes(b.id)
      );
      if (activeBanners.length === 0) {
        setDismissed(true);
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, [initialBanners]);

  // Auto-rotate banners every 6 seconds
  useEffect(() => {
    if (banners.length <= 1 || dismissed) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length, dismissed]);

  const handleDismiss = useCallback(() => {
    try {
      const stored = sessionStorage.getItem("crown_dismissed_banners");
      const dismissedIds = stored ? JSON.parse(stored) : [];
      banners.forEach((b) => {
        if (!dismissedIds.includes(b.id)) dismissedIds.push(b.id);
      });
      sessionStorage.setItem("crown_dismissed_banners", JSON.stringify(dismissedIds));
    } catch {}
    setDismissed(true);
  }, [banners]);

  if (!visible || dismissed || banners.length === 0) return null;

  const banner = banners[currentIndex];
  const style = TYPE_STYLES[banner.type] || TYPE_STYLES.news;

  return (
    <div
      className="banner-strip-enter relative flex items-center justify-center gap-3 px-4 py-2.5 text-center text-sm font-medium"
      style={{ background: style.bg, color: style.color }}
      role="status"
      aria-live="polite"
    >
      {/* Multiple banners indicator */}
      {banners.length > 1 && (
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? "20px" : "6px",
                background: i === currentIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
              }}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      <span className="shrink-0">{style.icon}</span>

      <span className="max-w-2xl">
        {banner.text}
        {banner.link && (
          <a
            href={banner.link}
            className="ml-2 inline-flex items-center gap-1 rounded-full border border-current px-2.5 py-0.5 text-xs font-bold opacity-90 transition hover:opacity-100"
            target="_blank"
            rel="noopener noreferrer"
          >
            {banner.linkLabel || "Learn more"} →
          </a>
        )}
      </span>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white/20"
        aria-label="Dismiss banner"
        style={{ color: style.color }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
