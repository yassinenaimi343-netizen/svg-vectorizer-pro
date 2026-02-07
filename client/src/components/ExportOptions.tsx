/**
 * Export Options Component
 * Multi-format export with feature gating
 * Based on SVGcode by Google LLC (GPL-2.0)
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Lock, Zap, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ExportOptionsProps {
  svgContent: string;
  imageBuffer?: string; // Base64 encoded image for AutoTrace
  fileName: string;
  onExport?: (format: string, data: Buffer) => void;
}

export default function ExportOptions({
  svgContent,
  imageBuffer,
  fileName,
  onExport,
}: ExportOptionsProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['svg']);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch available formats and features
  const { data: availableFormats, isLoading: formatsLoading } = trpc.export.getAvailableFormats.useQuery();
  const { data: autoTraceStatus } = trpc.export.checkAutoTraceStatus.useQuery();
  const { data: features } = trpc.payment.getFeatures.useQuery();

  // Export mutations
  const exportSVGMutation = trpc.export.exportSVG.useMutation();
  const exportFormatMutation = trpc.export.exportFormat.useMutation();
  const exportMultipleMutation = trpc.export.exportMultipleFormats.useMutation();

  /**
   * Handle format selection
   */
  function toggleFormat(format: string) {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  }

  /**
   * Download single file
   */
  function downloadFile(data: string | Buffer, format: string, fileName: string) {
    const element = document.createElement('a');
    let blob: Blob;

    if (typeof data === 'string') {
      // Base64 encoded data
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes]);
    } else {
      // Direct buffer - convert to Uint8Array
      const uint8Array = new Uint8Array(data as any);
      blob = new Blob([uint8Array]);
    }

    element.href = URL.createObjectURL(blob);
    element.download = fileName;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }

  /**
   * Export selected formats
   */
  async function handleExport() {
    if (selectedFormats.length === 0) {
      toast.error('Please select at least one format');
      return;
    }

    setIsExporting(true);

    try {
      // Export SVG
      if (selectedFormats.includes('svg')) {
        const result = await exportSVGMutation.mutateAsync({
          svgContent,
          fileName,
        });
        downloadFile(result.data, 'svg', result.fileName);
      }

      // Export other formats (requires AutoTrace and Pro plan)
      const otherFormats = selectedFormats.filter((f) => f !== 'svg');
      if (otherFormats.length > 0) {
        if (!imageBuffer) {
          toast.error('Image data required for multi-format export');
          return;
        }

        if (otherFormats.length === 1) {
          const result = await exportFormatMutation.mutateAsync({
            imageBuffer,
            format: otherFormats[0] as any,
            fileName,
          });
          downloadFile(result.data, result.format, result.fileName);
        } else {
          const results = await exportMultipleMutation.mutateAsync({
            imageBuffer,
            formats: otherFormats as any,
            fileName,
          });
          results.forEach((result) => {
            downloadFile(result.data, result.format, result.fileName);
          });
        }
      }

      toast.success('Export completed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }

  if (formatsLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading export options...</div>;
  }

  return (
    <div className="space-y-4">
      {/* AutoTrace Status */}
      {!autoTraceStatus?.available && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            AutoTrace is not available. Multi-format export requires AutoTrace installation.
          </AlertDescription>
        </Alert>
      )}

      {/* Pro Plan Required */}
      {!features?.hasMultiFormatExport && (
        <Alert className="bg-blue-50 border-blue-200">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Multi-format export (EPS, PDF, AI, DXF) requires a Pro subscription.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Export Formats</h3>

        <div className="space-y-3">
          {availableFormats?.map((format) => (
            <div key={format.id} className="flex items-start gap-3">
              <Checkbox
                id={format.id}
                checked={selectedFormats.includes(format.id)}
                onCheckedChange={() => toggleFormat(format.id)}
                disabled={!format.available || (format.requiresPro && !features?.hasMultiFormatExport)}
              />
              <label
                htmlFor={format.id}
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{format.name}</span>
                  {format.requiresPro && !features?.hasMultiFormatExport && (
                    <Lock className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{format.description}</p>
              </label>
            </div>
          ))}
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedFormats.length === 0}
          className="w-full mt-6"
        >
          {isExporting ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Selected Formats
            </>
          )}
        </Button>
      </Card>

      {/* Format Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Format Information</h3>
        <Tabs defaultValue="svg" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="svg">SVG</TabsTrigger>
            <TabsTrigger value="pro">Pro Formats</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="svg" className="space-y-2">
            <p className="text-sm">
              <strong>SVG (Scalable Vector Graphics)</strong> is the recommended format for web and general use.
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
              <li>Infinitely scalable without quality loss</li>
              <li>Small file sizes</li>
              <li>Full color support</li>
              <li>Editable in any text editor or vector software</li>
            </ul>
          </TabsContent>

          <TabsContent value="pro" className="space-y-2">
            {!features?.hasMultiFormatExport ? (
              <p className="text-sm text-yellow-900 bg-yellow-50 p-3 rounded">
                Pro formats require a Pro subscription. <a href="/account" className="underline">Upgrade now</a>
              </p>
            ) : (
              <>
                <p className="text-sm">
                  <strong>EPS (Encapsulated PostScript)</strong> - Professional print format
                </p>
                <p className="text-sm">
                  <strong>PDF (Vector)</strong> - Portable Document Format with vector paths
                </p>
                <p className="text-sm">
                  <strong>AI (Adobe Illustrator)</strong> - Native Adobe format for professional editing
                </p>
                <p className="text-sm">
                  <strong>DXF (AutoCAD)</strong> - CAD format for technical drawings and engineering
                </p>
              </>
            )}
          </TabsContent>

          <TabsContent value="tips" className="space-y-2">
            <ul className="text-sm list-disc list-inside space-y-2 text-muted-foreground">
              <li>SVG is best for web, print, and general use</li>
              <li>Use AI format for professional Adobe Illustrator editing</li>
              <li>Use DXF for CAD software and technical drawings</li>
              <li>Use PDF for print-ready documents</li>
              <li>EPS is legacy format, use PDF for modern workflows</li>
            </ul>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
