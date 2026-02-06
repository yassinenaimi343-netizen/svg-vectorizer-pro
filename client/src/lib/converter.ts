/**
 * SVG Bulk Vectorizer - Image Conversion Module
 * Based on SVGcode by Google LLC (GPL-2.0)
 * 
 * This module provides image-to-SVG conversion functionality using Potrace WASM.
 * Adapted from: https://github.com/tomayac/SVGcode
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { potrace, init } from 'esm-potrace-wasm';
import { optimize } from 'svgo';

// Initialize Potrace WASM once
let potraceInitialized = false;

export interface ConversionParams {
  turdsize: number;
  alphamax: number;
  turnpolicy: number;
  opttolerance: number;
  opticurve: boolean;
  extractcolors: boolean;
}

export interface ConversionResult {
  svg: string;
  fileName: string;
  originalFileName: string;
  error?: string;
}

/**
 * Initialize Potrace WASM module
 */
async function initializePotrace() {
  if (!potraceInitialized) {
    await init();
    potraceInitialized = true;
  }
}

/**
 * Load image file and convert to ImageData
 */
async function loadImageAsImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = async () => {
          // Create canvas with image dimensions
          const canvas = new OffscreenCanvas(img.width, img.height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          resolve(imageData);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert ImageData to SVG using Potrace
 */
async function convertImageDataToSVG(
  imageData: ImageData,
  params: ConversionParams
): Promise<string> {
  await initializePotrace();
  
  const potraceParams = {
    turdsize: params.turdsize,
    alphamax: params.alphamax,
    turnpolicy: params.turnpolicy,
    opttolerance: params.opttolerance,
    opticurve: params.opticurve ? 1 : 0,
    extractcolors: params.extractcolors,
  };

  const svg = await potrace(imageData, potraceParams);
  
  // Optimize SVG with SVGO
  const optimized = optimize(svg, {
    multipass: true,
    plugins: [
      'preset-default',
      'removeViewBox',
    ],
  });

  return optimized.data;
}

/**
 * Convert a single image file to SVG
 */
export async function convertImageFile(
  file: File,
  params: ConversionParams
): Promise<ConversionResult> {
  try {
    const imageData = await loadImageAsImageData(file);
    const svg = await convertImageDataToSVG(imageData, params);
    
    // Generate output filename
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const fileName = `${baseName}.svg`;

    return {
      svg,
      fileName,
      originalFileName: file.name,
    };
  } catch (error) {
    return {
      svg: '',
      fileName: file.name.replace(/\.[^/.]+$/, '.svg'),
      originalFileName: file.name,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Default conversion parameters
 */
export const DEFAULT_PARAMS: ConversionParams = {
  turdsize: 2,
  alphamax: 1.0,
  turnpolicy: 4,
  opttolerance: 0.2,
  opticurve: true,
  extractcolors: false,
};
