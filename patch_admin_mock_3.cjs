const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Replace setSelectedTest(test); setView('questions') with navigate
code = code.replace(
  "onClick={() => { setSelectedTest(test); setView('questions'); }}",
  "onClick={() => navigate(`/admin/tests/${test.id}/questions`)}"
);

// Remove the inline view === 'questions' rendering block
code = code.replace(
  /\{\/\* Questions View \*\/\}[\s\S]*\{\/\* Add Test & Question Builder Modal \*\/\}/g,
  "{/* Add Test & Question Builder Modal */}"
);

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
