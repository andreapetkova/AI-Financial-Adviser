import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/hooks/useAuth';
import { createUpload, upsertTransactions } from '@/lib/supabase/queries';
import type { TransactionInsert } from '@/lib/supabase/types';
import { FileDropzone } from './components/FileDropzone';
import { ColumnMapper } from './components/ColumnMapper';
import { ParsePreview } from './components/ParsePreview';
import { CheckCircle } from 'lucide-react';

export function UploadPage() {
  const { user } = useAuth();
  const upload = useFileUpload();

  async function handleConfirm() {
    if (!user || !upload.file) return;

    upload.setStep('saving');
    upload.setError(null);

    try {
      const validRows = upload.getValidRows();

      const uploadRecord = await createUpload({
        user_id: user.id,
        filename: upload.file.name,
        row_count: validRows.length,
      });

      const transactionInserts: TransactionInsert[] = validRows.map((row) => ({
        user_id: user.id,
        date: row.date,
        description: row.description,
        amount: row.amount,
        currency: row.currency ?? 'USD',
        upload_batch_id: uploadRecord.id,
      }));

      await upsertTransactions(transactionInserts);
      upload.setSavedCount(validRows.length);
      upload.setStep('success');
    } catch (error) {
      upload.setError(error instanceof Error ? error.message : 'Failed to save transactions');
      upload.setStep('preview');
    }
  }

  function handleBack() {
    if (!upload.autoDetected) {
      upload.setStep('mapping');
    } else {
      upload.reset();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload transactions</h1>
        <p className="text-sm text-muted-foreground">
          Import your bank statement as a CSV file
        </p>
      </div>

      {upload.step === 'dropzone' && (
        <FileDropzone
          onFileSelected={upload.handleFileSelected}
          error={upload.error}
        />
      )}

      {upload.step === 'mapping' && (
        <ColumnMapper
          headers={upload.headers}
          onConfirm={upload.handleMappingConfirmed}
        />
      )}

      {(upload.step === 'preview' || upload.step === 'saving') && upload.parseResult && (
        <ParsePreview
          result={upload.parseResult}
          onConfirm={handleConfirm}
          onBack={handleBack}
          saving={upload.step === 'saving'}
        />
      )}

      {upload.step === 'success' && (
        <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
          <div>
            <p className="text-lg font-semibold">Upload complete</p>
            <p className="text-sm text-muted-foreground">
              {upload.savedCount} {upload.savedCount === 1 ? 'transaction' : 'transactions'} saved successfully.
            </p>
          </div>
          <button
            type="button"
            onClick={upload.reset}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}
