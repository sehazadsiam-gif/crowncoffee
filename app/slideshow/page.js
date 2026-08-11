import { getMenu, getSettings } from "@/lib/data";
import MenuSlideshow from "@/components/slideshow/MenuSlideshow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu Slideshow | Crown Coffee Bangladesh",
  description: "Endless full-screen featured menu slideshow for Crown Coffee Bangladesh.",
};

export default async function SlideshowPage() {
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);

  return <MenuSlideshow menu={menu} settings={settings} />;
}
