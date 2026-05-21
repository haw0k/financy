import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { routes } from '@/config';
import { ERole, EProfileStatus } from '@/enums';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? routes.dashboard;

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
    console.error('Auth callback error:', error.message);
  }

  return NextResponse.redirect(`${origin}${routes.authError}`);
}
