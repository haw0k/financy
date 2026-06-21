import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

beforeEach(() => {
  // Ensure a clean DOM for each visual regression-style test.
  document.body.className = '';
  document.documentElement.classList.remove('dark');
});

describe('Button styling', () => {
  it('renders a primary button with data-slot', async () => {
    const { Button } = await import('@/lib/shadcn/Button');
    render(<Button>Primary</Button>);

    const button = screen.getByRole('button', { name: 'Primary' });
    expect(button).toBeDefined();
    expect(button.getAttribute('data-slot')).toBe('button');
  });

  it('renders button variants without crashing', async () => {
    const { Button } = await import('@/lib/shadcn/Button');
    const { container } = render(
      <>
        <Button variant="default">Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="link">Link</Button>
      </>
    );

    expect(container.querySelectorAll('[data-slot="button"]')).toHaveLength(6);
  });

  it('renders button sizes without crashing', async () => {
    const { Button } = await import('@/lib/shadcn/Button');
    const { container } = render(
      <>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="icon">
          I
        </Button>
      </>
    );

    expect(container.querySelectorAll('[data-slot="button"]')).toHaveLength(4);
  });
});

describe('Card styling', () => {
  it('renders a card with all subcomponents', async () => {
    const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } =
      await import('@/lib/shadcn/Card');

    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeDefined();
    expect(screen.getByText('Card description')).toBeDefined();
    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.getByText('Footer')).toBeDefined();
  });

  it('applies hover shadow transition class to card', async () => {
    const { Card, CardTitle } = await import('@/lib/shadcn/Card');

    const { container } = render(
      <Card>
        <CardTitle>Hover</CardTitle>
      </Card>
    );

    const card = container.querySelector('[data-slot="card"]');
    expect(card?.className).toContain('hover:shadow-md');
    expect(card?.className).toContain('transition-all');
  });
});

describe('Theme-aware dashboard badges', () => {
  it('renders income badge using primary palette classes', async () => {
    const { Badge } = await import('@/lib/shadcn/Badge');
    const { container } = render(
      <Badge variant="outline" className="bg-primary/15 text-primary border-primary/20">
        Income
      </Badge>
    );

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.textContent).toBe('Income');
    expect(badge?.className).toContain('bg-primary/15');
    expect(badge?.className).toContain('text-primary');
  });

  it('renders expense badge using destructive palette classes', async () => {
    const { Badge } = await import('@/lib/shadcn/Badge');
    const { container } = render(
      <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/20">
        Expense
      </Badge>
    );

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.textContent).toBe('Expense');
    expect(badge?.className).toContain('bg-destructive/15');
    expect(badge?.className).toContain('text-destructive');
  });
});
