const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "import TestInstructions from './pages/TestInstructions';",
  "import TestInstructions from './pages/TestInstructions';\nimport TakeTest from './pages/TakeTest';\nimport TestResult from './pages/TestResult';"
);

code = code.replace(
  '<Route path="test-instructions" element={<TestInstructions />} />',
  '<Route path="test-instructions/:testId" element={<TestInstructions />} />\n            <Route path="take-test/:testId" element={<TakeTest />} />\n            <Route path="test-result/:testId" element={<TestResult />} />'
);

fs.writeFileSync('src/App.tsx', code);
