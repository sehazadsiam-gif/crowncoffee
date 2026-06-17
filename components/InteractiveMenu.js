"use client";

import { useEffect, useState, useRef } from "react";
import MenuCard from "./MenuCard";

export default function InteractiveMenu({ groups }) {
  const [activeCategory, setActiveCategory] = useState(groups[0]?.category || "");
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px", threshold: 0 } // Triggers near the top
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToCategory = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Account for the sticky header (h-20 = 80px) + some padding
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (groups.length === 0) {
    return (
      <p className="mt-12 text-[var(--ink-soft)]">
        The menu is being updated &mdash; check back soon.
      </p>
    );
  }

  return (
    <div className="mt-14 flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
      {/* Sticky Sidebar Navigation */}
      <nav className="sticky top-28 z-30 hidden w-64 shrink-0 lg:block">
        <h2 className="mb-6 font-display text-2xl">Categories</h2>
        <ul className="flex flex-col gap-3 border-l-2 border-[var(--line)]">
          {groups.map((group) => {
            const id = group.category.toLowerCase().replace(/\s+/g, "-");
            const isActive = activeCategory === id;
            return (
              <li key={id}>
                <button
                  onClick={() => scrollToCategory(id)}
                  className={`-ml-[2px] block border-l-2 py-1.5 pl-5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "border-[var(--accent)] text-[var(--accent)]"
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

      {/* Mobile Horizontal Scroll Navigation */}
      <nav className="sticky top-20 z-30 -mx-6 w-screen overflow-x-auto border-b border-[var(--line)] bg-[var(--paper)]/95 px-6 py-4 backdrop-blur-sm lg:hidden hide-scrollbar shadow-sm">
        <ul className="flex gap-4 min-w-max">
          {groups.map((group) => {
            const id = group.category.toLowerCase().replace(/\s+/g, "-");
            const isActive = activeCategory === id;
            return (
              <li key={id}>
                <button
                  onClick={() => scrollToCategory(id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-md"
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

      {/* Main Menu Content */}
      <div className="flex-1 flex flex-col gap-16 pb-32">
        {groups.map((group) => {
          const id = group.category.toLowerCase().replace(/\s+/g, "-");
          return (
            <section
              key={id}
              id={id}
              ref={(el) => (sectionRefs.current[id] = el)}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-4">
                <h2 className="font-display text-3xl sm:text-4xl text-[var(--ink)]">{group.category}</h2>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--line)] to-transparent" aria-hidden="true" />
              </div>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {group.items.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
