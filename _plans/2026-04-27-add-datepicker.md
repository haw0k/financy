# Plan: Add DatePicker With Shadcn Calendar And Popover

Spec: `_specs/2026-04-27-add-datepicker.md`
Branch: `feat/add-datepicker`

## Context

`TransactionForm.tsx` uses a native `<Input type="date">` for the transaction date field. The app already has everything needed for a proper adaptive DatePicker:

- `Calendar` (react-day-picker) + `Popover` (Radix) in `lib/shadcn/`
- `Drawer` (vaul) for mobile bottom sheet in `lib/shadcn/`
- `date-fns` (4.1.0) and `vaul` (^1.1.2) in `package.json`
- `useIsMobile()` in `hooks/useMobile.ts`

The DatePicker should use **Popover on desktop** and **Drawer (bottom sheet) on mobile** for the best UX on each device.

## Design Decisions

- **Extract a component**: Create `components/ui/DatePicker.tsx` — keeps TransactionForm clean and the component reusable across the app
- **Adaptive via `useIsMobile()`**: On desktop render `Popover` + `Calendar`, on mobile render `Drawer` (vaul bottom sheet) + `Calendar`
- **date-fns format**: Use `format(date, 'MMM d, yyyy')` for human-readable trigger text (app already has `date-fns`)
- **Close on select**: Both Popover and Drawer close as soon as a date is picked (`setOpen(false)` in `handleSelect`)
- **Props mirror form state**: Accept `value: string` (YYYY-MM-DD) and `onChange: (date: string) => void` — no conversion needed at the call site
- **No snap points**: Default vaul drawer behavior is sufficient for a calendar

## Changes

### 1. Create `components/ui/DatePicker.tsx`

```tsx
'use client';

import { useState, type FC } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks';
import { Button } from '@/lib/shadcn';
import { Calendar } from '@/lib/shadcn/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/shadcn/Popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/lib/shadcn/Drawer';

interface IDatePicker {
  value: string;
  onChange: (date: string) => void;
}

export const DatePicker: FC<IDatePicker> = ({ value, onChange }) => {
  const [isOpen, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date.toISOString().split('T')[0]);
      setOpen(false);
    }
  };

  const trigger = (
    <Button
      variant="outline"
      className={cn(
        'w-full justify-start text-left font-normal',
        !value && 'text-muted-foreground'
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value ? format(selectedDate!, 'MMM d, yyyy') : 'Pick a date'}
    </Button>
  );

  const calendar = (
    <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} initialFocus />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <div className="p-4 pb-8 flex justify-center">{calendar}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {calendar}
      </PopoverContent>
    </Popover>
  );
};
```

### 2. Update `TransactionForm.tsx`

- Add import: `import { DatePicker } from '@/components/ui';`
- Replace the `<Input type="date">` block with:
  ```tsx
  <div className="space-y-2">
    <Label htmlFor="date">Date</Label>
    <DatePicker
      value={formData.date}
      onChange={(date) => { setFormData({ ...formData, date }) }}
    />
  </div>
  ```

### 3. Update `components/ui/index.ts`

- Add: `export { DatePicker } from './DatePicker';`

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
- On desktop: click trigger → Popover opens → select date → popover closes → trigger shows formatted date
- On mobile viewport (<768px): tap trigger → Drawer slides up from bottom → select date → drawer closes → trigger shows formatted date
- Transaction form submits with correct date
- Edit mode pre-populates the date correctly
