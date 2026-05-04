import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function classnames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}
