"use client";

import { useState } from "react";

export default function NoticeManager({ initialNotices = [] }) {
  const [notices, setNotices] = useState(initialNotices);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const categories = [
    { id: "hours", label: "Store Hours" },
    { id: "urgent", label: "Urgent Announcement" },
    { id: "offer", label: "Offer / Menu Launch" },
    { id: "event", label: "Special Event" },
    { id: "general", label: "General Notice" },
  ];

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  }

  function handleCreateNew() {
    setEditingNotice({
      id: `notice-${Date.now()}`,
      title: "",
      summary: "",
      content: "",
      category: "general",
      badgeText: "NEW",
      pinned: false,
      active: true,
      date: new Date().toISOString().split("T")[0],
      link: "",
      linkLabel: "Learn More",
    });
  }

  async function handleSaveList(updatedList) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/notices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notices: updatedList }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setNotices(updatedList);
      showMsg("Notices updated successfully!");
      setEditingNotice(null);
    } catch (err) {
      showMsg("Error saving notices. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!editingNotice.title.trim()) {
      showMsg("Title is required.", "error");
      return;
    }

    let updated = [...notices];
    const index = updated.findIndex((n) => n.id === editingNotice.id);
    if (index >= 0) {
      updated[index] = editingNotice;
    } else {
      updated.unshift(editingNotice);
    }

    handleSaveList(updated);
  }

  function handleToggleField(id, field) {
    const updated = notices.map((n) => {
      if (n.id === id) {
        return { ...n, [field]: !n[field] };
      }
      // If setting pinned to true, optionally unpin others if desired, or keep multiple
      return n;
    });
    handleSaveList(updated);
  }

  function handleDelete(id) {
    if (confirm("Are you sure you want to delete this notice?")) {
      const updated = notices.filter((n) => n.id !== id);
      handleSaveList(updated);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            Customer Notice Desk
          </h2>
          <p className="text-xs text-[var(--ink-soft)]">
            Publish, edit, and spotlight notices displayed on crowncoffeebangladesh.xyz/notice.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-5 py-2 text-xs font-semibold shadow hover:brightness-110 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Notice
        </button>
      </div>

      {message.text && (
        <div
          className={`rounded-lg px-4 py-3 text-xs font-semibold ${
            message.type === "error"
              ? "bg-red-500/10 text-red-600 border border-red-500/20"
              : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Notice List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-8 text-center text-xs text-[var(--ink-soft)]">
            No notices published yet. Click "Add New Notice" above to create one.
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className={`rounded-xl border p-4 sm:p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                notice.pinned
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--line)] bg-[var(--card)]"
              }`}
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  {notice.pinned && (
                    <span className="rounded bg-[var(--accent)] text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      Spotlight Pinned
                    </span>
                  )}
                  <span className="rounded border border-[var(--line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ink-soft)] uppercase">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-[var(--ink-soft)]">
                    {notice.date}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  {notice.title || "Untitled Notice"}
                </h3>
                <p className="text-xs text-[var(--ink-soft)] line-clamp-1">
                  {notice.summary || notice.content}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => handleToggleField(notice.id, "active")}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    notice.active
                      ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
                      : "bg-gray-200 text-gray-500 border border-gray-300"
                  }`}
                >
                  {notice.active ? "Active" : "Hidden"}
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleField(notice.id, "pinned")}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    notice.pinned
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  {notice.pinned ? "Pinned" : "Pin Spotlight"}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingNotice(notice)}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] font-semibold text-[var(--ink)] hover:bg-[var(--paper)] transition"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(notice.id)}
                  className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleFormSubmit}
            className="w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                {notices.some((n) => n.id === editingNotice.id)
                  ? "Edit Notice"
                  : "Create Notice"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingNotice(null)}
                className="text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                value={editingNotice.title}
                onChange={(e) =>
                  setEditingNotice({ ...editingNotice, title: e.target.value })
                }
                placeholder="e.g. Adjusted Ramadan Operating Hours"
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Category
                </label>
                <select
                  value={editingNotice.category}
                  onChange={(e) =>
                    setEditingNotice({ ...editingNotice, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Badge Pill Text
                </label>
                <input
                  type="text"
                  value={editingNotice.badgeText}
                  onChange={(e) =>
                    setEditingNotice({ ...editingNotice, badgeText: e.target.value })
                  }
                  placeholder="e.g. URGENT, NEW, LIMITED TIME"
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Short Summary (Card Preview)
              </label>
              <textarea
                rows="2"
                value={editingNotice.summary}
                onChange={(e) =>
                  setEditingNotice({ ...editingNotice, summary: e.target.value })
                }
                placeholder="Brief snippet shown on the notice card grid..."
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Full Notice Body Content *
              </label>
              <textarea
                rows="5"
                required
                value={editingNotice.content}
                onChange={(e) =>
                  setEditingNotice({ ...editingNotice, content: e.target.value })
                }
                placeholder="Detailed announcement content..."
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Optional CTA Link
                </label>
                <input
                  type="text"
                  value={editingNotice.link}
                  onChange={(e) =>
                    setEditingNotice({ ...editingNotice, link: e.target.value })
                  }
                  placeholder="e.g. /menu or /contact"
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={editingNotice.linkLabel}
                  onChange={(e) =>
                    setEditingNotice({ ...editingNotice, linkLabel: e.target.value })
                  }
                  placeholder="e.g. View Special Menu"
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingNotice.pinned}
                  onChange={(e) =>
                    setEditingNotice({ ...editingNotice, pinned: e.target.checked })
                  }
                  className="rounded accent-[var(--accent)]"
                />
                Pin to Spotlight Banner (Hero)
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingNotice.active}
                  onChange={(e) =>
                    setEditingNotice({ ...editingNotice, active: e.target.checked })
                  }
                  className="rounded accent-[var(--accent)]"
                />
                Active (Visible to Customers)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--line)] pt-4 mt-4">
              <button
                type="button"
                onClick={() => setEditingNotice(null)}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-[var(--accent)] text-white px-6 py-2 text-xs font-semibold shadow hover:brightness-110 transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Notice"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
