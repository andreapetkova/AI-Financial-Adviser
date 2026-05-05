import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SubmitButton } from '@/components/SubmitButton';
import { FormErrorAlert } from '@/components/FormErrorAlert';
import type { ColumnMapping } from '@/lib/parsers/csv';

interface ColumnMapperProps {
  headers: string[];
  onConfirm: (mapping: ColumnMapping) => void;
  onAIParse?: () => void;
}

function MappingSelect({ id, label, required, headers, value, onChange }: {
  id: string;
  label: string;
  required?: boolean;
  headers: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}{required && ' *'}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">{required ? 'Select column' : 'None'}</option>
        {headers.map((header) => <option key={header} value={header}>{header}</option>)}
      </select>
    </div>
  );
}

const UNSET = '';

export function ColumnMapper({ headers, onConfirm, onAIParse }: ColumnMapperProps) {
  const [date, setDate] = useState(UNSET);
  const [description, setDescription] = useState(UNSET);
  const [amount, setAmount] = useState(UNSET);
  const [currency, setCurrency] = useState(UNSET);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!date || !description || !amount) {
      setError('Please map date, description, and amount columns');
      return;
    }

    const selected = [date, description, amount, currency].filter(Boolean);
    if (new Set(selected).size !== selected.length) {
      setError('Each column can only be mapped once');
      return;
    }

    onConfirm({
      date,
      description,
      amount,
      currency: currency || undefined,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Map your columns</h2>
        <p className="text-sm text-muted-foreground">
          {"We couldn't auto-detect your CSV columns. Map them manually or let AI analyze the file."}
        </p>
      </div>

      {onAIParse && (
        <button
          type="button"
          onClick={onAIParse}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-sm font-medium text-primary hover:border-primary hover:bg-primary/10 transition-colors"
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          Let AI parse this file automatically
        </button>
      )}

      <div className="relative">
        {onAIParse && (
          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or map manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormErrorAlert message={error} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <MappingSelect id="map-date" label="Date" required headers={headers} value={date} onChange={setDate} />
            <MappingSelect id="map-description" label="Description" required headers={headers} value={description} onChange={setDescription} />
            <MappingSelect id="map-amount" label="Amount" required headers={headers} value={amount} onChange={setAmount} />
            <MappingSelect id="map-currency" label="Currency" headers={headers} value={currency} onChange={setCurrency} />
          </div>

          <SubmitButton className="w-auto">Confirm mapping</SubmitButton>
        </form>
      </div>
    </div>
  );
}
