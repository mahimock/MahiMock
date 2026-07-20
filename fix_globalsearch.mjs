import fs from 'fs';

let content = fs.readFileSync('src/components/GlobalSearch.tsx', 'utf8');

content = content.replace(/bg-white/g, 'bg-white dark:bg-[#1E1E2D]');
content = content.replace(/border-gray-200/g, 'border-gray-200 dark:border-white/10');
content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-white/5');
content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-white/5');
content = content.replace(/bg-gray-100/g, 'bg-gray-100 dark:bg-white/10');
content = content.replace(/bg-\[\#F8FAFC\]/g, 'bg-[#F8FAFC] dark:bg-[#151521]');
content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
content = content.replace(/text-gray-800/g, 'text-gray-800 dark:text-white');
content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
content = content.replace(/text-gray-400/g, 'text-gray-400 dark:text-gray-500');

fs.writeFileSync('src/components/GlobalSearch.tsx', content);
