import { createClient } from '@/lib/supabase/server';
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
