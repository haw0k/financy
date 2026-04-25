# Plan: Remove User Id From Categories Table

## Context

Adding a category fails with foreign key error `23503` because `categories.user_id` references `profiles(id)`, but the profile may not exist for some users. The user wants to make `categories` global (like `category_types`), removing `user_id` and its FK constraint, and updating all downstream code.

The categories `user_id` field was added before `category_types` existed. Now categories should be a global reference table.

## Implementation

### Step 1: Update DB schema

**File:** `scripts/001_init_database.sql`

- Remove `user_id` column from `categories` table
- Remove `user_id` FK constraint
- Update RLS policies: categories become global (all authenticated users can read/write)

**Current:**

```sql
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  type_id uuid references public.category_types(id) on delete set null,
  color text default '#3b82f6',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

**Updated:**

```sql
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('income', 'expense')),
  type_id uuid references public.category_types(id) on delete set null,
  color text default '#3b82f6',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

Update RLS policies for categories (global, like `category_types`):

```sql
drop policy if exists "categories_select_own" on public.categories;
drop policy if exists "categories_insert_own" on public.categories;
drop policy if exists "categories_update_own" on public.categories;
drop policy if exists "categories_delete_own" on public.categories;

drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories for select using (auth.role() = 'authenticated');
drop policy if exists "categories_insert_all" on public.categories;
create policy "categories_insert_all" on public.categories for insert with check (auth.role() = 'authenticated');
drop policy if exists "categories_update_all" on public.categories;
create policy "categories_update_all" on public.categories for update using (auth.role() = 'authenticated');
drop policy if exists "categories_delete_all" on public.categories;
create policy "categories_delete_all" on public.categories for delete using (auth.role() = 'authenticated');
```

### Step 2: Update interface

**File:** `interfaces/categories.interface.ts`

- Remove `user_id` from `ICategory`
- Remove `user_id` from `ICategoryInput`

### Step 3: Update CategoriesTable component

**File:** `components/layout/CategoriesTable.tsx`

- Remove `ICategoriesTable` interface (component no longer needs `userId` prop)
- Remove `userId` from destructured props
- Remove `.eq('user_id', userId)` filter in `fetchCategories()`
- Remove `user_id: userId` from the insert payload in `handleSubmit`
- Component becomes self-contained

### Step 4: Update CategoriesPage

**File:** `components/pages/dashboard/CategoriesPage.tsx`

- Remove server-side user fetch (`createClient`, `getUser`)
- Remove `userId` prop from `<CategoriesTable>`
- Simplify to just render `<CategoriesTable />`

## Files to Modify

| File                                            | Change                                                 |
| ----------------------------------------------- | ------------------------------------------------------ |
| `scripts/001_init_database.sql`                 | Remove `user_id` from categories table + update RLS    |
| `interfaces/categories.interface.ts`            | Remove `user_id` from `ICategory` and `ICategoryInput` |
| `components/layout/CategoriesTable.tsx`         | Remove `userId` prop, filters, insert payload          |
| `components/pages/dashboard/CategoriesPage.tsx` | Remove server user fetch, simplify                     |

## Verification

1. Run `pnpm lint && pnpm build` — no errors
2. Open `/dashboard/categories` — categories load without user filter
3. Add a new category — should succeed without FK error
4. Open `/dashboard/transactions` — category dropdown should show all categories
