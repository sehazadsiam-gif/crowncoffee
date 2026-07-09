import { getMenu, getSettings, groupMenuByCategory } from "@/lib/data";
import MenuCard from "@/components/MenuCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kiosk Menu | Crown Coffee",
  description: "Specialty coffee, cold brew, breakfast and pastries at Crown Coffee.",
  robots: { index: false, follow: false },
};

export default async function KioskPage() {
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);

  // Filter items specifically marked for the kiosk
  let kioskItems = (menu.items || []).filter((item) => item.kiosk);

  // Fallback: If no items are explicitly configured for the kiosk,
  // pick a set of 12 standard items across different categories.
  if (kioskItems.length === 0) {
    const popularIds = [
      "traditional_breakfast",
      "american_breakfast",
      "chicken_sandwich",
      "classic_club_sandwich",
      "french_fries",
      "japanese_fried_chicken",
      "creamy_fettuccine_alfredo_pasta",
      "stir_fried_chicken_noodles",
    ];
    
    // First, try to grab the popular ones by ID
    kioskItems = (menu.items || []).filter((item) => popularIds.includes(item.id));
    
    // If still empty or low, just take the first 12 items of the menu
    if (kioskItems.length < 5) {
      kioskItems = (menu.items || []).slice(0, 12);
    }
  }

  // Group the kiosk items by their original categories
  const groups = groupMenuByCategory({
    categories: menu.categories,
    items: kioskItems,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase">
        {settings.siteName}
      </p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">Kiosk Menu</h1>
      <p className="mt-4 max-w-xl text-[var(--ink-soft)]">
        A curated selection of our favorite dishes, desserts, and brews. Ask our team about seasonal specials.
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
