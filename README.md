# SVG Vectorizer Pro

A modern, minimalist web application for converting PNG, JPG, and other raster images to SVG vectors. Features a clean single-page interface with real-time conversion and advanced options.

## ✨ New Features

- **Minimalist Design**: Clean, modern single-page interface
- **White Background Option**: Add white background layer to SVG output
- **Side-by-Side Layout**: Upload and results visible on the same page
- **Real-time Preview**: See results instantly as they convert
- **Batch Processing**: Convert up to 250 images at once

## 🚀 Features

- **Client-Side Processing**: All conversions happen in your browser—100% private
- **Drag & Drop Upload**: Easy file selection with drag-and-drop interface
- **Advanced Settings**: Fine-tune conversion parameters
- **Batch Download**: Download all converted SVGs as a ZIP file
- **Remove Background**: Automatically remove white backgrounds
- **Add White Background**: Add white layer behind transparent SVGs

## 📸 Supported Formats

**Input**: PNG, JPG, GIF, WebP, AVIF (up to 50MB each)
**Output**: SVG (optimized with SVGO)

## 🛠️ Technology Stack

- **React 19**: Modern UI framework
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Beautiful component library
- **Potrace WASM**: High-quality vectorization
- **SVGO**: SVG optimization
- **Express**: Backend server
- **tRPC**: Type-safe API

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🌐 Deployment

### Deploy to Railway

1. **Fork this repository** to your GitHub account

2. **Create a new Railway project**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your forked repository

3. **Configure environment variables** (optional)
   - `NODE_ENV=production`
   - `PORT=3000` (Railway will auto-assign)

4. **Deploy**
   - Railway will automatically detect and build your app
   - Your app will be live in minutes!

### Deploy to Other Platforms

This app can be deployed to:
- Vercel
- Netlify
- Render
- Heroku
- Any Node.js hosting platform

## 📖 How to Use

1. **Upload Images**: Drag and drop or click to select PNG/JPG images
2. **Configure Options**:
   - Toggle "Add White Background" for transparent SVGs
   - Toggle "Remove White Background" to make white pixels transparent
   - Adjust "Detail Level" for quality vs. smoothness
3. **Convert**: Click the convert button to start processing
4. **Download**: Download individual SVGs or all as ZIP

## 🎨 Design Philosophy

This redesign focuses on:
- **Minimalism**: Clean, uncluttered interface
- **Efficiency**: Everything visible on one page
- **User Experience**: Clear visual hierarchy and intuitive controls
- **Performance**: Fast, client-side processing

## 🔧 Configuration

### Conversion Parameters

- **Detail Level**: Controls curve smoothness (0-2)
- **Remove White Background**: Makes white pixels transparent
- **Optimize Curves**: Simplifies paths for smaller file size
- **Add White Background**: Adds white rectangle behind SVG

## 📝 License

MIT License - See [LICENSE](./LICENSE) file

## 🙏 Attribution

Based on [SVGcode](https://github.com/tomayac/SVGcode) by Google LLC, using:
- **Potrace**: Image tracing algorithm by Peter Selinger
- **SVGO**: SVG optimization by Kir Belevich

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using React, Tailwind CSS, and Potrace**
