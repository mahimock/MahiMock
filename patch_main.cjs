const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

if (!code.includes('virtual:pwa-register')) {
  code = `import { registerSW } from 'virtual:pwa-register';\nregisterSW({ immediate: true });\n` + code;
  fs.writeFileSync('src/main.tsx', code);
}
