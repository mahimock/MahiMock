const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Replace test fetching to use `db, 'tests'` where examId and type match
code = code.replace(
  "const q = collection(db, 'Exams', catName, 'ExamList', selectedExam.examName, typeCollection);",
  "const q = query(collection(db, 'tests'), where('examId', '==', selectedExam.id), where('type', '==', selectedTestType));"
);

// Replace test saving to use `db, 'tests'`
code = code.replace(
  "const testRef = doc(collection(db, 'Exams', catName, 'ExamList', selectedExam.examName, typeCollection));",
  "const testRef = doc(collection(db, 'tests'));"
);

// Make sure examId is saved in the test document
code = code.replace(
  "...testFormData,",
  "...testFormData,\n        examId: selectedExam.id,\n        categoryId: selectedCategory.id,\n        type: selectedTestType,"
);

// Replace test deleting to use `db, 'tests'`
const oldDelete = `const catName = selectedCategory.name || selectedCategory.category;
        const typeCollection = selectedTestType;
        const testRef = doc(db, 'Exams', catName, 'ExamList', selectedExam.examName, typeCollection, id);`;
const newDelete = `const testRef = doc(db, 'tests', id);`;
code = code.replace(oldDelete, newDelete);

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
