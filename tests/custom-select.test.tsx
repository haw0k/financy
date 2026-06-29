import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

function TestSelect({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger data-testid="select-trigger">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Option One</SelectItem>
        <SelectItem value="two">Option Two</SelectItem>
        <SelectItem value="three">Option Three</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Custom Select component', () => {
  it('renders the trigger with the placeholder', () => {
    render(<TestSelect />);

    expect(screen.getByTestId('select-trigger')).toBeTruthy();
    expect(screen.getByText('Select an option')).toBeTruthy();
  });

  it('opens the content and selects an item on click', async () => {
    const handleValueChange = vi.fn();
    render(<TestSelect onValueChange={handleValueChange} />);

    await userEvent.click(screen.getByTestId('select-trigger'));

    expect(screen.getByText('Option Two')).toBeTruthy();

    await userEvent.click(screen.getByText('Option Two'));

    expect(handleValueChange).toHaveBeenCalledWith('two');
  });

  it('supports keyboard navigation and selection', async () => {
    const handleValueChange = vi.fn();
    render(<TestSelect onValueChange={handleValueChange} />);

    const trigger = screen.getByTestId('select-trigger');

    await userEvent.click(trigger);
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(handleValueChange).toHaveBeenCalledWith('two');
  });
});
