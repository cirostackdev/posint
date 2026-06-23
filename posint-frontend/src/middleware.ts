import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    const authCookie = request.cookies.get("posint-session")
    if (!authCookie?.value) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
}
