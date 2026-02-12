import React, { useState, useEffect } from 'react';
import { Upload, Download, Settings2, Zap, ImageIcon, FileCheck } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import BulkUploader, { UploadedFile } from '@/components/BulkUploader';
import ConversionResultsEnhanced from '@/components/ConversionResultsEnhanced';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { ConversionParams, DEFAULT_PARAMS } from '@/lib/converter';
import { conversionQueue, QueueState } from '@/lib/conversionQueue';

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [params, setParams] = useState<ConversionParams>(DEFAULT_PARAMS);
  const [queueState, setQueueState] = useState<QueueState>({
    isProcessing: false,
    completed: 0,
    total: 0,
  });
  const [addWhiteBackground, setAddWhiteBackground] = useState(false);

  useEffect(() => {
    conversionQueue.onStateChange(setQueueState);
    conversionQueue.setParams(params);
  }, [params]);

  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleConvertStart = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setResults([]);

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
        // Add white background if requested
        let finalSvg = svg;
        if (addWhiteBackground) {
          finalSvg = svg.replace(
            /<svg([^>]*)>/,
            '<svg$1><rect width="100%" height="100%" fill="white"/>'
          );
        }

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'completed' as const, progress: 100, svgData: finalSvg }
              : f
          )
        );

        setResults((prev) => [
          ...prev,
          {
            id: uploadedFile.id,
            fileName: uploadedFile.file.name.replace(/\.[^/.]+$/, '.svg'),
            originalFileName: uploadedFile.file.name,
            svg: finalSvg,
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

    conversionQueue.enqueue(...queueItems);
  };

  const progressPercent =
    queueState.total > 0 ? Math.round((queueState.completed / queueState.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Minimalist Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">PNG to SVG</h1>
                <p className="text-xs text-slate-500">Instant vectorization</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ImageIcon className="w-4 h-4" />
              <span>{uploadedFiles.length} files</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Page Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-slate-700" />
                  <h2 className="text-lg font-semibold text-slate-900">Upload Images</h2>
                </div>
                <BulkUploader
                  maxFiles={250}
                  onFilesSelected={handleFilesSelected}
                  onConvertStart={handleConvertStart}
                />
              </div>
            </div>

            {/* Settings Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-5 h-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Options</h2>
              </div>

              <div className="space-y-6">
                {/* White Background Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <Label htmlFor="white-bg" className="text-sm font-medium text-slate-900 cursor-pointer">
                      Add White Background
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">
                      Add a white layer behind the SVG
                    </p>
                  </div>
                  <Switch
                    id="white-bg"
                    checked={addWhiteBackground}
                    onCheckedChange={setAddWhiteBackground}
                  />
                </div>

                {/* Remove Background */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <Label htmlFor="remove-bg" className="text-sm font-medium text-slate-900 cursor-pointer">
                      Remove White Background
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">
                      Make white pixels transparent
                    </p>
                  </div>
                  <Switch
                    id="remove-bg"
                    checked={params.removeBackground}
                    onCheckedChange={(checked) =>
                      setParams({ ...params, removeBackground: checked })
                    }
                  />
                </div>

                {/* Quality Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-900">
                      Detail Level
                    </Label>
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {params.alphamax.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[params.alphamax]}
                    onValueChange={(value) =>
                      setParams({ ...params, alphamax: value[0] })
                    }
                  />
                  <p className="text-xs text-slate-500">
                    Higher = smoother, Lower = more detailed
                  </p>
                </div>

                {/* Optimize Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <Label htmlFor="optimize" className="text-sm font-medium text-slate-900 cursor-pointer">
                      Optimize Curves
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">
                      Smoother but slightly less accurate
                    </p>
                  </div>
                  <Switch
                    id="optimize"
                    checked={params.opticurve}
                    onCheckedChange={(checked) =>
                      setParams({ ...params, opticurve: checked })
                    }
                  />
                </div>
              </div>

              {/* Convert Button */}
              {uploadedFiles.length > 0 && !queueState.isProcessing && (
                <Button
                  onClick={handleConvertStart}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-6 rounded-xl shadow-lg"
                  size="lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Convert {uploadedFiles.length} Image{uploadedFiles.length !== 1 ? 's' : ''} to SVG
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Preview & Results */}
          <div className="space-y-6">
            {/* Processing Status */}
            {queueState.isProcessing && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Converting...</h3>
                    <span className="text-sm text-slate-600">
                      {queueState.completed} / {queueState.total}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  {queueState.currentFile && (
                    <p className="text-xs text-slate-500 truncate">
                      Processing: {queueState.currentFile}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Results</h2>
                  </div>
                  <span className="text-sm text-slate-600">
                    {results.filter((r) => r.status === 'success').length} converted
                  </span>
                </div>
                <ConversionResultsEnhanced results={results} />
                {!queueState.isProcessing && (
                  <Button
                    onClick={() => {
                      setResults([]);
                      setUploadedFiles([]);
                    }}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Convert More Images
                  </Button>
                )}
              </div>
            )}

            {/* Empty State */}
            {uploadedFiles.length === 0 && results.length === 0 && !queueState.isProcessing && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="w-10 h-10 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No images yet
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      Upload PNG, JPG, GIF, WebP, or AVIF images to convert them to scalable SVG vectors
                    </p>
                  </div>
                  <div className="pt-4 flex flex-wrap gap-2 justify-center text-xs text-slate-400">
                    <span className="px-2 py-1 bg-slate-50 rounded">Fast</span>
                    <span className="px-2 py-1 bg-slate-50 rounded">Client-side</span>
                    <span className="px-2 py-1 bg-slate-50 rounded">Private</span>
                    <span className="px-2 py-1 bg-slate-50 rounded">Free</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
