/**
 * SVG Color Editor Component
 * Real-time SVG color editing with DOM manipulation
 * Based on SVGcode by Google LLC (GPL-2.0)
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Copy, Check, RotateCcw, Palette } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface SVGColorEditorProps {
  svgContent: string;
  fileName: string;
  onSVGChange?: (newSvg: string) => void;
}

interface ColorInfo {
  color: string;
  count: number;
}

export default function SVGColorEditor({ svgContent, fileName, onSVGChange }: SVGColorEditorProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [newColor, setNewColor] = useState('#000000');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [currentSVG, setCurrentSVG] = useState(svgContent);
  const svgElementRef = useRef<SVGElement | null>(null);

  // Initialize SVG and extract colors
  useEffect(() => {
    if (!svgContainerRef.current) return;

    try {
      // Parse SVG content
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');

      if (svgDoc.documentElement.tagName === 'parsererror') {
        console.error('Failed to parse SVG');
        return;
      }

      // Clear container
      svgContainerRef.current.innerHTML = '';

      // Clone and append SVG
      const svgElement = svgDoc.documentElement.cloneNode(true) as SVGElement;
      svgElement.style.maxWidth = '100%';
      svgElement.style.height = 'auto';
      svgElement.style.border = '1px solid #e5e7eb';
      svgElement.style.borderRadius = '0.5rem';
      svgElement.style.padding = '1rem';
      svgElement.style.backgroundColor = '#f9fafb';
      svgContainerRef.current.appendChild(svgElement);
      svgElementRef.current = svgElement;

      // Extract unique colors
      const colorMap = new Map<string, number>();
      const paths = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, ellipse, g');

      paths.forEach((path) => {
        // Check fill attribute
        let fill = (path as any).getAttribute('fill');
        
        // If no fill, check style attribute
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

        const normalizedColor = normalizeColor(fill);

        if (!colorMap.has(normalizedColor)) {
          colorMap.set(normalizedColor, 0);
        }
        colorMap.set(normalizedColor, (colorMap.get(normalizedColor) || 0) + 1);
      });

      // Convert to array
      const colorList: ColorInfo[] = Array.from(colorMap.entries())
        .map(([color, count]) => ({
          color,
          count,
        }))
        .sort((a, b) => b.count - a.count);

      setColors(colorList);
      if (colorList.length > 0) {
        setSelectedColor(colorList[0].color);
      }
    } catch (error) {
      console.error('Error initializing SVG editor:', error);
    }
  }, [svgContent]);

  /**
   * Normalize color to hex format
   */
  function normalizeColor(color: string): string {
    color = color.trim();

    // Handle rgb/rgba
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }

    // Already hex
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }

    // Named colors - convert to hex (basic set)
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
   * Change color of selected group
   */
  function changeColor(fromColor: string, toColor: string) {
    if (!svgElementRef.current) return;

    const svgElement = svgElementRef.current;
    const paths = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, ellipse, g');
    
    let changedCount = 0;

    paths.forEach((path) => {
      // Check fill attribute
      let fill = (path as any).getAttribute('fill');
      
      // If no fill, check style attribute
      if (!fill) {
        const style = (path as any).getAttribute('style');
        if (style) {
          const fillMatch = style.match(/fill:\s*([^;]+)/);
          if (fillMatch) {
            fill = fillMatch[1].trim();
          }
        }
      }

      if (!fill) {
        fill = '#000000';
      }

      const normalizedFill = normalizeColor(fill);

      if (normalizedFill === fromColor) {
        (path as any).setAttribute('fill', toColor);
        changedCount++;
      }
    });

    // Update colors list
    const updatedColors = colors.map((c) => {
      if (c.color === fromColor) {
        return { ...c, color: toColor };
      }
      return c;
    });
    setColors(updatedColors);
    setSelectedColor(toColor);

    // Get updated SVG content
    const updatedSVG = svgElement.outerHTML;
    setCurrentSVG(updatedSVG);
    onSVGChange?.(updatedSVG);

    if (changedCount > 0) {
      toast.success(`Changed ${changedCount} element(s)`);
    }
  }

  /**
   * Replace all colors
   */
  function replaceAllColors(toColor: string) {
    if (!svgElementRef.current) return;

    const svgElement = svgElementRef.current;
    const paths = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, ellipse, g');

    paths.forEach((path) => {
      (path as any).setAttribute('fill', toColor);
    });

    // Reset colors list
    setColors([
      {
        color: toColor,
        count: paths.length,
      },
    ]);
    setSelectedColor(toColor);

    // Get updated SVG content
    const updatedSVG = svgElement.outerHTML;
    setCurrentSVG(updatedSVG);
    onSVGChange?.(updatedSVG);

    toast.success(`Changed all ${paths.length} element(s)`);
  }

  /**
   * Reset to original colors
   */
  function resetColors() {
    setCurrentSVG(svgContent);
    onSVGChange?.(svgContent);

    // Re-initialize
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    if (svgContainerRef.current) {
      svgContainerRef.current.innerHTML = '';
      const svgElement = svgDoc.documentElement.cloneNode(true) as SVGElement;
      svgElement.style.maxWidth = '100%';
      svgElement.style.height = 'auto';
      svgElement.style.border = '1px solid #e5e7eb';
      svgElement.style.borderRadius = '0.5rem';
      svgElement.style.padding = '1rem';
      svgElement.style.backgroundColor = '#f9fafb';
      svgContainerRef.current.appendChild(svgElement);
      svgElementRef.current = svgElement;
    }

    toast.success('Colors reset to original');
  }

  /**
   * Copy color to clipboard
   */
  function copyColor(color: string) {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
    toast.success('Color copied to clipboard');
  }

  /**
   * Download edited SVG
   */
  function downloadSVG() {
    const element = document.createElement('a');
    element.setAttribute('href', `data:image/svg+xml;charset=utf-8,${encodeURIComponent(currentSVG)}`);
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('SVG downloaded');
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Palette className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          Select a color from the palette and choose a new color. Changes apply in real-time to the preview.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="code">SVG Code</TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6 bg-white border-gray-200">
            <div
              ref={svgContainerRef}
              className="flex items-center justify-center min-h-64 bg-gray-50 rounded"
              style={{ maxHeight: '500px', overflow: 'auto' }}
            />
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Color Palette</h3>

            {colors.length === 0 ? (
              <p className="text-muted-foreground">No colors found in SVG</p>
            ) : (
              <div className="space-y-4">
                {/* Color List */}
                <div className="space-y-2">
                  {colors.map((colorInfo) => (
                    <div
                      key={colorInfo.color}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                        selectedColor === colorInfo.color
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedColor(colorInfo.color)}
                    >
                      <div
                        className="w-12 h-12 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: colorInfo.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-semibold text-sm">{colorInfo.color}</p>
                        <p className="text-xs text-muted-foreground">
                          {colorInfo.count} element{colorInfo.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyColor(colorInfo.color);
                        }}
                      >
                        {copiedColor === colorInfo.color ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Color Picker */}
                {selectedColor && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">New Color</label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          className="flex-1 font-mono text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => changeColor(selectedColor, newColor)}
                        className="flex-1"
                      >
                        Change Selected
                      </Button>
                      <Button
                        onClick={() => replaceAllColors(newColor)}
                        variant="outline"
                        className="flex-1"
                      >
                        Change All
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reset Button */}
                <Button
                  onClick={resetColors}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Original
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* SVG Code Tab */}
        <TabsContent value="code" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">SVG Source Code</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {currentSVG}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Download Button */}
      <Button onClick={downloadSVG} className="w-full">
        Download Edited SVG
      </Button>
    </div>
  );
}
