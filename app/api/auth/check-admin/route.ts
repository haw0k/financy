import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EProfileStatus, ERole } from '@/enums';

/**
 * Returns whether an approved admin already exists.
 *
 * Uses the anon-key server client with a short cache TTL instead of the
 * service-role client. This avoids exposing a privileged query on an
 * unauthenticated route while still letting the admin auth UI decide whether
 * to show the login or signup form.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', ERole.Admin)
      .eq('status', EProfileStatus.Approved)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: 'Failed to check admin' }, { status: 500 });
    }

    return NextResponse.json({ exists: data.length > 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
