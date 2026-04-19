import { createClient } from '@/lib/supabase/server'
import { TransactionsTable } from '@/components/transactions-table'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Manage your income and expenses</p>
      </div>
      <TransactionsTable userId={user?.id || ''} />
    </div>
  )
}
