# Plan: Add Category Types Table

## Context

Need to add categorization to expenses/income by grouping categories into types (e.g., "Consumer goods", "Food"). This is a database schema change that requires:

1. New `category-types` reference table
2. FK relationship from `categories` to `category-types`
3. UI updates to display and manage category type association

## Implementation Steps

### 1. Database Migration

**File:** `scripts/002_add_category_types.sql` (new file)

Create migration script:

- Create `category_types` table (id, name, created_at) — global reference, no user_id
- Add `type_id` column to `categories` table with FK constraint

### 2. Update ICategory Interface

**File:** `interfaces/categories.interface.ts`

Add `type_id` field to `ICategory` interface. Create `ICategoryType` interface for category types.

### 3. Update CategoriesTable Component

**File:** `components/layout/CategoriesTable.tsx`

- Fetch category types on mount
- Add dropdown in form to select category type
- Add column in table to display category type name
- Update insert/update logic to include `type_id`

### 4. Update TransactionsTable Component

**File:** `components/layout/TransactionsTable.tsx`

- Fetch categories with their types on mount
- Add "Category" column to table showing category name and its type
- Display as: "CategoryName (TypeName)" e.g., "Headphones (Consumer goods)"

```sql
-- Create category_types table (snake_case to match existing conventions)
create table if not exists public.category_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- Add type_id to categories
alter table public.categories
add column type_id uuid references public.category_types(id) on delete set null;
```

## Files to Modify

| File                                      | Change                                          |
| ----------------------------------------- | ----------------------------------------------- |
| `scripts/002_add_category_types.sql`      | Create new migration                            |
| `interfaces/categories.interface.ts`      | Add `type_id` field + `ICategoryType` interface |
| `components/layout/CategoriesTable.tsx`   | Add type selection in form + display column     |
| `components/layout/TransactionsTable.tsx` | Display category type in table                  |
| `components/layout/TransactionForm.tsx`   | Optional: filter or display category type       |

## Verification

1. Run migration in Supabase SQL Editor
2. Check categories table has `type_id` column
3. Check /dashboard/categories page loads without errors
4. Verify category form allows selecting type
5. Check existing categories display their type
6. Check /dashboard/transactions page displays category types in table
