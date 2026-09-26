import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { MFA_COOKIE, hasAdminSession } from "@/lib/admin-session";

// Runs only on /admin: refreshes the Supabase session cookie and bounces signed-out visitors to
// the login page before any admin code runs. Pages and actions still check the owner themselves
// (see src/lib/auth.js); this is the first of two gates, not the only one.
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Owner session AND the second-factor cookie (see src/lib/admin-session.js).
  const isOwner = await hasAdminSession(user, request.cookies.get(MFA_COOKIE)?.value);
  const onLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!isOwner && !onLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (isOwner && onLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
