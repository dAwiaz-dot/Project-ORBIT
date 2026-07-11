import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSecret } from "@/lib/auth-secret";
import { isSessionExpired } from "@/lib/session-policy";

const publicRoutes = new Set(["/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: authSecret
  });
  const hasValidToken = Boolean(token && !isSessionExpired(token.sessionExpiresAt));

  if (hasValidToken && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasValidToken && !publicRoutes.has(pathname)) {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("next-auth.session-token");
  response.cookies.delete("__Secure-next-auth.session-token");
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|apple-touch-icon.png|icon-192.png|icon-512.png|orbit-logo.png|manifest.webmanifest|sw.js).*)"
  ]
};
