import { updateSession } from './lib/supabase/update-session';
import { NextRequest } from 'next/server';

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
