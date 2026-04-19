import { updateSession } from './lib/supabase/middleware'
import { NextRequest } from 'next/server'

// Next.js expects a function named `proxy` in this file when using proxy mode
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}
