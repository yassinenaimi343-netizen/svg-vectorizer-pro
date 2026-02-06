/**
 * SVG Bulk Vectorizer - Bulk Upload Component
 * Based on SVGcode by Google LLC (GPL-2.0)
 * 
 * Provides drag-drop and file selection UI for bulk image uploads.
 * Adapted from: https://github.com/tomayac/SVGcode
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
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
  maxFiles = 100,
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
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700 mb-1">
            Drag and drop images here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to select files (up to {maxFiles} images)
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
            </p>
            {uploadedFiles.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="p-3 relative">
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveFile(uploadedFile.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>

                {/* File info */}
                <div className="pr-6 space-y-2">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </p>

                  {/* Progress bar */}
                  {uploadedFile.status === 'converting' && (
                    <div className="space-y-1">
                      <Progress value={uploadedFile.progress} className="h-1" />
                      <p className="text-xs text-gray-500">
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
            className="w-full"
            disabled={uploadedFiles.length === 0 || uploadedFiles.some((f) => f.status === 'converting')}
          >
            Convert {uploadedFiles.length} Image{uploadedFiles.length !== 1 ? 's' : ''} to SVG
          </Button>
        </div>
      )}
    </div>
  );
}
