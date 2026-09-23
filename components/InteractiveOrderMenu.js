"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import MenuCard from "./MenuCard";
import CrownMark from "./CrownMark";

export default function InteractiveOrderMenu({ groups }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const sectionRefs = useRef({});
  const categoryNavRef = useRef(null);

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, searchQuery]);

  // Set the first active category when filtered groups change
  useEffect(() => {
    if (filteredGroups.length > 0) {
      const firstId = filteredGroups[0].category.toLowerCase().replace(/\s+/g, "-");
      setActiveCategory(firstId);
    } else {
      setActiveCategory("");
    }
  }, [filteredGroups]);

  // Scroll-spy observer logic
  useEffect(() => {
    if (searchQuery.trim()) return; // Disable scroll-spy during search to prevent confusion

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveCategory(id);
            
            // Auto scroll category pills list to keep active pill visible
            const navButton = document.getElementById(`pill-${id}`);
            if (navButton && categoryNavRef.current) {
              const navContainer = categoryNavRef.current;
              const buttonLeft = navButton.offsetLeft;
              const buttonWidth = navButton.clientWidth;
              const containerWidth = navContainer.clientWidth;
              const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
              navContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
          }
        });
      },
      { rootMargin: "-25% 0px -75% 0px", threshold: 0 }
    );

    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, [searchQuery, filteredGroups]);

  const scrollToCategory = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveCategory(id);
    }
  };

  return (
    <div className="w-full">
      {/* Search Input Section */}
      <div className="sticky top-[73px] z-30 -mx-6 bg-[var(--paper)] px-6 py-3 border-b border-[var(--line)] shadow-sm">
        <div className="relative mx-auto max-w-xl">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--ink-soft)]">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search coffee, burger, pasta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-[var(--line)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--ink)] placeholder-[var(--ink-soft)] shadow-inner transition focus:border-[var(--accent)] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)]"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Category Pill Navigation (Only visible when not searching) */}
      {!searchQuery && filteredGroups.length > 0 && (
        <nav
          ref={categoryNavRef}
          className="sticky top-[129px] z-30 -mx-6 w-screen overflow-x-auto border-b border-[var(--line)] bg-[var(--paper)]/95 px-6 py-3.5 backdrop-blur-sm scrollbar-none shadow-xs"
        >
          <ul className="flex gap-2.5 min-w-max">
            {filteredGroups.map((group) => {
              const id = group.category.toLowerCase().replace(/\s+/g, "-");
              const isActive = activeCategory === id;
              return (
                <li key={id} id={`pill-${id}`}>
                  <button
                    onClick={() => scrollToCategory(id)}
                    className={`rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 duration-200 ${
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-sm border border-[var(--accent)]"
                        : "bg-white text-[var(--ink-soft)] border border-[var(--line)] hover:border-[var(--mute)]"
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
      <div className="mt-8 flex flex-col gap-12 pb-32">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CrownMark className="h-12 w-12 text-[var(--accent)] opacity-20 mb-4" />
            <p className="font-display text-xl font-bold text-[var(--ink)]">No items found</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;. Try another search term.
            </p>
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
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)]">
                    {group.category}
                  </h2>
                  <span className="h-px flex-1 bg-[var(--line)]" aria-hidden="true" />
                  <span className="text-[10px] font-mono text-[var(--ink-soft)]">
                    {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
