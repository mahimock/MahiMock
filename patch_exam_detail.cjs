const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

code = code.replace(/t\.type === 'full'/g, "t.type === 'Full Mock Tests'");
code = code.replace(/t\.type === 'subject'/g, "t.type === 'Sectional Tests'");
code = code.replace(/t\.type === 'chapter'/g, "t.type === 'Topic Tests'");

code = code.replace(/type: Test\['type'\] = 'full';/g, "let type: string = 'Full Mock Tests';");
code = code.replace(/type = 'subject';/g, "type = 'Sectional Tests';");
code = code.replace(/type = 'chapter';/g, "type = 'Topic Tests';");

fs.writeFileSync('src/pages/ExamDetail.tsx', code);
