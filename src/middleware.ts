import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_PATH, APP_PATH, SESSION_COOKIE } from "@/lib/constants";

const PUBLIC_PATHS = [
  `${ADMIN_PATH}/login`,
  "/login",
  "/signup",
];

function hasSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get(SESSION_COOKIE)?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (pathname.startsWith(ADMIN_PATH) || pathname.startsWith(APP_PATH)) {
    if (!hasSession(request)) {
      const loginUrl = new URL(`${ADMIN_PATH}/login`, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/app/:path*"],
};
