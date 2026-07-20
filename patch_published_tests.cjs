const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

// Inside renderTestList, or in the filter
// Better to just filter them out from the `tests` array entirely if not admin?
// But `isAdmin` is available in the component.

code = code.replace(
  "const filteredMocks = tests.filter(t => t.type === 'Full Mock Tests' && t.title.toLowerCase().includes(searchQuery.toLowerCase()));",
  "const filteredMocks = tests.filter(t => t.type === 'Full Mock Tests' && t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (isAdmin || t.status === 'Published'));"
);

code = code.replace(
  "? tests.filter(t => t.type === 'Sectional Tests' && t.subjectId === selectedSubject.id && t.title.toLowerCase().includes(searchQuery.toLowerCase()))",
  "? tests.filter(t => t.type === 'Sectional Tests' && t.subjectId === selectedSubject.id && t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (isAdmin || t.status === 'Published'))"
);

code = code.replace(
  "? tests.filter(t => t.type === 'Topic Tests' && t.chapterId === selectedChapter.id && t.title.toLowerCase().includes(searchQuery.toLowerCase()))",
  "? tests.filter(t => t.type === 'Topic Tests' && t.chapterId === selectedChapter.id && t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (isAdmin || t.status === 'Published'))"
);

// For the count display
code = code.replace(
  "<span className=\"text-[#5B5FFB]\">{tests.filter(t => t.type === 'Full Mock Tests').length} Tests Available</span>",
  "<span className=\"text-[#5B5FFB]\">{tests.filter(t => t.type === 'Full Mock Tests' && (isAdmin || t.status === 'Published')).length} Tests Available</span>"
);

fs.writeFileSync('src/pages/ExamDetail.tsx', code);
