import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');
content = content.replace(/from-\[\#1A1D29\] to-\[\#0B0F1A\]/g, 'from-gray-50 dark:from-[#1A1D29] to-white dark:to-[#0B0F1A]');
fs.writeFileSync('src/pages/Home.tsx', content);

let detail = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf8');
detail = detail.replace(/from-\[\#0B0F1A\] via-\[\#1A1D29\] to-\[\#0B0F1A\]/g, 'from-[#F8FAFC] dark:from-[#0B0F1A] via-gray-50 dark:via-[#1A1D29] to-[#F8FAFC] dark:to-[#0B0F1A]');
fs.writeFileSync('src/pages/ExamDetail.tsx', detail);
