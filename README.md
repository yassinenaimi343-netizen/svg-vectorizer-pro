# SVG Bulk Vectorizer

A high-performance, client-side PNG/JPG to SVG vectorization web application with bulk upload support for up to 100 images.

## Features

- **Bulk Image Upload**: Convert up to 100 images at once
- **Drag & Drop Support**: Easy file selection with drag-and-drop interface
- **Client-Side Processing**: All conversions happen in your browser—no server uploads
- **Potrace WASM**: High-quality vectorization using Potrace algorithm compiled to WebAssembly
- **Batch Download**: Download all converted SVGs as a ZIP file
- **Advanced Settings**: Fine-tune Potrace parameters (turdsize, alphamax, turnpolicy, etc.)
- **Real-Time Progress**: Monitor conversion progress for each image
- **SVG Preview & Copy**: Preview and copy SVG code directly from the browser

## Supported Formats

**Input**: PNG, JPG, GIF, WebP, AVIF (up to 50MB each)
**Output**: SVG (optimized with SVGO)

## Attribution

This project is based on [SVGcode](https://github.com/tomayac/SVGcode) by Google LLC, which provides a Progressive Web App for converting raster images to vector graphics.

**Original SVGcode Repository**: https://github.com/tomayac/SVGcode

### Key Technologies

- **Potrace WASM**: Image tracing algorithm (via [esm-potrace-wasm](https://github.com/tomayac/esm-potrace-wasm))
- **SVGO**: SVG optimization library
- **React 19**: UI framework
- **Tailwind CSS 4**: Styling
- **shadcn/ui**: Component library
- **JSZip**: ZIP file generation

## License

This project is licensed under the **GNU General Public License v2.0** (GPL-2.0), inherited from the original SVGcode project.

See the [LICENSE](./LICENSE) file for full license text.

### GPL Compliance

As a GPL-2.0 project, this software:
- Is free software that you can redistribute and modify
- Must include this license and attribution to the original SVGcode project
- Any modifications must also be released under GPL-2.0
- Source code must be made available to users

## Development

### Prerequisites

- Node.js 18+
- pnpm (or npm)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Project Structure

```
client/
  src/
    components/
      BulkUploader.tsx          # Drag-drop upload UI
      ConversionResults.tsx     # Results display and download
      ConversionSettings.tsx    # Potrace parameter controls
    lib/
      converter.ts             # Core conversion logic
      conversionQueue.ts       # Queue management
      svgcode/                 # Adapted SVGcode modules
    pages/
      Home.tsx                 # Main application page
    App.tsx                    # Root component
    index.css                  # Global styles
```

## How It Works

1. **Upload Images**: Drag and drop or select multiple images
2. **Configure Settings**: Adjust Potrace parameters if needed
3. **Convert**: Click "Convert to SVG" to start batch processing
4. **Download**: Get individual SVGs or download all as ZIP

### Conversion Pipeline

1. Image file → ImageData (canvas rendering)
2. ImageData → Potrace vectorization
3. SVG → SVGO optimization
4. Optimized SVG → Download/Preview

## Performance Considerations

- **Sequential Processing**: Images are converted one at a time to prevent memory issues
- **Memory Management**: Canvas and ImageData are cleaned up after each conversion
- **WASM Initialization**: Potrace WASM is initialized once and reused
- **Browser Limits**: Tested with up to 100 images; performance depends on image size and browser capabilities

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires support for:
- OffscreenCanvas
- Web Workers
- WebAssembly (WASM)
- File System Access API (for save functionality)

## Troubleshooting

### Large images cause browser to freeze
- Reduce image dimensions before uploading
- Convert fewer images at once
- Use a browser with more available memory

### WASM module fails to load
- Check browser console for errors
- Ensure WebAssembly is enabled in browser settings
- Try a different browser

### SVG output quality is poor
- Adjust Potrace parameters (increase alphamax, reduce turdsize)
- Ensure input image has good contrast
- Try preprocessing the image (increase contrast/sharpness)

## Contributing

Contributions are welcome! Please ensure any modifications:
1. Maintain GPL-2.0 license compliance
2. Include proper attribution to SVGcode
3. Follow the existing code style
4. Test with multiple image formats and sizes

## Credits

- **SVGcode**: Original project by Google LLC
- **Potrace**: Image tracing algorithm by Peter Selinger
- **SVGO**: SVG optimization by Kir Belevich

## Related Projects

- [SVGcode](https://github.com/tomayac/SVGcode) - Original single-image converter
- [esm-potrace-wasm](https://github.com/tomayac/esm-potrace-wasm) - Potrace WASM module
- [SVGO](https://github.com/svg/svgo) - SVG optimization

## Support

For issues, feature requests, or questions:
1. Check the [SVGcode repository](https://github.com/tomayac/SVGcode) for related discussions
2. Review browser console for error messages
3. Test with different images and settings

---

**Note**: This is a GPL-2.0 licensed open-source project. By using this software, you agree to the terms of the GPL-2.0 license.
