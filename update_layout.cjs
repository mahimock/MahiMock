const fs = require('fs');
let code = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf-8');
code = code.replace("{ name: 'Mock Tests', path: '/admin/tests', icon: FileQuestion }", "{ name: 'Exams', path: '/admin/tests', icon: FileQuestion }");
fs.writeFileSync('src/layouts/AdminLayout.tsx', code);
