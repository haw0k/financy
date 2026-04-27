import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config';

export default async function HomePage() {
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
