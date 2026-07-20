const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminQuestionManager.tsx', 'utf-8');

// Replace question references
code = code.replace(/collection\(db, 'Exams', catName, 'ExamList', examName, typeCollection, testId, 'Questions'\)/g, "collection(db, 'tests', testId, 'Questions')");

// Replace test document references
code = code.replace(/doc\(db, 'Exams', catName, 'ExamList', examName, typeCollection, testId\)/g, "doc(db, 'tests', testId)");

fs.writeFileSync('src/pages/admin/AdminQuestionManager.tsx', code);
