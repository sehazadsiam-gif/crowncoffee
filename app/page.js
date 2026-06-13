import Link from "next/link";
import { getMenu, getSettings, groupMenuByCategory } from "@/lib/data";
import MenuCard from "@/components/MenuCard";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  const groups = groupMenuByCategory(menu);
  const preview = groups.map((group) => group.items[0]).filter(Boolean).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 lg:px-10 lg:pt-24 lg:pb-28">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase">
          Sector 13 &middot; Uttara, Dhaka
        </p>
        <h1 className="mt-6 font-display text-6xl leading-[1.05] sm:text-7xl lg:text-8xl">
          Crown
          <br />
          <span className="text-[var(--accent)]">Coffee</span>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--ink-soft)]">
          {settings.tagline}
        </p>

        <div className="mt-8 sm:hidden">
          <StatusBadge hours={settings.hours} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/menu"
            className="rounded-full bg-[var(--ink)] px-7 py-3 text-sm font-semibold tracking-wide text-[var(--paper)] transition hover:bg-[var(--accent)]"
          >
            View the menu
          </Link>
          {settings.mapUrl && (
            <a
              href={settings.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--line)] px-7 py-3 text-sm font-semibold tracking-wide text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Get directions
            </a>
          )}
        </div>
      </section>

      {/* About strip */}
      <section className="border-y border-[var(--line)] bg-[var(--card)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-10 lg:py-20">
          <p className="font-display text-3xl leading-snug sm:text-4xl">
            Good coffee, made without hurry &mdash; a calm room to read, work or talk.
          </p>
          <div className="flex flex-col gap-4 text-[var(--ink-soft)]">
            <p className="leading-relaxed">{settings.description}</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <span className="font-medium text-[var(--ink)]">{settings.address}</span>
              {settings.phone && <span>{settings.phone}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Menu preview */}
      {preview.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl sm:text-4xl">From the menu</h2>
            <Link
              href="/menu"
              className="text-sm font-semibold tracking-wide text-[var(--accent)] hover:underline"
            >
              View full menu &rarr;
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {preview.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Visit */}
      <section className="border-t border-[var(--line)] bg-[var(--card)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Visit Crown Coffee</h2>
            <dl className="mt-8 flex flex-col gap-6 text-sm">
              <div>
                <dt className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                  Address
                </dt>
                <dd className="mt-1.5 text-base text-[var(--ink)]">{settings.address}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                  Phone
                </dt>
                <dd className="mt-1.5 text-base text-[var(--ink)]">
                  <a href={`tel:${settings.phone}`} className="hover:text-[var(--accent)]">
                    {settings.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                  Status
                </dt>
                <dd className="mt-2">
                  <StatusBadge hours={settings.hours} />
                </dd>
              </div>
            </dl>
            {settings.mapUrl && (
              <a
                href={settings.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--accent)] hover:underline"
              >
                Open in Google Maps &rarr;
              </a>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
            <iframe
              title="Crown Coffee location map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                `Crown Coffee, ${settings.address}`
              )}&output=embed`}
              className="h-80 w-full lg:h-full"
              style={{ border: 0, minHeight: "320px" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
