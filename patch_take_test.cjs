const fs = require('fs');
let code = fs.readFileSync('src/pages/TakeTest.tsx', 'utf-8');

// Replace question fetch
code = code.replace(
  "const qSnap = await getDocs(query(collection(db, 'questions'), where('testId', '==', testId)));",
  "const qSnap = await getDocs(collection(db, 'tests', testId, 'Questions'));"
);

fs.writeFileSync('src/pages/TakeTest.tsx', code);
