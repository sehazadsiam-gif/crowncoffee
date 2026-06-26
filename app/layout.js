import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/work-sans/wght.css";
import "@fontsource-variable/sora/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/500.css";
import "@fontsource/spectral/600.css";
import "@fontsource/spectral/700.css";
import "./globals.css";
import { getSettings, getBanners } from "@/lib/data";
import { FONT_PAIRS } from "@/lib/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BannerStrip from "@/components/BannerStrip";
import PresenceTracker from "@/components/PresenceTracker";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Crown Coffee | Specialty Cafe in Uttara, Dhaka",
  description:
    "Crown Coffee is a specialty coffee shop in Sector 13, Uttara, Dhaka \u2014 serving espresso, cold brew, breakfast and pastries daily.",
};

export default async function RootLayout({ children }) {
  const [settings, bannersData] = await Promise.all([getSettings(), getBanners()]);
  const activeBanners = (bannersData.banners || []).filter((b) => b.active);
  const theme = settings.theme;
  const pair = FONT_PAIRS[theme.fontPair] || FONT_PAIRS.heritage;

  const themeStyle = `:root{--accent:${theme.accent};--secondary:${theme.secondary};--accent-soft:color-mix(in srgb, ${theme.accent} 12%, white);--secondary-soft:color-mix(in srgb, ${theme.secondary} 14%, white);--font-display:${pair.display};--font-body:${pair.body};}`;

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Header settings={settings} />
        <BannerStrip initialBanners={activeBanners} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <PresenceTracker />
      </body>
    </html>
  );
}
