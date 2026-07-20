const fs = require('fs');
// A valid 1x1 transparent PNG base64
const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const buffer = Buffer.from(pngBase64, 'base64');
fs.writeFileSync('public/pwa-192x192.png', buffer);
fs.writeFileSync('public/pwa-512x512.png', buffer);
fs.writeFileSync('assets/icon.png', buffer);
fs.writeFileSync('assets/splash.png', buffer);
