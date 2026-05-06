'use client';

import { CircleX, TriangleAlert, CircleCheck, Info } from 'lucide-react';
import { toast } from 'sonner';

const baseClasses =
  'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg shadow-lg';

function showError(message: string) {
  toast(
    <div className={baseClasses}>
      <CircleX className="size-4 shrink-0" />
      <span>{message}</span>
    </div>,
    {
      classNames: {
        toast: 'bg-red-600 text-white border-0',
      },
      duration: 6000,
    },
  );
}

function showWarning(message: string) {
  toast(
    <div className={baseClasses}>
      <TriangleAlert className="size-4 shrink-0" />
      <span>{message}</span>
    </div>,
    {
      classNames: {
        toast: 'bg-yellow-500 text-black border-0',
      },
      duration: 5000,
    },
  );
}

function showSuccess(message: string) {
  toast(
    <div className={baseClasses}>
      <CircleCheck className="size-4 shrink-0" />
      <span>{message}</span>
    </div>,
    {
      classNames: {
        toast: 'bg-green-600 text-white border-0',
      },
      duration: 4000,
    },
  );
}

function showNotification(message: string) {
  toast(
    <div className={baseClasses}>
      <Info className="size-4 shrink-0" />
      <span>{message}</span>
    </div>,
    {
      classNames: {
        toast: 'bg-white text-black border border-gray-200',
      },
      duration: 4000,
    },
  );
}

export { showError, showWarning, showSuccess, showNotification };
