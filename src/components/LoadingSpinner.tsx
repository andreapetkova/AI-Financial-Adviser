interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps = {}) {
  if (className) {
    return (
      <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
