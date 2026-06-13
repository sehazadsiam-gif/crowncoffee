"use client";

import { useState } from "react";
import { FONT_PAIRS } from "@/lib/fonts";

const FONT_PAIR_KEYS = Object.keys(FONT_PAIRS);

export default function AppearanceForm({ initialTheme }) {
  const [theme, setTheme] = useState(initialTheme);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState("");

  function update(patch) {
    setTheme((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    setSavedAt(null);
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save appearance settings.");
        setSaving(false);
        return;
      }

      const saved = await res.json();
      setTheme(saved.theme);
      setDirty(false);
      setSavedAt(new Date());
    } catch {
      setError("Could not save appearance settings. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] px-5 py-3.5">
        <p className="text-sm text-[var(--ink-soft)]">
          {dirty
            ? "You have unsaved changes."
            : savedAt
              ? `Saved at ${savedAt.toLocaleTimeString()}. Reload the site to see it everywhere.`
              : "Pick an accent colour, a secondary colour and a font pairing."}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving\u2026" : "Save changes"}
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <h3 className="font-display text-lg">Colours</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          The accent colour highlights buttons, prices and links. The secondary colour is used
          sparingly, for things like the &ldquo;open now&rdquo; indicator.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ColorField
            label="Accent colour"
            value={theme.accent}
            onChange={(value) => update({ accent: value })}
          />
          <ColorField
            label="Secondary colour"
            value={theme.secondary}
            onChange={(value) => update({ secondary: value })}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <h3 className="font-display text-lg">Typography</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Choose a font pairing for the whole site.</p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FONT_PAIR_KEYS.map((key) => {
            const pair = FONT_PAIRS[key];
            const active = theme.fontPair === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ fontPair: key })}
                className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--line)] hover:border-[var(--accent)]"
                }`}
              >
                <span style={{ fontFamily: pair.display }} className="text-2xl">
                  Aa
                </span>
                <span className="font-semibold">{pair.label}</span>
                <span
                  className="text-xs text-[var(--ink-soft)]"
                  dangerouslySetInnerHTML={{ __html: pair.description }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 font-mono text-sm focus:border-[var(--accent)]"
        />
      </div>
    </label>
  );
}
