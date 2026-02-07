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
import { AlertCircle, Copy, Check, RotateCcw, Palette, Download } from 'lucide-react';
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
  const originalSVGRef = useRef(svgContent);
  const colorMapRef = useRef<Map<string, SVGElement[]>>(new Map());

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
      
      // Set proper dimensions and scaling
      svgElement.style.maxWidth = '100%';
      svgElement.style.height = 'auto';
      svgElement.style.border = '1px solid #e5e7eb';
      svgElement.style.borderRadius = '0.5rem';
      svgElement.style.padding = '1rem';
      svgElement.style.backgroundColor = '#f9fafb';
      svgElement.style.display = 'block';
      svgElement.style.margin = '0 auto';
      
      // Ensure viewBox is set for proper scaling
      if (!svgElement.getAttribute('viewBox') && svgElement.getAttribute('width') && svgElement.getAttribute('height')) {
        const width = svgElement.getAttribute('width');
        const height = svgElement.getAttribute('height');
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
      
      svgContainerRef.current.appendChild(svgElement);
      svgElementRef.current = svgElement;

      // Extract unique colors and build color map
      const colorMap = new Map<string, SVGElement[]>();
      const paths = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, ellipse, g, text');

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
          colorMap.set(normalizedColor, []);
        }
        colorMap.get(normalizedColor)!.push(path as SVGElement);
      });

      colorMapRef.current = colorMap;

      // Convert to array
      const colorList: ColorInfo[] = Array.from(colorMap.entries())
        .map(([color, elements]) => ({
          color,
          count: elements.length,
        }))
        .sort((a, b) => b.count - a.count);

      setColors(colorList);
      if (colorList.length > 0) {
        setSelectedColor(colorList[0].color);
        setNewColor(colorList[0].color);
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
   * Change color of selected group - truly real-time
   */
  function updateColorInDOM(fromColor: string, toColor: string) {
    if (!svgElementRef.current) return;

    const elements = colorMapRef.current.get(fromColor) || [];
    
    elements.forEach((element) => {
      element.setAttribute('fill', toColor);
    });

    // Get updated SVG content
    const updatedSVG = svgElementRef.current.outerHTML;
    setCurrentSVG(updatedSVG);
    onSVGChange?.(updatedSVG);
  }

  /**
   * Handle color picker change - real-time updates
   */
  function handleColorChange(newColorValue: string) {
    setNewColor(newColorValue);
    
    if (selectedColor && newColorValue.match(/^#[0-9A-F]{6}$/i)) {
      updateColorInDOM(selectedColor, newColorValue);
    }
  }

  /**
   * Replace all colors - real-time
   */
  function replaceAllColorsRealTime(toColor: string) {
    if (!svgElementRef.current) return;

    const svgElement = svgElementRef.current;
    const paths = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, ellipse, g, text');

    paths.forEach((path) => {
      (path as any).setAttribute('fill', toColor);
    });

    // Get updated SVG content
    const updatedSVG = svgElement.outerHTML;
    setCurrentSVG(updatedSVG);
    onSVGChange?.(updatedSVG);
  }

  /**
   * Reset to original colors
   */
  function resetColors() {
    setCurrentSVG(originalSVGRef.current);
    onSVGChange?.(originalSVGRef.current);

    // Re-initialize
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(originalSVGRef.current, 'image/svg+xml');
    if (svgContainerRef.current) {
      svgContainerRef.current.innerHTML = '';
      const svgElement = svgDoc.documentElement.cloneNode(true) as SVGElement;
      svgElement.style.maxWidth = '100%';
      svgElement.style.height = 'auto';
      svgElement.style.border = '1px solid #e5e7eb';
      svgElement.style.borderRadius = '0.5rem';
      svgElement.style.padding = '1rem';
      svgElement.style.backgroundColor = '#f9fafb';
      svgElement.style.display = 'block';
      svgElement.style.margin = '0 auto';
      
      if (!svgElement.getAttribute('viewBox') && svgElement.getAttribute('width') && svgElement.getAttribute('height')) {
        const width = svgElement.getAttribute('width');
        const height = svgElement.getAttribute('height');
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
      
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
          Select a color and adjust the color picker - changes update in real-time as you move the slider.
        </AlertDescription>
      </Alert>

      {/* Main Layout: Preview on Left, Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Preview Column - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div
              ref={svgContainerRef}
              className="flex items-center justify-center bg-gray-50 rounded border border-gray-200 w-full"
              style={{ minHeight: '400px', maxHeight: '600px', overflow: 'auto' }}
            />
          </Card>
        </div>

        {/* Controls Column */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Colors</h3>

            {colors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No colors found</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {colors.map((colorInfo) => (
                  <div
                    key={colorInfo.color}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition ${
                      selectedColor === colorInfo.color
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedColor(colorInfo.color);
                      setNewColor(colorInfo.color);
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: colorInfo.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold text-xs">{colorInfo.color}</p>
                      <p className="text-xs text-muted-foreground">
                        {colorInfo.count}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyColor(colorInfo.color);
                      }}
                    >
                      {copiedColor === colorInfo.color ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Color Picker - Real-time updates */}
          {selectedColor && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Change Color</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-2">New Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={newColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-12 h-10 cursor-pointer p-1"
                    />
                    <Input
                      type="text"
                      value={newColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="flex-1 font-mono text-xs"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => replaceAllColorsRealTime(newColor)}
                    variant="outline"
                    className="w-full text-xs"
                    size="sm"
                  >
                    Change All to This
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={resetColors}
              variant="outline"
              className="w-full text-xs"
              size="sm"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              onClick={downloadSVG}
              className="w-full text-xs"
              size="sm"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
