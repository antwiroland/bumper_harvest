import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protected routes that require authentication
const protectedRoutes = ["/user", "/admin"]
const authRoutes = ["/login", "/register"]
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // TODO: Implement proper authentication check with NextAuth.js
  // For now, this is a placeholder that will be updated in Phase 3
  const isAuthenticated = false // Will be replaced with actual auth check
  const isAdmin = false // Will be replaced with actual role check

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url))
  }

  // Protect dashboard routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check admin access
    if (adminRoutes.some((route) => pathname.startsWith(route)) && !isAdmin) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
