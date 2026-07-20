const sharp = require('sharp');

async function processImage() {
  try {
    const meta = await sharp('public/icon-512x512.png').metadata();
    console.log(meta.width, meta.height);
    
    // Let's crop the top half. The "M" logo is on top, text is below.
    // We'll extract an area.
    await sharp('public/icon-512x512.png')
      .extract({ left: 0, top: 0, width: 512, height: 320 }) // adjust height
      .toFile('public/logo-m.png');
      
    console.log("Cropped successfully to public/logo-m.png");
  } catch (err) {
    console.error(err);
  }
}
processImage();
