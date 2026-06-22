import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { env, routes } from '@/config';
import { EProfileStatus, ERole } from '@/enums';

function getRoleFromUser(user: { app_metadata?: Record<string, unknown> } | null): string | null {
  const role = user?.app_metadata?.role;
  return typeof role === 'string' ? role : null;
}

function getStatusFromUser(user: { app_metadata?: Record<string, unknown> } | null): string | null {
  const status = user?.app_metadata?.status;
  return typeof status === 'string' ? status : null;
}

async function getProfileFromDatabase(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string
): Promise<{ role: string | null; status: string | null }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', userId)
    .maybeSingle();

  return {
    role: profile?.role ?? null,
    status: profile?.status ?? null,
  };
}

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

    let role = getRoleFromUser(user);
    let status = getStatusFromUser(user);

    // Fallback to the database only when the JWT does not contain synced claims.
    // The handle_profile_update trigger keeps app_metadata in sync, so this path
    // is rare (e.g. legacy sessions created before the trigger existed).
    if (role === null || status === null) {
      const profile = await getProfileFromDatabase(supabase, user.id);
      role = profile.role ?? role;
      status = profile.status ?? status;
    }

    if (role !== ERole.Admin || status !== EProfileStatus.Approved) {
      const url = request.nextUrl.clone();
      // Non-approved admins should land on /auth/pending, not /dashboard,
      // to avoid an extra redirect through the dashboard middleware.
      url.pathname = role === ERole.Admin ? routes.pending : routes.dashboard;
      return NextResponse.redirect(url);
    }
  }

  if (isDashboardPath && user) {
    let role = getRoleFromUser(user);
    let status = getStatusFromUser(user);

    if (role === null || status === null) {
      const profile = await getProfileFromDatabase(supabase, user.id);
      role = profile.role ?? role;
      status = profile.status ?? status;
    }

    if (status !== EProfileStatus.Approved || role === ERole.Admin) {
      const url = request.nextUrl.clone();
      url.pathname = role === ERole.Admin ? routes.admin : routes.pending;
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you are creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    myNewResponse = NextResponse.next({ request })
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
