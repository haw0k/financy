import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/config';
import { EProfileStatus, ERole } from '@/enums';

type TAllowedCallbackRedirect =
  | (typeof routes)['dashboard']
  | (typeof routes)['admin']
  | (typeof routes)['pending'];

const ALLOWED_CALLBACK_REDIRECTS: TAllowedCallbackRedirect[] = [
  routes.dashboard,
  routes.admin,
  routes.pending,
];

function safeCallbackRedirect(next: string | null): TAllowedCallbackRedirect {
  if (!next) {
    return routes.dashboard;
  }

  const normalized = next.startsWith('/') ? next : `/${next}`;
  return ALLOWED_CALLBACK_REDIRECTS.includes(normalized as TAllowedCallbackRedirect)
    ? (normalized as TAllowedCallbackRedirect)
    : routes.dashboard;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeCallbackRedirect(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.role === ERole.Admin && profile?.status === EProfileStatus.Approved) {
          return NextResponse.redirect(`${origin}${routes.admin}`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Intentionally not logging auth errors to avoid leaking details in production.
  }

  return NextResponse.redirect(`${origin}${routes.authError}`);
}
