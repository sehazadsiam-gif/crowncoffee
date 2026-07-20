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
  const isMenuPage = pathname === "/menu"; // Public browse-only menu — no basket needed

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
      {/* Basket UI is hidden on the public /menu page — ordering is via QR/delivery/tab only */}
      {!isMenuPage && <FloatingBasketButton />}
      {!isMenuPage && <BasketDrawer />}
      {!isMenuPage && <WaiterModeModal />}
    </>
  );
}
