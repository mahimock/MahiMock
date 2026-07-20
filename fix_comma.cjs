const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

code = code.replace(
  "Image as ImageIcon\n  ListPlus, Play",
  "Image as ImageIcon,\n  ListPlus, Play"
);

fs.writeFileSync('src/pages/ExamDetail.tsx', code);
