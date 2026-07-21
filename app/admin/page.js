import { getMenu, getSettings, getBanners } from "@/lib/data";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Crown Coffee",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!(await isValidSession(token))) {
    redirect("/admin/login?from=/admin");
  }

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
