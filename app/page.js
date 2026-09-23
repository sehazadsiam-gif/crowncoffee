import Link from "next/link";
import { getMenu, getSettings, groupMenuByCategory } from "@/lib/data";
import MenuCard from "@/components/MenuCard";
import BestSellerCard from "@/components/BestSellerCard";
import StatusBadge from "@/components/StatusBadge";
import HomeHero from "@/components/HomeHero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  const groups = groupMenuByCategory(menu);
  const preview = groups.map((group) => group.items[0]).filter(Boolean).slice(0, 4);
  const bestSellers = (menu.items || []).filter((item) => item.bestSeller);
  const heroFeatured = bestSellers[0] || (menu.items && menu.items[0]) || null;

  return (
    <>
      {/* Interactive Hero Showcase */}
      <HomeHero settings={settings} featuredItem={heroFeatured} />


      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section
          className="border-y border-[var(--line)]"
          style={{ background: "linear-gradient(180deg, #fffaf5 0%, #fde4ce 100%)" }}
        >
          <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: "var(--accent)" }}>
                  Crowd favourites
                </p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                  ★ Our Best Sellers
                </h2>
              </div>
              <Link
                href="/menu"
                className="text-sm font-semibold tracking-wide hover:underline"
                style={{ color: "var(--accent)" }}
              >
                See full menu &rarr;
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {bestSellers.map((item) => (
                <BestSellerCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

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
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
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
