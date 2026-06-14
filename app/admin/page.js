import { getMenu, getSettings, getBanners } from "@/lib/data";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Crown Coffee",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [menu, settings, banners] = await Promise.all([
    getMenu(),
    getSettings(),
    getBanners(),
  ]);

  return (
    <AdminDashboard
      initialMenu={menu}
      initialSettings={settings}
      initialBanners={banners}
    />
  );
}
