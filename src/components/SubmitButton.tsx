import { type ButtonHTMLAttributes } from 'react';
import { classnames } from '@/lib/utils';

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function SubmitButton({ className, children, ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className={classnames(
        'inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground',
        'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
