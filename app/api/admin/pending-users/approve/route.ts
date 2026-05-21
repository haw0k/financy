import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ERole, EProfileStatus } from '@/enums';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (adminProfile.role !== ERole.Admin || adminProfile.status !== EProfileStatus.Approved) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot approve your own account' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: statusError } = await supabase
      .from('profiles')
      .update({ status: EProfileStatus.Approved })
      .eq('id', userId);

    if (statusError) {
      return NextResponse.json({ error: 'Failed to update profile status' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
