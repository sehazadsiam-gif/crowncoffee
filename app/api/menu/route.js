import { NextResponse } from "next/server";
import { getMenu, saveMenu } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const menu = await getMenu();
  return NextResponse.json(menu);
}

export async function PUT(request) {
  const body = await request.json();

  if (!body || !Array.isArray(body.items) || !Array.isArray(body.categories)) {
    return NextResponse.json({ error: "Invalid menu payload" }, { status: 400 });
  }

  const saved = await saveMenu(body);
  return NextResponse.json(saved);
}
