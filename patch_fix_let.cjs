const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');
code = code.replace("let let type: string = 'Full Mock Tests';", "let type: string = 'Full Mock Tests';");
fs.writeFileSync('src/pages/ExamDetail.tsx', code);
