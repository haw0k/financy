# Plan: Add Category Type Management

## Context

Category types (e.g., "Consumer goods", "Food") can only be added via the Supabase database directly — there is no UI. The user wants CRUD for category types **inline** in the `/dashboard/categories` page, with a **confirmation dialog before deleting**.

## Implementation

### Step 1: Update interfaces

**File:** `interfaces/categories.interface.ts`

Add `ICategoryTypeInput` interface:

```typescript
export interface ICategoryTypeInput {
  name: string;
}
```

### Step 2: Add category type management UI to CategoriesTable

**File:** `/home/haw0k/src/test/financy/components/layout/CategoriesTable.tsx`

**State additions:**

- `ctFormData: { name: string }` — form state for category type name
- `ctEditingId: string | null` — editing state for category types
- `ctIsShowForm: boolean` — show/hide category type add form
- `ctDeleteId: string | null` — track which category type is being deleted (for confirmation dialog)

**Import additions:**

- `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle` from `@/lib/shadcn`

**Add CRUD functions:**

- `handleCtSubmit(e)` — create/update category type via supabase
- `handleCtDelete(id: string)` — delete category type via supabase, then refresh `fetchCategoryTypes()`
- `handleCtEdit(ct: ICategoryType)` — populate form for editing

**Add Card section** (below existing Categories card):

- Card with title "Category Types" and description "Manage category types"
- "Add Category Type" button to toggle inline form
- Inline form with name Input and Submit/Cancel buttons (same pattern as category form)
- Table showing category types with Edit/Delete action buttons
- `AlertDialog` for delete confirmation: "Are you sure? Categories using this type will have it removed."

### Step 3: Category type form UI pattern

Follow the exact same inline Card form pattern used for categories (`isShowForm` toggle):

- Conditionally rendered `<Card className="bg-accent/50">` with `<CardTitle>` "Add New Category Type" / "Edit Category Type"
- Single input field: "Type Name" (required)
- Submit and Cancel buttons
- On success: refresh category types list

### Step 4: Supabase queries

- **Create**: `supabase.from('category_types').insert([{ name }])`
- **Update**: `supabase.from('category_types').update({ name }).eq('id', id)`
- **Delete**: `supabase.from('category_types').delete().eq('id', id)`

After any mutation, call `fetchCategoryTypes()` to refresh.

### Step 5: Delete confirmation

Use shadcn `AlertDialog`:

- Trigger: clicking delete button sets `ctDeleteId`
- Content: "Are you sure you want to delete this category type?" with description "Categories using this type will have the type removed but won't be deleted."
- Cancel button closes dialog (clears `ctDeleteId`)
- Confirm button calls `handleCtDelete(ctDeleteId)`

## Files to Modify

| File                                    | Change                                  |
| --------------------------------------- | --------------------------------------- |
| `interfaces/categories.interface.ts`    | Add `ICategoryTypeInput`                |
| `components/layout/CategoriesTable.tsx` | Add category type CRUD UI + AlertDialog |

## Verification

1. Run `pnpm lint && pnpm build` to verify no errors
2. Open `/dashboard/categories` in browser
3. Add a new category type via the form — confirm it appears in the list
4. Edit an existing category type — confirm name updates
5. Delete a category type — confirm dialog appears, confirm deletion works, type is removed
6. Check that categories referencing the deleted type now show "-" in Category Type column
