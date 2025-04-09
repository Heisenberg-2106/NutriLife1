import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/about"]

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + "/"),
  )

  // If the user is not logged in and trying to access a protected route
  if (!token && !isPublicPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If the user is logged in and trying to access login/register
  // if (token && request.nextUrl.pathname === "/login") {
  //   return NextResponse.redirect(new URL("/", request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

