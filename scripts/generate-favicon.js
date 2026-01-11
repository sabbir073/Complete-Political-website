const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/Logo-PNG.png');
const publicDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../src/app');

async function generateFavicons() {
  console.log('Starting favicon generation from Logo-PNG.png...');

  try {
    // Read the logo
    const logo = sharp(logoPath);
    const metadata = await logo.metadata();
    console.log(`Logo dimensions: ${metadata.width}x${metadata.height}`);

    // Generate favicon.ico (32x32)
    console.log('Generating favicon.ico (32x32)...');
    await logo
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(appDir, 'favicon.ico'));

    // Generate apple-touch-icon.png (180x180)
    console.log('Generating apple-touch-icon.png (180x180)...');
    await logo
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(appDir, 'apple-icon.png'));

    // Generate icon-192.png for manifest
    console.log('Generating icon-192.png (192x192)...');
    await logo
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));

    // Generate icon-512.png for manifest
    console.log('Generating icon-512.png (512x512)...');
    await logo
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));

    // Generate opengraph-image.png (1200x630)
    console.log('Generating opengraph-image.png (1200x630)...');
    await logo
      .resize(1200, 630, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .png()
      .toFile(path.join(appDir, 'opengraph-image.png'));

    console.log('✅ All favicons generated successfully!');
    console.log('Files created:');
    console.log('  - src/app/favicon.ico');
    console.log('  - src/app/apple-icon.png');
    console.log('  - public/icon-192.png');
    console.log('  - public/icon-512.png');
    console.log('  - src/app/opengraph-image.png');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
