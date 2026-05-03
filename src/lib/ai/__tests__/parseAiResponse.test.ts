import { describe, it, expect } from 'vitest';
import { extractJson, getTextContent } from '../parseAiResponse';

describe('extractJson', () => {
  it('extracts JSON from a fenced markdown code block with json tag', () => {
    const text = '```json\n{"key": "value"}\n```';
    expect(JSON.parse(extractJson(text))).toEqual({ key: 'value' });
  });

  it('extracts JSON from a fenced code block without a language tag', () => {
    const text = '```\n{"key": "value"}\n```';
    expect(JSON.parse(extractJson(text))).toEqual({ key: 'value' });
  });

  it('extracts a bare JSON object from surrounding prose', () => {
    const text = 'Here is the result: {"results": []} (end of response)';
    expect(JSON.parse(extractJson(text))).toEqual({ results: [] });
  });

  it('prefers a code block over a bare object when both are present', () => {
    const text = 'Preamble {"outer": 1} ```json\n{"inner": 2}\n``` suffix';
    expect(JSON.parse(extractJson(text))).toEqual({ inner: 2 });
  });

  it('returns trimmed plain text when no JSON structure is found', () => {
    expect(extractJson('  just a string  ')).toBe('just a string');
  });

  it('handles nested objects and arrays', () => {
    const payload = { results: [{ id: '1', category: 'food_dining' }] };
    const text = `\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``;
    expect(JSON.parse(extractJson(text))).toEqual(payload);
  });
});

describe('getTextContent', () => {
  it('returns the text from a text block', () => {
    const content = [{ type: 'text', text: 'Hello world' }];
    expect(getTextContent(content)).toBe('Hello world');
  });

  it('returns null when no text block exists', () => {
    const content = [{ type: 'tool_use', text: undefined }];
    expect(getTextContent(content)).toBeNull();
  });

  it('returns null for an empty array', () => {
    expect(getTextContent([])).toBeNull();
  });

  it('finds the text block among other content types', () => {
    const content = [
      { type: 'tool_use' },
      { type: 'text', text: 'public response' },
    ];
    expect(getTextContent(content)).toBe('public response');
  });

  it('returns null when the text block has no text property', () => {
    const content = [{ type: 'text', text: undefined }];
    expect(getTextContent(content)).toBeNull();
  });
});
