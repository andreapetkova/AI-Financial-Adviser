import type { ParseResult } from '@/lib/parsers/csv';
import { SubmitButton } from '@/components/SubmitButton';
import { classnames } from '@/lib/utils';

interface ParsePreviewProps {
  result: ParseResult;
  onConfirm: () => void;
  onBack: () => void;
  saving: boolean;
}

export function ParsePreview({ result, onConfirm, onBack, saving }: ParsePreviewProps) {
  const { valid, errors } = result;
  const hasErrors = errors.length > 0;
  const hasCurrency = valid.some((row) => row.currency);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Preview</h2>
          <p className="text-sm text-muted-foreground">
            {valid.length} valid {valid.length === 1 ? 'row' : 'rows'}
            {hasErrors && (
              <span className="text-destructive">
                {`, ${errors.length} ${errors.length === 1 ? 'error' : 'errors'}`}
              </span>
            )}
          </p>
        </div>
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

      {valid.length > 0 && (
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
              </tr>
            </thead>
            <tbody>
              {valid.slice(0, 50).map((row, index) => (
                <tr
                  key={index}
                  className={classnames(
                    'border-b last:border-b-0',
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/25',
                  )}
                >
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">{row.description}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{row.amount.toFixed(2)}</td>
                  {hasCurrency && <td className="px-4 py-2">{row.currency ?? ''}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {valid.length > 50 && (
            <p className="px-4 py-2 text-sm text-muted-foreground">
              Showing 50 of {valid.length} rows
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
          disabled={valid.length === 0 || saving}
          className="w-auto"
        >
          {saving ? 'Saving...' : `Save ${valid.length} transactions`}
        </SubmitButton>
      </div>
    </div>
  );
}
