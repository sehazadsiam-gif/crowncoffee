import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidManagerSession, MANAGER_COOKIE } from "@/lib/manager-auth";
import { getOrders } from "@/lib/data";
import ManagerPortal from "./ManagerPortal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manager Portal | Crown Coffee",
  robots: { index: false, follow: false },
};

export default async function ManagerPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MANAGER_COOKIE)?.value;

  if (!(await isValidManagerSession(token))) {
    redirect("/manager/login");
  }

  const store = await getOrders();

  return <ManagerPortal initialOrders={store.orders} />;
}
