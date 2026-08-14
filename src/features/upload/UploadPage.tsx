'use client';

import { useEffect, useRef } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import {
  createUpload,
  upsertTransactions,
  fetchCategorizationRules,
  upsertCategorizationRules,
} from '@/lib/supabase/queries';
import type { TransactionInsert } from '@/lib/supabase/types';
import { FileDropzone } from './components/FileDropzone';
import { ParsePreview } from './components/ParsePreview';
import { InlineSpinner } from '@/components/InlineSpinner';
import { CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

export function UploadPage() {
  const { user, session } = useAuth();
  const upload = useFileUpload();
  const toast = useToast();
  const queryClient = useQueryClient();

  const handleAIParseRef = useRef(upload.handleAIParse);
  handleAIParseRef.current = upload.handleAIParse;

  useEffect(() => {
    if (upload.step === 'analyzing' && session?.access_token && user) {
      fetchCategorizationRules(user.id)
        .then(rules => handleAIParseRef.current(session.access_token, rules))
        .catch(() => handleAIParseRef.current(session.access_token, []));
    }
  }, [upload.step, session?.access_token, user]);

  async function handleConfirm() {
    if (!user || !upload.file) return;

    upload.setStep('saving');
    upload.setError(null);

    try {
      const rows = upload.categorizedRows;

      const uploadRecord = await createUpload({
        user_id: user.id,
        filename: upload.file.name,
        row_count: rows.length,
      });

      const transactionInserts: TransactionInsert[] = rows.map((row) => ({
        user_id: user.id,
        date: row.date,
        description: row.description,
        amount: row.amount,
        currency: row.currency ?? 'USD',
        upload_batch_id: uploadRecord.id,
        category: row.category,
        confidence: row.confidence,
        manually_edited: row.manuallyEdited,
      }));

      const savedTransactions = await upsertTransactions(transactionInserts);

      // Save confident and manually-edited categorizations as learned rules for future uploads
      const rulesToSave = rows
        .filter(row =>
          row.category !== null &&
          (row.manuallyEdited || (row.confidence !== null && row.confidence >= 0.75)),
        )
        .map(row => ({
          user_id: user.id,
          description: row.description.toLowerCase(),
          category: row.category!,
          last_confirmed_at: new Date().toISOString(),
        }));

      upsertCategorizationRules(rulesToSave).catch(() => {
        // Non-critical — don't block the success flow if rule saving fails
      });

      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      upload.setSavedCount(savedTransactions.length);
      upload.setStep('success');
      toast.success(
        `${savedTransactions.length} ${savedTransactions.length === 1 ? 'transaction' : 'transactions'} saved.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save transactions';
      upload.setError(message);
      upload.setStep('preview');
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload transactions</h1>
        <p className="text-sm text-muted-foreground">
          Import your bank statement as a PDF file
        </p>
      </div>

      {upload.step === 'dropzone' && (
        <FileDropzone
          onFileSelected={upload.handleFileSelected}
          error={upload.error}
        />
      )}

      {upload.step === 'analyzing' && (
        <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-12 text-center">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" aria-hidden="true" />
          <div>
            <p className="text-lg font-semibold">AI is reading your statement</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Extracting and categorizing transactions from your PDF...
            </p>
          </div>
          <InlineSpinner />
        </div>
      )}

      {(upload.step === 'preview' || upload.step === 'saving') && upload.parseResult && (
        <ParsePreview
          result={upload.parseResult}
          categorizedRows={upload.categorizedRows}
          onUpdateCategory={upload.updateRowCategory}
          onConfirm={handleConfirm}
          onBack={upload.reset}
          saving={upload.step === 'saving'}
          aiParsed={upload.aiParsed}
        />
      )}

      {upload.step === 'success' && (() => {
        const uploadedMonth = upload.categorizedRows
          .map(r => r.date.slice(0, 7))
          .filter(Boolean)
          .sort()
          .at(-1) ?? null;

        function handleShowInsights() {
          if (uploadedMonth) {
            sessionStorage.setItem('dashboard_focus_month', uploadedMonth);
          }
        }

        return (
          <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600" aria-hidden="true" />
            <div>
              <p className="text-lg font-semibold">Upload complete</p>
              <p className="text-sm text-muted-foreground">
                {upload.savedCount} {upload.savedCount === 1 ? 'transaction' : 'transactions'} saved
                successfully.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={upload.reset}
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Upload another file
              </button>
              <Link
                href="/dashboard"
                onClick={handleShowInsights}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Show Insights
              </Link>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
