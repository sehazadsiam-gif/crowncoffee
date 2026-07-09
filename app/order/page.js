import { Suspense } from "react";
import { getMenu, getSettings, groupMenuByCategory } from "@/lib/data";
import MenuCard from "@/components/MenuCard";
import TableInitializer from "@/components/TableInitializer";

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
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);

  const groups = groupMenuByCategory(menu);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
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

      {/* Table banner */}
      {!isDelivery && tableNumber && (
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

      {groups.length === 0 && (
        <p className="mt-12 text-[var(--ink-soft)]">The menu is being updated — check back soon.</p>
      )}

      <div className="mt-12 flex flex-col gap-16">
        {groups.map((group) => (
          <section key={group.category} id={`cat-${group.category.toLowerCase().replace(/\s+/g, "-")}`}>
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
