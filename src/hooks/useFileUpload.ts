import { useState } from 'react';
import {
  parseCSVFile,
  detectColumnMapping,
  mapAndValidateRows,
  readFileWithEncoding,
  type ColumnMapping,
  type ParseResult,
} from '@/lib/parsers/csv';
import { parseCSVWithAI } from '@/lib/ai/csvParser';
import type { ParsedCSVRow } from '@/types';

export type UploadStep = 'dropzone' | 'mapping' | 'analyzing' | 'preview' | 'saving' | 'success';

interface UploadState {
  step: UploadStep;
  file: File | null;
  headers: string[];
  rawRows: Record<string, string>[];
  columnMapping: ColumnMapping | null;
  autoDetected: boolean;
  aiParsed: boolean;
  parseResult: ParseResult | null;
  savedCount: number;
  error: string | null;
}

const INITIAL_STATE: UploadState = {
  step: 'dropzone',
  file: null,
  headers: [],
  rawRows: [],
  columnMapping: null,
  autoDetected: false,
  aiParsed: false,
  parseResult: null,
  savedCount: 0,
  error: null,
};

export function useFileUpload() {
  const [state, setState] = useState<UploadState>(INITIAL_STATE);

  async function handleFileSelected(file: File) {
    setState((previous) => ({ ...previous, error: null }));

    try {
      const { rows, headers } = await parseCSVFile(file);

      if (rows.length === 0) {
        setState((previous) => ({ ...previous, error: 'CSV file contains no data rows' }));
        return;
      }

      const detectedMapping = detectColumnMapping(headers);

      if (detectedMapping) {
        const parseResult = mapAndValidateRows(rows, detectedMapping);

        if (parseResult.valid.length > 0) {
          setState({
            ...INITIAL_STATE,
            step: 'preview',
            file,
            headers,
            rawRows: rows,
            columnMapping: detectedMapping,
            autoDetected: true,
            aiParsed: false,
            parseResult,
          });
          return;
        }
      }

      // Standard parsing couldn't detect columns — offer manual mapping
      // but store the file for potential AI parsing
      setState({
        ...INITIAL_STATE,
        step: 'mapping',
        file,
        headers,
        rawRows: rows,
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        error: error instanceof Error ? error.message : 'Failed to parse CSV file',
      }));
    }
  }

  async function handleAIParse(accessToken: string) {
    if (!state.file) return;

    setState((previous) => ({ ...previous, step: 'analyzing', error: null }));

    try {
      const rawText = await readFileWithEncoding(state.file);
      const parsed = await parseCSVWithAI(rawText, accessToken);

      if (parsed.length === 0) {
        setState((previous) => ({
          ...previous,
          step: 'mapping',
          error: 'AI could not extract any transactions from the file. Please map columns manually.',
        }));
        return;
      }

      const parseResult: ParseResult = { valid: parsed, errors: [] };

      setState((previous) => ({
        ...previous,
        step: 'preview',
        aiParsed: true,
        autoDetected: true,
        parseResult,
      }));
    } catch (error) {
      setState((previous) => ({
        ...previous,
        step: 'mapping',
        error: error instanceof Error
          ? `AI parsing failed: ${error.message}`
          : 'AI parsing failed. Please map columns manually.',
      }));
    }
  }

  function handleMappingConfirmed(mapping: ColumnMapping) {
    const parseResult = mapAndValidateRows(state.rawRows, mapping);
    setState((previous) => ({
      ...previous,
      step: 'preview',
      columnMapping: mapping,
      autoDetected: false,
      aiParsed: false,
      parseResult,
    }));
  }

  function getValidRows(): ParsedCSVRow[] {
    return state.parseResult?.valid ?? [];
  }

  function reset() {
    setState(INITIAL_STATE);
  }

  function setStep(step: UploadStep) {
    setState((previous) => ({ ...previous, step }));
  }

  function setError(error: string | null) {
    setState((previous) => ({ ...previous, error }));
  }

  function setSavedCount(savedCount: number) {
    setState((previous) => ({ ...previous, savedCount }));
  }

  return {
    ...state,
    handleFileSelected,
    handleAIParse,
    handleMappingConfirmed,
    getValidRows,
    reset,
    setStep,
    setError,
    setSavedCount,
  };
}
