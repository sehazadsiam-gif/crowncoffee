"use client";

import { useState } from "react";
import { DAY_ORDER, DAY_LABELS } from "@/lib/hours";

export default function SiteInfoForm({ initialSettings }) {
  const [info, setInfo] = useState({
    siteName: initialSettings.siteName,
    tagline: initialSettings.tagline,
    description: initialSettings.description,
    address: initialSettings.address,
    phone: initialSettings.phone,
    mapUrl: initialSettings.mapUrl,
    deliveryCharge: initialSettings.deliveryCharge || 0,
    tableCount: initialSettings.tableCount || 50,
    hours: initialSettings.hours,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState("");

  function update(patch) {
    setInfo((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    setSavedAt(null);
  }

  function updateDay(day, patch) {
    update({ hours: { ...info.hours, [day]: { ...info.hours[day], ...patch } } });
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save site info.");
        setSaving(false);
        return;
      }

      const saved = await res.json();
      setInfo({
        siteName: saved.siteName,
        tagline: saved.tagline,
        description: saved.description,
        address: saved.address,
        phone: saved.phone,
        mapUrl: saved.mapUrl,
        deliveryCharge: saved.deliveryCharge || 0,
        tableCount: saved.tableCount || 50,
        hours: saved.hours,
      });
      setDirty(false);
      setSavedAt(new Date());
    } catch {
      setError("Could not save site info. Check your connection and try again.");
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
              ? `Saved at ${savedAt.toLocaleTimeString()}.`
              : "Update your cafe's details and opening hours."}
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
        <h3 className="font-display text-lg">Cafe details</h3>

        <div className="mt-5 flex flex-col gap-4">
          <Field label="Site name" value={info.siteName} onChange={(v) => update({ siteName: v })} />
          <Field label="Tagline" value={info.tagline} onChange={(v) => update({ tagline: v })} />
          <Field
            label="Description"
            value={info.description}
            onChange={(v) => update({ description: v })}
            textarea
          />
          <Field label="Address" value={info.address} onChange={(v) => update({ address: v })} />
          <Field label="Phone" value={info.phone} onChange={(v) => update({ phone: v })} />
          <Field
            label="Google Maps link"
            value={info.mapUrl}
            onChange={(v) => update({ mapUrl: v })}
          />
          <Field
            label="Delivery Charge (৳)"
            value={String(info.deliveryCharge || 0)}
            onChange={(v) => update({ deliveryCharge: Number(v) || 0 })}
          />
          <Field
            label="Table Count (For QR Codes)"
            value={String(info.tableCount || 50)}
            onChange={(v) => update({ tableCount: Number(v) || 50 })}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <h3 className="font-display text-lg">Opening hours</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Used for the &ldquo;open now&rdquo; badge and the hours shown on the Contact page.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {DAY_ORDER.map((day) => {
            const hours = info.hours[day] || { open: "08:00", close: "22:00", closed: false };
            return (
              <div
                key={day}
                className="grid grid-cols-1 items-center gap-3 rounded-lg border border-[var(--line)] px-3 py-2.5 sm:grid-cols-[120px_1fr_1fr_auto]"
              >
                <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
                <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                  <span className="w-12 shrink-0 text-xs uppercase tracking-[0.15em] text-[var(--mute)]">
                    Open
                  </span>
                  <input
                    type="time"
                    value={hours.open}
                    disabled={hours.closed}
                    onChange={(event) => updateDay(day, { open: event.target.value })}
                    className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2 py-1.5 text-sm focus:border-[var(--accent)] disabled:opacity-50"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                  <span className="w-12 shrink-0 text-xs uppercase tracking-[0.15em] text-[var(--mute)]">
                    Close
                  </span>
                  <input
                    type="time"
                    value={hours.close}
                    disabled={hours.closed}
                    onChange={(event) => updateDay(day, { close: event.target.value })}
                    className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2 py-1.5 text-sm focus:border-[var(--accent)] disabled:opacity-50"
                  />
                </label>
                <label className="flex items-center justify-end gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(event) => updateDay(day, { closed: event.target.checked })}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  Closed
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 focus:border-[var(--accent)]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 focus:border-[var(--accent)]"
        />
      )}
    </label>
  );
}
