import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("token")?.value;

  if (!accessToken) {
    if (pathname !== "/auth") {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    return NextResponse.next();
  }

  // User is logged in
  if (pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};