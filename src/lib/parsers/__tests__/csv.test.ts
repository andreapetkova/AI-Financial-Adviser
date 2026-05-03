import { describe, it, expect } from 'vitest';
import { detectColumnMapping, mapAndValidateRows } from '../csv';

describe('detectColumnMapping', () => {
  it('detects standard bank CSV headers', () => {
    const mapping = detectColumnMapping(['Date', 'Description', 'Amount']);
    expect(mapping).toEqual({
      date: 'Date',
      description: 'Description',
      amount: 'Amount',
      currency: undefined,
    });
  });

  it('detects headers case-insensitively', () => {
    const mapping = detectColumnMapping(['DATE', 'MEMO', 'DEBIT']);
    expect(mapping?.date).toBe('DATE');
    expect(mapping?.description).toBe('MEMO');
    expect(mapping?.amount).toBe('DEBIT');
  });

  it('detects alternative header names', () => {
    const mapping = detectColumnMapping([
      'Transaction Date',
      'Narrative',
      'Sum',
      'Currency',
    ]);
    expect(mapping?.date).toBe('Transaction Date');
    expect(mapping?.description).toBe('Narrative');
    expect(mapping?.amount).toBe('Sum');
    expect(mapping?.currency).toBe('Currency');
  });

  it('detects currency column via ccy alias', () => {
    const mapping = detectColumnMapping(['date', 'description', 'amount', 'ccy']);
    expect(mapping?.currency).toBe('ccy');
  });

  it('returns null when date column is missing', () => {
    expect(detectColumnMapping(['Description', 'Amount'])).toBeNull();
  });

  it('returns null when description column is missing', () => {
    expect(detectColumnMapping(['Date', 'Amount'])).toBeNull();
  });

  it('returns null when amount column is missing', () => {
    expect(detectColumnMapping(['Date', 'Description'])).toBeNull();
  });

  it('returns null for an empty header list', () => {
    expect(detectColumnMapping([])).toBeNull();
  });
});

describe('mapAndValidateRows', () => {
  const mapping = { date: 'Date', description: 'Description', amount: 'Amount' };

  it('maps valid rows to ParsedCSVRow objects', () => {
    const rows = [
      { Date: '2026-01-15', Description: 'Netflix', Amount: '-14.99' },
      { Date: '2026-01-20', Description: 'Salary', Amount: '3000.00' },
    ];
    const { valid, errors } = mapAndValidateRows(rows, mapping);
    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(0);
    expect(valid[0].amount).toBe(-14.99);
    expect(valid[0].description).toBe('Netflix');
    expect(valid[1].description).toBe('Salary');
  });

  it('collects errors for invalid rows without stopping on others', () => {
    const rows = [
      { Date: '2026-01-15', Description: 'Valid row', Amount: '10.00' },
      { Date: 'not-a-date', Description: 'Invalid date', Amount: '10.00' },
      { Date: '2026-01-20', Description: 'Also valid', Amount: '-5.00' },
    ];
    const { valid, errors } = mapAndValidateRows(rows, mapping);
    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(2);
    expect(errors[0].field).toBe('date');
  });

  it('uses 1-based row numbers in errors', () => {
    const rows = [{ Date: 'bad-date', Description: 'test', Amount: '10' }];
    const { errors } = mapAndValidateRows(rows, mapping);
    expect(errors[0].row).toBe(1);
  });

  it('rejects a non-numeric amount', () => {
    const rows = [{ Date: '2026-01-15', Description: 'Test', Amount: 'abc' }];
    const { valid, errors } = mapAndValidateRows(rows, mapping);
    expect(valid).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('amount');
  });

  it('rejects an empty description', () => {
    const rows = [{ Date: '2026-01-15', Description: '', Amount: '10.00' }];
    const { valid, errors } = mapAndValidateRows(rows, mapping);
    expect(valid).toHaveLength(0);
    expect(errors[0].field).toBe('description');
  });

  it('treats a missing column as an empty string and reports an error', () => {
    const rows = [{ Date: '2026-01-15', Amount: '10.00' }]; // no Description key
    const { valid, errors } = mapAndValidateRows(rows, mapping);
    expect(valid).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('maps currency from the optional currency column', () => {
    const mappingWithCurrency = { ...mapping, currency: 'CCY' };
    const rows = [{ Date: '2026-01-15', Description: 'Test', Amount: '10.00', CCY: 'GBP' }];
    const { valid } = mapAndValidateRows(rows, mappingWithCurrency);
    expect(valid[0].currency).toBe('GBP');
  });

  it('returns empty arrays for empty input', () => {
    const { valid, errors } = mapAndValidateRows([], mapping);
    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('includes raw values in error objects', () => {
    const rows = [{ Date: 'bad', Description: 'test', Amount: '10' }];
    const { errors } = mapAndValidateRows(rows, mapping);
    expect(errors[0].rawValues).toMatchObject({ date: 'bad' });
  });
});
