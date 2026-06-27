import { type PropsWithChildren, Suspense } from 'react'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layouts'
import { createClient } from '@/lib/supabase/server'
import { routes } from '@/config'

async function AppAuthLoader({ children }: PropsWithChildren) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(routes.login)
  }

  return <AppShell user={user}>{children}</AppShell>
}

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<div className='min-h-screen bg-background' />}>
      <AppAuthLoader>{children}</AppAuthLoader>
    </Suspense>
  )
}
