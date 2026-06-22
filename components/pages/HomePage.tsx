import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import { routes } from '@/config';

export async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(routes.dashboard);
  } else {
    redirect(routes.login);
  }
}
