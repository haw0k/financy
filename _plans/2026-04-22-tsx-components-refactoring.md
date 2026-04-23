# Plan: TSX Components Refactoring

## Context

Standardize all TSX component files in `components/` to follow a consistent export pattern with named exports, FC typing, and proper interface definitions. Use ThemeProvider.tsx as the reference example since it already follows the target pattern.

## Component Pattern

```tsx
// Example (ThemeProvider.tsx - already correct)
import { type FC } from 'react';

export const ThemeProvider: FC<ThemeProviderProps> = ({ children, ...props }) => (
  <NextThemesProvider {...props}>{children}</NextThemesProvider>
);
```

## Files to modify

### 1. DashboardNav.tsx (no props - no interface needed)

```tsx
import { type FC } from 'react';
// ... existing imports

export const DashboardNav: FC = () => {
  // ... existing logic
};
```

### 2. Header.tsx

```tsx
import { type FC } from 'react';
// ... existing imports (User from supabase)

interface IHeader {
  user: User;
}

export const Header: FC<IHeader> = ({ user }) => {
  // ... existing logic
};
```

### 3. DashboardOverview.tsx

```tsx
import { type FC } from 'react';
// ... existing imports

interface IDashboardOverview {
  userId: string;
}

export const DashboardOverview: FC<IDashboardOverview> = ({ userId }) => {
  // ... existing logic
};
```

### 4. TransactionForm.tsx

```tsx
// Rename interface
interface ITransactionForm {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
  editingId: string | null;
}

export const TransactionForm: FC<ITransactionForm> = ({
  userId,
  onSuccess,
  onCancel,
  editingId,
}) => {
  // ... existing logic
};
```

### 5. TransactionsTable.tsx

```tsx
// Rename interface
interface ITransactionsTable {
  userId: string;
}

export const TransactionsTable: FC<ITransactionsTable> = ({ userId }) => {
  // ... existing logic
};
```

### 6. CategoriesTable.tsx

```tsx
// Rename interface
interface ICategoriesTable {
  userId: string;
}

export const CategoriesTable: FC<ICategoriesTable> = ({ userId }) => {
  // ... existing logic
};
```

## Files NOT to modify

- `components/layout/index.ts` - component names stay the same
- `components/pages/HomePage.tsx` - default export page

## Verification

1. `pnpm build` - ensure all components compile
2. `pnpm lint` - verify no linting issues
