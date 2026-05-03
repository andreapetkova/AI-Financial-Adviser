import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { FileDropzone } from '../FileDropzone';

describe('FileDropzone', () => {
  it('renders the drag-and-drop prompt', () => {
    render(<FileDropzone onFileSelected={vi.fn()} error={null} />);
    expect(screen.getByText(/drag and drop your csv file/i)).toBeInTheDocument();
  });

  it('calls onFileSelected with a valid CSV file via input change', () => {
    const onFileSelected = vi.fn();
    const { container } = render(
      <FileDropzone onFileSelected={onFileSelected} error={null} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['date,description,amount'], 'bank.csv', { type: 'text/csv' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);
    expect(onFileSelected).toHaveBeenCalledOnce();
    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('shows a file-type error and does not call onFileSelected for a non-CSV file', () => {
    const onFileSelected = vi.fn();
    const { container } = render(
      <FileDropzone onFileSelected={onFileSelected} error={null} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'report.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);
    expect(onFileSelected).not.toHaveBeenCalled();
    expect(screen.getByText(/not a csv file/i)).toBeInTheDocument();
  });

  it('calls onFileSelected when a valid CSV is dropped', () => {
    const onFileSelected = vi.fn();
    render(<FileDropzone onFileSelected={onFileSelected} error={null} />);
    const dropzone = screen.getByRole('button');
    const file = new File(['date,description,amount'], 'statement.csv', {
      type: 'text/csv',
    });
    const dropEvent = createEvent.drop(dropzone);
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file] },
    });
    fireEvent(dropzone, dropEvent);
    expect(onFileSelected).toHaveBeenCalledOnce();
    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('shows a file-type error when a non-CSV file is dropped', () => {
    const onFileSelected = vi.fn();
    render(<FileDropzone onFileSelected={onFileSelected} error={null} />);
    const dropzone = screen.getByRole('button');
    const file = new File(['data'], 'image.png', { type: 'image/png' });
    const dropEvent = createEvent.drop(dropzone);
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file] },
    });
    fireEvent(dropzone, dropEvent);
    expect(onFileSelected).not.toHaveBeenCalled();
    expect(screen.getByText(/not a csv file/i)).toBeInTheDocument();
  });

  it('displays an external error prop', () => {
    render(
      <FileDropzone
        onFileSelected={vi.fn()}
        error="Network error uploading file"
      />,
    );
    expect(screen.getByText('Network error uploading file')).toBeInTheDocument();
  });

  it('shows drag-over styling while dragging over the dropzone', () => {
    render(<FileDropzone onFileSelected={vi.fn()} error={null} />);
    const dropzone = screen.getByRole('button');
    fireEvent.dragEnter(dropzone);
    expect(screen.getByText(/drop your csv file here/i)).toBeInTheDocument();
  });
});
