'use client';

import { useContext } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastContext } from '@/context/ToastContext';
import type { ToastType } from '@/context/ToastContext';
import { classnames } from '@/lib/utils';

const TOAST_STYLES: Record<
  ToastType,
  { container: string; icon: string; IconComponent: typeof CheckCircle2 }
> = {
  success: {
    container: 'border-green-500/20 bg-green-500/10 text-green-300',
    icon: 'text-green-400',
    IconComponent: CheckCircle2,
  },
  error: {
    container: 'border-red-500/20 bg-red-500/10 text-red-300',
    icon: 'text-red-400',
    IconComponent: AlertCircle,
  },
  info: {
    container: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
    icon: 'text-blue-400',
    IconComponent: Info,
  },
};

export function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, removeToast } = context;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map(toast => {
        const { container, icon, IconComponent } = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className={classnames(
              'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md',
              'min-w-[260px] max-w-sm text-sm',
              container,
            )}
          >
            <IconComponent className={classnames('mt-0.5 h-4 w-4 shrink-0', icon)} />
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
