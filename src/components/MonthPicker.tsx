'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { classnames } from '@/lib/utils';

interface MonthPickerProps {
  id?: string;
  value: string; // YYYY-MM
  onChange: (month: string) => void;
  label: string;
}

const MONTH_ABBREVIATIONS = Array.from({ length: 12 }, (_, index) =>
  new Date(2000, index, 1).toLocaleDateString('en-GB', { month: 'short' }),
);

function parseMonth(value: string): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}

function formatMonthLabel(value: string): string {
  const { year, month } = parseMonth(value);
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export function MonthPicker({ id, value, onChange, label }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { year: selectedYear, month: selectedMonth } = parseMonth(value);
  const [viewYear, setViewYear] = useState(selectedYear);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setViewYear(selectedYear);

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleSelectMonth(monthIndex: number) {
    onChange(`${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(previous => !previous)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label}
        className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {formatMonthLabel(value)}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-border bg-card p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewYear(year => year - 1)}
              aria-label="Previous year"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold tabular-nums">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(year => year + 1)}
              aria-label="Next year"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {MONTH_ABBREVIATIONS.map((monthLabel, index) => {
              const isSelected = viewYear === selectedYear && index + 1 === selectedMonth;
              return (
                <button
                  key={monthLabel}
                  type="button"
                  onClick={() => handleSelectMonth(index)}
                  className={classnames(
                    'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {monthLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
