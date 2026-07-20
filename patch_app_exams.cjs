const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import Exams from './pages/Exams';")) {
  code = code.replace(
    "import Category from './pages/Category';",
    "import Exams from './pages/Exams';\nimport Category from './pages/Category';"
  );
}

code = code.replace(
  '<Route path="exams" element={<div className="flex items-center justify-center h-[50vh] text-gray-500 font-medium text-lg">All Exams - Coming Soon</div>} />',
  '<Route path="exams" element={<Exams />} />'
);

fs.writeFileSync('src/App.tsx', code);
