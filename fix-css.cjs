const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('html, body, #root')) {
  code = code.replace('@layer base {', `@layer base {
  html, body, #root {
    background-color: #070B18 !important;
    color: #ffffff;
    color-scheme: dark;
  }
  .dark html, .dark body, .dark #root {
    background-color: #070B18 !important;
  }
`);
}

fs.writeFileSync('src/index.css', code);
