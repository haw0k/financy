import { createClient } from '@/lib/supabase/server';
import { ERole, EProfileStatus } from '@/enums';
import { AUTH_MSGS } from '@/messages';

/**
 * Verifies that the current user is authenticated and returns the Supabase client along with the user ID.
 *
 * Call this once at the start of a Server Action to both authenticate and obtain the client.
 *
 * @returns `{ supabase, userId }` if authenticated, or `{ error: string }` if not.
 */
export async function requireAuth(): Promise<
  { supabase: Awaited<ReturnType<typeof createClient>>; userId: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: AUTH_MSGS.AUTH_FAILED };
  }

  return { supabase, userId: user.id };
}

/**
 * Verifies that the current user is authenticated and approved.
 *
 * Rejects pending users at the Server Action boundary so that unapproved accounts cannot
 * read or mutate financial data even if they call the generated action endpoint directly.
 *
 * @returns `{ supabase, userId }` if authenticated and approved, or `{ error: string }` if not.
 */
export async function requireApprovedUser(): Promise<
  { supabase: Awaited<ReturnType<typeof createClient>>; userId: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: AUTH_MSGS.AUTH_FAILED };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return { error: AUTH_MSGS.AUTH_FAILED };
  }

  if (profile?.status !== EProfileStatus.Approved) {
    return { error: AUTH_MSGS.PENDING_APPROVAL_REQUIRED };
  }

  if (profile.role === ERole.Admin) {
    return { error: AUTH_MSGS.ADMIN_ACCESS_DENIED };
  }

  return { supabase, userId: user.id };
}
