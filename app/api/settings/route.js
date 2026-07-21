import { NextResponse } from "next/server";
import { getSettings, saveSettings, DEFAULT_HOURS, DEFAULT_THEME } from "@/lib/data";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
