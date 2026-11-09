import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/jwt";

const PUBLIC_ADMIN = ["/admin/login", "/api/admin/auth/login"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_ADMIN.includes(pathname)) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session && session.sub) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
