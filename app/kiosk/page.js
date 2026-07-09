import { getMenu, getSettings } from "@/lib/data";
import KioskMenu from "@/components/KioskMenu";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Self-Service Kiosk | Crown Coffee",
  description: "Touch to select and order your favorite coffee, breakfast, and pastries.",
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

  return <KioskMenu initialItems={kioskItems} settings={settings} />;
}
