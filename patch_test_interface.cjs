const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

code = code.replace("type: 'full' | 'subject' | 'chapter';", "type: string;");

fs.writeFileSync('src/pages/ExamDetail.tsx', code);
