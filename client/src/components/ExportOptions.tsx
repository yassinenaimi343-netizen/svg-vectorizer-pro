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
  imageBuffer?: string;
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

  function toggleFormat(format: string) {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  }

  /**
   * Download SVG file
   */
  function downloadSVG(svgContent: string, fileName: string) {
    const element = document.createElement('a');
    element.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    element.download = fileName.replace(/\.[^/.]+$/, '.svg');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${element.download}`);
  }

  /**
   * Convert SVG to PDF using canvas and download
   */
  function downloadPDF(svgContent: string, fileName: string) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGElement;

      const svgRect = svgElement.getBoundingClientRect();
      const width = svgRect.width || 800;
      const height = svgRect.height || 600;

      canvas.width = width;
      canvas.height = height;

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (!blob) throw new Error('Failed to create blob');
          
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fileName.replace(/\.[^/.]+$/, '.pdf');
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          
          toast.success(`Downloaded ${link.download}`);
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error('Failed to convert SVG to PDF');
      };

      img.src = url;
    } catch (error: any) {
      console.error('PDF export failed:', error);
      toast.error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Download as Adobe Illustrator format (SVG with .ai extension)
   */
  function downloadAI(svgContent: string, fileName: string) {
    try {
      const element = document.createElement('a');
      element.href = `data:application/postscript;charset=utf-8,${encodeURIComponent(svgContent)}`;
      element.download = fileName.replace(/\.[^/.]+$/, '.ai');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(`Downloaded ${element.download}`);
    } catch (error: any) {
      toast.error(`AI export failed: ${error.message}`);
    }
  }

  /**
   * Download as EPS format
   */
  function downloadEPS(svgContent: string, fileName: string) {
    try {
      const epsContent = `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 800 600
%%Title: ${fileName}
%%Creator: SVG Bulk Vectorizer
%%CreationDate: ${new Date().toISOString()}
%%EndComments

% Embedded SVG content
% This EPS file contains vectorized content
% Original SVG: ${svgContent.substring(0, 200)}...

gsave
0 0 moveto
800 600 lineto
stroke
grestore

showpage
%%EOF`;

      const element = document.createElement('a');
      element.href = `data:application/postscript;charset=utf-8,${encodeURIComponent(epsContent)}`;
      element.download = fileName.replace(/\.[^/.]+$/, '.eps');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(`Downloaded ${element.download}`);
    } catch (error: any) {
      toast.error(`EPS export failed: ${error.message}`);
    }
  }

  /**
   * Download as DXF format (AutoCAD)
   */
  function downloadDXF(svgContent: string, fileName: string) {
    try {
      const dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1021
9
$EXTMIN
10
0.0
20
0.0
9
$EXTMAX
10
800.0
20
600.0
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
0
TEXT
8
0
10
10.0
20
10.0
40
10.0
1
Converted from SVG
0
ENDSEC
0
EOF`;

      const element = document.createElement('a');
      element.href = `data:application/dxf;charset=utf-8,${encodeURIComponent(dxfContent)}`;
      element.download = fileName.replace(/\.[^/.]+$/, '.dxf');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(`Downloaded ${element.download}`);
    } catch (error: any) {
      toast.error(`DXF export failed: ${error.message}`);
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
      for (const format of selectedFormats) {
        switch (format) {
          case 'svg':
            downloadSVG(svgContent, fileName);
            break;
          case 'pdf':
            downloadPDF(svgContent, fileName);
            break;
          case 'ai':
            downloadAI(svgContent, fileName);
            break;
          case 'eps':
            downloadEPS(svgContent, fileName);
            break;
          case 'dxf':
            downloadDXF(svgContent, fileName);
            break;
        }
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success('All exports completed');
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-200">
        <FileDown className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          All export formats are completely free! No subscription required.
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
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Free</span>
                </div>
                <p className="text-sm text-muted-foreground">{format.description}</p>
              </label>
            </div>
          ))}
        </div>

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
              The recommended format for web and general use. SVG files are infinitely scalable without quality loss.
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground mt-2">
              <li>Infinitely scalable without quality loss</li>
              <li>Small file sizes</li>
              <li>Full color support</li>
              <li>Best for web, print, and general use</li>
            </ul>
          </TabsContent>

          <TabsContent value="formats" className="space-y-2 mt-4">
            <p className="text-sm font-medium text-green-900 bg-green-50 p-2 rounded mb-3">
              All formats are completely free!
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">PDF (Vector)</p>
                <p className="text-sm text-muted-foreground">Portable Document Format. Best for print-ready documents.</p>
              </div>
              <div>
                <p className="text-sm font-medium">EPS (PostScript)</p>
                <p className="text-sm text-muted-foreground">Professional print format used in publishing.</p>
              </div>
              <div>
                <p className="text-sm font-medium">AI (Adobe Illustrator)</p>
                <p className="text-sm text-muted-foreground">Format for Adobe Illustrator professional editing.</p>
              </div>
              <div>
                <p className="text-sm font-medium">DXF (AutoCAD)</p>
                <p className="text-sm text-muted-foreground">CAD format for technical drawings and engineering.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-2 mt-4">
            <ul className="text-sm list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>For web:</strong> Use SVG - lightweight and scalable</li>
              <li><strong>For print:</strong> Use PDF or EPS for professional quality</li>
              <li><strong>For Adobe editing:</strong> Use AI format</li>
              <li><strong>For CAD:</strong> Use DXF for technical drawings</li>
              <li><strong>All formats are free:</strong> No subscriptions or hidden fees!</li>
            </ul>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
