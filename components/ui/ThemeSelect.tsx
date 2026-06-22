'use client';

import { type FC, useSyncExternalStore } from 'react';

import { ChevronDown, Moon, Sun, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/shadcn';

function getIsServerSnapshot() {
  return false;
}

function getIsClientSnapshot() {
  return true;
}

function subscribe() {
  return () => {};
}

export const ThemeSelect: FC = () => {
  const { theme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(subscribe, getIsClientSnapshot, getIsServerSnapshot);

  if (!isMounted) {
    return (
      <div className="grid gap-2">
        <label className="text-sm font-medium text-muted-foreground">Theme</label>
        <div className="border-input flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap opacity-50 sm:max-w-xs">
          <span className="text-muted-foreground">Loading...</span>
          <ChevronDown className="size-4 opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-muted-foreground">Theme</label>
      <Select value={theme || 'system'} onValueChange={setTheme}>
        <SelectTrigger className="w-full sm:max-w-xs">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system">
            <span className="flex items-center gap-2">
              <SunMoon className="h-4 w-4" />
              System
            </span>
          </SelectItem>
          <SelectItem value="light">
            <span className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light
            </span>
          </SelectItem>
          <SelectItem value="dark">
            <span className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
