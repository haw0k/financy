'use client';

import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/shadcn';
import { SunMoon, Sun, Moon } from 'lucide-react';
import { type FC } from 'react';

export const ThemeSelect: FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-muted-foreground">Theme</label>
      <Select value={theme} onValueChange={setTheme}>
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
