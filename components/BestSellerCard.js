"use client";

import Image from "next/image";
import CrownMark from "./CrownMark";

export default function BestSellerCard({ item }) {
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-200 transition-all duration-300"
      style={{
        background: "linear-gradient(145deg, #fffbf0 0%, #fff8e7 50%, #fef3c7 100%)",
        boxShadow: "0 4px 24px -8px rgba(182,134,44,0.25)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 40px -8px rgba(182,134,44,0.45)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 24px -8px rgba(182,134,44,0.25)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Best Seller badge */}
      <div
        className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide shadow-sm"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)",
          color: "#fff",
        }}
      >
        <span>★</span>
        <span>Best Seller</span>
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-107"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
                backgroundSize: "200% auto",
                animation: "shimmer 1.5s linear infinite",
              }}
            />
            <CrownMark className="h-12 w-12 opacity-30" style={{ color: "var(--accent)" }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-5 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="font-display text-xl leading-snug"
            style={{ color: "var(--ink)" }}
          >
            {item.name}
          </h3>
          <span
            className="shrink-0 font-display text-xl font-bold"
            style={{ color: "var(--accent)" }}
          >
            &#2547;{item.price}
          </span>
        </div>
        {item.description && (
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}
