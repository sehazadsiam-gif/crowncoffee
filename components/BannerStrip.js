"use client";

import { useState, useEffect, useCallback } from "react";

const TYPE_CONFIG = {
  offer: { label: "OFFER:", color: "text-emerald-400" },
  news: { label: "NEWS:", color: "text-cyan-400" },
  alert: { label: "ALERT:", color: "text-rose-500" },
};

export default function BannerStrip({ initialBanners = [] }) {
  const [banners, setBanners] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("crown_dismissed_banners");
      const dismissedIds = stored ? JSON.parse(stored) : [];
      
      const activeBanners = initialBanners.filter(
        (b) => b.active && !dismissedIds.includes(b.id)
      );
      
      setBanners(activeBanners);
      if (activeBanners.length === 0) {
        setDismissed(true);
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, [initialBanners]);

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

  // Manage CSS variable for floating button adjustment
  useEffect(() => {
    if (visible && !dismissed && banners.length > 0) {
      document.documentElement.style.setProperty('--banner-height', '52px');
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
    return () => {
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [visible, dismissed, banners.length]);

  if (!visible || dismissed || banners.length === 0) return null;

  // Stitch all banner texts together for the ticker
  const tickerItems = banners.map((banner, index) => {
    const config = TYPE_CONFIG[banner.type] || TYPE_CONFIG.news;
    return (
      <span key={index} className="mx-4 flex items-center">
        <span className={`mr-4 font-black tracking-widest ${config.color}`}>
          {config.label}
        </span>
        {banner.text}
        {banner.link && (
          <a
            href={banner.link}
            className="ml-3 underline decoration-amber-300/50 underline-offset-4 hover:decoration-amber-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {banner.linkLabel || "READ MORE"}
          </a>
        )}
        <span className="ml-8 text-amber-500 opacity-50">///</span>
      </span>
    );
  });

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] flex items-center overflow-hidden bg-zinc-950 px-0 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_-4px_20px_rgba(0,0,0,0.5)] border-t-2 border-amber-500/30"
      role="status"
      aria-live="polite"
    >
      <div className="flex animate-marquee whitespace-nowrap pr-12">
        {/* Render twice for seamless looping */}
        {tickerItems}
        {tickerItems}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-0 top-0 bottom-0 z-10 flex w-12 items-center justify-center bg-zinc-950/90 backdrop-blur-sm transition hover:bg-zinc-800 text-white border-l border-white/10"
        aria-label="Dismiss banner"
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
