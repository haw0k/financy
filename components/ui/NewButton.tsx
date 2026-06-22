'use client';

import { CirclePlus } from 'lucide-react';
import { Button } from '@/lib/shadcn';

interface INewButton {
  onClick: () => void;
  disabled?: boolean;
}

export function NewButton({ onClick, disabled }: INewButton) {
  return (
    <Button onClick={onClick} disabled={disabled} size="sm" className="gap-2">
      <CirclePlus className="h-4 w-4" />
      New
    </Button>
  );
}
