# Plan: Cache User Role via Server-Fetched React Context

## Context

Every client component that needs `role`/`status` calls `useRole()` independently, each triggering:
1. `supabase.auth.getUser()` — JWT verification
2. `supabase.from('profiles').select('role, status')` — DB query

Four components run these queries on mount: `AdminPage`, `DashboardNav`, `MobileNav`, `PendingPage`. On a `/dashboard` page load, DashboardNav + MobileNav = 4 independent requests for the same data.

Middleware already validates role/status before the request reaches protected routes — when a component renders, we KNOW the user is authorized. The profile can be fetched once server-side and shared via React Context.

## Approach

**Fetch profile in root layout** (`app/layout.tsx` — server component), pass to a `RoleProvider` client component via props. `useRole()` reads from Context first; falls back to DB query if Context is empty (backward compatibility for components rendered outside the provider).

Auth pages get `null/null` — `getUser()` on unauthenticated request does a fast JWT check (no DB call), so no overhead for `/auth/*` routes.

## Implementation Steps

### Step 1 — Create `components/providers/RoleProvider.tsx`

- `'use client'` component
- Props: `{ role: ERole | null; status: EProfileStatus | null; children: React.ReactNode }`
- Context type `IRoleContext = { role: ERole | null; status: EProfileStatus | null; refetch: () => void }`
- `refetch()` calls `useRouter().refresh()` — triggers server layout re-render
- Exports: `RoleProvider` component, `useRoleContext()` hook
- Follow pattern from `MobileNavContext.tsx`: `createContext`, provider, custom hook

### Step 2 — Update `components/providers/index.ts`

- Add `export { RoleProvider, useRoleContext } from './RoleProvider'`

### Step 3 — Modify `app/layout.tsx`

- Import `createClient` from `@/lib/supabase/server`, `RoleProvider` from `@/components/providers`
- Add async profile fetch before `return`:
  ```tsx
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let role: ERole | null = null;
  let status: EProfileStatus | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();
    role = (profile?.role as ERole) ?? null;
    status = (profile?.status as EProfileStatus) ?? null;
  }
  ```
- Wrap children: `<RoleProvider role={role} status={status}>{children}</RoleProvider>`
- Nest inside `<ThemeProvider>` — `<ThemeProvider><RoleProvider>{children}</RoleProvider></ThemeProvider>`

### Step 4 — Modify `hooks/useRole.ts`

- Import `useRoleContext` from `@/components/providers`
- Try reading from context first:
  ```typescript
  const ctx = useRoleContext();
  // If context has role data, return it synchronously
  if (ctx.role !== null) {
    return { role: ctx.role, status: ctx.status, isLoading: false, error: null, refetch: ctx.refetch };
  }
  ```
- If context is null (component outside provider, or error in layout), execute existing DB-query logic as fallback
- This preserves backward compatibility — tests that mock `useRole` will still work (they mock the entire hook)

### Step 5 — Verify

- `pnpm type-check` — no errors
- `pnpm lint` — no errors
- `pnpm test:run` — all existing tests pass (tests mock `useRole` at module level, so change is invisible to them)
- Manual smoke test: login → dashboard renders, admin panel renders, pending page renders

## Files Summary

| Action | File |
|--------|------|
| CREATE | `components/providers/RoleProvider.tsx` |
| MODIFY | `components/providers/index.ts` |
| MODIFY | `app/layout.tsx` |
| MODIFY | `hooks/useRole.ts` |
| NO CHANGE | All consumer components (AdminPage, DashboardNav, MobileNav, PendingPage) |

## Edge Cases

- **Component outside provider**: `useRoleContext()` returns null-safe defaults — `useRole` falls back to DB query
- **Auth pages** (`/auth/*`): `getUser()` returns null → `role=null, status=null` → no DB query
- **Session expiry mid-session**: middleware catches it and redirects to `/auth/login` before layout re-renders
- **`refetch()`**: calls `router.refresh()` → server layout re-executes → new profile fetch → context updates
- **SPA navigation between dashboard pages**: layout persists → no re-fetch → profile stays in context (correct behavior, role/status don't change mid-session)
