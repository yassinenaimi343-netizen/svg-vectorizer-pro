/**
 * AutoTrace Integration
 * Converts raster images to vector formats (EPS, PDF, AI, DXF)
 * Based on SVGcode by Google LLC (GPL-2.0)
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

export type ExportFormat = 'eps' | 'pdf' | 'ai' | 'dxf' | 'fig' | 'sk';

export interface AutoTraceOptions {
  format: ExportFormat;
  colorMode?: 'bw' | 'color';
  despeckle?: number;
  smoothing?: number;
  cornerThreshold?: number;
}

export interface AutoTraceResult {
  format: ExportFormat;
  data: Buffer;
  mimeType: string;
}

/**
 * Check if AutoTrace is installed
 */
export function isAutoTraceAvailable(): boolean {
  try {
    execSync('which autotrace', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert image to vector format using AutoTrace
 */
export async function convertWithAutoTrace(
  imageBuffer: Buffer,
  options: AutoTraceOptions
): Promise<AutoTraceResult> {
  // Create temporary files
  const tempDir = '/tmp';
  const inputFile = path.join(tempDir, `autotrace-input-${randomBytes(8).toString('hex')}.png`);
  const outputFile = path.join(tempDir, `autotrace-output-${randomBytes(8).toString('hex')}.${options.format}`);

  try {
    // Write input image
    fs.writeFileSync(inputFile, imageBuffer);

    // Build AutoTrace command
    const args = [
      `-${options.format}`,
      `-output-file=${outputFile}`,
    ];

    // Add optional parameters
    if (options.colorMode === 'bw') {
      args.push('-bw');
    } else if (options.colorMode === 'color') {
      args.push('-color');
    }

    if (options.despeckle !== undefined) {
      args.push(`-despeckle=${options.despeckle}`);
    }

    if (options.smoothing !== undefined) {
      args.push(`-smoothing=${options.smoothing}`);
    }

    if (options.cornerThreshold !== undefined) {
      args.push(`-corner-threshold=${options.cornerThreshold}`);
    }

    args.push(inputFile);

    // Execute AutoTrace
    try {
      execSync(`autotrace ${args.join(' ')}`, {
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });
    } catch (error) {
      console.error('AutoTrace execution failed:', error);
      throw new Error(`AutoTrace conversion failed: ${error}`);
    }

    // Read output file
    if (!fs.existsSync(outputFile)) {
      throw new Error('AutoTrace did not generate output file');
    }

    const data = fs.readFileSync(outputFile);
    const mimeType = getMimeType(options.format);

    return {
      format: options.format,
      data,
      mimeType,
    };
  } finally {
    // Cleanup temporary files
    try {
      if (fs.existsSync(inputFile)) {
        fs.unlinkSync(inputFile);
      }
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    } catch (error) {
      console.warn('Failed to cleanup temporary files:', error);
    }
  }
}

/**
 * Get MIME type for export format
 */
function getMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    eps: 'application/postscript',
    pdf: 'application/pdf',
    ai: 'application/postscript', // AI files are PostScript-based
    dxf: 'application/dxf',
    fig: 'application/x-fig',
    sk: 'application/x-sketch',
  };

  return mimeTypes[format] || 'application/octet-stream';
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ExportFormat): string {
  return format;
}

/**
 * Get format display name
 */
export function getFormatName(format: ExportFormat): string {
  const names: Record<ExportFormat, string> = {
    eps: 'Encapsulated PostScript',
    pdf: 'PDF (Vector)',
    ai: 'Adobe Illustrator',
    dxf: 'AutoCAD DXF',
    fig: 'Xfig',
    sk: 'Sketch',
  };

  return names[format] || format.toUpperCase();
}

/**
 * Batch convert to multiple formats
 */
export async function convertToMultipleFormats(
  imageBuffer: Buffer,
  formats: ExportFormat[],
  options?: Partial<AutoTraceOptions>
): Promise<AutoTraceResult[]> {
  const results: AutoTraceResult[] = [];

  for (const format of formats) {
    try {
      const result = await convertWithAutoTrace(imageBuffer, {
        format,
        colorMode: options?.colorMode || 'color',
        despeckle: options?.despeckle,
        smoothing: options?.smoothing,
        cornerThreshold: options?.cornerThreshold,
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to convert to ${format}:`, error);
      // Continue with other formats
    }
  }

  return results;
}

/**
 * Validate AutoTrace installation and permissions
 */
export function validateAutoTraceSetup(): { available: boolean; message: string } {
  if (!isAutoTraceAvailable()) {
    return {
      available: false,
      message: 'AutoTrace is not installed. Install with: apt-get install autotrace',
    };
  }

  return {
    available: true,
    message: 'AutoTrace is properly configured',
  };
}
