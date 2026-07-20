const fs = require('fs');

let takeTest = fs.readFileSync('src/pages/TakeTest.tsx', 'utf-8');
takeTest = takeTest.replace(/navigate\(`\/admin\/tests\/\$\{testId\}\/questions`\)/g, "navigate('/admin/tests')");
fs.writeFileSync('src/pages/TakeTest.tsx', takeTest);

let examDetail = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');
examDetail = examDetail.replace(/navigate\(`\/admin\/tests\/\$\{test.id\}\/questions`\)/g, "navigate('/admin/tests')");
fs.writeFileSync('src/pages/ExamDetail.tsx', examDetail);

