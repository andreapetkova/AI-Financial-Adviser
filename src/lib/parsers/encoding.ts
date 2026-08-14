const ENCODINGS = [
  'utf-8',
  'windows-1251',
  'koi8-r',
  'iso-8859-5',
  'iso-8859-1',
  'windows-1252',
] as const;

function detectBOM(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return 'utf-8';
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) return 'utf-16le';
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) return 'utf-16be';
  return null;
}

function scoreText(text: string): number {
  let score = 0;
  const length = Math.min(text.length, 5000);

  for (let i = 0; i < length; i++) {
    const code = text.charCodeAt(i);

    if (code === 0xFFFD) {
      score -= 10;
    } else if ((code >= 0 && code <= 8) || (code >= 14 && code <= 31)) {
      score -= 5;
    } else if (code >= 0x0400 && code <= 0x04FF) {
      // Cyrillic Unicode block — strong signal for correct decoding
      score += 3;
    } else if (
      (code >= 0x20 && code <= 0x7E) ||
      code === 0x09 ||
      code === 0x0A ||
      code === 0x0D
    ) {
      // Printable ASCII + tab/newline
      score += 1;
    } else if (code >= 0x00C0 && code <= 0x024F) {
      // Latin Extended — accented letters
      score += 2;
    } else if (code >= 0x0080 && code <= 0x00BF) {
      // Latin-1 Supplement control area — often garbled text indicator
      score -= 2;
    }
  }

  return score;
}

export async function readFileAsText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  const bom = detectBOM(buffer);
  if (bom) {
    const decoder = new TextDecoder(bom);
    return decoder.decode(buffer);
  }

  // Try UTF-8 strict first — if it works, it's almost certainly correct
  try {
    const utf8Strict = new TextDecoder('utf-8', { fatal: true });
    const text = utf8Strict.decode(buffer);
    if (scoreText(text) > 0) return text;
  } catch {
    // Not valid UTF-8 — try single-byte encodings below
  }

  let bestText = '';
  let bestScore = -Infinity;

  // Single-byte encodings: use fatal: false because some (e.g. Windows-1251)
  // have undefined byte values that would throw with fatal: true,
  // skipping the correct encoding entirely.
  for (const encoding of ENCODINGS.slice(1)) {
    const decoder = new TextDecoder(encoding, { fatal: false });
    const text = decoder.decode(buffer);
    const score = scoreText(text);

    if (score > bestScore) {
      bestScore = score;
      bestText = text;
    }
  }

  if (bestText) return bestText;

  return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
}
