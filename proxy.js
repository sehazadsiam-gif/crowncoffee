import { NextResponse } from "next/server";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isProtectedApi =
    pathname.startsWith("/api/menu") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/upload");

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (isValidSession(token)) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/menu/:path*", "/api/settings/:path*", "/api/upload/:path*"],
};
