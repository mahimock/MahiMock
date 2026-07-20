const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import PerformanceHistory")) {
  code = code.replace(
    "import TestResult from './pages/TestResult';",
    "import TestResult from './pages/TestResult';\nimport PerformanceHistory from './pages/PerformanceHistory';"
  );
}

if (!code.includes('<Route path="performance-history" element={<PerformanceHistory />} />')) {
  code = code.replace(
    '<Route path="test-result/:testId" element={<TestResult />} />',
    '<Route path="test-result/:testId" element={<TestResult />} />\n            <Route path="performance-history" element={<PerformanceHistory />} />'
  );
}

fs.writeFileSync('src/App.tsx', code);
