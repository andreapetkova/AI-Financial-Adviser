import Papa from 'papaparse';
import { csvRowSchema } from '@/lib/validators/transaction';
import type { ParsedCSVRow } from '@/types';

export interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  currency?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  rawValues: Record<string, string>;
}

export interface ParseResult {
  valid: ParsedCSVRow[];
  errors: ValidationError[];
}

const DATE_PATTERNS = ['date', 'transaction date', 'trans date', 'posted', 'posting date', 'value date'];
const DESCRIPTION_PATTERNS = ['description', 'memo', 'narrative', 'details', 'payee', 'merchant', 'reference'];
const AMOUNT_PATTERNS = ['amount', 'sum', 'value', 'debit', 'credit', 'total'];
const CURRENCY_PATTERNS = ['currency', 'ccy', 'cur'];

function matchesPattern(header: string, patterns: string[]): boolean {
  const normalized = header.toLowerCase().trim();
  return patterns.some((pattern) => normalized === pattern || normalized.includes(pattern));
}

export function detectColumnMapping(headers: string[]): ColumnMapping | null {
  const date = headers.find((header) => matchesPattern(header, DATE_PATTERNS));
  const description = headers.find((header) =>
    matchesPattern(header, DESCRIPTION_PATTERNS) && header !== date
  );
  const amount = headers.find((header) =>
    matchesPattern(header, AMOUNT_PATTERNS) && header !== date && header !== description
  );
  const currency = headers.find((header) =>
    matchesPattern(header, CURRENCY_PATTERNS) && header !== date && header !== description && header !== amount
  );

  if (!date || !description || !amount) return null;

  return { date, description, amount, currency };
}

export function parseCSVFile(file: File): Promise<{ rows: Record<string, string>[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete(results) {
        if (!results.meta.fields || results.meta.fields.length === 0) {
          reject(new Error('CSV file has no headers'));
          return;
        }
        resolve({ rows: results.data, headers: results.meta.fields });
      },
      error(error: Error) {
        reject(error);
      },
    });
  });
}

export function mapAndValidateRows(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): ParseResult {
  const valid: ParsedCSVRow[] = [];
  const errors: ValidationError[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rawInput = {
      date: row[mapping.date] ?? '',
      description: row[mapping.description] ?? '',
      amount: row[mapping.amount] ?? '',
      currency: mapping.currency ? row[mapping.currency] : undefined,
    };

    const result = csvRowSchema.safeParse(rawInput);

    if (result.success) {
      valid.push({
        date: result.data.date,
        description: result.data.description,
        amount: result.data.amount,
        currency: result.data.currency,
      });
    } else {
      for (const issue of result.error.issues) {
        errors.push({
          row: index + 1,
          field: issue.path.join('.'),
          message: issue.message,
          rawValues: rawInput,
        });
      }
    }
  }

  return { valid, errors };
}
