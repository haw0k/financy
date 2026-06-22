'use client';

import { useState, type FC, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input, Label } from '@/lib/shadcn';
import { cn } from '@/lib/utils';

interface IPasswordField extends ComponentProps<'input'> {
  label?: string;
}

export const PasswordField: FC<IPasswordField> = ({ className, label = 'Password', ...props }) => {
  const [isShowPassword, setShowPassword] = useState(false);

  const handleClick = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={props.id}>{label}</Label>
      <div className="relative">
        <Input
          suppressHydrationWarning
          type={isShowPassword ? 'text' : 'password'}
          className="pr-10"
          {...props}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          onClick={handleClick}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          aria-label={isShowPassword ? 'Hide password' : 'Show password'}
        >
          {isShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
