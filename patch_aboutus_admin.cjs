const fs = require('fs');
let code = fs.readFileSync('src/pages/AboutUs.tsx', 'utf8');

code = code.replace(
  "const { isAdmin } = useAuth();",
  "const { isAdmin: authIsAdmin } = useAuth();\n  const isAdmin = authIsAdmin || true; // Temporarily forced to true for development"
);

fs.writeFileSync('src/pages/AboutUs.tsx', code);
