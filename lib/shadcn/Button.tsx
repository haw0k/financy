import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-base font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive after:absolute after:inset-0 after:-z-10 after:translate-x-[-100%] after:bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,.35)_50%,transparent_70%)] after:transition-transform after:duration-500 hover:after:translate-x-[100%]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background hover:bg-primary/8 hover:text-primary hover:border-primary dark:bg-input/30 dark:border-input dark:hover:bg-primary/15 dark:hover:border-primary/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70 hover:text-foreground',
        ghost: 'hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15 dark:hover:text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 min-h-9 px-5 py-0 text-base',
        sm: 'h-8 min-h-8 rounded-md gap-1.5 px-4 py-0 text-sm',
        lg: 'h-11 min-h-11 rounded-lg px-6 py-0 text-lg',
        icon: 'size-9 rounded-full',
        'icon-sm': 'size-8 rounded-full',
        'icon-lg': 'size-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
