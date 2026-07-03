import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  const collectOptions = (
    nodes: React.ReactNode
  ): React.ReactElement<{
    value: string;
    children: React.ReactNode;
  }>[] =>
    React.Children.toArray(nodes).flatMap((child) => {
      if (!React.isValidElement(child)) return [];
      const element = child as React.ReactElement<{
        value?: string;
        children?: React.ReactNode;
      }>;
      if (element.props.value !== undefined) {
        return [element as React.ReactElement<{ value: string; children: React.ReactNode }>];
      }
      return collectOptions(element.props.children);
    });

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
      const options = collectOptions(children);

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
    SelectGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <option value={value}>{children}</option>
    ),
    SelectLabel: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
  mockCreateCategoryAction.mockResolvedValue({
    isSuccess: true,
    data: { id: 'new-cat', name: 'Food', type: 'expense', color: '#fff', icon: 'circle' },
  });
  mockUpdateCategoryAction.mockResolvedValue({ isSuccess: true, data: undefined });
  mockDeleteCategoryAction.mockResolvedValue({ isSuccess: true, data: undefined });
  mockCreateCategoryTypeAction.mockResolvedValue({
    isSuccess: true,
    data: { id: 'new-ct', name: 'Goods', icon: 'circle' },
  });
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

describe('CategoriesTableClient icon selector', () => {
  it('renders icon select in the category form', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'New' })[0]);

    expect(screen.getByText('Icon')).toBeDefined();
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(3);
  });

  it('renders icon select in the category type form', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'New' })[1]);

    expect(screen.getByText('Icon')).toBeDefined();
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
  });

  it('submits the selected icon value when creating a category', async () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'New' })[0]);
    fireEvent.change(screen.getByPlaceholderText('e.g., Groceries'), {
      target: { value: 'Food' },
    });

    const iconSelects = screen.getAllByRole('combobox');
    fireEvent.change(iconSelects[iconSelects.length - 2], { target: { value: 'wallet' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    await waitFor(() => expect(mockCreateCategoryAction).toHaveBeenCalled());
    expect(mockCreateCategoryAction).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Food', icon: 'wallet' })
    );
  });

  it('submits the selected icon value when creating a category type', async () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'New' })[1]);
    fireEvent.change(screen.getByPlaceholderText('e.g., Consumer goods'), {
      target: { value: 'Goods' },
    });

    const iconSelects = screen.getAllByRole('combobox');
    fireEvent.change(iconSelects[iconSelects.length - 1], { target: { value: 'wallet' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Type' }));

    await waitFor(() => expect(mockCreateCategoryTypeAction).toHaveBeenCalled());
    expect(mockCreateCategoryTypeAction).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Goods', icon: 'wallet' })
    );
  });

  it('renders the icon in the categories table', () => {
    const { container } = render(
      <CategoriesTableClient
        initialCategories={[
          { id: '1', name: 'Food', type: 'expense', color: '#fff', icon: 'wallet' },
        ]}
        initialCategoryTypes={[]}
      />
    );

    expect(container.querySelector('svg')).toBeDefined();
    expect(screen.getByText('Food')).toBeDefined();
  });

  it('renders the icon in the category types table', () => {
    const { container } = render(
      <CategoriesTableClient
        initialCategories={[]}
        initialCategoryTypes={[{ id: '1', name: 'Goods', icon: 'wallet' }]}
      />
    );

    expect(container.querySelector('svg')).toBeDefined();
    expect(screen.getByText('Goods')).toBeDefined();
  });

  it('falls back to the default icon when a category has no icon value', () => {
    const { container } = render(
      <CategoriesTableClient
        initialCategories={[{ id: '1', name: 'Food', type: 'expense', color: '#fff' }]}
        initialCategoryTypes={[]}
      />
    );

    expect(container.querySelector('svg')).toBeDefined();
    expect(screen.getByText('Food')).toBeDefined();
  });
});
