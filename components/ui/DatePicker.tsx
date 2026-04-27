'use client';

import { useState, type FC } from 'react';
import { useIsMobile } from '@/hooks';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/lib/shadcn';
import { Calendar } from '@/lib/shadcn/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/shadcn/Popover';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/lib/shadcn/Drawer';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface IDatePicker {
  value: string;
  onChange: (date: string) => void;
}

export const DatePicker: FC<IDatePicker> = ({ value, onChange }) => {
  const [isOpen, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const selectedDate = value
    ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)))
    : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
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
      <Drawer open={isOpen} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent aria-describedby={undefined}>
          <DrawerTitle className="sr-only">Select a date</DrawerTitle>
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
