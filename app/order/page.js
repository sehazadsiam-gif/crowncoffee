import { Suspense } from "react";
import { getMenu, getSettings, groupMenuByCategory } from "@/lib/data";
import TableInitializer from "@/components/TableInitializer";
import InteractiveOrderMenu from "@/components/InteractiveOrderMenu";
import OrderTrackerBanner from "@/components/OrderTrackerBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order | Crown Coffee",
  description: "Order from your table at Crown Coffee.",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ searchParams }) {
  const params = await searchParams;
  const tableNumber = params.table || null;
  const isDelivery = params.type === "delivery";
  const isTab = params.type === "tab";
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);

  const groups = groupMenuByCategory(menu);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <OrderTrackerBanner />

      {/* Delivery banner */}
      {isDelivery && (
        <div className="sticky top-0 z-30 -mx-6 px-6 py-3 mb-6 flex items-center justify-between border-b border-[var(--accent)] bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full font-display text-lg text-white" style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}>
              🚚
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--ink-soft)]">{settings.siteName}</p>
              <p className="font-display text-base font-bold text-[var(--ink)]">Home Delivery — Scan &amp; Order</p>
            </div>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">● Live</span>
        </div>
      )}

      {/* Tab banner */}
      {isTab && (
        <div className="sticky top-0 z-30 -mx-6 px-6 py-3 mb-6 flex items-center justify-between border-b border-[var(--accent)] bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full font-display text-lg text-white" style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}>
              💳
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--ink-soft)]">{settings.siteName}</p>
              <p className="font-display text-base font-bold text-[var(--ink)]">Tab Order — Scan &amp; Order</p>
            </div>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">● Live</span>
        </div>
      )}

      {/* Table banner */}
      {!isDelivery && !isTab && tableNumber && (
        <div className="sticky top-0 z-30 -mx-6 px-6 py-3 mb-6 flex items-center justify-between border-b border-[var(--accent)] bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full font-display text-base font-black text-white" style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d4a017 100%)" }}>
              {tableNumber}
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--ink-soft)]">{settings.siteName}</p>
              <p className="font-display text-base font-bold text-[var(--ink)]">Table {tableNumber} — Scan &amp; Order</p>
            </div>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">● Live</span>
        </div>
      )}

      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase">{settings.siteName}</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Our Menu</h1>
      {isDelivery ? (
        <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
          You are ordering for <strong>Home Delivery</strong> (Delivery charge: ৳{settings.deliveryCharge}). Add items to your basket, input your address, and place your order.
        </p>
      ) : isTab ? (
        <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
          You are placing a <strong>Tab Order</strong>. Add items to your basket, enter your name &amp; contact number, and place your order.
        </p>
      ) : tableNumber ? (
        <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
          You&apos;re ordering for <strong>Table {tableNumber}</strong>. Add items to your basket and tap <em>Place Order</em> — the kitchen will be notified instantly.
        </p>
      ) : (
        <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
          Browse our full menu and add items to your basket.
        </p>
      )}

      {/* Reads ?table= and stores in context/localStorage */}
      <Suspense fallback={null}>
        <TableInitializer />
      </Suspense>

      <InteractiveOrderMenu groups={groups} />
    </div>
  );
}
