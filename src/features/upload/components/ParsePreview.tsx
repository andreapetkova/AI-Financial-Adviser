import { useMemo } from 'react';
import type { ParseResult } from '@/lib/parsers/csv';
import type { CategorizedRow, Category } from '@/types';
import { CATEGORIES } from '@/types';
import { CATEGORY_LABELS } from '@/lib/categories';
import { SubmitButton } from '@/components/SubmitButton';
import { classnames } from '@/lib/utils';
import { AlertTriangle, Sparkles } from 'lucide-react';

const CONFIDENCE_REVIEW_THRESHOLD = 0.75;

function needsReview(row: CategorizedRow): boolean {
  if (row.manuallyEdited) return false;
  return row.category === null || (row.confidence !== null && row.confidence < CONFIDENCE_REVIEW_THRESHOLD);
}

interface ParsePreviewProps {
  result: ParseResult;
  categorizedRows: CategorizedRow[];
  onUpdateCategory: (index: number, category: Category) => void;
  onConfirm: () => void;
  onBack: () => void;
  saving: boolean;
  aiParsed?: boolean;
}

export function ParsePreview({
  result,
  categorizedRows,
  onUpdateCategory,
  onConfirm,
  onBack,
  saving,
  aiParsed,
}: ParsePreviewProps) {
  const { errors } = result;
  const hasErrors = errors.length > 0;
  const hasCurrency = categorizedRows.some((row) => row.currency);

  const uncategorizedCount = useMemo(
    () => categorizedRows.filter(row => row.category === null).length,
    [categorizedRows],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {categorizedRows.length} valid {categorizedRows.length === 1 ? 'row' : 'rows'}
              {hasErrors && (
                <span className="text-destructive">
                  {`, ${errors.length} ${errors.length === 1 ? 'error' : 'errors'}`}
                </span>
              )}
            </span>
            {aiParsed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                AI parsed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-medium">Amber rows</span>
          {' '}mean the AI was not confident about the category. Please review the dropdown and correct any that look wrong before saving.
          {uncategorizedCount > 0 && (
            <span className="font-medium">
              {' '}{uncategorizedCount} {uncategorizedCount === 1 ? 'transaction has' : 'transactions have'} no category yet and must be assigned.
            </span>
          )}
        </span>
      </div>

      {hasErrors && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <p className="mb-2 text-sm font-medium text-destructive">Validation errors</p>
          <ul className="space-y-1 text-sm text-destructive">
            {errors.slice(0, 10).map((validationError, index) => (
              <li key={index}>
                Row {validationError.row}: {validationError.field} — {validationError.message}
              </li>
            ))}
            {errors.length > 10 && (
              <li className="text-muted-foreground">
                ...and {errors.length - 10} more
              </li>
            )}
          </ul>
        </div>
      )}

      {categorizedRows.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Date</th>
                <th className="px-4 py-2 text-left font-medium">Description</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
                {hasCurrency && (
                  <th className="px-4 py-2 text-left font-medium">Currency</th>
                )}
                <th className="px-4 py-2 text-left font-medium">Category</th>
              </tr>
            </thead>
            <tbody>
              {categorizedRows.slice(0, 50).map((row, index) => {
                const isReview = needsReview(row);
                return (
                  <tr
                    key={index}
                    className={classnames(
                      'border-b last:border-b-0',
                      isReview
                        ? 'border-l-4 border-l-amber-500 bg-amber-500/10'
                        : index % 2 === 0
                          ? 'bg-background'
                          : 'bg-muted/25',
                    )}
                  >
                    <td className="px-4 py-2 tabular-nums">{row.date}</td>
                    <td className="px-4 py-2">{row.description}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.amount.toFixed(2)}</td>
                    {hasCurrency && <td className="px-4 py-2">{row.currency ?? ''}</td>}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        {isReview && (
                          <AlertTriangle
                            className="h-3.5 w-3.5 shrink-0 text-amber-400"
                            aria-label="Needs review"
                          />
                        )}
                        <select
                          value={row.category ?? ''}
                          onChange={(event) => {
                            if (event.target.value) {
                              onUpdateCategory(index, event.target.value as Category);
                            }
                          }}
                          className={classnames(
                            'rounded border px-2 py-1 text-xs focus:outline-none focus:ring-2',
                            isReview
                              ? 'border-2 border-amber-500 bg-background font-medium text-amber-300 focus:ring-amber-400'
                              : 'border-input bg-background focus:ring-ring',
                          )}
                        >
                          {!row.category && (
                            <option value="">Select category…</option>
                          )}
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {CATEGORY_LABELS[category]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {categorizedRows.length > 50 && (
            <p className="px-4 py-2 text-sm text-muted-foreground">
              Showing 50 of {categorizedRows.length} rows
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Back
        </button>
        <SubmitButton
          type="button"
          onClick={onConfirm}
          disabled={categorizedRows.length === 0 || saving}
          className="w-auto"
        >
          {saving ? 'Saving...' : `Save ${categorizedRows.length} transactions`}
        </SubmitButton>
      </div>
    </div>
  );
}
