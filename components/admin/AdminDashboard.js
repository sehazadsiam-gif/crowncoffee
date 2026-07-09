"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CrownMark from "@/components/CrownMark";
import MenuManager from "./MenuManager";
import AppearanceForm from "./AppearanceForm";
import SiteInfoForm from "./SiteInfoForm";
import BannerManager from "./BannerManager";

const TABS = [
  { id: "menu", label: "Menu" },
  { id: "appearance", label: "Appearance" },
  { id: "info", label: "Site info" },
  { id: "banners", label: "Banners" },
  { id: "qr", label: "Tables & QR" },
];

export default function AdminDashboard({ initialMenu, initialSettings, initialBanners }) {
  const [tab, setTab] = useState("menu");
  const [activeVisits, setActiveVisits] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await fetch('/api/presence');
        if (res.ok) {
          const data = await res.json();
          setActiveVisits(data.count || 0);
        }
      } catch (e) {
        // Ignore errors
      }
    };

    fetchVisits();
    const interval = setInterval(fetchVisits, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <CrownMark className="h-7 w-7 text-[var(--accent)]" />
          <div>
            <p className="font-display text-2xl">Crown Coffee admin</p>
            <p className="text-sm text-[var(--ink-soft)]">Manage your menu, theme and details.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
            </span>
            <span>{activeVisits} {activeVisits === 1 ? 'visitor' : 'visitors'}</span>
          </div>
          <Link
            href="/manager"
            target="_blank"
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Manager Portal
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:border-red-300 hover:text-red-600"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-2 border-b border-[var(--line)]">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold tracking-wide transition ${
              tab === item.id
                ? "border-[var(--accent)] text-[var(--ink)]"
                : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "menu" && <MenuManager initialMenu={initialMenu} />}
        {tab === "appearance" && <AppearanceForm initialTheme={initialSettings.theme} />}
        {tab === "info" && <SiteInfoForm initialSettings={initialSettings} />}
        {tab === "banners" && <BannerManager initialBanners={initialBanners} />}
        {tab === "qr" && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--ink-soft)]">Print QR codes to place on your tables. Customers scan to order directly.</p>
            <Link
              href="/qr"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
              style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}
            >
              Open QR Print Page ↗
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
