"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CrownMark from "./CrownMark";

export default function Footer({ settings }) {
  const pathname = usePathname();
  if (pathname === "/kiosk") return null;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--card)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3 lg:px-10">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <CrownMark className="h-6 w-6 text-[var(--accent)]" />
            <span className="font-display text-lg">{settings.siteName}</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--ink-soft)]">
            {settings.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-[var(--ink-soft)]">
          <p className="font-display text-base text-[var(--ink)]">Visit</p>
          <p className="leading-relaxed">{settings.address}</p>
          {settings.mapUrl && (
            <a
              href={settings.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Get directions
            </a>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm text-[var(--ink-soft)]">
          <p className="font-display text-base text-[var(--ink)]">Contact</p>
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="hover:text-[var(--ink)]">
              {settings.phone}
            </a>
          )}
          <Link href="/contact" className="font-medium text-[var(--accent)] hover:underline">
            Contact page
          </Link>
        </div>
      </div>

      <div className="border-t border-[var(--line)] px-6 py-5 lg:px-10">
        <p className="mx-auto max-w-6xl text-xs text-[var(--mute)]">
          &copy; {year} {settings.siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
