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

    // 1. Confirm email first. If this fails the user stays pending — safe state.
    const { error: confirmError } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (confirmError) {
      return NextResponse.json({ error: confirmError.message }, { status: 500 });
    }

    // 2. Approve profile. The DB trigger updates app_metadata so the next JWT
    // refresh contains the new status. If this fails the user is confirmed but
    // still pending in profiles; the admin can retry approval because the user
    // remains in the pending list.
    const { error: statusError } = await supabase
      .from('profiles')
      .update({ status: EProfileStatus.Approved })
      .eq('id', userId);

    if (statusError) {
      console.error('Failed to approve profile after email confirmation:', {
        userId,
        error: statusError,
      });
      return NextResponse.json(
        { error: 'Email confirmed, but failed to update profile status. Please retry approval.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
