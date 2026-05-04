const MAX_RETRIES = 3;
const BASE_DELAY_MILLISECONDS = 1000;
const TRANSIENT_STATUS_CODES = new Set([429, 502, 503, 504]);

async function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function isTransientError(error: unknown): boolean {
  return error instanceof TypeError;
}

interface RetryConfig {
  endpoint: string;
  body: unknown;
  accessToken: string;
}

/**
 * POSTs JSON to an internal API route with exponential backoff retry on
 * transient failures (429, 5xx, network errors). Throws on non-retryable
 * errors or exhausted retries with the server's error message when available.
 */
export async function fetchWithRetry({ endpoint, body, accessToken }: RetryConfig): Promise<unknown> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await delay(BASE_DELAY_MILLISECONDS * Math.pow(2, attempt - 1));
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (TRANSIENT_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
          lastError = new Error(`Request to ${endpoint} failed with status ${response.status}`);
          continue;
        }
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          (errorBody as { error?: string }).error ??
            `Request to ${endpoint} failed with status ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!isTransientError(error) || attempt === MAX_RETRIES) break;
    }
  }

  throw lastError ?? new Error(`Request to ${endpoint} failed`);
}
