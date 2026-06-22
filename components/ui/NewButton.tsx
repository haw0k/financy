'use client';

import { CirclePlus } from 'lucide-react';
import { Button } from '@/lib/shadcn';

interface INewButton {
  onClick: () => void;
  isDisabled?: boolean;
}

export function NewButton({ onClick, isDisabled }: INewButton) {
  return (
    <Button onClick={onClick} disabled={isDisabled} size="sm" className="gap-2">
      <CirclePlus className="h-4 w-4" />
      New
    </Button>
  );
}
