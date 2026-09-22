import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { edgeAuthConfig } from "@/lib/auth/edge-config";
import { SITE_SOMENTE_BLOG, rotaOculta } from "@/lib/modo-site";

const { auth } = NextAuth(edgeAuthConfig);

export const proxy = auth((req) => {
  if (SITE_SOMENTE_BLOG && rotaOculta(req.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL("/nao-encontrado-oculto", req.nextUrl.origin));
  }

  const isLoggedIn = !!req.auth;
  const isAdminRoute =
    req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login";

  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/produtos/:path*",
    "/ofertas/:path*",
    "/vitrine/:path*",
    "/grupo/:path*",
    "/go/:path*",
  ],
};
