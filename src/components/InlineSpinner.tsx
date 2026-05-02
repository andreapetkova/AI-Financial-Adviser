interface InlineSpinnerProps {
  className?: string;
}

export function InlineSpinner({ className = 'h-4 w-4' }: InlineSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
