# Elevate Designs | Image Converter

Convert your images to WebP format easily with a beautiful, modern UI. Supports batch upload (up to 10 images), instant conversion, and download as individual files or a zip archive.

## Features

- Upload up to 10 images (PNG, JPG, JPEG)
- Drag & drop or browse files
- Preview selected files before conversion
- Convert all images to WebP format
- Download converted images individually or as a zip
- Responsive design for desktop and mobile
- Fast conversion powered by [Sharp](https://github.com/lovell/sharp)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
nvm use 20.7.0 # recommended
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Configuration

The project includes `vercel.json` for optimal deployment on Vercel platform with proper timeout and body size limits.

## Folder Structure

```
├── public/
│   └── elevate-designs-logo.svg
├── src/
│   └── app/
│       ├── page.tsx
│       └── api/
│           ├── convert/route.ts
│           └── convert-single/route.ts
├── .gitignore
├── package.json
├── README.md
└── ...
```

## API Endpoints

- `POST /api/convert` — Convert multiple images, returns WebP or zip
- `POST /api/convert-single` — Convert a single image, returns WebP

## Credits

- UI by Elevate Designs
- Conversion by [Sharp](https://github.com/lovell/sharp)
- Zip creation by [JSZip](https://stuk.github.io/jszip/)

## License

MIT
