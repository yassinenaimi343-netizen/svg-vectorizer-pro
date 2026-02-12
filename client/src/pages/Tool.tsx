import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Settings2, Zap, ImageIcon, FileCheck, Moon, Sun, Home } from 'lucide-react';
import { useLocation } from 'wouter';
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
import { useTheme } from '@/hooks/useTheme';

export default function Tool() {
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [params, setParams] = useState<ConversionParams>(DEFAULT_PARAMS);
  const [queueState, setQueueState] = useState<QueueState>({
    isProcessing: false,
    completed: 0,
    total: 0,
  });
  const [whiteBackground, setWhiteBackground] = useState(false);
  const [autoConvert, setAutoConvert] = useState(false);

  // Check for uploaded files from Landing page
  useEffect(() => {
    const pendingFiles = (window as any).__pendingFiles;
    console.log('Checking for pending files:', pendingFiles ? 'Found' : 'Not found');
    
    if (pendingFiles && pendingFiles.length > 0) {
      console.log('Processing pending files:', pendingFiles.length);
      
      const newUploadedFiles: UploadedFile[] = Array.from(pendingFiles).map((file: File) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: 'pending' as const,
        progress: 0,
      }));
      
      console.log('Setting uploaded files for auto-convert:', newUploadedFiles);
      setUploadedFiles(newUploadedFiles);
      setAutoConvert(true);
      
      // Clear the global variable
      (window as any).__pendingFiles = null;
    }
  }, []);
  
  // Auto-convert when files are loaded from landing page
  useEffect(() => {
    if (autoConvert && uploadedFiles.length > 0) {
      console.log('Auto-converting uploaded files...');
      setAutoConvert(false);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        handleConvertStart();
      }, 300);
    }
  }, [autoConvert, uploadedFiles, handleConvertStart]);

  useEffect(() => {
    conversionQueue.onStateChange(setQueueState);
    conversionQueue.setParams(params);
  }, [params]);

  const handleFilesSelected = (files: UploadedFile[]) => {
    console.log('Files selected:', files.length);
    setUploadedFiles(files);
  };

  const handleConvertStart = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    console.log('Starting conversion for', uploadedFiles.length, 'files');
    // Don't clear results immediately - let the queue handle it
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
        // Handle white background option
        let finalSvg = svg;
        
        if (whiteBackground) {
          // Parse the SVG to properly insert the white background
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;
          
          // Get SVG dimensions from viewBox or width/height attributes
          const viewBox = svgElement.getAttribute('viewBox');
          let width = '100%';
          let height = '100%';
          let x = '0';
          let y = '0';
          
          if (viewBox) {
            const parts = viewBox.split(/\s+/);
            x = parts[0] || '0';
            y = parts[1] || '0';
            width = parts[2] || '100%';
            height = parts[3] || '100%';
          } else {
            width = svgElement.getAttribute('width') || '100%';
            height = svgElement.getAttribute('height') || '100%';
          }
          
          // Create white background rectangle
          const rect = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', x);
          rect.setAttribute('y', y);
          rect.setAttribute('width', width);
          rect.setAttribute('height', height);
          rect.setAttribute('fill', 'white');
          
          // Insert as first child so it appears behind everything
          svgElement.insertBefore(rect, svgElement.firstChild);
          
          finalSvg = new XMLSerializer().serializeToString(svgDoc);
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
  }, [uploadedFiles, whiteBackground, params]);

  const progressPercent =
    queueState.total > 0 ? Math.round((queueState.completed / queueState.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Minimalist Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Back to Home"
              >
                <Home className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">PNG to SVG</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Instant vectorization</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <ImageIcon className="w-4 h-4" />
                <span>{uploadedFiles.length} files</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-slate-400 hover:text-slate-200" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 hover:text-slate-900" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Upload & Settings (2 columns width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upload Images</h2>
                </div>
                <BulkUploader
                  maxFiles={250}
                  onFilesSelected={handleFilesSelected}
                  onConvertStart={handleConvertStart}
                />
              </div>
            </div>

            {/* Settings Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Options</h2>
              </div>

              <div className="space-y-6">
                {/* White Background Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1">
                    <Label htmlFor="white-bg" className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                      White Background
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {whiteBackground ? 'White background will be added' : 'Background will be transparent'}
                    </p>
                  </div>
                  <Switch
                    id="white-bg"
                    checked={whiteBackground}
                    onCheckedChange={setWhiteBackground}
                  />
                </div>
                
                {/* Remove Background (for transparency) */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1">
                    <Label htmlFor="remove-bg" className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                      Remove White Pixels
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Make white areas transparent before conversion
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
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Detail Level
                    </Label>
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Higher = smoother, Lower = more detailed
                  </p>
                </div>

                {/* Optimize Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1">
                    <Label htmlFor="optimize" className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                      Optimize Curves
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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

          {/* Right Column - Preview & Results (3 columns width - wider) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Processing Status */}
            {queueState.isProcessing && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Converting...</h3>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {queueState.completed} / {queueState.total}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  {queueState.currentFile && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Processing: {queueState.currentFile}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Results</h2>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
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
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No images yet
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Upload PNG, JPG, GIF, WebP, or AVIF images to convert them to scalable SVG vectors
                    </p>
                  </div>
                  <div className="pt-4 flex flex-wrap gap-2 justify-center text-xs text-slate-400 dark:text-slate-500">
                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded">Fast</span>
                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded">Client-side</span>
                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded">Private</span>
                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded">Free</span>
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
