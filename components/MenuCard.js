import Image from "next/image";
import CrownMark from "./CrownMark";

export default function MenuCard({ item }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] transition-shadow hover:shadow-[0_12px_32px_-20px_rgba(28,22,18,0.35)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--accent-soft)]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CrownMark className="h-10 w-10 text-[var(--accent)] opacity-40" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg leading-snug">{item.name}</h3>
          <span className="shrink-0 font-display text-lg text-[var(--accent)]">
            &#2547;{item.price}
          </span>
        </div>
        {item.description && (
          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{item.description}</p>
        )}
      </div>
    </article>
  );
}
