import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { categorizeTransactions } from '../categorizer';
import type { TransactionInput } from '../types';

const TX_ID_1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const TX_ID_2 = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

function makeTransaction(id: string, description: string): TransactionInput {
  return { id, description, amount: -10 };
}

function mockFetch(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as unknown as Response;
}

describe('categorizeTransactions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns rule-based results without calling the API when all transactions match rules', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const results = await categorizeTransactions(
      [makeTransaction(TX_ID_1, 'Netflix')],
      'token',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('subscriptions');
    expect(results[0].confidence).toBe(0.95);
  });

  it('calls the API for transactions that do not match rules', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockFetch({ results: [{ transactionId: TX_ID_1, category: 'other', confidence: 0.7 }] }),
    );
    const promise = categorizeTransactions(
      [makeTransaction(TX_ID_1, 'Unknown Corp XYZ')],
      'token',
    );
    await vi.runAllTimersAsync();
    const results = await promise;
    expect(global.fetch).toHaveBeenCalledOnce();
    expect(results[0].category).toBe('other');
    expect(results[0].transactionId).toBe(TX_ID_1);
  });

  it('sends the Authorization header with the access token', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockFetch({ results: [] }));
    const promise = categorizeTransactions(
      [makeTransaction(TX_ID_1, 'Unknown XYZ')],
      'my-token',
    );
    await vi.runAllTimersAsync();
    await promise;
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/categorize',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    );
  });

  it('batches more than 50 transactions into multiple API calls', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockFetch({ results: [] }));
    const transactions = Array.from({ length: 51 }, (_, i) =>
      makeTransaction(`a0eebc99-9c0b-4ef8-bb6d-${String(i).padStart(12, '0')}`, `Unknown Vendor ${i}`),
    );
    const promise = categorizeTransactions(transactions, 'token');
    await vi.runAllTimersAsync();
    await promise;
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('combines rule-based and API results into a single array', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockFetch({ results: [{ transactionId: TX_ID_2, category: 'other', confidence: 0.7 }] }),
    );
    const promise = categorizeTransactions(
      [
        makeTransaction(TX_ID_1, 'Netflix'),      // matched by rules
        makeTransaction(TX_ID_2, 'Unknown Corp'), // needs API
      ],
      'token',
    );
    await vi.runAllTimersAsync();
    const results = await promise;
    expect(results).toHaveLength(2);
    expect(results.find(r => r.transactionId === TX_ID_1)?.category).toBe('subscriptions');
    expect(results.find(r => r.transactionId === TX_ID_2)?.category).toBe('other');
  });

  it('retries on a 429 response and succeeds on the second attempt', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(mockFetch({}, 429))
      .mockResolvedValueOnce(
        mockFetch({ results: [{ transactionId: TX_ID_1, category: 'other', confidence: 0.6 }] }),
      );
    const promise = categorizeTransactions(
      [makeTransaction(TX_ID_1, 'Unknown Corp')],
      'token',
    );
    await vi.runAllTimersAsync();
    const results = await promise;
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(results[0].category).toBe('other');
  });

  it('throws after exhausting all retries on persistent 429 responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockFetch({}, 429));
    const promise = categorizeTransactions(
      [makeTransaction(TX_ID_1, 'Unknown Corp')],
      'token',
    );
    // Attach rejection handler before advancing timers to avoid unhandled rejection warnings.
    const rejection = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await rejection;
    expect(global.fetch).toHaveBeenCalledTimes(4); // initial + 3 retries
  });

  it('throws immediately on a non-retryable 400 error without retrying', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockFetch({ error: 'Bad request' }, 400),
    );
    const promise = categorizeTransactions(
      [makeTransaction(TX_ID_1, 'Unknown Corp')],
      'token',
    );
    const rejection = expect(promise).rejects.toThrow('Bad request');
    await vi.runAllTimersAsync();
    await rejection;
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
