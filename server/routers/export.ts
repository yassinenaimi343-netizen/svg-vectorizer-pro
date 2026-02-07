/**
 * Export Router
 * tRPC routes for SVG and multi-format export
 * Based on SVGcode by Google LLC (GPL-2.0)
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { convertWithAutoTrace, convertToMultipleFormats, getFormatName, validateAutoTraceSetup, ExportFormat } from '../autotrace';
import { getUserFeatures } from '../payment-db';
import { TRPCError } from '@trpc/server';

export const exportRouter = router({
  /**
   * Export SVG (no conversion needed)
   */
  exportSVG: protectedProcedure
    .input(
      z.object({
        svgContent: z.string().min(1),
        fileName: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check user features
      const features = await getUserFeatures(ctx.user.id);
      if (!features?.hasBulkProcessing) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Bulk processing not available for your plan',
        });
      }

      return {
        format: 'svg',
        fileName: input.fileName.replace(/\.[^/.]+$/, '.svg'),
        data: Buffer.from(input.svgContent),
        mimeType: 'image/svg+xml',
      };
    }),

  /**
   * Export to single format using AutoTrace
   */
  exportFormat: protectedProcedure
    .input(
      z.object({
        imageBuffer: z.string(), // Base64 encoded image
        format: z.enum(['eps', 'pdf', 'ai', 'dxf', 'fig', 'sk'] as const),
        fileName: z.string().min(1),
        colorMode: z.enum(['bw', 'color']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check user features
      const features = await getUserFeatures(ctx.user.id);
      if (!features?.hasMultiFormatExport) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Multi-format export is only available for Pro users',
        });
      }

      // Validate AutoTrace
      const validation = validateAutoTraceSetup();
      if (!validation.available) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: validation.message,
        });
      }

      try {
        // Decode base64 image
        const imageBuffer = Buffer.from(input.imageBuffer, 'base64');

        // Convert using AutoTrace
        const result = await convertWithAutoTrace(imageBuffer, {
          format: input.format as ExportFormat,
          colorMode: input.colorMode || 'color',
        });

        return {
          format: result.format,
          fileName: input.fileName.replace(/\.[^/.]+$/, `.${result.format}`),
          data: result.data.toString('base64'),
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error('Export conversion failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to convert to ${input.format}: ${error}`,
        });
      }
    }),

  /**
   * Export to multiple formats
   */
  exportMultipleFormats: protectedProcedure
    .input(
      z.object({
        imageBuffer: z.string(), // Base64 encoded image
        formats: z.array(z.enum(['eps', 'pdf', 'ai', 'dxf', 'fig', 'sk'] as const)),
        fileName: z.string().min(1),
        colorMode: z.enum(['bw', 'color']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check user features
      const features = await getUserFeatures(ctx.user.id);
      if (!features?.hasMultiFormatExport) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Multi-format export is only available for Pro users',
        });
      }

      // Validate AutoTrace
      const validation = validateAutoTraceSetup();
      if (!validation.available) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: validation.message,
        });
      }

      try {
        // Decode base64 image
        const imageBuffer = Buffer.from(input.imageBuffer, 'base64');

        // Convert to multiple formats
        const results = await convertToMultipleFormats(
          imageBuffer,
          input.formats as ExportFormat[],
          { colorMode: input.colorMode || 'color' }
        );

        return results.map((result) => ({
          format: result.format,
          fileName: input.fileName.replace(/\.[^/.]+$/, `.${result.format}`),
          data: result.data.toString('base64'),
          mimeType: result.mimeType,
        }));
      } catch (error) {
        console.error('Multi-format export failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to convert formats: ${error}`,
        });
      }
    }),

  /**
   * Get available export formats
   */
  getAvailableFormats: protectedProcedure.query(async ({ ctx }) => {
    const features = await getUserFeatures(ctx.user.id);
    const validation = validateAutoTraceSetup();

    const formats = [
      {
        id: 'svg',
        name: 'SVG (Vector)',
        available: true,
        requiresPro: false,
        description: 'Scalable Vector Graphics - best quality',
      },
    ];

    if (features?.hasMultiFormatExport && validation.available) {
      formats.push(
        {
          id: 'eps',
          name: 'Encapsulated PostScript',
          available: true,
          requiresPro: true,
          description: 'Professional print format',
        },
        {
          id: 'pdf',
          name: 'PDF (Vector)',
          available: true,
          requiresPro: true,
          description: 'Portable Document Format - vector',
        },
        {
          id: 'ai',
          name: 'Adobe Illustrator',
          available: true,
          requiresPro: true,
          description: 'Native Adobe format',
        },
        {
          id: 'dxf',
          name: 'AutoCAD DXF',
          available: true,
          requiresPro: true,
          description: 'CAD format for technical drawings',
        }
      );
    }

    return formats;
  }),

  /**
   * Check AutoTrace availability
   */
  checkAutoTraceStatus: protectedProcedure.query(() => {
    const validation = validateAutoTraceSetup();
    return {
      available: validation.available,
      message: validation.message,
    };
  }),
});
