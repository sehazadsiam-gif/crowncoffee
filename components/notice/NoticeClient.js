"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

export default function NoticeClient({ initialNotices = [] }) {
  const [notices, setNotices] = useState(initialNotices);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Check URL hash on load (e.g. #ramadan-hours-2026) to open modal directly
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      const found = notices.find((n) => n.id === hashId);
      if (found) setSelectedNotice(found);
    }
  }, [notices]);

  const categories = [
    { id: "all", label: "All Notices" },
    { id: "urgent", label: "Urgent" },
    { id: "hours", label: "Store Hours" },
    { id: "offer", label: "Offers & Menu" },
    { id: "event", label: "Events" },
    { id: "general", label: "General" },
  ];

  // Active notices only
  const activeNotices = useMemo(() => {
    return notices.filter((n) => n.active !== false);
  }, [notices]);

  // Featured pinned notice (first active pinned notice, if any)
  const spotlightNotice = useMemo(() => {
    return activeNotices.find((n) => n.pinned) || null;
  }, [activeNotices]);

  // Filtered list
  const filteredNotices = useMemo(() => {
    return activeNotices.filter((notice) => {
      const matchesCat =
        activeCategory === "all" || notice.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        notice.title?.toLowerCase().includes(q) ||
        notice.summary?.toLowerCase().includes(q) ||
        notice.content?.toLowerCase().includes(q) ||
        notice.badgeText?.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeNotices, activeCategory, searchQuery]);

  function handleCopyLink(notice, e) {
    e.stopPropagation();
    const url = `${window.location.origin}/notice#${notice.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(notice.id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  function getCategoryLabel(catId) {
    switch (catId) {
      case "urgent":
        return "URGENT";
      case "hours":
        return "STORE HOURS";
      case "offer":
        return "SPECIAL OFFER";
      case "event":
        return "EVENT";
      default:
        return "ANNOUNCEMENT";
    }
  }

  function getCategoryBadgeStyle(catId) {
    switch (catId) {
      case "urgent":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "hours":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "offer":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "event":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-700 border-slate-500/20";
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
            Official Customer Desk
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight">
            Customer Notices & Announcements
          </h1>
          <p className="text-base text-[var(--ink-soft)] leading-relaxed">
            Stay updated with operating schedules, seasonal specials, upcoming events, and official café announcements from Crown Coffee Bangladesh.
          </p>
        </div>

        {/* Spotlight / Pinned Hero Section */}
        {spotlightNotice && (
          <div className="mb-14 relative overflow-hidden rounded-2xl border-2 border-[var(--accent)] bg-gradient-to-br from-[var(--paper)] via-[var(--card)] to-[var(--background)] p-6 sm:p-10 shadow-xl">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-sm">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Spotlight Notice
                </span>
                {spotlightNotice.badgeText && (
                  <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 uppercase tracking-wider">
                    {spotlightNotice.badgeText}
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--ink-soft)] font-medium">
                Published {spotlightNotice.date}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] mb-3 leading-snug">
              {spotlightNotice.title}
            </h2>

            <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed mb-6 max-w-3xl">
              {spotlightNotice.summary || spotlightNotice.content}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setSelectedNotice(spotlightNotice)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-sm font-semibold shadow-md hover:brightness-110 transition"
              >
                Read Full Notice
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              {spotlightNotice.link && (
                <Link
                  href={spotlightNotice.link}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  {spotlightNotice.linkLabel || "Learn More"}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              )}

              <button
                type="button"
                onClick={(e) => handleCopyLink(spotlightNotice, e)}
                className="ml-auto text-xs font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--paper)] transition"
              >
                {copiedId === spotlightNotice.id ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Link Copied
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z"
                      />
                    </svg>
                    Share Notice
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
                  activeCategory === cat.id
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--card)] text-[var(--ink-soft)] border border-[var(--line)] hover:text-[var(--ink)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 pl-9 text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] focus:border-[var(--accent)] focus:outline-none transition"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-[var(--ink-soft)] pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Notices Grid */}
        {filteredNotices.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-12 text-center">
            <svg
              className="w-12 h-12 mx-auto text-[var(--ink-soft)] mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="font-display text-lg font-semibold text-[var(--ink)]">
              No notices match your criteria
            </h3>
            <p className="text-xs text-[var(--ink-soft)] mt-1">
              Try adjusting your category filter or search term.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                id={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="group cursor-pointer rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition-all hover:border-[var(--accent)]/50 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${getCategoryBadgeStyle(
                        notice.category
                      )}`}
                    >
                      {getCategoryLabel(notice.category)}
                    </span>
                    <span className="text-xs text-[var(--ink-soft)] font-medium">
                      {notice.date}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors mb-2 leading-snug">
                    {notice.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--ink-soft)] line-clamp-3 leading-relaxed mb-4">
                    {notice.summary || notice.content}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 mt-2">
                  <span className="text-xs font-semibold text-[var(--accent)] group-hover:underline inline-flex items-center gap-1">
                    Read Details
                    <svg
                      className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(notice, e)}
                    title="Share notice link"
                    className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-md transition"
                  >
                    {copiedId === notice.id ? (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        Copied
                      </span>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 rounded-full p-2 text-[var(--ink-soft)] hover:bg-[var(--card)] hover:text-[var(--ink)] transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${getCategoryBadgeStyle(
                  selectedNotice.category
                )}`}
              >
                {getCategoryLabel(selectedNotice.category)}
              </span>
              <span className="text-xs text-[var(--ink-soft)] font-medium">
                Published {selectedNotice.date}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] mb-4 leading-snug">
              {selectedNotice.title}
            </h2>

            <div className="prose prose-sm max-w-none text-[var(--ink)] space-y-3 leading-relaxed mb-6 whitespace-pre-line border-t border-[var(--line)] pt-4">
              {selectedNotice.content}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
              {selectedNotice.link ? (
                <Link
                  href={selectedNotice.link}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-5 py-2 text-sm font-semibold shadow hover:brightness-110 transition"
                >
                  {selectedNotice.linkLabel || "Action Link"}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(selectedNotice, e)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--card)] transition"
                >
                  {copiedId === selectedNotice.id ? "Link Copied!" : "Copy Direct Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
