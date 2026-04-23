# Plan: Extract Shared Interfaces from Layout Components

## Goal

Create a centralized `interfaces/` directory with domain types extracted from layout components, establishing a convention for shared types even when not yet shared across 2+ components.

## Current State

### Layout Component Interfaces (inline, component-specific)

| Component | Interface | Purpose |
|-----------|-----------|---------|
| `TransactionsTable.tsx` | `ITransactionsTable` | Props for table component |
| `TransactionsTable.tsx` | `ITransaction` | Transaction data (with `sender_id`, `receiver_id`, `category_id`) |
| `CategoriesTable.tsx` | `ICategoriesTable` | Props for table component |
| `CategoriesTable.tsx` | `ICategory` | Category data |
| `DashboardOverview.tsx` | `IDashboardOverview` | Props for dashboard |
| `DashboardOverview.tsx` | `IStats` | User statistics |
| `DashboardOverview.tsx` | `ITransaction` | Transaction data (subset, no sender/receiver) |
| `DashboardOverview.tsx` | `ICategoryData` | Chart data |
| `TransactionForm.tsx` | `ITransactionForm` | Props for form component |

### Issue

Two different `ITransaction` interfaces with different structures:
- **TransactionsTable**: Full type with `sender_id`, `receiver_id`, `category_id`
- **DashboardOverview**: Subset without sender/receiver fields

## Target State

### New Directory Structure

```
interfaces/
├── index.ts                 # Barrel file
├── transactions.interface.ts # Transaction types
├── categories.interface.ts     # Category types
└── stats.interface.ts        # Statistics types
```

### Type Definitions

**`interfaces/transactions.ts`**
```typescript
export interface ITransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  description: string | null;
  category_id: string | null;
  sender_id: string;
  receiver_id: string;
}

export interface ITransactionInput {
  amount: number;
  type: 'income' | 'expense';
  date: string;
  description: string | null;
  receiverId?: string;
}
```

**`interfaces/categories.ts`**
```typescript
export interface ICategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  user_id: string;
}

export interface ICategoryInput {
  name: string;
  type: 'income' | 'expense';
  color: string;
}
```

**`interfaces/stats.ts`**
```typescript
export interface IStats {
  total_balance: number;
  total_income: number;
  total_expense: number;
}

export interface ICategoryData {
  name: string;
  value: number;
}
```

**`interfaces/index.ts`**
```typescript
export * from './transactions.interface';
export * from './categories.interface';
export * from './stats.interface';
```

## Component Updates

Only extract **domain types** (Transaction, Category, Stats, CategoryData). Component-specific prop interfaces (`I<ComponentName>`) remain inline in their respective component files — **do not extract**.

### TransactionsTable.tsx
- Remove `ITransaction` interface (domain type)
- Import: `import type { ITransaction } from '@/interfaces'`
- **Keep** `ITransactionsTable` inline (component-specific)

### CategoriesTable.tsx
- Remove `ICategory` interface (domain type)
- Import: `import type { ICategory } from '@/interfaces'`
- **Keep** `ICategoriesTable` inline (component-specific)

### DashboardOverview.tsx
- Remove `IStats`, `ICategoryData`, `ITransaction` interfaces (domain types)
- Import: `import type { ITransaction, IStats, ICategoryData } from '@/interfaces'`
- **Keep** `IDashboardOverview` inline (component-specific)

### TransactionForm.tsx
- No domain types to extract (has only `ITransactionForm` prop type)
- **Keep** `ITransactionForm` inline (component-specific)
- No changes needed

## Files to Create

1. `interfaces/transactions.interface.ts` — Transaction types
2. `interfaces/categories.interface.ts` — Category types
3. `interfaces/stats.interface.ts` — Statistics and chart types
4. `interfaces/index.ts` — Barrel file

## Files to Modify

1. `components/layout/TransactionsTable.tsx` — Update imports (remove ITransaction)
2. `components/layout/CategoriesTable.tsx` — Update imports (remove ICategory)
3. `components/layout/DashboardOverview.tsx` — Update imports (remove IStats, ICategoryData)

## Acceptance Criteria

- [ ] `interfaces/` directory created with domain types
- [ ] Barrel file `interfaces/index.ts` exports all types
- [ ] Layout components import from centralized interfaces
- [ ] Component-specific prop interfaces remain inline (not extracted)
- [ ] TypeScript compiles without errors: `pnpm type-check`
- [ ] No breaking changes to existing functionality

## Testing

- Run `pnpm type-check` to verify no type errors
- Verify all layout components still render correctly