const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
if (!code.includes("import TestSeries from './pages/TestSeries';")) {
  code = code.replace("import AdminTestSeries from './pages/admin/AdminTestSeries';", "import AdminTestSeries from './pages/admin/AdminTestSeries';\nimport TestSeries from './pages/TestSeries';");
}

// Replace route
code = code.replace(
  '<Route path="test-series" element={<div className="flex items-center justify-center h-[50vh] text-gray-500 font-medium text-lg">Test Series - Coming Soon</div>} />',
  '<Route path="test-series" element={<TestSeries />} />'
);

fs.writeFileSync('src/App.tsx', code);
