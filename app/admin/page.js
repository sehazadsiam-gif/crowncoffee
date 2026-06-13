import { getMenu, getSettings } from "@/lib/data";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Crown Coffee",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);

  return <AdminDashboard initialMenu={menu} initialSettings={settings} />;
}
