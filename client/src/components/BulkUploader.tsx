import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  error?: string;
  svgData?: string;
}

interface BulkUploaderProps {
  maxFiles?: number;
  onFilesSelected: (files: UploadedFile[]) => void;
  onConvertStart?: () => void;
}

export default function BulkUploader({
  maxFiles = 250,
  onFilesSelected,
  onConvertStart,
}: BulkUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif'];

  const validateFiles = (files: File[]): File[] => {
    const validated: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!acceptedFormats.includes(file.type)) {
        errors.push(`${file.name}: Unsupported format. Accepted: PNG, JPG, GIF, WebP, AVIF`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 50MB)`);
        continue;
      }

      validated.push(file);
    }

    if (uploadedFiles.length + validated.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} images allowed`);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    return validated;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validatedFiles = validateFiles(Array.from(files));
    if (validatedFiles.length === 0) return;

    const newFiles: UploadedFile[] = validatedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    onFilesSelected([...uploadedFiles, ...newFiles]);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    setError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'converting':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Converted';
      case 'error':
        return 'Failed';
      case 'converting':
        return 'Converting...';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drag-drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Upload className="w-10 h-10 text-gray-400 mb-3" />
          <p className="text-base font-medium text-gray-900 mb-1">
            Drag and drop images here
          </p>
          <p className="text-sm text-gray-600 mb-4">
            or click to select files (up to {maxFiles} images)
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            size="sm"
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-wrap text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
            </p>
            {uploadedFiles.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="p-4 relative border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveFile(uploadedFile.id)}
                  className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 group"
                  title="Remove file"
                >
                  <X className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                </button>

                {/* File info */}
                <div className="pr-8 space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </p>

                  {/* Progress bar */}
                  {uploadedFile.status === 'converting' && (
                    <div className="space-y-1">
                      <Progress value={uploadedFile.progress} className="h-1" />
                      <p className="text-xs text-gray-600">
                        {uploadedFile.progress}%
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <p className={`text-xs font-medium ${getStatusColor(uploadedFile.status)}`}>
                    {getStatusText(uploadedFile.status)}
                  </p>

                  {/* Error message */}
                  {uploadedFile.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Convert button */}
          <Button
            onClick={onConvertStart}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={uploadedFiles.length === 0 || uploadedFiles.some((f) => f.status === 'converting')}
          >
            <Zap className="w-5 h-5 mr-2" />
            Convert {uploadedFiles.length} Image{uploadedFiles.length !== 1 ? 's' : ''} to SVG
          </Button>
        </div>
      )}
    </div>
  );
}
