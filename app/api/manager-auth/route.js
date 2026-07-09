import { NextResponse } from "next/server";
import { checkManagerPin, getManagerToken, MANAGER_COOKIE } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

// POST /api/manager-auth — verify PIN and set manager session cookie
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pin } = body;

    if (!checkManagerPin(pin)) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(MANAGER_COOKIE, await getManagerToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/manager-auth — logout manager
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(MANAGER_COOKIE);
  return response;
}
