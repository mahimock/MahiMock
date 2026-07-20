const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes('VitePWA')) {
  code = code.replace(
    "import {defineConfig} from 'vite';",
    "import {defineConfig} from 'vite';\nimport { VitePWA } from 'vite-plugin-pwa';"
  );
  code = code.replace(
    "plugins: [react(), tailwindcss()],",
    `plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        manifest: {
          name: 'MahiMock',
          short_name: 'MahiMock',
          description: 'India\\'s Premium EdTech platform',
          theme_color: '#5B5FFB',
          background_color: '#F8FAFC',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],`
  );
}
fs.writeFileSync('vite.config.ts', code);
