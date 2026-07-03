import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ICategory, ICategoryType } from '@/interfaces';

/* ── Mocks ─────────────────────────────────────────────────────── */

const mockRouterRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}));

vi.mock('@/lib/with-timeout', () => ({
  withTimeout: <T,>(p: Promise<T>) => p,
}));

const mockCreateCategoryAction = vi.fn();
const mockUpdateCategoryAction = vi.fn();
const mockDeleteCategoryAction = vi.fn();
const mockCreateCategoryTypeAction = vi.fn();
const mockUpdateCategoryTypeAction = vi.fn();
const mockDeleteCategoryTypeAction = vi.fn();

vi.mock('@/app/actions/categories', () => ({
  createCategoryAction: (...args: unknown[]) => mockCreateCategoryAction(...args),
  updateCategoryAction: (...args: unknown[]) => mockUpdateCategoryAction(...args),
  deleteCategoryAction: (...args: unknown[]) => mockDeleteCategoryAction(...args),
  createCategoryTypeAction: (...args: unknown[]) => mockCreateCategoryTypeAction(...args),
  updateCategoryTypeAction: (...args: unknown[]) => mockUpdateCategoryTypeAction(...args),
  deleteCategoryTypeAction: (...args: unknown[]) => mockDeleteCategoryTypeAction(...args),
}));

const mockShowError = vi.fn();

vi.mock('@/components/ui', async () => {
  const React = await import('react');

  return {
    NewButton: ({ onClick, label }: { onClick?: () => void; label?: string }) => (
      <button type="button" aria-label={label ?? 'New'} onClick={onClick}>
        {label ?? 'New'}
      </button>
    ),
    Select: ({
      children,
      value,
      onValueChange,
    }: {
      children: React.ReactNode;
      value?: string;
      onValueChange?: (value: string) => void;
    }) => {
      const options = React.Children.toArray(children).flatMap((child) => {
        if (!React.isValidElement(child)) return [];
        const element = child as React.ReactElement<{ value?: string; children?: React.ReactNode }>;
        if (element.props.value === undefined) {
          return React.Children.toArray(element.props.children).filter(
            (c): c is React.ReactElement<{ value: string; children: React.ReactNode }> => {
              if (!React.isValidElement(c)) return false;
              const option = c as React.ReactElement<{ value?: string }>;
              return option.props.value !== undefined;
            }
          );
        }
        return [element as React.ReactElement<{ value: string; children: React.ReactNode }>];
      });

      return (
        <select
          value={value}
          onChange={(e) => {
            onValueChange?.(e.target.value);
          }}
        >
          {options.map((option) => (
            <option key={option.props.value} value={option.props.value}>
              {option.props.children}
            </option>
          ))}
        </select>
      );
    },
    SelectContent: ({ children }: { children: React.ReactNode }) => children,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <option value={value}>{children}</option>
    ),
    SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => (
      <button id={id} type="button">
        {children}
      </button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => <>{placeholder}</>,
    showError: mockShowError,
  };
});

vi.mock('@/lib/shadcn', async () => {
  const React = await import('react');

  return {
    AlertDialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AlertDialogAction: ({
      children,
      onClick,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
      <button type="button">{children}</button>
    ),
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Button: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
      ({ children, ...props }, ref) => (
        <button ref={ref} {...props}>
          {children}
        </button>
      )
    ),
    Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
      ({ ...props }, ref) => <input ref={ref} {...props} />
    ),
    Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
      <label htmlFor={htmlFor}>{children}</label>
    ),
    Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
    TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
    TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
    TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
    TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
    TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  };
});

/* ── Helpers ───────────────────────────────────────────────────── */

const initialCategories: ICategory[] = [];
const initialCategoryTypes: ICategoryType[] = [];

function setup() {
  return render(
    <CategoriesTableClient
      initialCategories={initialCategories}
      initialCategoryTypes={initialCategoryTypes}
    />
  );
}

/* ── Dynamic import after mocks are configured ────────────────── */

let CategoriesTableClient: typeof import('@/components/layouts/CategoriesTableClient').CategoriesTableClient;

beforeEach(async () => {
  vi.clearAllMocks();
  mockCreateCategoryAction.mockResolvedValue({ isSuccess: true, data: undefined });
  mockUpdateCategoryAction.mockResolvedValue({ isSuccess: true, data: undefined });
  mockDeleteCategoryAction.mockResolvedValue({ isSuccess: true, data: undefined });
  mockCreateCategoryTypeAction.mockResolvedValue({ isSuccess: true, data: undefined });
  mockUpdateCategoryTypeAction.mockResolvedValue({ isSuccess: true, data: undefined });
  mockDeleteCategoryTypeAction.mockResolvedValue({ isSuccess: true, data: undefined });

  const module = await import('@/components/layouts/CategoriesTableClient');
  CategoriesTableClient = module.CategoriesTableClient;
});

/* ── Tests ─────────────────────────────────────────────────────── */

describe('CategoriesTableClient form layout', () => {
  it('renders category form fieldset with a legend', () => {
    const { container } = setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'New' })[0]);

    expect(screen.getByRole('group', { name: 'New Category' })).toBeDefined();
    expect(container.querySelector('legend')?.textContent).toBe('New Category');
  });

  it('marks required category fields with a red asterisk', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'New' })[0]);

    expect(
      screen.getByText(
        (content, element) => element?.tagName === 'LABEL' && content.startsWith('Category Name')
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        (content, element) => element?.tagName === 'LABEL' && content.startsWith('Type')
      )
    ).toBeDefined();
    expect(screen.getAllByText('*').length).toBeGreaterThanOrEqual(2);
  });

  it('renders category type form fieldset with a legend', () => {
    const { container } = setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'New' })[1]);

    expect(screen.getByRole('group', { name: 'New Category Type' })).toBeDefined();
    expect(container.querySelector('legend')?.textContent).toBe('New Category Type');
  });

  it('marks required category type field with a red asterisk', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'New' })[1]);

    expect(
      screen.getByText(
        (content, element) => element?.tagName === 'LABEL' && content.startsWith('Type Name')
      )
    ).toBeDefined();
    expect(screen.getAllByText('*').length).toBeGreaterThanOrEqual(1);
  });
});
