"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CrownMark from "./CrownMark";
import StatusBadge from "./StatusBadge";
import DishDetailModal from "./DishDetailModal";
import { getMenuItemImage } from "@/lib/foodImage";

const QUICK_CATEGORIES = [
  { label: "☕ Espresso & Coffee", href: "/menu" },
  { label: "🧊 Cold Brews", href: "/menu" },
  { label: "🥐 Breakfast & Pastries", href: "/menu" },
  { label: "🍔 Sandwiches", href: "/menu" },
  { label: "🧋 Boba & Frappes", href: "/menu" },
];

export default function HomeHero({ settings, featuredItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback featured item if none passed
  const heroItem = featuredItem || {
    id: "spanish_latte_special",
    name: "Signature Spanish Latte",
    category: "Coffee",
    price: 320,
    description: "Espresso with condensed milk and micro-foamed textured whole milk.",
    bestSeller: true,
  };

  const heroImage = getMenuItemImage(heroItem);

  return (
    <>
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle Ambient Background Wash */}
        <div className="absolute top-1/4 -right-40 -z-10 h-96 w-96 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -left-40 -z-10 h-96 w-96 rounded-full bg-[var(--accent-orange)]/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              {/* Location Badge with Live Matcha Pulse */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-1.5 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--secondary)] opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--secondary)]" />
                </span>
                <span className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
                  Sector 13 &middot; Uttara, Dhaka
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-7xl lg:text-8xl font-black text-[var(--ink)]">
                Crown{" "}
                <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-orange)] to-[var(--accent)] bg-clip-text text-transparent">
                  Coffee
                </span>
              </h1>

              {/* Tagline */}
              <p className="mt-5 max-w-lg text-lg sm:text-xl leading-relaxed text-[var(--ink-soft)] font-medium">
                {settings.tagline || "A quiet corner for proper specialty coffee in Uttara."}
              </p>

              {/* Status Badge */}
              <div className="mt-6 flex items-center gap-3">
                <StatusBadge hours={settings.hours} />
                <span className="text-xs font-semibold text-[var(--ink-soft)]">• Dine-in, Takeaway & Delivery</span>
              </div>

              {/* CTA Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/menu"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-xl transition-spring hover:scale-105 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent) 0%, var(--accent-orange, #ff670e) 100%)",
                    boxShadow: "0 10px 25px -5px rgba(210, 39, 1, 0.4)",
                  }}
                >
                  <span>Explore Menu</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </Link>

                <Link
                  href="/order"
                  className="rounded-full border border-[var(--line)] bg-[var(--card)] px-7 py-3.5 text-sm font-bold tracking-wide text-[var(--ink)] transition-spring hover:border-[var(--accent)] hover:text-[var(--accent)] hover:scale-105 active:scale-95 shadow-sm"
                >
                  Order Ahead (QR)
                </Link>

                {settings.mapUrl && (
                  <a
                    href={settings.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors py-2 px-1"
                  >
                    📍 Directions
                  </a>
                )}
              </div>

              {/* Micro-Features / Trust Badges */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-6 max-w-lg">
                <div>
                  <p className="font-display text-lg font-bold text-[var(--accent)]">100%</p>
                  <p className="text-[11px] font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Arabica Beans</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-[var(--accent)]">Fresh</p>
                  <p className="text-[11px] font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Baked Daily</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-[var(--accent)]">★ 4.8</p>
                  <p className="text-[11px] font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Guest Rating</p>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Interactive Spotlight Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                onClick={() => setIsModalOpen(true)}
                className="group relative w-full max-w-sm rounded-3xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(210,39,1,0.22)] cursor-pointer active:scale-98 animate-float"
              >
                {/* Floating Ribbon */}
                <div className="absolute -top-3 -right-2 z-20 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-orange)] px-4 py-1 text-xs font-black tracking-wider text-white shadow-lg uppercase">
                  ★ Barista&apos;s Pick
                </div>

                {/* Picture Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[var(--card-tint)] shadow-inner">
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={heroItem.name}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CrownMark className="h-16 w-16 text-[var(--accent)] opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      Tap to Customize & Order ↗
                    </span>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="mt-4 p-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                        {heroItem.category}
                      </span>
                      <h3 className="font-display text-xl font-bold text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                        {heroItem.name}
                      </h3>
                    </div>
                    <span className="font-display text-xl font-black text-[var(--accent)] shrink-0">
                      ৳{heroItem.price}
                    </span>
                  </div>
                  {heroItem.description && (
                    <p className="mt-1 text-xs text-[var(--ink-soft)] line-clamp-2">
                      {heroItem.description}
                    </p>
                  )}

                  {/* Micro-interaction Button */}
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3 text-xs font-bold text-[var(--accent)]">
                    <span>Taste Notes: Caramel &bull; Velvety</span>
                    <span className="group-hover:translate-x-1 transition-transform">Quick View &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="mt-14 border-t border-[var(--line)] pt-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-3">
              Explore Our Offerings:
            </p>
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2">
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-xs font-bold text-[var(--ink)] shadow-2xs transition-spring hover:border-[var(--accent)] hover:text-[var(--accent)] hover:scale-105 active:scale-95"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dish Detail Spotlight Modal */}
      <DishDetailModal
        item={heroItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
