import { NextResponse } from "next/server";
import { getBanners, saveBanners } from "@/lib/data";

export async function GET() {
  const data = await getBanners();
  return NextResponse.json(data);
}

export async function PUT(request) {
  const body = await request.json();

  if (!body || !Array.isArray(body.banners)) {
    return NextResponse.json({ error: "Invalid banners payload" }, { status: 400 });
  }

  const saved = await saveBanners(body);
  return NextResponse.json(saved);
}
