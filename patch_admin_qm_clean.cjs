const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminQuestionManager.tsx', 'utf-8');

code = code.replace(
  "const qRef = doc(db, 'Exams', catName, 'ExamList', examName, typeCollection, testId, 'Questions', id);",
  "const qRef = doc(db, 'tests', testId, 'Questions', id);"
);

fs.writeFileSync('src/pages/admin/AdminQuestionManager.tsx', code);
