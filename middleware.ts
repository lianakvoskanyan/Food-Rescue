import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/studio" || pathname.startsWith("/studio/")) {
    const role = req.auth?.user?.role;
    if (role === "admin") {
      return NextResponse.next();
    }

    if (req.auth) {
      const denied = new URL("/profile", req.nextUrl.origin);
      denied.searchParams.set("error", "access_denied");
      return NextResponse.redirect(denied);
    }

    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
