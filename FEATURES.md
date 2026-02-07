# SVG Bulk Vectorizer - Complete Feature Documentation

## Overview

The SVG Bulk Vectorizer is a comprehensive web application for converting raster images (PNG, JPG, GIF, WebP, AVIF) to scalable vector graphics (SVG) with advanced editing and export capabilities. Built on the GPL-licensed SVGcode project by Google LLC, it includes real-time color editing, multi-format export, and Stripe payment integration.

## Core Features

### 1. Bulk Image Upload
- **Drag-and-drop interface** for easy file selection
- **Support for multiple formats**: PNG, JPG, GIF, WebP, AVIF
- **Up to 100 images** per batch (configurable)
- **File validation** with size and format checks
- **Progress indicators** for upload and conversion

### 2. High-Quality SVG Conversion
- **Potrace WASM integration** for client-side vectorization
- **Black & white vectorization** with automatic edge detection
- **Color vectorization** preserving original image colors
- **Smooth output** with configurable Potrace parameters
- **Batch processing** with sequential queue management
- **Memory management** to prevent browser crashes

### 3. Real-Time SVG Color Editing
- **Interactive color palette** showing all colors in SVG
- **Color picker** for selecting new colors
- **Real-time DOM manipulation** to preview changes instantly
- **Batch color replacement** across all paths
- **Reset functionality** to revert to original colors
- **Copy color codes** to clipboard

### 4. Multi-Format Export
- **SVG export** (always available)
- **EPS (Encapsulated PostScript)** - Professional print format
- **PDF (Vector)** - Portable Document Format with vector paths
- **AI (Adobe Illustrator)** - Native Adobe format for professional editing
- **DXF (AutoCAD)** - CAD format for technical drawings
- **AutoTrace integration** for format conversion
- **Batch export** to multiple formats simultaneously

### 5. SVG Preview and Download
- **Live SVG preview** in browser
- **SVG code viewer** with syntax highlighting
- **Individual file download** for each conversion
- **Batch ZIP download** for all converted SVGs
- **Copy SVG code** to clipboard

### 6. Stripe Payment Integration
- **Free plan**: 100 conversions/month, SVG only
- **Pro plan**: 1000 conversions/month, color editor, multi-format export
- **Enterprise plan**: Unlimited conversions, all features
- **Monthly and yearly subscriptions**
- **One-time purchases** (optional)
- **Payment history** tracking
- **Subscription management** (upgrade/downgrade/cancel)

### 7. Feature Gating
- **Free users**: Basic bulk upload, SVG conversion, 100/month limit
- **Pro users**: Color editor, multi-format export, 1000/month limit
- **Enterprise users**: Unlimited conversions, all features
- **Automatic feature availability** based on subscription

### 8. User Authentication
- **Manus OAuth integration** for secure login
- **User profile management**
- **Account settings** page
- **Billing dashboard** with subscription info
- **Payment history** display

## Technical Architecture

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** components for consistent UI
- **tRPC** for type-safe API calls
- **Potrace WASM** for client-side vectorization
- **jszip** for ZIP file creation
- **Sonner** for toast notifications

### Backend
- **Express.js** for HTTP server
- **tRPC** for RPC procedures
- **Drizzle ORM** for database operations
- **MySQL/TiDB** for data persistence
- **Stripe SDK** for payment processing
- **AutoTrace** CLI for multi-format export

### Database Schema
- **users** - User accounts and authentication
- **subscriptions** - Subscription plans and status
- **payments** - Payment transactions and history
- **userFeatures** - Feature access and usage limits

## API Routes

### Payment Routes (`/api/trpc/payment.*`)
- `payment.getSubscription` - Get current subscription
- `payment.getFeatures` - Get available features
- `payment.createCheckoutSession` - Create Stripe checkout
- `payment.createPaymentIntent` - Create payment intent
- `payment.confirmPayment` - Confirm payment
- `payment.cancelSubscription` - Cancel subscription
- `payment.getPaymentHistory` - Get payment history
- `payment.getSubscriptionStatus` - Get Stripe subscription status

### Export Routes (`/api/trpc/export.*`)
- `export.exportSVG` - Export SVG file
- `export.exportFormat` - Export to single format
- `export.exportMultipleFormats` - Export to multiple formats
- `export.getAvailableFormats` - List available formats
- `export.checkAutoTraceStatus` - Check AutoTrace availability

## Configuration

### Environment Variables
Required for Stripe integration:
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_PRICE_PRO_MONTHLY` - Pro monthly price ID
- `STRIPE_PRICE_PRO_YEARLY` - Pro yearly price ID

Optional:
- `STRIPE_PRICE_ENTERPRISE` - Enterprise price ID
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

### Potrace Parameters
Configurable via UI:
- **Turdsize** - Threshold for corner detection (default: 2)
- **Alphamax** - Maximum angle (default: 1)
- **Turnpolicy** - Corner handling (default: minority)
- **Opttolerance** - Optimization tolerance (default: 0.2)

### AutoTrace Parameters
Configurable via API:
- **Color mode** - BW or color vectorization
- **Despeckle** - Remove small artifacts
- **Smoothing** - Smooth output curves
- **Corner threshold** - Corner detection sensitivity

## Usage Guide

### Basic Workflow
1. **Upload images** via drag-drop or file picker
2. **Configure Potrace settings** (optional)
3. **Start conversion** to generate SVGs
4. **Preview results** in real-time
5. **Edit colors** if needed (Pro users)
6. **Export** to desired format(s)
7. **Download** individual files or ZIP

### Advanced Features
- **Color editing**: Click colors in palette to change them
- **Batch export**: Select multiple formats for simultaneous export
- **ZIP download**: Export all SVGs at once
- **Payment upgrade**: Unlock Pro features for advanced options

## Performance Characteristics

### Conversion Speed
- **Small images** (< 1MB): < 5 seconds
- **Medium images** (1-5MB): 5-15 seconds
- **Large images** (5-10MB): 15-30 seconds
- **Batch processing**: Sequential with memory cleanup

### Memory Management
- **Per-image cleanup** after conversion
- **Canvas memory release** to prevent leaks
- **WASM module optimization** for efficiency
- **Safe handling** of 100+ images

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14+)
- **Mobile**: Responsive design, touch-friendly

## Limitations and Considerations

### Free Plan
- Limited to 100 conversions per month
- SVG export only
- No color editing
- No multi-format export
- Resets monthly

### AutoTrace Availability
- Requires AutoTrace CLI installation
- Not available on all platforms
- Fallback to SVG-only export if unavailable
- Server-side processing required

### Image Constraints
- Maximum image size: 10MB (configurable)
- Supported formats: PNG, JPG, GIF, WebP, AVIF
- Minimum resolution: 10x10 pixels
- Recommended: 100x100 to 2000x2000 pixels

## Security Features

- **OAuth authentication** via Manus
- **HTTPS encryption** for all data
- **Secure payment processing** via Stripe
- **Database encryption** for sensitive data
- **CORS protection** for API endpoints
- **Rate limiting** on API routes

## Support and Documentation

- **README.md** - Project overview and setup
- **STRIPE_SETUP.md** - Payment integration guide
- **ATTRIBUTION.md** - GPL compliance and credits
- **LICENSE** - GNU General Public License v2.0

## Future Enhancements

Potential features for future releases:
- **Batch color replacement** with presets
- **SVG optimization** and minification
- **Advanced tracing parameters** UI
- **Custom color palettes** saving
- **API access** for programmatic use
- **Webhook integration** for automated workflows
- **Advanced analytics** dashboard
- **Team collaboration** features
- **Cloud storage** integration
- **Mobile app** version

## Troubleshooting

### Common Issues

**Conversion fails**
- Check image format and size
- Try reducing image dimensions
- Clear browser cache and retry

**Colors not changing**
- Ensure SVG has fill attributes
- Check for inline styles that override fill
- Try resetting and editing again

**Export not available**
- Verify Pro subscription is active
- Check AutoTrace installation status
- Ensure sufficient disk space

**Payment issues**
- Use valid test card numbers
- Check Stripe API keys are configured
- Verify webhook endpoint is accessible

## Credits and Attribution

This project is based on **SVGcode** by Google LLC, licensed under GPL-2.0.

- **Original Project**: https://github.com/tomayac/SVGcode
- **Potrace WASM**: esm-potrace-wasm
- **Stripe**: Payment processing
- **AutoTrace**: Multi-format export

For full attribution details, see [ATTRIBUTION.md](./ATTRIBUTION.md).

## License

This project is licensed under the **GNU General Public License v2.0**. See [LICENSE](./LICENSE) for details.

All modifications and enhancements maintain GPL compliance and are freely available for use and modification.
