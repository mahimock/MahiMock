const fs = require('fs');
let code = fs.readFileSync('src/contexts/ThemeContext.tsx', 'utf8');
code = code.replace("return saved || 'system';", "return saved || 'dark';");
code = code.replace("const root = window.document.documentElement;\n    root.classList.remove('light', 'dark');", "const root = window.document.documentElement;\n    root.classList.remove('light');\n    root.classList.add('dark'); // Force dark mode");
fs.writeFileSync('src/contexts/ThemeContext.tsx', code);
