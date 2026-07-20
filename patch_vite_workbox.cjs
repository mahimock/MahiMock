const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(
  "devOptions: { enabled: true },",
  "devOptions: { enabled: true },\n        workbox: {\n          maximumFileSizeToCacheInBytes: 5000000\n        },"
);

fs.writeFileSync('vite.config.ts', code);
