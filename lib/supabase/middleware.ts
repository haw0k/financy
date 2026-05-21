import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routes, env } from '@/config';
import { ERole, EProfileStatus } from '@/enums';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Check if Supabase env vars are configured
  const supabaseUrl = env.supabaseUrl;
  const supabaseAnonKey = env.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow request to proceed
    // This prevents errors during initial setup
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPath = request.nextUrl.pathname.startsWith(routes.admin);
  const isDashboardPath = request.nextUrl.pathname.startsWith(routes.dashboard);

  if (isAdminPath) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = routes.login;
      return NextResponse.redirect(url);
    }

    if (!user.email_confirmed_at) {
      const url = request.nextUrl.clone();
      url.pathname = routes.pending;
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== ERole.Admin || profile.status !== EProfileStatus.Approved) {
      const url = request.nextUrl.clone();
      url.pathname = routes.dashboard;
      return NextResponse.redirect(url);
    }
  }

  if (isDashboardPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.status !== EProfileStatus.Approved) {
      const url = request.nextUrl.clone();
      url.pathname = routes.pending;
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
