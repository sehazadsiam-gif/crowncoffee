"use client";

import { useState } from "react";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `banner-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const TYPES = [
  { value: "offer", label: "☕ Offer", description: "Promotions & deals (amber)" },
  { value: "news", label: "📢 News", description: "Announcements (green)" },
  { value: "alert", label: "⚠️ Alert", description: "Important notices (red)" },
];

function BannerRow({ banner, index, total, onChange, onMove, onRemove }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="rounded-xl border border-[var(--line)] bg-[var(--card)]">
      {/* Collapsed row */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="rounded-md border border-[var(--line)] px-2 py-1 text-xs disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            className="rounded-md border border-[var(--line)] px-2 py-1 text-xs disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm font-medium">
            <span className="shrink-0 text-base">
              {TYPES.find((t) => t.value === banner.type)?.label.split(" ")[0] || "📢"}
            </span>
            {banner.text || "Untitled banner"}
          </p>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
            <span className="capitalize">{banner.type}</span>
            <span>·</span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={
                banner.active
                  ? { background: "rgba(84,97,74,0.12)", color: "var(--secondary)" }
                  : { background: "rgba(0,0,0,0.06)", color: "var(--mute)" }
              }
            >
              {banner.active ? "● Active" : "○ Hidden"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {expanded ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => onRemove(banner.id)}
            className="rounded-md border border-[var(--line)] px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Expanded edit */}
      {expanded && (
        <div className="flex flex-col gap-4 border-t border-[var(--line)] p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
              Message
            </span>
            <textarea
              rows={2}
              value={banner.text}
              onChange={(e) => onChange(banner.id, { text: e.target.value })}
              placeholder="e.g. 20% off all cold brews this weekend!"
              className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                Type
              </span>
              <select
                value={banner.type}
                onChange={(e) => onChange(banner.id, { type: e.target.value })}
                className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} — {t.description}
                  </option>
                ))}
              </select>
            </label>

            <label
              className="flex cursor-pointer items-center gap-2.5 self-end rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm transition hover:border-[var(--accent)]"
              style={banner.active ? { borderColor: "var(--accent)", background: "rgba(84,97,74,0.06)" } : {}}
            >
              <input
                type="checkbox"
                checked={!!banner.active}
                onChange={(e) => onChange(banner.id, { active: e.target.checked })}
                className="h-4 w-4 rounded"
                style={{ accentColor: "var(--accent)" }}
              />
              <span className="font-semibold" style={{ color: banner.active ? "var(--secondary)" : "inherit" }}>
                Active
              </span>
              <span className="text-[var(--mute)] text-xs">visible on site</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                Link URL <span className="normal-case font-normal">(optional)</span>
              </span>
              <input
                type="url"
                value={banner.link || ""}
                onChange={(e) => onChange(banner.id, { link: e.target.value })}
                placeholder="https://..."
                className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                Link label <span className="normal-case font-normal">(optional)</span>
              </span>
              <input
                type="text"
                value={banner.linkLabel || ""}
                onChange={(e) => onChange(banner.id, { linkLabel: e.target.value })}
                placeholder="e.g. Order now"
                className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </label>
          </div>
        </div>
      )}
    </li>
  );
}

export default function BannerManager({ initialBanners }) {
  const [banners, setBanners] = useState(initialBanners?.banners || []);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState("");

  function markDirty(updater) {
    setBanners(updater);
    setDirty(true);
    setSavedAt(null);
  }

  function addBanner() {
    markDirty((prev) => [
      ...prev,
      {
        id: makeId(),
        text: "",
        type: "news",
        active: false,
        link: "",
        linkLabel: "",
      },
    ]);
  }

  function updateBanner(id, patch) {
    markDirty((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function removeBanner(id) {
    if (!confirm("Remove this banner?")) return;
    markDirty((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBanner(index, direction) {
    markDirty((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save banners.");
        setSaving(false);
        return;
      }
      const saved = await res.json();
      setBanners(saved.banners || banners);
      setDirty(false);
      setSavedAt(new Date());
    } catch {
      setError("Could not save banners. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const activeBanners = banners.filter((b) => b.active).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Save bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] px-5 py-3.5">
        <div>
          <p className="text-sm text-[var(--ink-soft)]">
            {dirty
              ? "You have unsaved changes."
              : savedAt
              ? `Saved at ${savedAt.toLocaleTimeString()}.`
              : "Manage banners shown at the top of your site."}
          </p>
          <p className="mt-0.5 text-xs text-[var(--mute)]">
            {activeBanners} of {banners.length} banner{banners.length !== 1 ? "s" : ""} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addBanner}
            className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            + Add banner
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="rounded-full bg-[var(--ink)] px-6 py-2 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Info card */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-5 py-4 text-sm text-[var(--ink-soft)]">
        <p className="font-semibold text-[var(--ink)]">How banners work</p>
        <ul className="mt-2 flex flex-col gap-1 text-xs">
          <li>• Only <strong>Active</strong> banners appear on the site (below the header).</li>
          <li>• Multiple active banners rotate automatically every 6 seconds.</li>
          <li>• Types: <strong>Offer</strong> (amber), <strong>News</strong> (green), <strong>Alert</strong> (red).</li>
          <li>• Visitors can dismiss banners — they stay dismissed for the session.</li>
        </ul>
      </div>

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line)] px-5 py-10 text-center text-sm text-[var(--ink-soft)]">
          <p className="text-2xl">📢</p>
          <p className="mt-2 font-medium">No banners yet</p>
          <p className="mt-1 text-xs">Click &ldquo;+ Add banner&rdquo; to create your first announcement.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {banners.map((banner, index) => (
            <BannerRow
              key={banner.id}
              banner={banner}
              index={index}
              total={banners.length}
              onChange={updateBanner}
              onMove={moveBanner}
              onRemove={removeBanner}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
