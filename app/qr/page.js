import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/data";
import QRGrid from "./QRGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Table QR Codes | Crown Coffee Admin",
  robots: { index: false, follow: false },
};

export default async function QRPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    redirect("/admin/login");
  }

  const settings = await getSettings();
  const tableCount = settings.tableCount || 50;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <QRGrid tableCount={tableCount} />
    </div>
  );
}
