import { useRef, useState, type DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { classnames } from '@/lib/utils';
import { FormErrorAlert } from '@/components/FormErrorAlert';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  error: string | null;
}

const ACCEPTED_TYPE = '.csv';

export function FileDropzone({ onFileSelected, error }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragCounter, setDragCounter] = useState(0);
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);

  function validateAndEmit(file: File) {
    setFileTypeError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileTypeError(`"${file.name}" is not a CSV file. Please upload a .csv file.`);
      return;
    }
    onFileSelected(file);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragCounter(0);
    const file = event.dataTransfer.files[0];
    if (file) validateAndEmit(file);
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    setDragCounter((previous) => previous + 1);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    setDragCounter((previous) => previous - 1);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) validateAndEmit(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  const dragging = dragCounter > 0;
  const displayError = fileTypeError ?? error;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={classnames(
          'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/50',
        )}
      >
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">
          {dragging ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPE}
        onChange={handleInputChange}
        className="hidden"
      />

      {displayError && <FormErrorAlert message={displayError} />}
    </div>
  );
}
