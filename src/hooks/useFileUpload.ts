import { useState } from 'react';
import {
  parseCSVFile,
  detectColumnMapping,
  mapAndValidateRows,
  type ColumnMapping,
  type ParseResult,
} from '@/lib/parsers/csv';
import type { ParsedCSVRow } from '@/types';

export type UploadStep = 'dropzone' | 'mapping' | 'preview' | 'saving' | 'success';

interface UploadState {
  step: UploadStep;
  file: File | null;
  headers: string[];
  rawRows: Record<string, string>[];
  columnMapping: ColumnMapping | null;
  autoDetected: boolean;
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
        setState({
          ...INITIAL_STATE,
          step: 'preview',
          file,
          headers,
          rawRows: rows,
          columnMapping: detectedMapping,
          autoDetected: true,
          parseResult,
        });
      } else {
        setState({
          ...INITIAL_STATE,
          step: 'mapping',
          file,
          headers,
          rawRows: rows,
        });
      }
    } catch (error) {
      setState((previous) => ({
        ...previous,
        error: error instanceof Error ? error.message : 'Failed to parse CSV file',
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
    handleMappingConfirmed,
    getValidRows,
    reset,
    setStep,
    setError,
    setSavedCount,
  };
}
