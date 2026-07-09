"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BannerStrip from "@/components/BannerStrip";
import PresenceTracker from "@/components/PresenceTracker";
import { FloatingBasketButton, BasketDrawer, WaiterModeModal } from "@/components/BasketComponents";

/**
 * Wraps the site shell (header, footer, basket).
 * Hides all of it for /manager and /manager/login so the portal is standalone.
 */
export default function SiteShell({ children, settings, activeBanners }) {
  const pathname = usePathname();
  const isManager = pathname.startsWith("/manager");

  if (isManager) {
    // Portal gets full viewport, no site chrome
    return <>{children}</>;
  }

  return (
    <>
      <Header settings={settings} />
      <BannerStrip initialBanners={activeBanners} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <PresenceTracker />
      <FloatingBasketButton />
      <BasketDrawer />
      <WaiterModeModal />
    </>
  );
}
