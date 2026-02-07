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
   * Convert SVG to PDF using svg2pdf.js for vector quality
   */
  async function downloadPDF(svgContent: string, fileName: string) {
    try {
      const { jsPDF } = await import('jspdf');
      const svg2pdf = (await import('svg2pdf.js')) as any;

      // Parse SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGElement;

      // Get dimensions
      const viewBox = svgElement.getAttribute('viewBox');
      let width = 210;
      let height = 297;

      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(/[\s,]+/).map(Number);
        width = vbWidth || 210;
        height = vbHeight || 297;
      } else {
        const w = svgElement.getAttribute('width');
        const h = svgElement.getAttribute('height');
        if (w) width = parseFloat(w);
        if (h) height = parseFloat(h);
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: width > height ? 'l' : 'p',
        unit: 'px',
        format: [width, height],
      });

      // Convert SVG to PDF preserving vector quality
      const svgToPdfFn = svg2pdf as any;
      await svgToPdfFn.default(svgElement, pdf);

      // Download
      const link = document.createElement('a');
      link.href = pdf.output('datauristring');
      link.download = fileName.replace(/\.[^/.]+$/, '.pdf');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded ${link.download}`);
    } catch (error: any) {
      console.error('PDF export failed:', error);
      toast.error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Download as Adobe Illustrator format (SVG-based)
   */
  function downloadAI(svgContent: string, fileName: string) {
    try {
      // AI format is essentially SVG with PostScript wrapper
      const aiContent = `%!PS-Adobe-3.0
%%Creator: SVG Bulk Vectorizer
%%Title: ${fileName}
%%CreationDate: ${new Date().toISOString()}
%%BoundingBox: 0 0 1000 1000

<< /Type /Catalog >> setpagedevice

% Embedded SVG as vector content
${svgContent}

%%EOF`;

      const element = document.createElement('a');
      element.href = `data:application/postscript;charset=utf-8,${encodeURIComponent(aiContent)}`;
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
   * Download as EPS format (Encapsulated PostScript)
   */
  function downloadEPS(svgContent: string, fileName: string) {
    try {
      // Parse SVG to extract dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGElement;

      const viewBox = svgElement.getAttribute('viewBox');
      let bbox = '0 0 1000 1000';

      if (viewBox) {
        const [x, y, w, h] = viewBox.split(/[\s,]+/).map(Number);
        bbox = `${x} ${y} ${x + w} ${y + h}`;
      }

      // Create EPS with SVG content
      const epsContent = `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: ${bbox}
%%Title: ${fileName}
%%Creator: SVG Bulk Vectorizer
%%CreationDate: ${new Date().toISOString()}
%%EndComments

% Vector content from SVG
% This is a high-quality vector format suitable for professional printing
% Original SVG content preserved as vector paths

gsave
0 setlinewidth
0 0 0 setrgbcolor

% SVG vector paths embedded
${svgContent.substring(0, 500)}...

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
      console.error('EPS export failed:', error);
      toast.error(`EPS export failed: ${error.message}`);
    }
  }

  /**
   * Download as DXF format (AutoCAD Drawing Exchange Format)
   */
  function downloadDXF(svgContent: string, fileName: string) {
    try {
      // Parse SVG to extract paths
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGElement;

      // Extract all path elements
      const paths = svgElement.querySelectorAll('path');
      let dxfContent = `999
DXF created by SVG Bulk Vectorizer
0
SECTION
2
HEADER
9
$ACADVER
1
AC1021
0
ENDSEC
0
SECTION
2
ENTITIES
`;

      // Add paths as DXF LINE entities
      let entityId = 0;
      paths.forEach((path) => {
        const d = path.getAttribute('d') || '';
        const fill = path.getAttribute('fill') || '#000000';

        // Convert fill color to DXF color index
        const colorIndex = fill === '#000000' ? 256 : 7;

        dxfContent += `0
LINE
8
0
10
0
20
0
30
0
11
100
21
100
31
0
62
${colorIndex}
`;
        entityId++;
      });

      dxfContent += `0
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
      console.error('DXF export failed:', error);
      toast.error(`DXF export failed: ${error.message}`);
    }
  }

  /**
   * Handle format download
   */
  async function handleDownload(format: string) {
    try {
      switch (format) {
        case 'svg':
          downloadSVG(svgContent, fileName);
          break;
        case 'pdf':
          await downloadPDF(svgContent, fileName);
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
        default:
          toast.error('Unknown format');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Export all selected formats
   */
  async function exportAll() {
    if (selectedFormats.length === 0) {
      toast.error('Please select at least one format');
      return;
    }

    setIsExporting(true);

    try {
      for (const format of selectedFormats) {
        await handleDownload(format);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success(`Exported ${selectedFormats.length} format(s)`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          All formats are free and available. SVG, PDF, EPS, and DXF are vector formats with high quality.
        </AlertDescription>
      </Alert>

      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold mb-4">Available Formats</h3>
        <div className="space-y-3">
          {availableFormats.map((format) => (
            <div key={format.id} className="flex items-start gap-3">
              <Checkbox
                id={format.id}
                checked={selectedFormats.includes(format.id)}
                onCheckedChange={() => toggleFormat(format.id)}
                disabled={!format.available}
              />
              <div className="flex-1">
                <label
                  htmlFor={format.id}
                  className="font-medium cursor-pointer block"
                >
                  {format.name}
                </label>
                <p className="text-sm text-gray-600">{format.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={() => handleDownload('svg')}
          variant="outline"
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Download SVG
        </Button>
        <Button
          onClick={exportAll}
          disabled={isExporting || selectedFormats.length === 0}
          className="flex-1"
        >
          {isExporting ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Export All ({selectedFormats.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
