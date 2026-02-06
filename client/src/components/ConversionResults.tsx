/**
 * SVG Bulk Vectorizer - Conversion Results Component
 * Based on SVGcode by Google LLC (GPL-2.0)
 * 
 * Displays conversion results and provides download options.
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

import React, { useState } from 'react';
import { Download, Eye, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import JSZip from 'jszip';

export interface ConversionResult {
  id: string;
  fileName: string;
  originalFileName: string;
  svg: string;
  error?: string;
  status: 'success' | 'error';
}

interface ConversionResultsProps {
  results: ConversionResult[];
  onDownloadAll?: () => void;
}

export default function ConversionResults({
  results,
  onDownloadAll,
}: ConversionResultsProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  const handleDownloadSingle = (result: ConversionResult) => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result.svg)
    );
    element.setAttribute('download', result.fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${result.fileName}`);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const successResults = results.filter((r) => r.status === 'success');

    for (const result of successResults) {
      zip.file(result.fileName, result.svg);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', 'svg-conversions.zip');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    toast.success('Downloaded all SVGs as ZIP');
  };

  const handleCopySvg = (svg: string, fileName: string) => {
    navigator.clipboard.writeText(svg);
    setCopied(fileName);
    setTimeout(() => setCopied(null), 2000);
    toast.success('SVG copied to clipboard');
  };

  const handlePreview = (id: string) => {
    setPreviewId(id);
  };

  const previewResult = results.find((r) => r.id === previewId);

  return (
    <div className="w-full space-y-4">
      {/* Summary */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Conversion Complete</p>
            <p className="text-2xl font-bold text-gray-900">
              {successCount} of {results.length} converted
            </p>
            {errorCount > 0 && (
              <p className="text-sm text-red-600 mt-1">
                {errorCount} failed
              </p>
            )}
          </div>
          {successCount > 0 && (
            <Button
              onClick={handleDownloadZip}
              size="lg"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download All as ZIP
            </Button>
          )}
        </div>
      </Card>

      {/* Results tabs */}
      {results.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All ({results.length})
            </TabsTrigger>
            <TabsTrigger value="success" className="text-green-600">
              Success ({successCount})
            </TabsTrigger>
            {errorCount > 0 && (
              <TabsTrigger value="error" className="text-red-600">
                Failed ({errorCount})
              </TabsTrigger>
            )}
          </TabsList>

          {/* All results */}
          <TabsContent value="all" className="space-y-3 mt-4">
            {results.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                onDownload={() => handleDownloadSingle(result)}
                onCopy={() => handleCopySvg(result.svg, result.fileName)}
                onPreview={() => handlePreview(result.id)}
                isCopied={copied === result.fileName}
              />
            ))}
          </TabsContent>

          {/* Success results */}
          <TabsContent value="success" className="space-y-3 mt-4">
            {results
              .filter((r) => r.status === 'success')
              .map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  onDownload={() => handleDownloadSingle(result)}
                  onCopy={() => handleCopySvg(result.svg, result.fileName)}
                  onPreview={() => handlePreview(result.id)}
                  isCopied={copied === result.fileName}
                />
              ))}
          </TabsContent>

          {/* Error results */}
          {errorCount > 0 && (
            <TabsContent value="error" className="space-y-3 mt-4">
              {results
                .filter((r) => r.status === 'error')
                .map((result) => (
                  <Card key={result.id} className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">
                          {result.originalFileName}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {result.error || 'Conversion failed'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Preview dialog */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {previewResult?.fileName}
            </DialogTitle>
          </DialogHeader>
          {previewResult && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                <div
                  dangerouslySetInnerHTML={{ __html: previewResult.svg }}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownloadSingle(previewResult)}
                  variant="default"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={() => handleCopySvg(previewResult.svg, previewResult.fileName)}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy SVG
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ResultCardProps {
  result: ConversionResult;
  onDownload: () => void;
  onCopy: () => void;
  onPreview: () => void;
  isCopied: boolean;
}

function ResultCard({
  result,
  onDownload,
  onCopy,
  onPreview,
  isCopied,
}: ResultCardProps) {
  if (result.status === 'error') {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">
                {result.originalFileName}
              </p>
              <p className="text-sm text-red-700 mt-1">
                {result.error || 'Conversion failed'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{result.fileName}</p>
          <p className="text-sm text-gray-500">
            {(result.svg.length / 1024).toFixed(1)} KB
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onPreview}
            variant="outline"
            size="sm"
            className="gap-2"
            title="Preview SVG"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            onClick={onCopy}
            variant="outline"
            size="sm"
            className="gap-2"
            title="Copy SVG code"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            onClick={onDownload}
            variant="default"
            size="sm"
            className="gap-2"
            title="Download SVG"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
}
