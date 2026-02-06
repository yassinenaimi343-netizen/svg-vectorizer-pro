# Attribution and GPL Compliance

## SVG Bulk Vectorizer

This project is based on and derived from the **SVGcode** project, which is licensed under the GNU General Public License v2.0 (GPL-2.0).

### Original Project

**SVGcode** - Convert raster images to SVG vector graphics
- **Author**: Google LLC (Thomas Steiner)
- **Repository**: https://github.com/tomayac/SVGcode
- **License**: GNU General Public License v2.0
- **Original License File**: https://github.com/tomayac/SVGcode/blob/main/LICENSE

### Modifications and Additions

This project extends SVGcode with the following features:

1. **Bulk Upload Functionality**: Added support for uploading and converting multiple images (up to 100)
2. **Queue Management**: Implemented sequential conversion queue to prevent memory issues
3. **Batch Download**: Added ZIP file download for all converted SVGs
4. **Advanced UI Components**: Created new React components for bulk operations
5. **Progress Tracking**: Real-time progress indicators for batch conversions
6. **Settings Panel**: Enhanced Potrace parameter configuration

### GPL-2.0 Compliance

As a derivative work of SVGcode, this project is released under the **GNU General Public License v2.0**. This means:

- **Source Code**: The complete source code is available and can be modified
- **Distribution**: You can redistribute this software freely
- **Modifications**: Any modifications must also be released under GPL-2.0
- **Attribution**: Original authors (Google LLC) and contributors must be credited
- **License Inclusion**: The GPL-2.0 license must be included with any distribution

### Key Dependencies

The following libraries are used in this project:

#### Core Vectorization
- **esm-potrace-wasm** (v0.4.1)
  - Modern ESM build of Potrace for browser use
  - Original Potrace by Peter Selinger
  - Repository: https://github.com/tomayac/esm-potrace-wasm
  - License: GPL-2.0 (inherited from Potrace)

- **SVGO** (v4.0.0)
  - SVG optimization library
  - Repository: https://github.com/svg/svgo
  - License: MIT

#### UI Framework
- **React** (v19.2.1) - MIT License
- **Tailwind CSS** (v4.1.14) - MIT License
- **shadcn/ui** - MIT License
- **Lucide React** (v0.453.0) - ISC License

#### Utilities
- **JSZip** (v3.10.1) - MIT/GPL-3.0 License
- **Sonner** (v2.0.7) - MIT License
- **Wouter** (v3.3.5) - ISC License

#### Build Tools
- **Vite** (v7.1.7) - MIT License
- **TypeScript** (v5.6.3) - Apache 2.0 License

### License Files

- **LICENSE**: Full GPL-2.0 license text (from SVGcode)
- **ATTRIBUTION.md**: This file, documenting all attributions and compliance
- **README.md**: Project documentation with attribution section

### Acknowledgments

Special thanks to:

1. **Google LLC and Thomas Steiner** for creating SVGcode
2. **Peter Selinger** for the original Potrace algorithm
3. **Kir Belevich** and the SVGO team for SVG optimization
4. **The open-source community** for all supporting libraries

### How to Comply with GPL-2.0

If you use or modify this software, you must:

1. **Include License**: Distribute the GPL-2.0 license with your software
2. **Provide Source Code**: Make source code available to users
3. **Document Changes**: Clearly mark modifications to the original code
4. **Maintain Attribution**: Keep copyright notices and credits intact
5. **Use Compatible License**: Any derivative works must use GPL-2.0 or compatible license

### Contributing

If you contribute to this project:

1. Your contributions will be licensed under GPL-2.0
2. You agree that your code can be used by others under GPL-2.0 terms
3. Please include GPL license headers in new files
4. Update this ATTRIBUTION.md file if adding new dependencies

### Questions?

For questions about GPL compliance or licensing:
- Review the [GPL-2.0 License](./LICENSE)
- Check the [SVGcode repository](https://github.com/tomayac/SVGcode)
- Consult the [GNU GPL FAQ](https://www.gnu.org/licenses/gpl-faq.html)

---

**Last Updated**: February 2026
**License**: GNU General Public License v2.0
