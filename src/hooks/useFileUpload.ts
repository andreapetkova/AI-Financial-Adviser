import { useState } from 'react';
import type { ParseResult } from '@/lib/parsers/csv';
import { parsePDFWithAI, type LearnedRule } from '@/lib/ai/csvParser';
import type { CategorizedRow, Category } from '@/types';

export type UploadStep = 'dropzone' | 'analyzing' | 'preview' | 'saving' | 'success';

interface UploadState {
  step: UploadStep;
  file: File | null;
  aiParsed: boolean;
  parseResult: ParseResult | null;
  categorizedRows: CategorizedRow[];
  savedCount: number;
  error: string | null;
}

const INITIAL_STATE: UploadState = {
  step: 'dropzone',
  file: null,
  aiParsed: false,
  parseResult: null,
  categorizedRows: [],
  savedCount: 0,
  error: null,
};

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:application/pdf;base64,<data>" — strip the prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsDataURL(file);
  });
}

export function useFileUpload() {
  const [state, setState] = useState<UploadState>(INITIAL_STATE);

  function handleFileSelected(file: File) {
    setState({ ...INITIAL_STATE, file, step: 'analyzing' });
  }

  async function handleAIParse(accessToken: string, learnedRules: LearnedRule[] = []) {
    if (!state.file) return;

    setState((previous) => ({ ...previous, error: null }));

    try {
      const pdfBase64 = await readFileAsBase64(state.file);
      const categorizedRows = await parsePDFWithAI(pdfBase64, accessToken, learnedRules);

      if (categorizedRows.length === 0) {
        setState((previous) => ({
          ...previous,
          step: 'dropzone',
          error: 'AI could not extract any transactions from this PDF.',
        }));
        return;
      }

      const parseResult: ParseResult = { valid: categorizedRows, errors: [] };

      setState((previous) => ({
        ...previous,
        step: 'preview',
        aiParsed: true,
        parseResult,
        categorizedRows,
      }));
    } catch (error) {
      setState((previous) => ({
        ...previous,
        step: 'dropzone',
        error: error instanceof Error
          ? `Failed to parse PDF: ${error.message}`
          : 'Failed to parse PDF. Please try again.',
      }));
    }
  }

  function updateRowCategory(index: number, category: Category) {
    setState((previous) => {
      const updated = [...previous.categorizedRows];
      updated[index] = { ...updated[index], category, confidence: null, manuallyEdited: true };
      return { ...previous, categorizedRows: updated };
    });
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
    updateRowCategory,
    reset,
    setStep,
    setError,
    setSavedCount,
  };
}
