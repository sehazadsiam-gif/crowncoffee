"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CrownMark from "./CrownMark";
import StatusBadge from "./StatusBadge";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const MEMBERSHIP_URL = "https://ccadmin.online/membership";

export default function Header({ settings }) {
  const pathname = usePathname();
  if (pathname === "/kiosk") return null;

  function renderLabel(link) {
    if (link.href === "/menu") {
      return <span className="nav-highlight">Menu</span>;
    }
    return link.label;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <CrownMark className="h-7 w-7 text-[var(--accent)]" />
          <span className="font-display text-xl leading-none tracking-wide">
            {settings.siteName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium tracking-[0.18em] text-[var(--ink-soft)] uppercase md:flex">
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
