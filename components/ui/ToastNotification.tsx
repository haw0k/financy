'use client';

import { TriangleAlert, CircleCheck, Info } from 'lucide-react';
import { toast } from 'sonner';

function showError(title: string, description: string) {
  toast(title, {
    description,
    icon: <TriangleAlert className={iconClass} color="yellow" />,
    style: {
      background: 'red',
      color: 'white',
    },
    duration: 6000,
  });
}

function showWarning(title: string, description: string) {
  toast(title, {
    description,
    icon: <TriangleAlert className={iconClass} color="black"/>,
    style: {
      background: 'yellow',
      color: 'black',
    },
    duration: 5000,
  });
}

function showSuccess(title: string, description: string) {
  toast(title, {
    description,
    icon: <CircleCheck className={iconClass} />,
    style: {
      background: 'green',
      color: 'white',
    },
    duration: 4000,
  });
}

function showNotification(title: string, description: string) {
  toast(title, {
    description,
    icon: <Info className={iconClass} />,
    duration: 4000,
  });
}

const iconClass = "size-4 shrink-0";

export { showError, showWarning, showSuccess, showNotification };
