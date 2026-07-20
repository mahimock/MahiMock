const sharp = require('sharp');

async function processImage() {
  try {
    const { data, info } = await sharp('public/icon-512x512.png')
      .trim()
      .toBuffer({ resolveWithObject: true });
      
    console.log("Trimmed info:", info);
    
    // The trimmed image has width info.width and height info.height
    // We want the top part, let's assume the logo is the top 65% of the trimmed image
    await sharp(data)
      .extract({ left: 0, top: 0, width: info.width, height: Math.floor(info.height * 0.6) })
      .trim()
      .toFile('public/logo-m.png');
      
    console.log("Trimmed and cropped to logo-m.png");
  } catch (err) {
    console.error(err);
  }
}
processImage();
