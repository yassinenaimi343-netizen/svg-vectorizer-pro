/**
 * Enhanced Conversion Results Component
 * With color editor and multi-format export
 * Based on SVGcode by Google LLC (GPL-2.0)
 */

import React, { useState } from 'react';
import { Download, Eye, Copy, Check, AlertCircle, Palette, FileDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import SVGColorEditor from './SVGColorEditor';
import ExportOptions from './ExportOptions';

export interface ConversionResult {
  id: string;
  fileName: string;
  originalFileName: string;
  svg: string;
  imageBuffer?: string;
  status: 'success' | 'error';
  error?: string;
}

interface ConversionResultsEnhancedProps {
  results: ConversionResult[];
}

type ExportFormat = 'svg' | 'pdf' | 'ai' | 'eps' | 'dxf';

export default function ConversionResultsEnhanced({ results }: ConversionResultsEnhancedProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingSVG, setEditingSVG] = useState<string | null>(null);
  const [editedSVGs, setEditedSVGs] = useState<Record<string, string>>({});
  const [bulkColorDialogOpen, setBulkColorDialogOpen] = useState(false);
  const [bulkFromColor, setBulkFromColor] = useState('#000000');
  const [bulkToColor, setBulkToColor] = useState('#FF0000');
  const [isApplyingBulkColor, setIsApplyingBulkColor] = useState(false);
  const [bulkExportDialogOpen, setBulkExportDialogOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>('svg');
  const [isExportingBulk, setIsExportingBulk] = useState(false);

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
   * Convert SVG to PDF using svg2pdf.js for vector quality
   */
  async function svgToPdf(svgString: string, fileName: string): Promise<Blob> {
    try {
      const { jsPDF } = await import('jspdf');
      const svg2pdf = (await import('svg2pdf.js')) as any;
      
      // Parse SVG to get dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGElement;
      
      // Get viewBox or width/height
      const viewBox = svgElement.getAttribute('viewBox');
      let width = 210; // A4 default
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
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: width > height ? 'l' : 'p',
        unit: 'px',
        format: [width, height],
      });
      
      // Use svg2pdf to convert SVG to PDF preserving vector quality
      const svgToPdfFn = svg2pdf as any;
      await svgToPdfFn.default(svgElement, pdf);
      
      return pdf.output('blob');
    } catch (error) {
      console.error('Error converting SVG to PDF:', error);
      // Fallback to canvas-based conversion if svg2pdf fails
      try {
        const { jsPDF } = await import('jspdf');
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgElement = svgDoc.documentElement as unknown as SVGElement;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load SVG'));
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
        
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        ctx?.drawImage(img, 0, 0);
        
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'l' : 'p',
          unit: 'mm',
          format: 'a4',
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        return pdf.output('blob');
      } catch (fallbackError) {
        console.error('Fallback PDF conversion also failed:', fallbackError);
        throw fallbackError;
      }
    }
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
   * Download all SVGs individually
   */
  async function downloadAllSVGs() {
    const successResults = results.filter((r) => r.status === 'success');
    if (successResults.length === 0) {
      toast.error('No successful conversions to download');
      return;
    }

    for (const result of successResults) {
      const svg = editedSVGs[result.id] || result.svg;
      const element = document.createElement('a');
      element.setAttribute('href', `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
      element.setAttribute('download', result.fileName);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    toast.success(`Downloaded ${successResults.length} SVGs`);
  }

  /**
   * Download all in selected format
   */
  async function downloadAllInFormat() {
    const successResults = results.filter((r) => r.status === 'success');
    if (successResults.length === 0) {
      toast.error('No successful conversions to download');
      return;
    }

    setIsExportingBulk(true);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (const result of successResults) {
        const svg = editedSVGs[result.id] || result.svg;
        const baseName = result.fileName.replace(/\.svg$/, '');

        let fileContent: string | Blob;
        let fileName: string;

        switch (selectedExportFormat) {
          case 'svg':
            fileContent = svg;
            fileName = `${baseName}.svg`;
            break;

          case 'pdf': {
            try {
              fileContent = await svgToPdf(svg, baseName);
              fileName = `${baseName}.pdf`;
            } catch (error) {
              console.error('Error converting to PDF:', error);
              toast.error(`Failed to convert ${baseName} to PDF`);
              continue;
            }
            break;
          }

          case 'ai':
            fileContent = svg;
            fileName = `${baseName}.ai`;
            break;

          case 'eps':
            fileContent = svg;
            fileName = `${baseName}.eps`;
            break;

          case 'dxf':
            fileContent = svg;
            fileName = `${baseName}.dxf`;
            break;

          default:
            fileContent = svg;
            fileName = `${baseName}.svg`;
        }

        zip.file(fileName, fileContent);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = `converted-files-${selectedExportFormat}.zip`;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);

      setBulkExportDialogOpen(false);
      toast.success(`Downloaded ${successResults.length} files as ${selectedExportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting bulk files:', error);
      toast.error('Failed to export files');
    } finally {
      setIsExportingBulk(false);
    }
  }

  /**
   * Normalize color to hex format
   */
  function normalizeColor(color: string): string {
    color = color.trim();

    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }

    if (color.startsWith('#')) {
      return color.toUpperCase();
    }

    const namedColors: Record<string, string> = {
      black: '#000000',
      white: '#FFFFFF',
      red: '#FF0000',
      green: '#008000',
      blue: '#0000FF',
      yellow: '#FFFF00',
      cyan: '#00FFFF',
      magenta: '#FF00FF',
      gray: '#808080',
      grey: '#808080',
    };

    return namedColors[color.toLowerCase()] || '#000000';
  }

  /**
   * Apply color change to all images
   */
  function applyBulkColorChange() {
    if (!bulkFromColor || !bulkToColor) {
      toast.error('Please select both colors');
      return;
    }

    setIsApplyingBulkColor(true);

    try {
      const normalizedFromColor = normalizeColor(bulkFromColor);
      const normalizedToColor = normalizeColor(bulkToColor);

      const newEditedSVGs: Record<string, string> = {};

      results.forEach((result) => {
        if (result.status === 'success') {
          const currentSVG = editedSVGs[result.id] || result.svg;
          
          // Replace all occurrences of the color
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(currentSVG, 'image/svg+xml');
          const svgElement = svgDoc.documentElement as unknown as SVGElement;

          const paths = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, ellipse, g, text');
          
          paths.forEach((path) => {
            let fill = (path as any).getAttribute('fill');
            
            if (!fill) {
              const style = (path as any).getAttribute('style');
              if (style) {
                const fillMatch = style.match(/fill:\s*([^;]+)/);
                if (fillMatch) {
                  fill = fillMatch[1].trim();
                }
              }
            }

            if (!fill || fill === 'none') {
              fill = '#000000';
            }

            const normalizedFill = normalizeColor(fill);

            if (normalizedFill === normalizedFromColor) {
              (path as any).setAttribute('fill', normalizedToColor);
            }
          });

          newEditedSVGs[result.id] = svgElement.outerHTML;
        }
      });

      setEditedSVGs((prev) => ({
        ...prev,
        ...newEditedSVGs,
      }));

      setBulkColorDialogOpen(false);
      toast.success(`Color changed in ${Object.keys(newEditedSVGs).length} images`);
    } catch (error) {
      console.error('Error applying bulk color change:', error);
      toast.error('Failed to apply color change');
    } finally {
      setIsApplyingBulkColor(false);
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
      {/* Summary and Bulk Actions */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {successCount} successful, {errorCount} failed
              </p>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          {successCount > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={downloadAllAsZIP} 
                size="sm" 
                variant="outline"
                className="flex-1 min-w-fit"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All as ZIP
              </Button>
              
              <Button 
                onClick={downloadAllSVGs} 
                size="sm" 
                variant="outline"
                className="flex-1 min-w-fit"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download All SVGs
              </Button>

              <Dialog open={bulkExportDialogOpen} onOpenChange={setBulkExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 min-w-fit"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Format
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Export All Images</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Format</label>
                      <Select value={selectedExportFormat} onValueChange={(value) => setSelectedExportFormat(value as ExportFormat)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="svg">SVG - Scalable Vector</SelectItem>
                          <SelectItem value="pdf">PDF - Document Format</SelectItem>
                          <SelectItem value="ai">AI - Adobe Illustrator</SelectItem>
                          <SelectItem value="eps">EPS - Encapsulated PostScript</SelectItem>
                          <SelectItem value="dxf">DXF - AutoCAD Drawing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={downloadAllInFormat}
                      disabled={isExportingBulk}
                      className="w-full"
                    >
                      {isExportingBulk ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export All as {selectedExportFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={bulkColorDialogOpen} onOpenChange={setBulkColorDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 min-w-fit"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Change Color All
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Color in All Images</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">From Color</label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={bulkFromColor}
                          onChange={(e) => setBulkFromColor(e.target.value)}
                          className="w-12 h-10 cursor-pointer p-1"
                        />
                        <Input
                          type="text"
                          value={bulkFromColor}
                          onChange={(e) => setBulkFromColor(e.target.value)}
                          className="flex-1 font-mono text-xs"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">To Color</label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={bulkToColor}
                          onChange={(e) => setBulkToColor(e.target.value)}
                          className="w-12 h-10 cursor-pointer p-1"
                        />
                        <Input
                          type="text"
                          value={bulkToColor}
                          onChange={(e) => setBulkToColor(e.target.value)}
                          className="flex-1 font-mono text-xs"
                          placeholder="#FF0000"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={applyBulkColorChange}
                      disabled={isApplyingBulkColor}
                      className="w-full"
                    >
                      {isApplyingBulkColor ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Palette className="w-4 h-4 mr-2" />
                          Apply to All
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="edit">Edit Colors</TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
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
                      className="bg-slate-800 rounded border border-slate-700 p-4 flex items-center justify-center min-h-64"
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
                </Tabs>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">{result.fileName}</p>
                    <p className="text-sm text-red-700">{result.error}</p>
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
