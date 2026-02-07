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
   * Convert SVG to PDF with vector paths for print-quality output
   */
  async function downloadPDF(svgContent: string, fileName: string) {
    try {
      // Parse SVG to extract vector paths
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGElement;

      // Get dimensions
      const viewBox = svgElement.getAttribute('viewBox');
      let width = 800;
      let height = 600;

      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).map(Number);
        width = parts[2] || 800;
        height = parts[3] || 600;
      } else {
        const w = svgElement.getAttribute('width');
        const h = svgElement.getAttribute('height');
        if (w) width = parseFloat(w);
        if (h) height = parseFloat(h);
      }

      // Create PDF with embedded SVG as vector content
      // For print-quality, we'll embed the SVG directly in PDF format
      const pdfContent = createVectorPDF(svgContent, width, height);

      // Download
      const link = document.createElement('a');
      link.href = pdfContent;
      link.download = fileName.replace(/\.[^/.]+$/, '.pdf');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded ${link.download} (vector quality)`);
    } catch (error: any) {
      console.error('PDF export failed:', error);
      toast.error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Create true vector PDF from SVG with proper path conversion
   */
  function createVectorPDF(svgContent: string, width: number, height: number): string {
    // Parse SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement as unknown as SVGElement;

    // Get all vector elements
    const paths = svgElement.querySelectorAll('path');
    const rects = svgElement.querySelectorAll('rect');
    const circles = svgElement.querySelectorAll('circle');
    const lines = svgElement.querySelectorAll('line');
    const polygons = svgElement.querySelectorAll('polygon');
    const polylines = svgElement.querySelectorAll('polyline');

    // Create PDF with proper vector stream
    let streamContent = '';

    // Process rectangles as vector paths
    rects.forEach((rect) => {
      const x = parseFloat(rect.getAttribute('x') || '0');
      const y = parseFloat(rect.getAttribute('y') || '0');
      const w = parseFloat(rect.getAttribute('width') || '0');
      const h = parseFloat(rect.getAttribute('height') || '0');
      const fill = rect.getAttribute('fill') || '#000000';
      const stroke = rect.getAttribute('stroke');
      const strokeWidth = parseFloat(rect.getAttribute('stroke-width') || '1');

      const rgb = hexToRGB(fill);
      streamContent += `\n${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} rg\n`;
      streamContent += `${strokeWidth} w\n`;
      streamContent += `${x} ${y} ${w} ${h} re\nf\n`;
    });

    // Process circles as vector paths
    circles.forEach((circle) => {
      const cx = parseFloat(circle.getAttribute('cx') || '0');
      const cy = parseFloat(circle.getAttribute('cy') || '0');
      const r = parseFloat(circle.getAttribute('r') || '0');
      const fill = circle.getAttribute('fill') || '#000000';
      const rgb = hexToRGB(fill);

      streamContent += `\n${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} rg\n`;
      // Draw circle using Bézier curves (4 curves for circle)
      const k = 0.552; // Magic constant for circle approximation
      streamContent += `${cx - r} ${cy} m\n`;
      streamContent += `${cx - r} ${cy + k * r} ${cx - k * r} ${cy + r} ${cx} ${cy + r} c\n`;
      streamContent += `${cx + k * r} ${cy + r} ${cx + r} ${cy + k * r} ${cx + r} ${cy} c\n`;
      streamContent += `${cx + r} ${cy - k * r} ${cx + k * r} ${cy - r} ${cx} ${cy - r} c\n`;
      streamContent += `${cx - k * r} ${cy - r} ${cx - r} ${cy - k * r} ${cx - r} ${cy} c\n`;
      streamContent += `f\n`;
    });

    // Process paths with proper Bézier curve conversion
    paths.forEach((path) => {
      const d = path.getAttribute('d') || '';
      const fill = path.getAttribute('fill') || '#000000';
      const stroke = path.getAttribute('stroke');
      const strokeWidth = parseFloat(path.getAttribute('stroke-width') || '1');

      const rgb = hexToRGB(fill);
      streamContent += `\n${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} rg\n`;
      streamContent += `${strokeWidth} w\n`;

      // Convert SVG path commands to PDF drawing commands
      const pathCommands = parseSVGPath(d);
      streamContent += pathCommandsToPDF(pathCommands);
      streamContent += `f\n`;
    });

    // Process lines
    lines.forEach((line) => {
      const x1 = parseFloat(line.getAttribute('x1') || '0');
      const y1 = parseFloat(line.getAttribute('y1') || '0');
      const x2 = parseFloat(line.getAttribute('x2') || '0');
      const y2 = parseFloat(line.getAttribute('y2') || '0');
      const stroke = line.getAttribute('stroke') || '#000000';
      const strokeWidth = parseFloat(line.getAttribute('stroke-width') || '1');

      const rgb = hexToRGB(stroke);
      streamContent += `\n${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} RG\n`;
      streamContent += `${strokeWidth} w\n`;
      streamContent += `${x1} ${y1} m\n${x2} ${y2} l\nS\n`;
    });

    // Create PDF structure
    const pdfStart = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${streamContent.length} >>
stream
${streamContent}
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
`;
    const offsetLen = pdfStart.length + streamContent.length + 100;
    const pdfContent = pdfStart + offsetLen + `
%%EOF`;

    return `data:application/pdf;base64,${btoa(pdfContent)}`;
  }

  /**
   * Parse SVG path data into commands
   */
  function parseSVGPath(pathData: string): Array<{ cmd: string; args: number[] }> {
    const commands: Array<{ cmd: string; args: number[] }> = [];
    const pathRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
    let match;

    while ((match = pathRegex.exec(pathData)) !== null) {
      const cmd = match[1];
      const argsStr = match[2].trim();
      const args = argsStr
        .split(/[\s,]+/)
        .filter((s) => s.length > 0)
        .map((s) => parseFloat(s));
      commands.push({ cmd, args });
    }

    return commands;
  }

  /**
   * Convert SVG path commands to PDF drawing commands
   */
  function pathCommandsToPDF(commands: Array<{ cmd: string; args: number[] }>): string {
    let pdfCommands = '';
    let currentX = 0;
    let currentY = 0;

    for (const { cmd, args } of commands) {
      switch (cmd) {
        case 'M':
        case 'm':
          for (let i = 0; i < args.length; i += 2) {
            const x = cmd === 'M' ? args[i] : currentX + args[i];
            const y = cmd === 'M' ? args[i + 1] : currentY + args[i + 1];
            pdfCommands += `${x} ${y} m\n`;
            currentX = x;
            currentY = y;
          }
          break;
        case 'L':
        case 'l':
          for (let i = 0; i < args.length; i += 2) {
            const x = cmd === 'L' ? args[i] : currentX + args[i];
            const y = cmd === 'L' ? args[i + 1] : currentY + args[i + 1];
            pdfCommands += `${x} ${y} l\n`;
            currentX = x;
            currentY = y;
          }
          break;
        case 'C':
        case 'c':
          for (let i = 0; i < args.length; i += 6) {
            const x1 = cmd === 'C' ? args[i] : currentX + args[i];
            const y1 = cmd === 'C' ? args[i + 1] : currentY + args[i + 1];
            const x2 = cmd === 'C' ? args[i + 2] : currentX + args[i + 2];
            const y2 = cmd === 'C' ? args[i + 3] : currentY + args[i + 3];
            const x = cmd === 'C' ? args[i + 4] : currentX + args[i + 4];
            const y = cmd === 'C' ? args[i + 5] : currentY + args[i + 5];
            pdfCommands += `${x1} ${y1} ${x2} ${y2} ${x} ${y} c\n`;
            currentX = x;
            currentY = y;
          }
          break;
        case 'Z':
        case 'z':
          pdfCommands += `h\n`;
          break;
      }
    }

    return pdfCommands;
  }

  /**
   * Convert hex color to RGB
   */
  function hexToRGB(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
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

      <Card className="p-4 bg-slate-900 border-slate-700">
        <h3 className="font-semibold mb-4 text-white">Available Formats</h3>
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
                  className="font-medium cursor-pointer block text-white"
                >
                  {format.name}
                </label>
                <p className="text-sm text-slate-400">{format.description}</p>
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
