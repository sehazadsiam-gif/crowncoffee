import { NextResponse } from "next/server";
import { getSettings, saveSettings, DEFAULT_HOURS, DEFAULT_THEME } from "@/lib/data";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request) {
  const body = await request.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  const current = await getSettings();
  const merged = {
    ...current,
    ...body,
    hours: { ...DEFAULT_HOURS, ...(body.hours || current.hours) },
    theme: { ...DEFAULT_THEME, ...(body.theme || current.theme) },
  };

  const saved = await saveSettings(merged);
  return NextResponse.json(saved);
}
