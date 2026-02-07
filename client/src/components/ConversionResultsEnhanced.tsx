/**
 * Enhanced Conversion Results Component
 * With color editor and multi-format export
 * Based on SVGcode by Google LLC (GPL-2.0)
 */

import React, { useState } from 'react';
import { Download, Eye, Copy, Check, AlertCircle, Palette, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import SVGColorEditor from './SVGColorEditor';
import ExportOptions from './ExportOptions';

export interface ConversionResult {
  id: string;
  fileName: string;
  originalFileName: string;
  svg: string;
  imageBuffer?: string; // Base64 encoded original image
  status: 'success' | 'error';
  error?: string;
}

interface ConversionResultsEnhancedProps {
  results: ConversionResult[];
}

export default function ConversionResultsEnhanced({ results }: ConversionResultsEnhancedProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingSVG, setEditingSVG] = useState<string | null>(null);
  const [editedSVGs, setEditedSVGs] = useState<Record<string, string>>({});

  /**
   * Copy SVG code to clipboard
   */
  function copySVG(id: string, svg: string) {
    navigator.clipboard.writeText(svg);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('SVG copied to clipboard');
  }

  /**
   * Download single SVG
   */
  function downloadSVG(fileName: string, svg: string) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('SVG downloaded');
  }

  /**
   * Download all SVGs as ZIP
   */
  async function downloadAllAsZIP() {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      results.forEach((result) => {
        if (result.status === 'success') {
          const svg = editedSVGs[result.id] || result.svg;
          zip.file(result.fileName, svg);
        }
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = 'converted-svgs.zip';
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
      toast.success('All SVGs downloaded as ZIP');
    } catch (error) {
      toast.error('Failed to create ZIP file');
      console.error(error);
    }
  }

  /**
   * Handle SVG edit
   */
  function handleSVGEdit(id: string, newSVG: string) {
    setEditedSVGs((prev) => ({
      ...prev,
      [id]: newSVG,
    }));
  }

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {successCount} successful, {errorCount} failed
            </p>
          </div>
          {successCount > 0 && (
            <Button onClick={downloadAllAsZIP} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download All as ZIP
            </Button>
          )}
        </div>
      </Card>

      {/* Results Grid */}
      <div className="grid gap-4">
        {results.map((result) => {
          const displaySVG = editedSVGs[result.id] || result.svg;

          return (
            <Card key={result.id} className="p-4">
              {result.status === 'success' ? (
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="edit">Edit Colors</TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                  </TabsList>

                  {/* Preview Tab */}
                  <TabsContent value="preview" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{result.fileName}</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copySVG(result.id, displaySVG)}
                        >
                          {copiedId === result.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => downloadSVG(result.fileName, displaySVG)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div
                      className="bg-gray-50 rounded border border-gray-200 p-4 flex items-center justify-center min-h-64"
                      dangerouslySetInnerHTML={{ __html: displaySVG }}
                    />
                  </TabsContent>

                  {/* Edit Colors Tab */}
                  <TabsContent value="edit" className="space-y-4">
                    <SVGColorEditor
                      svgContent={result.svg}
                      fileName={result.fileName}
                      onSVGChange={(newSVG) => handleSVGEdit(result.id, newSVG)}
                    />
                  </TabsContent>

                  {/* Export Tab */}
                  <TabsContent value="export" className="space-y-4">
                    <ExportOptions
                      svgContent={displaySVG}
                      imageBuffer={result.imageBuffer}
                      fileName={result.fileName}
                    />
                  </TabsContent>

                  {/* Code Tab */}
                  <TabsContent value="code" className="space-y-4">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                      {displaySVG}
                    </pre>
                    <Button
                      onClick={() => copySVG(result.id, displaySVG)}
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy SVG Code
                    </Button>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center gap-3 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">{result.fileName}</p>
                    <p className="text-sm">{result.error}</p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
