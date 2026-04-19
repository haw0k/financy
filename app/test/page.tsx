export default function TestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Test Page</h1>
        <p className="mt-4 text-muted-foreground">
          If you can see this, the app is working!
        </p>
        <p className="mt-2">
          Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
        </p>
      </div>
    </div>
  )
}
