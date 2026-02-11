import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  label?: string;
  placeholder?: string;
  className?: string;
  previewClassName?: string;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  onRemove,
  label,
  placeholder = 'Click or drag to upload image',
  className,
  previewClassName,
  accept = 'image/*',
  maxSize = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, onChange, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [disabled, isUploading, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFile]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    onRemove?.();
  }, [onChange, onRemove]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'relative border-2 border-dashed rounded-lg transition-all cursor-pointer',
          isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-slate-600 hover:border-slate-500',
          disabled && 'opacity-50 cursor-not-allowed',
          !value && 'p-8'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
            <p className="text-sm text-slate-400">Uploading...</p>
          </div>
        ) : value ? (
          <div className="relative group">
            <img
              src={value}
              alt="Preview"
              className={clsx(
                'w-full h-48 object-cover rounded-lg',
                previewClassName
              )}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/1e293b/64748b?text=Image+Not+Found';
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Replace image"
              >
                <Upload className="h-5 w-5 text-white" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                title="Remove image"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <ImageIcon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-300 mb-1">{placeholder}</p>
            <p className="text-xs text-slate-500">
              PNG, JPG, GIF up to {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      {value && (
        <div className="mt-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or enter image URL directly"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      )}
    </div>
  );
}
