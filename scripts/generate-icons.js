const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// WM Logo SVG path
const WM_PATH = "M143.202 12.5373L143.106 19.6453C143.095 21.1328 143.733 22.6097 144.912 23.7784L176.723 55.5892H162.603L119.083 12.0804C117.532 10.7205 115.556 9.97673 113.505 9.97673H110.01V55.5892H96.4948C91.9049 55.5892 87.5062 53.8998 84.1169 50.8292L80.3876 47.0999C79.8776 46.6006 79.2082 46.4943 78.7513 46.4943C77.7845 46.4943 76.7326 47.0043 76.722 47.7693V55.5892H63.2284C58.6279 55.5892 54.2292 53.8998 50.8399 50.8292L0 0H14.1204L57.6504 43.53C58.3941 44.1781 59.2335 44.6881 60.1579 45.0387C61.146 45.4212 62.1766 45.6124 63.2284 45.6124C65.1409 45.6124 66.7665 44.4331 66.7878 43.0519L66.8834 35.997C66.8834 34.4776 66.2353 32.9689 65.024 31.747L33.2664 0H47.3974L90.9168 43.5193C92.468 44.8687 94.4442 45.6124 96.4948 45.6124H100.022V0H113.505C118.084 0 122.473 1.68935 125.873 4.73868L125.958 4.82368L129.612 8.48925C130.346 9.22236 131.525 9.22236 132.311 8.89299C132.598 8.78674 133.267 8.44675 133.278 7.81988V0H146.772C151.362 0 155.75 1.68935 159.15 4.73868L159.224 4.82368L210 55.5892H195.88L152.35 12.0804C150.798 10.7205 148.822 9.97673 146.772 9.97673C145.762 9.97673 144.795 10.2955 144.105 10.8586C143.531 11.3261 143.212 11.9211 143.202 12.5373Z";

const TEAL = '#1F8783';
const CREAM = '#FFF5DD';

// SVG dimensions
const SVG_WIDTH = 210;
const SVG_HEIGHT = 56;

function createIconSVG(size, padding = 0.15) {
  const availableSize = size * (1 - padding * 2);
  const scale = Math.min(availableSize / SVG_WIDTH, availableSize / SVG_HEIGHT);
  const offsetX = (size - SVG_WIDTH * scale) / 2;
  const offsetY = (size - SVG_HEIGHT * scale) / 2;

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${TEAL}"/>
      <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
        <path d="${WM_PATH}" fill="${CREAM}"/>
      </g>
    </svg>
  `;
}

async function generateIcon(name, size, padding = 0.15) {
  const outputPath = path.join(__dirname, '..', 'assets', 'images', name);
  const svg = createIconSVG(size, padding);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`✓ Generated ${name} (${size}x${size})`);
}

async function main() {
  console.log('🎨 Generating Washman app icons...\n');

  try {
    // App icon (1024x1024)
    await generateIcon('icon.png', 1024, 0.15);

    // Adaptive icon foreground (1024x1024 with more padding for safe zone)
    await generateIcon('adaptive-icon.png', 1024, 0.25);

    // Splash icon (200x200)
    await generateIcon('splash-icon.png', 200, 0.15);

    // Favicon (64x64)
    await generateIcon('favicon.png', 64, 0.1);

    console.log('\n✅ All icons generated successfully!');
    console.log('📁 Icons saved to: assets/images/');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

main();
