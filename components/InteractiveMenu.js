"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import MenuCard from "./MenuCard";
import CrownMark from "./CrownMark";

const FILTER_TAGS = [
  { id: "all", label: "All Items" },
  { id: "bestsellers", label: "★ Best Sellers" },
  { id: "coffee", label: "☕ Hot Coffee" },
  { id: "cold", label: "🧊 Cold Brew & Drinks" },
  { id: "food", label: "🥐 Food & Pastry" },
];

export default function InteractiveMenu({ groups, viewOnly = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [activeCategory, setActiveCategory] = useState(groups[0]?.category || "");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sectionRefs = useRef({});
  const mobileNavRef = useRef(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show / hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter groups based on search and selected tag
  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => {
        const cat = group.category.toLowerCase();
        let items = group.items;

        // Apply quick tag filter
        if (selectedTag === "bestsellers") {
          items = items.filter((item) => item.bestSeller);
        } else if (selectedTag === "coffee") {
          items = items.filter(
            (item) =>
              cat.includes("coffee") ||
              cat.includes("espresso") ||
              cat.includes("brew") ||
              item.name.toLowerCase().includes("coffee")
          );
        } else if (selectedTag === "cold") {
          items = items.filter(
            (item) =>
              cat.includes("cold") ||
              cat.includes("iced") ||
              cat.includes("frappe") ||
              cat.includes("shake") ||
              cat.includes("smoothie") ||
              cat.includes("juice")
          );
        } else if (selectedTag === "food") {
          items = items.filter(
            (item) =>
              cat.includes("food") ||
              cat.includes("pastry") ||
              cat.includes("dessert") ||
              cat.includes("burger") ||
              cat.includes("sandwich") ||
              cat.includes("pasta")
          );
        }

        // Apply search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          items = items.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              (item.description && item.description.toLowerCase().includes(q)) ||
              cat.includes(q)
          );
        }

        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [groups, searchQuery, selectedTag]);

  // Scroll observer logic
  useEffect(() => {
    if (searchQuery.trim() || selectedTag !== "all") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveCategory(id);

            // Auto-center active mobile pill
            const pillEl = document.getElementById(`pill-${id}`);
            if (pillEl && mobileNavRef.current) {
              const nav = mobileNavRef.current;
              const pillLeft = pillEl.offsetLeft;
              const pillWidth = pillEl.clientWidth;
              const navWidth = nav.clientWidth;
              nav.scrollTo({
                left: pillLeft - navWidth / 2 + pillWidth / 2,
                behavior: "smooth",
              });
            }
          }
        });
      },
      { rootMargin: "-25% 0px -75% 0px", threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [searchQuery, selectedTag, filteredGroups]);

  const scrollToCategory = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveCategory(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalFilteredCount = filteredGroups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className="mt-8 w-full">
      {/* ─── Interactive Search & Filter Controls ─── */}
      <div className="sticky top-16 md:top-20 z-30 -mx-6 bg-[var(--paper)]/95 px-6 py-3 border-b border-[var(--line)] backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--ink-soft)] text-sm">
              🔍
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search coffee, latte, breakfast, desserts... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] py-3 pl-11 pr-24 text-sm font-medium text-[var(--ink)] placeholder-[var(--mute)] shadow-inner transition focus:border-[var(--accent)] focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--accent)]"
              >
                Clear ✕
              </button>
            ) : (
              <span className="absolute inset-y-0 right-4 hidden sm:flex items-center text-[10px] font-mono text-[var(--mute)] border border-[var(--line)] px-2 py-0.5 rounded my-auto h-5">
                /
              </span>
            )}
          </div>

          {/* Quick Filter Tag Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {FILTER_TAGS.map((tag) => {
              const isSelected = selectedTag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-spring active:scale-90 ${
                    isSelected
                      ? "bg-[var(--accent)] text-white shadow-sm border border-[var(--accent)]"
                      : "bg-[var(--card)] text-[var(--ink-soft)] border border-[var(--line)] hover:border-[var(--mute)]"
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Mobile Horizontal Category Navigation (Only when not searching) ─── */}
      {!searchQuery && selectedTag === "all" && filteredGroups.length > 0 && (
        <nav
          ref={mobileNavRef}
          className="sticky top-[132px] md:top-[144px] z-20 -mx-6 w-screen overflow-x-auto border-b border-[var(--line)] bg-[var(--paper)]/95 px-6 py-2.5 backdrop-blur-sm lg:hidden scrollbar-none shadow-xs"
        >
          <ul className="flex gap-2 min-w-max">
            {filteredGroups.map((group) => {
              const id = group.category.toLowerCase().replace(/\s+/g, "-");
              const isActive = activeCategory === id;
              return (
                <li key={id} id={`pill-${id}`}>
                  <button
                    onClick={() => scrollToCategory(id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-spring active:scale-95 ${
                      isActive
                        ? "bg-[var(--ink)] text-white shadow-sm"
                        : "bg-[var(--card)] text-[var(--ink-soft)] border border-[var(--line)] hover:border-[var(--mute)]"
                    }`}
                  >
                    {group.category}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* ─── Layout: Sidebar (Desktop) + Main Menu Grid ─── */}
      <div className="mt-10 flex flex-col items-start gap-10 lg:flex-row lg:gap-14">
        {/* Sticky Desktop Category Sidebar */}
        {!searchQuery && selectedTag === "all" && (
          <nav className="sticky top-32 z-20 hidden w-60 shrink-0 lg:block">
            <h2 className="mb-4 font-display text-xl font-bold text-[var(--ink)]">Categories</h2>
            <ul className="flex flex-col gap-2 border-l-2 border-[var(--line)]">
              {filteredGroups.map((group) => {
                const id = group.category.toLowerCase().replace(/\s+/g, "-");
                const isActive = activeCategory === id;
                return (
                  <li key={id}>
                    <button
                      onClick={() => scrollToCategory(id)}
                      className={`-ml-[2px] block w-full border-l-2 py-2 pl-4 text-left text-sm font-semibold transition-spring ${
                        isActive
                          ? "border-[var(--accent)] text-[var(--accent)] font-bold translate-x-1"
                          : "border-transparent text-[var(--ink-soft)] hover:border-[var(--mute)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {group.category}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Menu Sections Grid */}
        <div className="flex-1 flex flex-col gap-14 pb-32 w-full">
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CrownMark className="h-14 w-14 text-[var(--accent)] opacity-20 mb-4 animate-bounce" />
              <h3 className="font-display text-2xl font-bold text-[var(--ink)]">No items found</h3>
              <p className="mt-2 text-sm text-[var(--ink-soft)] max-w-sm">
                We couldn&apos;t find anything matching your search. Try adjusting your query or resetting filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("all");
                }}
                className="mt-6 rounded-full bg-[var(--accent)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-spring hover:scale-105 active:scale-95"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const id = group.category.toLowerCase().replace(/\s+/g, "-");
              return (
                <section
                  key={id}
                  id={id}
                  ref={(el) => {
                    if (el) sectionRefs.current[id] = el;
                  }}
                  className="scroll-mt-48"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                      {group.category}
                    </h2>
                    <span
                      className="h-px flex-1 bg-gradient-to-r from-[var(--line)] to-transparent"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-[var(--ink-soft)] bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--line)]">
                      {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
                    {group.items.map((item) => (
                      <MenuCard key={item.id} item={item} viewOnly={viewOnly} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Scroll-To-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--card)] text-[var(--ink)] border border-[var(--line)] shadow-xl transition-spring hover:border-[var(--accent)] hover:text-[var(--accent)] hover:scale-110 active:scale-90"
          aria-label="Scroll to top of menu"
          title="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}
