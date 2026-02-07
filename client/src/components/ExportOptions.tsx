/**
 * Export Options Component
 * Multi-format export - all formats free
 * Based on SVGcode by Google LLC (GPL-2.0)
 */

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Zap, AlertCircle, FileDown } from 'lucide-react';
import { toast } from 'sonner';

interface ExportOptionsProps {
  svgContent: string;
  imageBuffer?: string; // Base64 encoded image for AutoTrace
  fileName: string;
  onExport?: (format: string, data: Buffer) => void;
}

interface ExportFormat {
  id: string;
  name: string;
  available: boolean;
  description: string;
}

export default function ExportOptions({
  svgContent,
  imageBuffer,
  fileName,
  onExport,
}: ExportOptionsProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['svg']);
  const [isExporting, setIsExporting] = useState(false);

  // Available formats - all free
  const availableFormats: ExportFormat[] = useMemo(() => [
    {
      id: 'svg',
      name: 'SVG (Vector)',
      available: true,
      description: 'Scalable Vector Graphics - best quality for web',
    },
    {
      id: 'pdf',
      name: 'PDF (Vector)',
      available: true,
      description: 'Portable Document Format - professional print',
    },
    {
      id: 'eps',
      name: 'EPS (PostScript)',
      available: true,
      description: 'Encapsulated PostScript - professional print',
    },
    {
      id: 'ai',
      name: 'Adobe Illustrator',
      available: true,
      description: 'Native Adobe format for professional editing',
    },
    {
      id: 'dxf',
      name: 'AutoCAD DXF',
      available: true,
      description: 'CAD format for technical drawings',
    },
  ], []);

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
  function downloadFile(data: string, format: string, fileName: string) {
    try {
      const element = document.createElement('a');
      
      if (format === 'svg') {
        // SVG is text-based
        element.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
      } else {
        // Other formats are base64 encoded
        element.href = `data:application/octet-stream;base64,${data}`;
      }
      
      element.download = fileName;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(`Downloaded ${fileName}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    }
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
      // For now, only SVG export is implemented
      // Multi-format export requires AutoTrace backend
      
      if (selectedFormats.includes('svg')) {
        // Download SVG
        const svgFileName = fileName.replace(/\.[^/.]+$/, '.svg');
        downloadFile(svgContent, 'svg', svgFileName);
      }

      // Show message for other formats
      const otherFormats = selectedFormats.filter(f => f !== 'svg');
      if (otherFormats.length > 0) {
        toast.info(
          `Multi-format export (${otherFormats.join(', ').toUpperCase()}) requires AutoTrace installation. ` +
          'All formats are free - no subscription needed!'
        );
      }

      toast.success('Export completed');
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <Alert className="bg-green-50 border-green-200">
        <FileDown className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          All export formats are completely free! No subscription required. SVG is ready now, other formats need AutoTrace.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Export Formats</h3>

        <div className="space-y-3 mb-6">
          {availableFormats.map((format) => (
            <div key={format.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition">
              <Checkbox
                id={format.id}
                checked={selectedFormats.includes(format.id)}
                onCheckedChange={() => toggleFormat(format.id)}
              />
              <label
                htmlFor={format.id}
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{format.name}</span>
                  {format.id === 'svg' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Ready</span>
                  )}
                  {format.id !== 'svg' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Free</span>
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
          className="w-full"
        >
          {isExporting ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download {selectedFormats.length > 0 ? `(${selectedFormats.length})` : ''}
            </>
          )}
        </Button>
      </Card>

      {/* Format Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Format Guide</h3>
        <Tabs defaultValue="svg" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="svg">SVG</TabsTrigger>
            <TabsTrigger value="formats">All Formats</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="svg" className="space-y-2 mt-4">
            <p className="text-sm font-medium">SVG (Scalable Vector Graphics)</p>
            <p className="text-sm text-muted-foreground">
              The recommended format for web and general use. SVG files are infinitely scalable without quality loss, have small file sizes, and can be edited in any text editor or vector software.
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground mt-2">
              <li>Infinitely scalable without quality loss</li>
              <li>Small file sizes</li>
              <li>Full color support</li>
              <li>Editable in any text editor or vector software</li>
              <li>Best for web, print, and general use</li>
            </ul>
          </TabsContent>

          <TabsContent value="formats" className="space-y-2 mt-4">
            <p className="text-sm font-medium text-green-900 bg-green-50 p-2 rounded mb-3">
              All formats are completely free - no subscription needed!
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">PDF (Vector)</p>
                <p className="text-sm text-muted-foreground">Portable Document Format with vector paths. Best for print-ready documents.</p>
              </div>
              <div>
                <p className="text-sm font-medium">EPS (Encapsulated PostScript)</p>
                <p className="text-sm text-muted-foreground">Professional print format. Legacy but still used in some workflows.</p>
              </div>
              <div>
                <p className="text-sm font-medium">AI (Adobe Illustrator)</p>
                <p className="text-sm text-muted-foreground">Native Adobe format for professional editing in Adobe Illustrator.</p>
              </div>
              <div>
                <p className="text-sm font-medium">DXF (AutoCAD)</p>
                <p className="text-sm text-muted-foreground">CAD format for technical drawings and engineering applications.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-2 mt-4">
            <ul className="text-sm list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>For web:</strong> Use SVG - it's lightweight and scalable</li>
              <li><strong>For print:</strong> Use PDF or EPS for professional quality</li>
              <li><strong>For Adobe editing:</strong> Use AI format to maintain full compatibility</li>
              <li><strong>For CAD software:</strong> Use DXF for technical drawings</li>
              <li><strong>For archival:</strong> SVG is future-proof and widely supported</li>
              <li><strong>Pro tip:</strong> Always keep the original SVG as a backup</li>
              <li><strong>Free forever:</strong> All formats are free - no hidden fees or subscriptions!</li>
            </ul>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
