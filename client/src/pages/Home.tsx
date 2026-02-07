/**
 * SVG Bulk Vectorizer - Main Application
 * Based on SVGcode by Google LLC (GPL-2.0)
 * 
 * Complete bulk image-to-SVG conversion application.
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

import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import BulkUploader, { UploadedFile } from '@/components/BulkUploader';
import ConversionResults, { ConversionResult } from '@/components/ConversionResults';
import ConversionSettings from '@/components/ConversionSettings';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ConversionParams, DEFAULT_PARAMS } from '@/lib/converter';
import { conversionQueue, QueueState } from '@/lib/conversionQueue';

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [params, setParams] = useState<ConversionParams>(DEFAULT_PARAMS);
  const [queueState, setQueueState] = useState<QueueState>({
    isProcessing: false,
    completed: 0,
    total: 0,
  });
  const [showResults, setShowResults] = useState(false);

  // Subscribe to queue state changes
  useEffect(() => {
    conversionQueue.onStateChange(setQueueState);
    conversionQueue.setParams(params);
  }, [params]);

  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setShowResults(false);
  };

  const handleConvertStart = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }

    // Reset results
    setResults([]);
    setShowResults(false);

    // Create queue items
    const queueItems = uploadedFiles.map((uploadedFile) => ({
      id: uploadedFile.id,
      file: uploadedFile.file,
      onProgress: (progress: number) => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'converting' as const, progress }
              : f
          )
        );
      },
      onComplete: (svg: string) => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'completed' as const, progress: 100, svgData: svg }
              : f
          )
        );

        setResults((prev) => [
          ...prev,
          {
            id: uploadedFile.id,
            fileName: uploadedFile.file.name.replace(/\.[^/.]+$/, '.svg'),
            originalFileName: uploadedFile.file.name,
            svg,
            status: 'success' as const,
          },
        ]);
      },
      onError: (error: string) => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'error' as const, error }
              : f
          )
        );

        setResults((prev) => [
          ...prev,
          {
            id: uploadedFile.id,
            fileName: uploadedFile.file.name.replace(/\.[^/.]+$/, '.svg'),
            originalFileName: uploadedFile.file.name,
            svg: '',
            error,
            status: 'error' as const,
          },
        ]);
      },
    }));

    // Enqueue items
    conversionQueue.enqueue(...queueItems);
  };

  const handleParamsChange = (newParams: ConversionParams) => {
    setParams(newParams);
    conversionQueue.setParams(newParams);
  };

  const progressPercent =
    queueState.total > 0 ? Math.round((queueState.completed / queueState.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">SVG Bulk Vectorizer</h1>
          </div>
          <p className="text-slate-400">
            Convert PNG, JPG, and other raster images to high-quality SVG vector graphics in bulk
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Info banner */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            This application uses <strong>Potrace WASM</strong> for fast, client-side vectorization.
            All processing happens in your browser—no files are uploaded to servers.
          </AlertDescription>
        </Alert>

        {/* Settings */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Conversion Settings</h2>
          <ConversionSettings params={params} onParamsChange={handleParamsChange} />
        </Card>

        {/* Upload section */}
        {!showResults && (
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Upload Images</h2>
            <BulkUploader
              maxFiles={100}
              onFilesSelected={handleFilesSelected}
              onConvertStart={handleConvertStart}
            />
          </Card>
        )}

        {/* Processing indicator */}
        {queueState.isProcessing && (
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">Converting images...</p>
                  <p className="text-sm text-slate-400">
                    {queueState.completed} / {queueState.total}
                  </p>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-slate-400 mt-2">
                  {queueState.currentFile && `Current: ${queueState.currentFile}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Results section */}
        {results.length > 0 && (
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Conversion Results</h2>
            <ConversionResults results={results} />
            {!queueState.isProcessing && (
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => {
                    setResults([]);
                    setUploadedFiles([]);
                    setShowResults(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Convert More Images
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Empty state */}
        {uploadedFiles.length === 0 && results.length === 0 && !queueState.isProcessing && (
          <Card className="p-12 bg-slate-800 border-slate-700 text-center">
            <p className="text-slate-400">
              Upload images to get started. Supports PNG, JPG, GIF, WebP, and AVIF formats.
            </p>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
          <p>
            Based on <a href="https://github.com/tomayac/SVGcode" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">SVGcode</a> by Google LLC
          </p>
          <p className="mt-2">
            Licensed under <a href="/LICENSE" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">GNU General Public License v2.0</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
