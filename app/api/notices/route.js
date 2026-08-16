import { NextResponse } from "next/server";
import { getNotices, saveNotices } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getNotices();
  return NextResponse.json(data);
}

export async function PUT(request) {
  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.notices)) {
      return NextResponse.json({ error: "Invalid notices payload" }, { status: 400 });
    }

    const saved = await saveNotices(body);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save notices" }, { status: 500 });
  }
}
