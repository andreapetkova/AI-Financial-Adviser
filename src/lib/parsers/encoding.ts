const COMMON_ENCODINGS = ['utf-8', 'windows-1251', 'iso-8859-1', 'windows-1252'] as const;

function hasGarbledText(text: string): boolean {
  const sample = text.slice(0, 500);
  if (sample.includes('�')) return true;
  // Check for non-printable control characters (ASCII 0-8, 14-31)
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if ((code >= 0 && code <= 8) || (code >= 14 && code <= 31)) return true;
  }
  return false;
}

export async function readFileAsText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  for (const encoding of COMMON_ENCODINGS) {
    try {
      const decoder = new TextDecoder(encoding, { fatal: true });
      const text = decoder.decode(buffer);
      if (!hasGarbledText(text)) return text;
    } catch {
      // fatal: true throws on invalid sequences — try next encoding
    }
  }

  // Last resort: lossy UTF-8
  return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
}
