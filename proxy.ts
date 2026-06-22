import { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/update-session';

// Next.js expects a function named `proxy` in this file when using proxy mode
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run session refresh and role checks only on protected routes. Public pages
  // (/auth/*, /, etc.) do not need supabase.auth.getUser() on every request,
  // avoiding 30-80ms warm / 100-300ms cold overhead per public page load.
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
