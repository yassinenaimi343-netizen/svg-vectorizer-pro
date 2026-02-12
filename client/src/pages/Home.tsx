import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import BulkUploader, { UploadedFile } from '@/components/BulkUploader';
import ConversionResultsEnhanced from '@/components/ConversionResultsEnhanced';
import ConversionSettings from '@/components/ConversionSettings';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ConversionParams, DEFAULT_PARAMS } from '@/lib/converter';
import { conversionQueue, QueueState } from '@/lib/conversionQueue';

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<any[]>([]);
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 text-emerald-600" />
            <h1 className="text-2xl font-semibold text-gray-900">SVG Bulk Vectorizer</h1>
          </div>
          <p className="text-gray-600 text-sm">
            Convert up to 250 images to SVG vectors instantly in your browser
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        {/* Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ConversionSettings params={params} onParamsChange={handleParamsChange} />
        </div>

        {/* Upload section */}
        {!showResults && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <BulkUploader
              maxFiles={250}
              onFilesSelected={handleFilesSelected}
              onConvertStart={handleConvertStart}
            />
          </div>
        )}

        {/* Processing indicator */}
        {queueState.isProcessing && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-900 font-medium text-sm">Converting images...</p>
                  <p className="text-xs text-gray-500">
                    {queueState.completed} / {queueState.total}
                  </p>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  {queueState.currentFile && `Current: ${queueState.currentFile}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results section */}
        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Results</h2>
            <ConversionResultsEnhanced results={results} />
            {!queueState.isProcessing && (
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setResults([]);
                    setUploadedFiles([]);
                    setShowResults(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Convert More Images
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {uploadedFiles.length === 0 && results.length === 0 && !queueState.isProcessing && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-sm">
              Upload images to get started. Supports PNG, JPG, GIF, WebP, and AVIF formats.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
