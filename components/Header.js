"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CrownMark from "./CrownMark";
import StatusBadge from "./StatusBadge";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/notice", label: "Notice" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const MEMBERSHIP_URL = "https://ccadmin.online/membership";

export default function Header({ settings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollY / totalHeight) * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function renderLabel(link) {
    if (link.href === "/menu") {
      return <span className="nav-highlight">Menu</span>;
    }
    if (link.href === "/notice") {
      return (
        <span className="relative inline-flex items-center gap-1">
          Notice
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
          </span>
        </span>
      );
    }
    return link.label;
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-md bg-[var(--paper)]/95" : ""
      }`}
    >
      {/* Top Scroll Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-transparent overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-orange)] to-[var(--secondary)] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 lg:px-10 transition-all duration-300 ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        <Link href="/" className="group flex shrink-0 items-center gap-3 transition-transform active:scale-95">
          <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <CrownMark className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <span className="font-display text-xl leading-none tracking-wide text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
            {settings.siteName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium tracking-[0.18em] text-[var(--ink-soft)] uppercase md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors hover:text-[var(--ink)] ${
                  isActive && link.href !== "/menu" ? "text-[var(--ink)] font-bold" : ""
                }`}
              >
                {renderLabel(link)}
                {isActive && link.href !== "/menu" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--accent)] animate-badge-pop" />
                )}
              </Link>
            );
          })}

          {/* Membership badge */}
          <a
            href={MEMBERSHIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Enjoy lifetime discounts"
            aria-label="Membership — enjoy lifetime discounts"
          >
            <span className="membership-highlight">
              ♛ Membership
            </span>
          </a>
        </nav>

        <div className="hidden shrink-0 sm:block">
          <StatusBadge hours={settings.hours} />
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex flex-wrap items-center justify-center gap-4 border-t border-[var(--line)] py-2.5 text-xs font-medium tracking-[0.18em] text-[var(--ink-soft)] uppercase md:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition hover:text-[var(--ink)] ${
              pathname === link.href && link.href !== "/menu"
                ? "text-[var(--ink)]"
                : ""
            }`}
          >
            {renderLabel(link)}
          </Link>
        ))}

        {/* Membership badge — mobile */}
        <a
          href={MEMBERSHIP_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Enjoy lifetime discounts"
          aria-label="Membership — enjoy lifetime discounts"
        >
          <span className="membership-highlight">♛ Membership</span>
        </a>
      </nav>
    </header>
  );
}
