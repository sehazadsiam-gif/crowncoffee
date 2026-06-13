import { getMenu, getSettings, groupMenuByCategory } from "@/lib/data";
import MenuCard from "@/components/MenuCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu | Crown Coffee",
  description: "Coffee, cold brew, breakfast and pastries at Crown Coffee, Uttara.",
};

export default async function MenuPage() {
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);
  const groups = groupMenuByCategory(menu);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase">
        {settings.siteName}
      </p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">Menu</h1>
      <p className="mt-4 max-w-xl text-[var(--ink-soft)]">
        Prices are in Bangladeshi taka and include VAT. Ask our team about seasonal specials.
      </p>

      {groups.length === 0 && (
        <p className="mt-12 text-[var(--ink-soft)]">The menu is being updated &mdash; check back soon.</p>
      )}

      <div className="mt-14 flex flex-col gap-16">
        {groups.map((group) => (
          <section key={group.category}>
            <div className="flex items-center gap-4">
              <h2 className="font-display text-2xl sm:text-3xl">{group.category}</h2>
              <span className="h-px flex-1 bg-[var(--line)]" aria-hidden="true" />
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
