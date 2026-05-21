import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ERole, EProfileStatus } from '@/enums';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (profile.role !== ERole.Admin || profile.status !== EProfileStatus.Approved) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: pendingUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('status', EProfileStatus.Pending)
      .neq('role', ERole.Admin)
      .order('created_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch pending users' }, { status: 500 });
    }

    return NextResponse.json({ data: pendingUsers });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
