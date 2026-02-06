/**
 * SVG Bulk Vectorizer - Conversion Queue Manager
 * Based on SVGcode by Google LLC (GPL-2.0)
 * 
 * Manages sequential image-to-SVG conversions with progress tracking.
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

import { convertImageFile, ConversionParams, DEFAULT_PARAMS } from './converter';

export interface QueueItem {
  id: string;
  file: File;
  onProgress: (progress: number) => void;
  onComplete: (svg: string) => void;
  onError: (error: string) => void;
}

export interface QueueState {
  isProcessing: boolean;
  completed: number;
  total: number;
  currentFile?: string;
}

class ConversionQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private completed = 0;
  private total = 0;
  private currentFile?: string;
  private stateCallback?: (state: QueueState) => void;
  private params: ConversionParams = DEFAULT_PARAMS;

  /**
   * Subscribe to queue state changes
   */
  onStateChange(callback: (state: QueueState) => void) {
    this.stateCallback = callback;
  }

  /**
   * Set conversion parameters
   */
  setParams(params: ConversionParams) {
    this.params = params;
  }

  /**
   * Add items to the queue
   */
  enqueue(...items: QueueItem[]) {
    this.queue.push(...items);
    this.total = this.queue.length;
    this.notifyStateChange();
    this.process();
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
    this.completed = 0;
    this.total = 0;
    this.currentFile = undefined;
    this.notifyStateChange();
  }

  /**
   * Process queue items sequentially
   */
  private async process() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.notifyStateChange();

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.currentFile = item.file.name;
      this.notifyStateChange();

      try {
        // Simulate progress updates
        item.onProgress(10);

        const result = await convertImageFile(item.file, this.params);

        if (result.error) {
          item.onError(result.error);
        } else {
          item.onProgress(100);
          item.onComplete(result.svg);
        }

        this.completed++;
        this.notifyStateChange();

        // Small delay between conversions to prevent memory issues
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        item.onError(error instanceof Error ? error.message : 'Unknown error');
        this.completed++;
        this.notifyStateChange();
      }
    }

    this.isProcessing = false;
    this.currentFile = undefined;
    this.notifyStateChange();
  }

  /**
   * Get current queue state
   */
  getState(): QueueState {
    return {
      isProcessing: this.isProcessing,
      completed: this.completed,
      total: this.total,
      currentFile: this.currentFile,
    };
  }

  /**
   * Notify state change listeners
   */
  private notifyStateChange() {
    if (this.stateCallback) {
      this.stateCallback(this.getState());
    }
  }
}

// Export singleton instance
export const conversionQueue = new ConversionQueue();
