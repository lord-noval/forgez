/**
 * PWA Icon Generator
 * Generates all required PWA icons from the source icon1024.png
 *
 * Run with: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_ICON = path.join(__dirname, '../public/icon1024.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Icon configurations
const icons = [
  // Standard icons
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },

  // Maskable icons (with padding for safe zone)
  { name: 'icon-maskable-192x192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512x512.png', size: 512, maskable: true },

  // Apple touch icon
  { name: 'apple-touch-icon.png', size: 180 },

  // Favicon sizes
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
];

async function generateIcons() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error('Source icon not found:', SOURCE_ICON);
    process.exit(1);
  }

  console.log('Generating PWA icons from:', SOURCE_ICON);
  console.log('Output directory:', OUTPUT_DIR);
  console.log('');

  for (const icon of icons) {
    const outputPath = path.join(OUTPUT_DIR, icon.name);

    try {
      if (icon.maskable) {
        // For maskable icons, add padding (10% on each side = 80% of icon in safe zone)
        const padding = Math.round(icon.size * 0.1);
        const innerSize = icon.size - (padding * 2);

        // Create a background with the theme color
        const background = await sharp({
          create: {
            width: icon.size,
            height: icon.size,
            channels: 4,
            background: { r: 13, g: 13, b: 15, alpha: 1 } // #0D0D0F - Matrix black
          }
        }).png().toBuffer();

        // Resize the icon to fit within safe zone
        const resizedIcon = await sharp(SOURCE_ICON)
          .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer();

        // Composite the icon onto the background
        await sharp(background)
          .composite([{
            input: resizedIcon,
            top: padding,
            left: padding
          }])
          .png()
          .toFile(outputPath);
      } else {
        // Standard resize
        await sharp(SOURCE_ICON)
          .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(outputPath);
      }

      console.log(`✓ Generated: ${icon.name} (${icon.size}x${icon.size}${icon.maskable ? ' maskable' : ''})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${icon.name}:`, error.message);
    }
  }

  // Also copy apple-touch-icon to public root for legacy support
  const appleIconSource = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
  const appleIconDest = path.join(__dirname, '../public/apple-touch-icon.png');

  if (fs.existsSync(appleIconSource)) {
    fs.copyFileSync(appleIconSource, appleIconDest);
    console.log('✓ Copied apple-touch-icon.png to public root');
  }

  console.log('');
  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);
