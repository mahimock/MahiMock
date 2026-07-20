const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  if (!fs.existsSync('resources')) {
    fs.mkdirSync('resources');
  }

  // Add a background rect to the SVG to make it square and padded
  const svg = fs.readFileSync('public/logo.svg', 'utf8');
  // Just use the SVG as is for now, maybe add a background if needed, but sharp can do that.
  
  // Icon
  await sharp('public/logo.svg')
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile('resources/icon.png');
    
  // Splash
  await sharp('public/logo.svg')
    .resize(2732, 2732, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile('resources/splash.png');
    
  // Also create PWA icons
  await sharp('resources/icon.png')
    .resize(192, 192)
    .toFile('public/icon-192x192.png');
    
  await sharp('resources/icon.png')
    .resize(512, 512)
    .toFile('public/icon-512x512.png');
}

generate().catch(console.error);
