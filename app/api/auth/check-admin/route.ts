import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .eq('status', 'approved')
      .limit(1);

    if (error) {
      return NextResponse.json({ error: 'Failed to check admin' }, { status: 500 });
    }

    return NextResponse.json({ exists: data.length > 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
