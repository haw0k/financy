import { updateSession } from './lib/supabase/middleware';
import { NextRequest } from 'next/server';

// Next.js expects a function named `proxy` in this file when using proxy mode
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (.*\.(?:svg|png|jpg|jpeg|gif|webp)$)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
