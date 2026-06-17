"use client";

import { useState, useEffect } from "react";

export default function BannerStrip({ initialBanners = [] }) {
  const [banners, setBanners] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show active banners. We removed the dismiss functionality to keep it
    // acting like a persistent news ticker.
    const activeBanners = initialBanners.filter((b) => b.active);
    setBanners(activeBanners);
    if (activeBanners.length > 0) {
      setVisible(true);
    }
  }, [initialBanners]);

  if (!visible || banners.length === 0) return null;

  // Stitch all banner texts together for the ticker
  const tickerItems = banners.map((banner, index) => (
    <span key={index} className="mx-4 flex items-center">
      <span className="mr-4 font-black tracking-widest text-amber-300">
        BREAKING:
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
  ));

  return (
    <div
      className="relative flex items-center overflow-hidden bg-zinc-950 px-0 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md border-b-2 border-amber-500/30"
      role="status"
      aria-live="polite"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Render twice for seamless looping */}
        {tickerItems}
        {tickerItems}
      </div>
    </div>
  );
}

