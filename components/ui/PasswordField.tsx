'use client';

import { useState, type FC, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Label,
} from '@/lib/shadcn';

interface IPasswordField extends ComponentProps<'input'> {
  label?: string;
}

export const PasswordField: FC<IPasswordField> = ({ className, label = 'Password', ...props }) => {
  const [isShowPassword, setShowPassword] = useState(false);

  const handleClick = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className={className}>
      <Label htmlFor={props.id}>{label}</Label>
      <InputGroup className="mt-1">
        <InputGroupInput type={isShowPassword ? 'text' : 'password'} {...props} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            type="button"
            onClick={handleClick}
            aria-label={isShowPassword ? 'Hide password' : 'Show password'}
          >
            {isShowPassword ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};
