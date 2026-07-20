import { getMenu, getSettings, groupMenuByCategory } from "@/lib/data";
import InteractiveMenu from "@/components/InteractiveMenu";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu | Crown Coffee",
  description: "Coffee, cold brew, breakfast and pastries at Crown Coffee, Uttara.",
};

export default async function MenuPage() {
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);
  const groups = groupMenuByCategory(menu);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase">
          {settings.siteName}
        </p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">Our Menu</h1>
        <p className="mt-6 text-lg text-[var(--ink-soft)] leading-relaxed">
          Prices are in Bangladeshi taka and include VAT. Ask our team about seasonal specials.
        </p>
      </div>

      <InteractiveMenu groups={groups} viewOnly />
    </div>
  );
}
