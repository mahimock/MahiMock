const fs = require('fs');
let code = fs.readFileSync('src/pages/TestResult.tsx', 'utf-8');

code = code.replace(
  "const qQuery = query(collection(db, 'questions'), where('testId', '==', testId));",
  "const qQuery = collection(db, 'tests', testId, 'Questions');"
);

fs.writeFileSync('src/pages/TestResult.tsx', code);
