"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CrownMark from "@/components/CrownMark";
import MenuManager from "./MenuManager";
import AppearanceForm from "./AppearanceForm";
import SiteInfoForm from "./SiteInfoForm";

const TABS = [
  { id: "menu", label: "Menu" },
  { id: "appearance", label: "Appearance" },
  { id: "info", label: "Site info" },
];

export default function AdminDashboard({ initialMenu, initialSettings }) {
  const [tab, setTab] = useState("menu");
  const router = useRouter();

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
      </div>
    </div>
  );
}
