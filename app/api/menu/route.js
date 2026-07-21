import { NextResponse } from "next/server";
import { getMenu, saveMenu } from "@/lib/data";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const menu = await getMenu();
  return NextResponse.json(menu);
}

export async function PUT(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body || !Array.isArray(body.items) || !Array.isArray(body.categories)) {
    return NextResponse.json({ error: "Invalid menu payload" }, { status: 400 });
  }

  const saved = await saveMenu(body);
  return NextResponse.json(saved);
}
