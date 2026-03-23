import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ROUTES = ["/login", "/register"];
const API_RATE_LIMIT_WINDOW_MS = 60_000;
const API_RATE_LIMIT_MAX = 120;

const apiRequestTracker = new Map<string, { count: number; windowStart: number }>();

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = apiRequestTracker.get(ip);
  if (!entry || now - entry.windowStart > API_RATE_LIMIT_WINDOW_MS) {
    apiRequestTracker.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > API_RATE_LIMIT_MAX;
}

function hasSuspiciousQuery(request: NextRequest) {
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (key.includes("$") || key.includes(".")) return true;
    if (value.includes("$") || value.includes("{") || value.includes("}")) return true;
  }
  return false;
}

function applySecurityHeaders(response: NextResponse) {
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'";
  const connectSrc = isDev ? "connect-src 'self' ws: wss: https:" : "connect-src 'self'";

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; ${scriptSrc}; ${connectSrc}; frame-ancestors 'none';`,
  );
  return response;
}

function redirectToLogin(pathname: string, origin: string) {
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return applySecurityHeaders(NextResponse.redirect(loginUrl));
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Too many requests, please retry shortly." }, { status: 429 }),
      );
    }

    if (hasSuspiciousQuery(req)) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Invalid query parameters." }, { status: 400 }),
      );
    }

    const isMutation = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    if (
      isMutation &&
      !pathname.startsWith("/api/webhooks") &&
      !pathname.startsWith("/api/settlement/run") &&
      !pathname.startsWith("/api/auth")
    ) {
      const origin = req.headers.get("origin");
      if (origin && new URL(origin).origin !== req.nextUrl.origin) {
        return applySecurityHeaders(
          NextResponse.json({ error: "CSRF validation failed." }, { status: 403 }),
        );
      }
    }

    return applySecurityHeaders(NextResponse.next());
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isLoggedIn = Boolean(token);
  const role = token?.role as "ADMIN" | "USER" | undefined;

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return applySecurityHeaders(NextResponse.next());
    }

    const redirectPath = role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
    return applySecurityHeaders(NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin)));
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return redirectToLogin(pathname, req.nextUrl.origin);
    }

    if (role !== "ADMIN") {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/user/dashboard", req.nextUrl.origin)),
      );
    }
  }

  if (pathname.startsWith("/user")) {
    if (!isLoggedIn) {
      return redirectToLogin(pathname, req.nextUrl.origin);
    }

    if (role === "ADMIN") {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl.origin)),
      );
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/login", "/register", "/admin/:path*", "/user/:path*", "/api/:path*"],
};
